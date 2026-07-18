import Image from "next/image";
import Whiskers from "@/components/Whiskers";
import PawIcon from "@/components/PawIcon";

export const metadata = {
  title: "About — Simbu Says",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative w-36 h-36 rounded-full overflow-hidden ring-8 ring-cream-deep shadow-md mb-6">
          <Image
            src="/images/meghna.jpg"
            alt="Meghna Mane"
            fill
            sizes="144px"
            className="object-cover"
          />
        </div>
        <div className="flex items-center gap-3 text-caramel mb-2">
          <Whiskers />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-caramel-deep/70">
            The human behind the mane
          </span>
          <Whiskers side="right" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-caramel-deep">
          Meghna Mane
        </h1>
      </div>

      <div className="rounded-3xl bg-cream-deep/50 p-6 sm:p-8">
        <p className="text-lg leading-relaxed text-ink/85">
          Hi, I&apos;m Meghna Mane. By day, I&apos;m a senior data analyst at the
          NHS — the rest of the time, I&apos;m usually somewhere in the middle of
          an adventure. Simbu Says is where I gather those adventures and share
          them with the world, in the hope that they inform, intrigue, and put a
          smile or two on a few faces along the way.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-caramel/70">
        <PawIcon className="w-4 h-4" />
        <PawIcon className="w-4 h-4" />
        <PawIcon className="w-4 h-4" />
      </div>
    </div>
  );
}
