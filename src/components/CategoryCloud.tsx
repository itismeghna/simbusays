import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

/** Size each theme by how many stories it holds, so the cloud doubles as a map of the blog. */
function sizeFor(count: number, max: number) {
  if (count === 0) return "text-lg sm:text-xl";
  const ratio = count / max;
  if (ratio > 0.66) return "text-3xl sm:text-[2.5rem]";
  if (ratio > 0.33) return "text-2xl sm:text-3xl";
  return "text-xl sm:text-2xl";
}

export default function CategoryCloud({
  counts,
  active,
}: {
  counts: Record<string, number>;
  active: string | null;
}) {
  const max = Math.max(1, ...Object.values(counts));

  return (
    <nav aria-label="Browse by theme" className="mt-12 w-full max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-wider text-faint mb-5">
        Explore by theme
        {active && (
          <>
            {" · "}
            <Link href="/" scroll={false} className="text-muted hover:text-ink normal-case tracking-normal">
              show all
            </Link>
          </>
        )}
      </p>
      <ul className="flex flex-wrap items-baseline justify-center gap-x-5 sm:gap-x-7 gap-y-3">
        {CATEGORIES.map((c, i) => {
          const count = counts[c.slug] ?? 0;
          const isActive = active === c.slug;
          const tone = isActive
            ? "text-accent underline decoration-accent/40 decoration-2 underline-offset-[6px]"
            : count === 0
              ? "text-faint/70 hover:text-muted"
              : active
                ? "text-ink/40 hover:text-accent"
                : "text-ink/85 hover:text-accent";
          return (
            <li key={c.slug}>
              <Link
                href={isActive ? "/" : `/?category=${c.slug}`}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={`font-display leading-none tracking-tight transition-colors ${
                  i % 2 ? "italic" : ""
                } ${sizeFor(count, max)} ${tone}`}
              >
                {c.label}
                {count > 0 && (
                  <sup className="ml-0.5 font-sans text-[10px] not-italic font-medium text-faint align-super">
                    {count}
                  </sup>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
