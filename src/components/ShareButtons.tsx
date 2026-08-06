"use client";

import { useState } from "react";
import PawIcon from "./PawIcon";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the share sheet
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cream-deep text-caramel-deep text-xs font-semibold hover:bg-honey/40 transition-colors"
    >
      <PawIcon className="w-3.5 h-3.5" />
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
