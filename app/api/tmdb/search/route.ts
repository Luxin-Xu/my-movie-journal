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
    return fetchTextViaProxy(url, new URL(proxyUrl));
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

async function fetchTextViaProxy(targetUrl: URL, proxyUrl: URL) {
  try {
    return await fetchTextViaHttpProxy(targetUrl, proxyUrl);
  } catch (error) {
    console.error("HTTP proxy request failed, trying SOCKS5 proxy", error);
    return fetchTextViaSocksProxy(targetUrl, proxyUrl);
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
          ALPNProtocols: ["http/1.1"],
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

function fetchTextViaSocksProxy(
  targetUrl: URL,
  proxyUrl: URL,
): Promise<HttpTextResponse> {
  return new Promise((resolve, reject) => {
    const proxyPort = Number(proxyUrl.port || 1080);
    const socket = net.connect(proxyPort, proxyUrl.hostname);
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("TMDb SOCKS proxy connection timed out."));
    }, 10000);

    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    socket.once("connect", () => {
      socket.write(Buffer.from([0x05, 0x01, 0x00]));
    });

    readExactly(socket, 2)
      .then((methodResponse) => {
        if (methodResponse[0] !== 0x05 || methodResponse[1] !== 0x00) {
          throw new Error("SOCKS5 proxy does not allow no-auth connections.");
        }

        const hostname = Buffer.from(targetUrl.hostname);
        const request = Buffer.concat([
          Buffer.from([0x05, 0x01, 0x00, 0x03, hostname.length]),
          hostname,
          Buffer.from([0x01, 0xbb]),
        ]);
        socket.write(request);

        return readSocksConnectResponse(socket);
      })
      .then(() => {
        const secureSocket = tls.connect({
          socket,
          ALPNProtocols: ["http/1.1"],
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

function readExactly(socket: net.Socket, byteCount: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalLength = 0;

    function onData(chunk: Buffer) {
      chunks.push(chunk);
      totalLength += chunk.length;

      if (totalLength >= byteCount) {
        socket.off("data", onData);
        socket.off("error", onError);
        const buffer = Buffer.concat(chunks);
        const extra = buffer.subarray(byteCount);

        if (extra.length > 0) {
          socket.unshift(extra);
        }

        resolve(buffer.subarray(0, byteCount));
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

async function readSocksConnectResponse(socket: net.Socket) {
  const header = await readExactly(socket, 4);

  if (header[0] !== 0x05 || header[1] !== 0x00) {
    throw new Error(`SOCKS5 proxy connect failed with code ${header[1]}.`);
  }

  const addressType = header[3];

  if (addressType === 0x01) {
    await readExactly(socket, 4 + 2);
    return;
  }

  if (addressType === 0x03) {
    const length = (await readExactly(socket, 1))[0];
    await readExactly(socket, length + 2);
    return;
  }

  if (addressType === 0x04) {
    await readExactly(socket, 16 + 2);
    return;
  }

  throw new Error(`Unsupported SOCKS5 address type ${addressType}.`);
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
