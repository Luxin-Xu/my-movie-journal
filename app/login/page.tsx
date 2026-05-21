"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/");
      }
    });
  }, []);

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSendingMagicLink(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSendingMagicLink(false);
      return;
    }

    setMessage("Check your email for the magic link.");
    setIsSendingMagicLink(false);
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSigningIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
      return;
    }

    window.location.replace("/");
  }

  return (
    <main className="min-h-screen bg-[#050607] text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#00e054] shadow-[0_0_22px_rgba(0,224,84,0.8)] transition group-hover:scale-110" />
            <span className="text-xl font-semibold tracking-normal text-white sm:text-2xl">
              PITATEE&apos;s Movie Journal
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/10"
          >
            Back Home
          </Link>
        </header>

        <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#40bcf4]">
            Owner sign in
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Unlock editing for your movie journal.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-400">
            Public visitors can browse everything. Signing in enables adding,
            editing, and deleting movie records.
          </p>

          <div className="mt-6 max-w-xl">
            {errorMessage ? (
              <p className="mb-4 rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                {errorMessage}
              </p>
            ) : null}

            {message ? (
              <p className="mb-4 rounded-[8px] border border-[#00e054]/40 bg-[#00e054]/10 px-4 py-3 text-sm leading-6 text-[#99f6c1]">
                {message}
              </p>
            ) : null}

            <form onSubmit={handleMagicLink}>
              <label className="block text-sm font-medium text-zinc-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="mt-3 h-12 w-full rounded-[8px] border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00e054] focus:ring-2 focus:ring-[#00e054]/20"
                />
              </label>

              <button
                type="submit"
                disabled={isSendingMagicLink || isSigningIn}
                className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#00e054] px-6 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(0,224,84,0.24)] transition hover:bg-[#20ff73] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300 disabled:shadow-none"
              >
                {isSendingMagicLink ? "Sending..." : "Send magic link"}
              </button>
            </form>

            <div className="my-6 h-px bg-white/10" />

            <form onSubmit={handlePasswordSignIn}>
              <label className="block text-sm font-medium text-zinc-300">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Your password"
                  className="mt-3 h-12 w-full rounded-[8px] border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-[#00e054] focus:ring-2 focus:ring-[#00e054]/20"
                />
              </label>

              <button
                type="submit"
                disabled={isSendingMagicLink || isSigningIn}
                className="mt-5 inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-500"
              >
                {isSigningIn ? "Signing in..." : "Sign in with password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
