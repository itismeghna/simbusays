import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} Simbu Says &middot; Stories by Meghna Mane</p>
        <nav className="flex items-center gap-5">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
          <Link href="/new-post" className="hover:text-ink">
            Write
          </Link>
        </nav>
      </div>
    </footer>
  );
}
