import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type SortKey = "recent" | "watched" | "rating";

type MovieLog = {
  id: string;
  title: string;
  poster_path: string | null;
  watched_date: string | null;
  my_rating: number | string | null;
  tags: unknown;
  created_at: string | null;
};

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently added" },
  { key: "watched", label: "Watched date" },
  { key: "rating", label: "Rating high to low" },
];

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const activeSort = parseSort(params.sort);
  const query = supabase
    .from("movie_logs")
    .select("id,title,poster_path,watched_date,my_rating,tags,created_at");

  if (activeSort === "watched") {
    query.order("watched_date", { ascending: false, nullsFirst: false });
  } else if (activeSort === "rating") {
    query.order("my_rating", { ascending: false, nullsFirst: false });
  } else {
    query.order("created_at", { ascending: false, nullsFirst: false });
  }

  const { data: movies, error } = await query;

  return (
    <main className="min-h-screen bg-[#050607] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#00e054] shadow-[0_0_22px_rgba(0,224,84,0.8)] transition group-hover:scale-110" />
            <span className="text-xl font-semibold tracking-normal text-white sm:text-2xl">
              PITATEE&apos;s Movie Journal
            </span>
          </Link>

          <Link
            href="/add"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#00e054] px-5 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] focus:outline-none focus:ring-2 focus:ring-[#00e054] focus:ring-offset-2 focus:ring-offset-black"
          >
            Add Movie
          </Link>
        </header>

        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
              All movies
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Every film in the journal, arranged your way.
            </h1>
          </div>
          <p className="text-sm text-zinc-500">{movies?.length ?? 0} records</p>
        </section>

        <nav
          aria-label="Movie sort options"
          className="flex flex-wrap gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] p-2"
        >
          {sortOptions.map((option) => {
            const isActive = activeSort === option.key;

            return (
              <Link
                key={option.key}
                href={`/movies?sort=${option.key}`}
                className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#00e054] text-black"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </nav>

        {error ? (
          <p className="rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
            {error.message}
          </p>
        ) : null}

        {!error && movies?.length === 0 ? (
          <section className="rounded-[8px] border border-dashed border-white/10 bg-white/[0.04] px-5 py-10 text-center">
            <p className="text-base font-medium text-zinc-200">
              No movies have been added yet.
            </p>
            <Link
              href="/add"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#00e054] px-5 text-sm font-semibold text-black transition hover:bg-[#20ff73]"
            >
              Add Movie
            </Link>
          </section>
        ) : null}

        {movies && movies.length > 0 ? (
          <section aria-label="All movie records poster wall">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {(movies as MovieLog[]).map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group block"
                >
                  <article>
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[8px] bg-gradient-to-br from-zinc-700 via-zinc-900 to-black shadow-xl shadow-black/40 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-2 group-hover:ring-[#00e054]/80">
                      {movie.poster_path ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${getPosterUrl(
                              movie.poster_path,
                            )})`,
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92),transparent_55%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h2 className="text-balance text-lg font-semibold leading-5 text-white">
                          {movie.title}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">
                          {formatDate(movie.watched_date)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {normalizeTags(movie.tags).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/10 px-2 py-1 text-[11px] leading-none text-zinc-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-[#00e054]">
                        {formatRating(movie.my_rating)}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function parseSort(sort: string | undefined): SortKey {
  if (sort === "watched" || sort === "rating") {
    return sort;
  }

  return "recent";
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
    year: "numeric",
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
