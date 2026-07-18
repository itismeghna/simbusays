"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PawIcon from "./PawIcon";

export default function LoginGate() {
  const router = useRouter();
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
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto text-center">
      <PawIcon className="w-10 h-10 text-caramel mx-auto mb-4" />
      <h1 className="font-heading text-2xl font-semibold text-caramel-deep mb-2">
        Author's den
      </h1>
      <p className="text-sm text-ink/60 mb-6">
        This bit is just for Meghna. Enter the password to publish a new adventure.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          required
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        {error && <p className="text-sm text-blush-deep">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-caramel text-cream text-sm font-semibold py-2 hover:bg-caramel-deep transition-colors disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
