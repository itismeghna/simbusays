"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export default function HeaderAuthMenu({ user }: { user: SessionUser | null }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/login", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold text-caramel-deep hover:bg-cream transition-colors whitespace-nowrap"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-cream text-caramel-deep hover:bg-cream/70 transition-colors shadow-sm whitespace-nowrap"
        >
          Register
        </Link>
      </>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold text-caramel-deep hover:bg-cream transition-colors whitespace-nowrap"
      title={user.email}
    >
      Log out ({user.name.split(" ")[0]})
    </button>
  );
}
