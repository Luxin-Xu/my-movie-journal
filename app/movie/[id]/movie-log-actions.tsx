"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type MovieLogActionsProps = {
  id: string;
  initialRating: string;
  initialWatchedDate: string;
  initialReview: string;
  initialTags: string[];
};

export function MovieLogActions({
  id,
  initialRating,
  initialWatchedDate,
  initialReview,
  initialTags,
}: MovieLogActionsProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [rating, setRating] = useState(initialRating);
  const [watchedDate, setWatchedDate] = useState(initialWatchedDate);
  const [review, setReview] = useState(initialReview);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setIsAuthenticated(Boolean(data.session));
      setIsCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!isAuthenticated) {
      setErrorMessage("Please sign in before editing this movie log.");
      return;
    }

    setIsSaving(true);

    const parsedRating = Number(rating);

    if (Number.isNaN(parsedRating)) {
      setErrorMessage("Rating must be a number.");
      setIsSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("movie_logs")
      .update({
        my_rating: rating.trim() ? parsedRating : null,
        watched_date: watchedDate || null,
        my_review: review.trim() || null,
        tags: parseTags(tags),
      })
      .eq("id", id)
      .select("id,my_rating,watched_date,my_review,tags")
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    if (!data) {
      setErrorMessage("No movie log was updated. Please check your permissions.");
      setIsSaving(false);
      return;
    }

    setMessage("Movie log updated.");
    setIsSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this movie log?");

    if (!confirmed) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    if (!isAuthenticated) {
      setErrorMessage("Please sign in before deleting this movie log.");
      return;
    }

    setIsDeleting(true);

    const { data, error } = await supabase
      .from("movie_logs")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      setIsDeleting(false);
      return;
    }

    if (!data) {
      setErrorMessage("No movie log was deleted. Please check your permissions.");
      setIsDeleting(false);
      return;
    }

    router.push("/movies");
    router.refresh();
  }

  if (isCheckingAuth || !isAuthenticated) {
    return null;
  }

  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
            Edit log
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Update your record
          </h2>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
          className="inline-flex h-11 items-center justify-center rounded-full border border-red-500/40 px-5 text-sm font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-500"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
          {errorMessage}
        </p>
      ) : null}

      {message ? (
        <p className="mt-5 rounded-[8px] border border-[#00e054]/40 bg-[#00e054]/10 px-4 py-3 text-sm leading-6 text-[#99f6c1]">
          {message}
        </p>
      ) : null}

      <form onSubmit={handleUpdate} className="mt-5">
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
              type="text"
              value={watchedDate}
              onChange={(event) => setWatchedDate(event.target.value)}
              inputMode="numeric"
              placeholder="yyyy-mm-dd"
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
            rows={6}
            placeholder="A few words about the mood, a scene, or why it stayed with you."
            className="mt-3 w-full resize-none rounded-[8px] border border-white/10 bg-black/30 px-4 py-3 text-base leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00e054] focus:ring-2 focus:ring-[#00e054]/20"
          />
        </label>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isDeleting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#00e054] px-6 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] focus:outline-none focus:ring-2 focus:ring-[#00e054] focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300 disabled:shadow-none"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function parseTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
