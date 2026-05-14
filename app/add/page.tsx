"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const fakeResults = [
  {
    tmdbId: "666277",
    title: "Past Lives",
    releaseDate: "2023-06-02",
    year: "2023",
    genres: ["Drama", "Romance"],
    posterPath: "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    palette: "from-emerald-300 via-cyan-700 to-slate-950",
  },
  {
    tmdbId: "693134",
    title: "Dune: Part Two",
    releaseDate: "2024-03-01",
    year: "2024",
    genres: ["Sci-Fi", "Adventure"],
    posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    palette: "from-amber-200 via-orange-700 to-stone-950",
  },
  {
    tmdbId: "915935",
    title: "Anatomy of a Fall",
    releaseDate: "2023-10-13",
    year: "2023",
    genres: ["Mystery", "Drama"],
    posterPath: "/kQs6keheMwCxJxrzV83VUwFtHkB.jpg",
    palette: "from-red-200 via-zinc-700 to-black",
  },
  {
    tmdbId: "976893",
    title: "Perfect Days",
    releaseDate: "2023-12-22",
    year: "2023",
    genres: ["Drama", "Slice of Life"],
    posterPath: "/4tHe7jYqGgx19HRkO7SGuZLylkW.jpg",
    palette: "from-yellow-100 via-green-700 to-zinc-950",
  },
];

type MovieResult = (typeof fakeResults)[number];

export default function AddMoviePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieResult>(fakeResults[0]);
  const [rating, setRating] = useState("4.5");
  const [review, setReview] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [tags, setTags] = useState("cinema, favorite");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return fakeResults;
    }

    return fakeResults.filter((movie) =>
      movie.title.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    const parsedRating = Number(rating);
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (Number.isNaN(parsedRating)) {
      setErrorMessage("Rating must be a number.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from("movie_logs").insert({
      tmdb_id: selectedMovie.tmdbId,
      title: selectedMovie.title,
      poster_path: selectedMovie.posterPath,
      release_date: selectedMovie.releaseDate,
      genres: selectedMovie.genres,
      watched_date: watchedDate || null,
      my_rating: parsedRating,
      my_review: review.trim() || null,
      tags: tagList,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    router.push("/");
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
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
          >
            Back Home
          </Link>
        </header>

        <section className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
            Add movie
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Log a film while the feeling is still warm.
          </h1>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
            <label
              htmlFor="movie-search"
              className="text-sm font-medium text-zinc-300"
            >
              Movie name
            </label>
            <input
              id="movie-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a movie"
              className="mt-3 h-12 w-full rounded-[8px] border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-[#40bcf4] focus:ring-2 focus:ring-[#40bcf4]/20"
            />

            <div className="mt-5 grid gap-3">
              {searchResults.map((movie) => {
                const isSelected = selectedMovie.tmdbId === movie.tmdbId;

                return (
                  <button
                    key={movie.tmdbId}
                    type="button"
                    onClick={() => setSelectedMovie(movie)}
                    className={`grid grid-cols-[64px_1fr] items-center gap-4 rounded-[8px] border p-3 text-left transition ${
                      isSelected
                        ? "border-[#00e054] bg-[#00e054]/10"
                        : "border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`block aspect-[2/3] rounded-[6px] bg-gradient-to-br ${movie.palette} ring-1 ring-white/10`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-base font-semibold text-white">
                        {movie.title}
                      </span>
                      <span className="mt-1 block text-sm text-zinc-400">
                        {movie.year} · {movie.genres.join(", ")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <form
            onSubmit={handleSave}
            className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
          >
            {errorMessage ? (
              <p className="mb-4 rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                {errorMessage}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">
                Rating
                <input
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  inputMode="decimal"
                  placeholder="4.5"
                  className="mt-3 h-12 w-full rounded-[8px] border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00e054] focus:ring-2 focus:ring-[#00e054]/20"
                />
              </label>

              <label className="text-sm font-medium text-zinc-300">
                Watched date
                <input
                  type="date"
                  value={watchedDate}
                  onChange={(event) => setWatchedDate(event.target.value)}
                  className="mt-3 h-12 w-full rounded-[8px] border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition focus:border-[#00e054] focus:ring-2 focus:ring-[#00e054]/20"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-zinc-300">
              Tags
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="animation, sci-fi"
                className="mt-3 h-12 w-full rounded-[8px] border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00e054] focus:ring-2 focus:ring-[#00e054]/20"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-zinc-300">
              Short review
              <textarea
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="A few words about the mood, a scene, or why it stayed with you."
                rows={7}
                className="mt-3 w-full resize-none rounded-[8px] border border-white/10 bg-black/30 px-4 py-3 text-base leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00e054] focus:ring-2 focus:ring-[#00e054]/20"
              />
            </label>

            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="min-w-0 text-sm text-zinc-400">
                Selected:{" "}
                <span className="font-medium text-zinc-100">
                  {selectedMovie.title}
                </span>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#00e054] px-6 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] focus:outline-none focus:ring-2 focus:ring-[#00e054] focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300 disabled:shadow-none"
              >
                {isSaving ? "Saving..." : "Save Movie"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
