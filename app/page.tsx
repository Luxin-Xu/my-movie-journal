import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type MovieLog = {
  id: string;
  title: string;
  poster_path: string | null;
  watched_date: string | null;
  my_rating: number | string | null;
  genres: unknown;
  tags: unknown;
  created_at: string | null;
};

export default async function Home() {
  const [
    { data: recentMovies, error },
    { data: statsRows },
    { data: topMovieRows },
  ] = await Promise.all([
    supabase
      .from("movie_logs")
      .select("id,title,poster_path,watched_date,my_rating,genres,tags,created_at")
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(8),
    supabase.from("movie_logs").select("genres,watched_date"),
    supabase
      .from("movie_logs")
      .select("id,title,poster_path,watched_date,my_rating,genres,tags,created_at")
      .order("my_rating", { ascending: false, nullsFirst: false })
      .order("watched_date", { ascending: false, nullsFirst: false })
      .limit(10),
  ]);

  const movies = (recentMovies ?? []) as MovieLog[];
  const topMovies = (topMovieRows ?? []) as MovieLog[];
  const allStatsRows = (statsRows ?? []) as Pick<
    MovieLog,
    "genres" | "watched_date"
  >[];
  const totalFilms = allStatsRows.length;
  const currentYear = new Date().getFullYear();
  const thisYearCount = allStatsRows.filter((movie) => {
    if (!movie.watched_date) {
      return false;
    }

    return new Date(movie.watched_date).getFullYear() === currentYear;
  }).length;
  const topGenre = getMostCommonGenre(allStatsRows);
  const monthlyRhythm = buildMonthlyRhythm(allStatsRows);

  const stats = [
    { label: "Total films", value: String(totalFilms) },
    { label: "This year", value: String(thisYearCount) },
    { label: "Top genre", value: topGenre },
  ];

  return (
    <main className="min-h-screen bg-[#050607] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-5 py-6 sm:px-8 lg:px-10">
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
              View All Movies
            </Link>
            <Link
              href="/add"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#00e054] px-5 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] focus:outline-none focus:ring-2 focus:ring-[#00e054] focus:ring-offset-2 focus:ring-offset-black"
            >
              Add Movie
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
              Recently added
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
              A private wall for every film night worth remembering.
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="truncate text-2xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {error ? (
          <p className="rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
            {error.message}
          </p>
        ) : null}

        {!error && movies.length === 0 ? (
          <section className="rounded-[8px] border border-dashed border-white/10 bg-white/[0.04] px-5 py-10 text-center">
            <p className="text-base font-medium text-zinc-200">
              No movie logs yet.
            </p>
            <Link
              href="/add"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#00e054] px-5 text-sm font-semibold text-black transition hover:bg-[#20ff73]"
            >
              Add Movie
            </Link>
          </section>
        ) : null}

        {movies.length > 0 ? (
          <section aria-label="Recently added poster wall">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8">
              {movies.map((movie) => (
                <article key={movie.id} className="group">
                  <Link href={`/movie/${movie.id}`} className="block">
                    <PosterCard movie={movie} />
                  </Link>

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {normalizeTags(movie.tags)[0] ?? "Movie"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatDate(movie.watched_date)}
                      </p>
                    </div>
                    <p className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-[#00e054]">
                      {formatRating(movie.my_rating)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {topMovies.length > 0 ? (
          <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-medium text-zinc-400">Top 10</p>
              <ol className="mt-4 space-y-3 text-sm text-zinc-200">
                {topMovies.map((movie, index) => (
                  <li key={movie.id} className="flex items-center gap-3">
                    <span className="w-5 text-zinc-500">{index + 1}</span>
                    <span className="flex-1 truncate">{movie.title}</span>
                    <span className="text-[#ff8000]">
                      {formatRating(movie.my_rating)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex min-h-[260px] flex-col rounded-[8px] border border-white/10 bg-[linear-gradient(135deg,rgba(64,188,244,0.12),rgba(0,224,84,0.08),rgba(255,128,0,0.1))] p-5">
              <p className="text-sm font-medium text-zinc-400">Recent rhythm</p>
              <div className="mt-auto flex h-[172px] items-end gap-1.5 pt-5 sm:gap-2">
                {monthlyRhythm.map((month) => (
                  <div
                    key={month.key}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                  >
                    <div className="flex h-[108px] w-full items-end">
                      <div
                        className={`w-full rounded-t-sm ${
                          month.count === 0 ? "bg-[#00e054]/25" : "bg-[#00e054]"
                        }`}
                        style={{ height: `${month.height}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-white">{month.count}</p>
                    <p className="text-xs text-zinc-500">{month.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function PosterCard({ movie }: { movie: MovieLog }) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-[8px] bg-gradient-to-br from-zinc-700 via-zinc-900 to-black shadow-xl shadow-black/40 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-2 group-hover:ring-[#00e054]/80">
      {movie.poster_path ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getPosterUrl(movie.poster_path)})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
          {movie.created_at ? movie.created_at.slice(0, 4) : "Logged"}
        </p>
        <h2 className="mt-2 text-balance text-lg font-semibold leading-5 text-white">
          {movie.title}
        </h2>
      </div>
    </div>
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
    return "No watch date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

function formatRating(rating: number | string | null) {
  if (rating === null || rating === undefined || rating === "") {
    return "-";
  }

  return Number(rating).toFixed(1);
}

function normalizeTags(tags: unknown) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter((tag): tag is string => typeof tag === "string");
}

function getMostCommonGenre(movies: Pick<MovieLog, "genres">[]) {
  const counts = new Map<string, number>();

  for (const movie of movies) {
    for (const genre of normalizeGenres(movie.genres)) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
}

function normalizeGenres(genres: unknown) {
  if (!Array.isArray(genres)) {
    return [];
  }

  return genres.filter((genre): genre is string => typeof genre === "string");
}

function buildMonthlyRhythm(movies: Pick<MovieLog, "watched_date">[]) {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(currentYear, index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    return {
      key,
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      count: 0,
    };
  });
  const countByMonth = new Map(months.map((month) => [month.key, 0]));

  for (const movie of movies) {
    if (!movie.watched_date) {
      continue;
    }

    const watchedDate = new Date(movie.watched_date);

    if (watchedDate.getFullYear() !== currentYear) {
      continue;
    }

    const key = `${watchedDate.getFullYear()}-${String(
      watchedDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    if (countByMonth.has(key)) {
      countByMonth.set(key, (countByMonth.get(key) ?? 0) + 1);
    }
  }

  const maxCount = Math.max(...countByMonth.values(), 1);

  return months.map((month) => {
    const count = countByMonth.get(month.key) ?? 0;

    return {
      ...month,
      count,
      height: count === 0 ? 5 : Math.max(16, Math.round((count / maxCount) * 100)),
    };
  });
}
