import Link from "next/link";

const recentMovies = [
  {
    id: "1",
    title: "Past Lives",
    year: "2023",
    watchedDate: "May 12",
    rating: "4.5",
    genre: "Drama",
    palette: "from-emerald-300 via-cyan-700 to-slate-950",
  },
  {
    id: "2",
    title: "Dune: Part Two",
    year: "2024",
    watchedDate: "May 09",
    rating: "5.0",
    genre: "Sci-Fi",
    palette: "from-amber-200 via-orange-700 to-stone-950",
  },
  {
    id: "3",
    title: "Anatomy of a Fall",
    year: "2023",
    watchedDate: "May 06",
    rating: "4.0",
    genre: "Mystery",
    palette: "from-red-200 via-zinc-700 to-black",
  },
  {
    title: "Aftersun",
    year: "2022",
    watchedDate: "May 02",
    rating: "4.5",
    genre: "Memory",
    palette: "from-sky-200 via-indigo-600 to-slate-950",
  },
  {
    title: "The Zone of Interest",
    year: "2023",
    watchedDate: "Apr 28",
    rating: "4.0",
    genre: "History",
    palette: "from-lime-200 via-neutral-600 to-zinc-950",
  },
  {
    title: "Decision to Leave",
    year: "2022",
    watchedDate: "Apr 24",
    rating: "5.0",
    genre: "Romance",
    palette: "from-teal-200 via-rose-700 to-neutral-950",
  },
  {
    title: "Perfect Days",
    year: "2023",
    watchedDate: "Apr 20",
    rating: "4.5",
    genre: "Slice of Life",
    palette: "from-yellow-100 via-green-700 to-zinc-950",
  },
  {
    title: "Monster",
    year: "2023",
    watchedDate: "Apr 16",
    rating: "4.0",
    genre: "Drama",
    palette: "from-fuchsia-200 via-blue-700 to-slate-950",
  },
];

const stats = [
  { label: "Films this year", value: "42" },
  { label: "Average rating", value: "4.2" },
  { label: "Favorite genre", value: "Drama" },
];

export default function Home() {
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

          <Link
            href="/add"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#00e054] px-5 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] focus:outline-none focus:ring-2 focus:ring-[#00e054] focus:ring-offset-2 focus:ring-offset-black"
          >
            Add Movie
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
              Recently watched
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
              A private wall for every film night worth remembering.
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Recently watched poster wall">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8">
            {recentMovies.map((movie) => (
              <article key={movie.title} className="group">
                {"id" in movie ? (
                  <Link href={`/movie/${movie.id}`} className="block">
                    <PosterCard movie={movie} />
                  </Link>
                ) : (
                  <PosterCard movie={movie} />
                )}

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {movie.genre}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{movie.watchedDate}</p>
                  </div>
                  <p className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-[#00e054]">
                    {movie.rating}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-medium text-zinc-400">Top 10</p>
            <ol className="mt-4 space-y-3 text-sm text-zinc-200">
              {recentMovies.slice(0, 5).map((movie, index) => (
                <li key={movie.title} className="flex items-center gap-3">
                  <span className="w-5 text-zinc-500">{index + 1}</span>
                  <span className="flex-1 truncate">{movie.title}</span>
                  <span className="text-[#ff8000]">{movie.rating}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-[linear-gradient(135deg,rgba(64,188,244,0.12),rgba(0,224,84,0.08),rgba(255,128,0,0.1))] p-5">
            <p className="text-sm font-medium text-zinc-400">Monthly rhythm</p>
            <div className="mt-5 flex h-32 items-end gap-2">
              {[32, 58, 44, 72, 50, 86, 64, 92, 48, 76, 60, 68].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-sm bg-white/75"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PosterCard({ movie }: { movie: (typeof recentMovies)[number] }) {
  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-[8px] bg-gradient-to-br ${movie.palette} shadow-xl shadow-black/40 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-2 group-hover:ring-[#00e054]/80`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.35),transparent_32%),linear-gradient(to_top,rgba(0,0,0,0.9),transparent_52%)]" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
          {movie.year}
        </p>
        <h2 className="mt-2 text-balance text-lg font-semibold leading-5 text-white">
          {movie.title}
        </h2>
      </div>
    </div>
  );
}
