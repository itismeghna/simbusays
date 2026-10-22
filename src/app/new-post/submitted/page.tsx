import Link from "next/link";
import { CheckIcon } from "@/components/Icons";

export default function SubmittedPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-24 text-center">
      <span className="mx-auto mb-6 flex w-12 h-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <CheckIcon className="w-5 h-5" />
      </span>
      <h1 className="font-display text-3xl font-medium tracking-tight mb-3">Sent for review</h1>
      <p className="text-muted mb-8">
        Thanks for sharing! Meghna will take a look and publish it soon.
      </p>
      <Link href="/" className="btn btn-secondary">
        Back to stories
      </Link>
    </div>
  );
}
