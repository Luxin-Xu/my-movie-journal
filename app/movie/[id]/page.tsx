import Link from "next/link";
import { notFound } from "next/navigation";

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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-base font-medium leading-6 text-white">{value}</p>
    </div>
  );
}
