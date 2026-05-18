import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { MovieLogActions } from "./movie-log-actions";

export const dynamic = "force-dynamic";

type MovieLog = {
  id: string;
  tmdb_id: string | null;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  genres: unknown;
  watched_date: string | null;
  my_rating: number | string | null;
  my_review: string | null;
  tags: unknown;
  created_at: string | null;
};

const movieDetails = [
  {
    id: "1",
    title: "Past Lives",
    year: "2023",
    releaseDate: "2023-06-02",
    director: "Celine Song",
    runtime: "106 min",
    genres: ["Drama", "Romance"],
    cast: ["Greta Lee", "Teo Yoo", "John Magaro", "Moon Seung-ah"],
    overview:
      "Two childhood friends reconnect across distance, time, and the lives they chose apart from each other.",
    palette: "from-emerald-300 via-cyan-700 to-slate-950",
    userRating: "4.5",
    watchedDate: "2026-05-12",
    review:
      "Quiet, restrained, and somehow enormous. It feels like a memory you borrowed from someone else.",
    tags: ["memory", "soft ache", "favorite"],
  },
  {
    id: "2",
    title: "Dune: Part Two",
    year: "2024",
    releaseDate: "2024-03-01",
    director: "Denis Villeneuve",
    runtime: "166 min",
    genres: ["Sci-Fi", "Adventure"],
    cast: ["Timothee Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler"],
    overview:
      "Paul Atreides unites with Chani and the Fremen while confronting the pull of prophecy and revenge.",
    palette: "from-amber-200 via-orange-700 to-stone-950",
    userRating: "5.0",
    watchedDate: "2026-05-09",
    review:
      "Huge in the old theatrical sense: sand, thunder, ritual, and dread arranged with absurd confidence.",
    tags: ["imax", "sci-fi", "epic"],
  },
  {
    id: "3",
    title: "Anatomy of a Fall",
    year: "2023",
    releaseDate: "2023-10-13",
    director: "Justine Triet",
    runtime: "151 min",
    genres: ["Mystery", "Drama", "Crime"],
    cast: ["Sandra Huller", "Swann Arlaud", "Milo Machado-Graner"],
    overview:
      "A writer becomes the prime suspect after her husband dies, and the trial turns a marriage into evidence.",
    palette: "from-red-200 via-zinc-700 to-black",
    userRating: "4.0",
    watchedDate: "2026-05-06",
    review:
      "A courtroom film that is really about the impossibility of making one clean story out of a life.",
    tags: ["courtroom", "ambiguous", "drama"],
  },
];

