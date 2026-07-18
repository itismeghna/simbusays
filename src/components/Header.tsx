import Image from "next/image";
import Link from "next/link";
import Whiskers from "./Whiskers";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-cream-deep">
      <div className="mx-auto max-w-5xl px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <span className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-4 ring-cream shadow-sm shrink-0 bg-honey">
            <Image
              src="/images/simbu.png"
              alt="Simbu the lion"
              fill
              sizes="48px"
              className="object-cover object-top group-hover:scale-105 transition-transform"
            />
          </span>
          <span className="flex items-center gap-2 text-caramel-deep min-w-0">
            <Whiskers className="text-caramel-deep hidden sm:inline-flex" />
            <span className="font-heading text-lg sm:text-2xl font-semibold tracking-tight whitespace-nowrap">
              Simbu Says
            </span>
            <Whiskers side="right" className="text-caramel-deep hidden sm:inline-flex" />
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          <Link
            href="/"
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold text-caramel-deep hover:bg-cream transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold text-caramel-deep hover:bg-cream transition-colors whitespace-nowrap"
          >
            About
          </Link>
          <Link
            href="/new-post"
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-caramel text-cream hover:bg-caramel-deep transition-colors shadow-sm whitespace-nowrap"
          >
            New post
          </Link>
        </nav>
      </div>
      <div className="mane-edge text-caramel" />
    </header>
  );
}
