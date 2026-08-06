"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PawIcon from "./PawIcon";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto text-center">
      <PawIcon className="w-10 h-10 text-caramel mx-auto mb-4" />
      <h1 className="font-heading text-2xl font-semibold text-caramel-deep mb-2">
        Join the pride
      </h1>
      <p className="text-sm text-ink/60 mb-6">
        Register to comment, share adventures, and submit your own posts.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          required
          autoFocus
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        {error && <p className="text-sm text-blush-deep">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-caramel text-cream text-sm font-semibold py-2 hover:bg-caramel-deep transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-5">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-caramel-deep hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
