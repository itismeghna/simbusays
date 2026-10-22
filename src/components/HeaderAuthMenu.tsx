"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import type { SessionUser } from "@/lib/auth";

export default function HeaderAuthMenu({
  user,
  pendingCount,
}: {
  user: SessionUser | null;
  pendingCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/login", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link href="/login" className="btn btn-ghost px-3">
        Log in
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center rounded-full p-0.5 hover:ring-4 hover:ring-subtle transition-shadow"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <Avatar name={user.name} />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-paper" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-xl border border-line bg-surface p-1.5 shadow-lg shadow-ink/5"
        >
          <div className="px-3 py-2.5 border-b border-line mb-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>
          {user.role === "ADMIN" && (
            <Link
              href="/moderation"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-subtle"
            >
              Review submissions
              {pendingCount > 0 && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link
              href="/settings/logo"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-subtle"
            >
              Change logo
            </Link>
          )}
          <Link
            href="/new-post"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-subtle"
          >
            Write a post
          </Link>
          <button
            role="menuitem"
            onClick={handleLogout}
            className="block w-full text-left rounded-lg px-3 py-2 text-sm text-muted hover:bg-subtle hover:text-ink"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
