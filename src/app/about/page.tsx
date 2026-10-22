import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About — Simbu Says",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-14 sm:py-20">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-subtle mb-8">
        <Image src="/images/meghna.jpg" alt="Meghna Mane" fill sizes="96px" className="object-cover" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-accent mb-3">About</p>
      <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-8">
        Hi, I&apos;m Meghna.
      </h1>
      <div className="space-y-5 text-lg leading-[1.75] text-ink/90">
        <p>
          By day, I&apos;m a senior data analyst at the NHS — the rest of the time, I&apos;m
          usually somewhere in the middle of an adventure.
        </p>
        <p>
          Simbu Says is where I gather those adventures and share them with the world, in the
          hope that they inform, intrigue, and put a smile or two on a few faces along the way.
          Simbu, the plush lion, comes along for most of them.
        </p>
      </div>
      <div className="mt-12 flex flex-wrap gap-2">
        <Link href="/" className="btn btn-primary">
          Read the stories
        </Link>
        <Link href="/new-post" className="btn btn-secondary">
          Share your own
        </Link>
      </div>
    </div>
  );
}