export function generateStaticParams() {
  return movieDetails.map((movie) => ({ id: movie.id }));
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const databaseMovie = await getDatabaseMovie(id);

  if (databaseMovie) {
    return <DatabaseMovieDetail movie={databaseMovie} />;
  }

  const movie = movieDetails.find((item) => item.id === id);

  if (!movie) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050607] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#00e054] shadow-[0_0_22px_rgba(0,224,84,0.8)] transition group-hover:scale-110" />
            <span className="text-xl font-semibold tracking-normal text-white sm:text-2xl">
              My Movie Journal
            </span>
          </Link>

          <Link
            href="/add"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#00e054] px-5 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] focus:outline-none focus:ring-2 focus:ring-[#00e054] focus:ring-offset-2 focus:ring-offset-black"
          >
            Add Movie
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <div
            className={`relative aspect-[2/3] overflow-hidden rounded-[8px] bg-gradient-to-br ${movie.palette} shadow-2xl shadow-black/50 ring-1 ring-white/10`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.38),transparent_34%),linear-gradient(to_top,rgba(0,0,0,0.92),transparent_55%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/60">
                {movie.year}
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
                {movie.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
                Film details
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-6xl">
                {movie.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300">
                {movie.overview}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoBlock label="Release date" value={movie.releaseDate} />
                <InfoBlock label="Director" value={movie.director} />
                <InfoBlock label="Runtime" value={movie.runtime} />
                <InfoBlock label="Genres" value={movie.genres.join(", ")} />
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-zinc-400">Cast</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {movie.cast.map((actor) => (
                    <span
                      key={actor}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-zinc-200"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-[260px_1fr]">
              <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-medium text-zinc-400">My rating</p>
                <p className="mt-3 text-5xl font-semibold text-[#00e054]">
                  {movie.userRating}
                </p>
                <p className="mt-5 text-sm text-zinc-400">Watched date</p>
                <p className="mt-2 text-base font-medium text-white">
                  {movie.watchedDate}
                </p>
              </div>

              <div className="rounded-[8px] border border-white/10 bg-[linear-gradient(135deg,rgba(64,188,244,0.12),rgba(0,224,84,0.08),rgba(255,128,0,0.1))] p-5">
                <p className="text-sm font-medium text-zinc-400">Short review</p>
                <p className="mt-3 text-base leading-8 text-zinc-100">
                  {movie.review}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {movie.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-black/30 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

          </div>
        </section>
      </div>
    </main>
  );
}

async function getDatabaseMovie(id: string) {
  if (!isUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("movie_logs")
    .select(
      "id,tmdb_id,title,poster_path,release_date,genres,watched_date,my_rating,my_review,tags,created_at",
    )
    .eq("id", id)
    .maybeSingle<MovieLog>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function DatabaseMovieDetail({ movie }: { movie: MovieLog }) {
  const genres = normalizeStringArray(movie.genres);
  const tags = normalizeStringArray(movie.tags);

  return (
    <main className="min-h-screen bg-[#050607] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#00e054] shadow-[0_0_22px_rgba(0,224,84,0.8)] transition group-hover:scale-110" />
            <span className="text-xl font-semibold tracking-normal text-white sm:text-2xl">
              My Movie Journal
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/movies"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
            >
              All Movies
            </Link>
            <Link
              href="/add"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#00e054] px-5 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] focus:outline-none focus:ring-2 focus:ring-[#00e054] focus:ring-offset-2 focus:ring-offset-black"
            >
              Add Movie
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[8px] bg-gradient-to-br from-zinc-700 via-zinc-900 to-black shadow-2xl shadow-black/50 ring-1 ring-white/10">
            {movie.poster_path ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getPosterUrl(movie.poster_path)})`,
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92),transparent_55%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/60">
                {movie.release_date ? movie.release_date.slice(0, 4) : "Logged"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
                {movie.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
                Film details
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-6xl">
                {movie.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300">
                This record is saved from your movie journal. Synopsis, cast, and
                director can be filled in later when TMDb integration is connected.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoBlock
                  label="Release date"
                  value={movie.release_date ?? "Unknown"}
                />
                <InfoBlock label="TMDb ID" value={movie.tmdb_id ?? "Unknown"} />
                <InfoBlock
                  label="Created"
                  value={formatDate(movie.created_at)}
                />
                <InfoBlock
                  label="Genres"
                  value={genres.length > 0 ? genres.join(", ") : "Unknown"}
                />
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-[260px_1fr]">
              <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-medium text-zinc-400">My rating</p>
                <p className="mt-3 text-5xl font-semibold text-[#00e054]">
                  {formatRating(movie.my_rating)}
                </p>
                <p className="mt-5 text-sm text-zinc-400">Watched date</p>
                <p className="mt-2 text-base font-medium text-white">
                  {formatDate(movie.watched_date)}
                </p>
              </div>

              <div className="rounded-[8px] border border-white/10 bg-[linear-gradient(135deg,rgba(64,188,244,0.12),rgba(0,224,84,0.08),rgba(255,128,0,0.1))] p-5">
                <p className="text-sm font-medium text-zinc-400">Short review</p>
                <p className="mt-3 text-base leading-8 text-zinc-100">
                  {movie.my_review || "No review yet."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-black/30 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No tags yet.</span>
                  )}
                </div>
              </div>
            </section>

            <MovieLogActions
              id={movie.id}
              initialRating={
                movie.my_rating === null || movie.my_rating === undefined
                  ? ""
                  : String(movie.my_rating)
              }
              initialWatchedDate={movie.watched_date ?? ""}
              initialReview={movie.my_review ?? ""}
              initialTags={tags}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-base font-medium leading-6 text-white">{value}</p>
    </div>
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getPosterUrl(posterPath: string) {
  if (posterPath.startsWith("http")) {
    return posterPath;
  }

  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatRating(rating: number | string | null) {
  if (rating === null || rating === undefined || rating === "") {
    return "-";
  }

  return Number(rating).toFixed(1);
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
