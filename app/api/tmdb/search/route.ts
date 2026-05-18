import net from "node:net";
import tls from "node:tls";
import { NextResponse } from "next/server";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const genreMap = new Map<number, string>([
  [12, "Adventure"],
  [14, "Fantasy"],
  [16, "Animation"],
  [18, "Drama"],
  [27, "Horror"],
  [28, "Action"],
  [35, "Comedy"],
  [36, "History"],
  [37, "Western"],
  [53, "Thriller"],
  [80, "Crime"],
  [99, "Documentary"],
  [878, "Science Fiction"],
  [9648, "Mystery"],
  [10402, "Music"],
  [10749, "Romance"],
  [10751, "Family"],
  [10752, "War"],
  [10770, "TV Movie"],
]);

type TMDbMovie = {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  genre_ids?: number[];
};

type TMDbSearchResponse = {
  results?: TMDbMovie[];
};

type HttpTextResponse = {
  ok: boolean;
  status: number;
  text: string;
};

export async function GET(request: Request) {
  try {
    const apiKey = process.env.TMDB_API_KEY?.trim();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    if (!apiKey) {
      return NextResponse.json(
        { results: [], error: "Missing TMDB_API_KEY" },
        { status: 500 },
      );
    }

    const tmdbUrl = new URL(TMDB_SEARCH_URL);
    tmdbUrl.searchParams.set("api_key", apiKey);
    tmdbUrl.searchParams.set("query", query);
    tmdbUrl.searchParams.set("language", "zh-CN");
    tmdbUrl.searchParams.set("include_adult", "false");
    tmdbUrl.searchParams.set("page", "1");

    const response = await fetchTmdb(tmdbUrl);

    if (!response.ok) {
      console.error("TMDb search returned non-OK response", {
        status: response.status,
        body: response.text,
      });

      return NextResponse.json(
        {
          results: [],
          error: "TMDb search failed. Please try again.",
        },
        { status: response.status },
      );
    }

    const payload = JSON.parse(response.text) as TMDbSearchResponse;
    const results = (payload.results ?? []).slice(0, 10).map((movie) => ({
      tmdbId: String(movie.id),
      title: movie.title || movie.original_title || "Untitled",
      releaseDate: movie.release_date || null,
      overview: movie.overview || "No overview available.",
      posterPath: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      genres: (movie.genre_ids ?? []).map(
        (genreId) => genreMap.get(genreId) ?? String(genreId),
      ),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TMDb search route failed", error);

    return NextResponse.json(
      {
        results: [],
        error: "Unable to search movies right now. Please try again.",
      },
      { status: 502 },
    );
  }
}

async function fetchTmdb(url: URL): Promise<HttpTextResponse> {
  try {
    return await fetchText(url);
  } catch (error) {
    const proxyUrl = process.env.TMDB_PROXY_URL?.trim();

    if (!proxyUrl) {
      console.error("Direct TMDb fetch failed and no TMDB_PROXY_URL is set", error);
      throw error;
    }

    console.error("Direct TMDb fetch failed, trying TMDB_PROXY_URL", error);
    return fetchTextViaHttpProxy(url, new URL(proxyUrl));
  }
}

async function fetchText(url: URL): Promise<HttpTextResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function fetchTextViaHttpProxy(
  targetUrl: URL,
  proxyUrl: URL,
): Promise<HttpTextResponse> {
  return new Promise((resolve, reject) => {
    const proxyPort = Number(proxyUrl.port || 80);
    const socket = net.connect(proxyPort, proxyUrl.hostname);
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("TMDb proxy connection timed out."));
    }, 10000);

    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    socket.once("connect", () => {
      socket.write(
        `CONNECT ${targetUrl.hostname}:443 HTTP/1.1\r\nHost: ${targetUrl.hostname}:443\r\nConnection: close\r\n\r\n`,
      );
    });

    readUntilHeaders(socket)
      .then((connectResponse) => {
        const statusLine = connectResponse.toString("latin1").split("\r\n")[0];

        if (!statusLine.includes(" 200 ")) {
          throw new Error(`Proxy CONNECT failed: ${statusLine}`);
        }

        const secureSocket = tls.connect({
          socket,
          servername: targetUrl.hostname,
        });

        return readTlsResponse(secureSocket, targetUrl);
      })
      .then((response) => {
        clearTimeout(timeout);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeout);
        socket.destroy();
        reject(error);
      });
  });
}

function readUntilHeaders(socket: net.Socket): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    function onData(chunk: Buffer) {
      chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      if (buffer.includes("\r\n\r\n")) {
        socket.off("data", onData);
        socket.off("error", onError);
        resolve(buffer);
      }
    }

    function onError(error: Error) {
      socket.off("data", onData);
      reject(error);
    }

    socket.on("data", onData);
    socket.once("error", onError);
  });
}

function readTlsResponse(
  secureSocket: tls.TLSSocket,
  targetUrl: URL,
): Promise<HttpTextResponse> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    secureSocket.once("secureConnect", () => {
      secureSocket.write(
        [
          `GET ${targetUrl.pathname}${targetUrl.search} HTTP/1.1`,
          `Host: ${targetUrl.hostname}`,
          "Accept: application/json",
          "Connection: close",
          "",
          "",
        ].join("\r\n"),
      );
    });

    secureSocket.on("data", (chunk) => chunks.push(chunk));
    secureSocket.once("error", reject);
    secureSocket.once("end", () => {
      try {
        resolve(parseHttpResponse(Buffer.concat(chunks)));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function parseHttpResponse(buffer: Buffer): HttpTextResponse {
  const headerEnd = buffer.indexOf("\r\n\r\n");

  if (headerEnd === -1) {
    throw new Error("Invalid HTTP response from TMDb proxy request.");
  }

  const headersText = buffer.subarray(0, headerEnd).toString("latin1");
  const bodyBuffer = buffer.subarray(headerEnd + 4);
  const [statusLine, ...headerLines] = headersText.split("\r\n");
  const status = Number(statusLine.split(" ")[1]);
  const headers = new Map(
    headerLines.map((line) => {
      const [key, ...value] = line.split(":");

      return [key.toLowerCase(), value.join(":").trim()];
    }),
  );
  const isChunked = headers.get("transfer-encoding")?.includes("chunked");
  const body = isChunked ? decodeChunkedBody(bodyBuffer) : bodyBuffer;

  return {
    ok: status >= 200 && status < 300,
    status,
    text: body.toString("utf8"),
  };
}

function decodeChunkedBody(buffer: Buffer) {
  const chunks: Buffer[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    const nextLine = buffer.indexOf("\r\n", offset);

    if (nextLine === -1) {
      break;
    }

    const sizeText = buffer.subarray(offset, nextLine).toString("latin1");
    const size = Number.parseInt(sizeText, 16);

    if (!size) {
      break;
    }

    const start = nextLine + 2;
    const end = start + size;
    chunks.push(buffer.subarray(start, end));
    offset = end + 2;
  }

  return Buffer.concat(chunks);
}
