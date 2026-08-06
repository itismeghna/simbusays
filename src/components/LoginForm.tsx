"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PawIcon from "./PawIcon";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
        Welcome back
      </h1>
      <p className="text-sm text-ink/60 mb-6">Log in to comment, share, or write a post.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoFocus
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        <input
          type="password"
          required
          placeholder="Password"
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
          {loading ? "Checking…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-5">
        New here?{" "}
        <Link href="/register" className="font-semibold text-caramel-deep hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
