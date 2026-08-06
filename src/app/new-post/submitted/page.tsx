import Link from "next/link";
import PawIcon from "@/components/PawIcon";

export default function SubmittedPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <PawIcon className="w-10 h-10 text-caramel mx-auto mb-4" />
      <h1 className="font-heading text-2xl font-semibold text-caramel-deep mb-2">
        Sent for review
      </h1>
      <p className="text-sm text-ink/60 mb-6">
        Thanks for sharing! Meghna will take a look and publish it soon.
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2 rounded-full bg-caramel text-cream text-sm font-semibold hover:bg-caramel-deep transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}
