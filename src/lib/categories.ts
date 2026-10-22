// The themes a story can be filed under. Add, rename, or reorder here; the slug
// is what's stored on each post, so keep existing slugs stable once in use.
export const CATEGORIES = [
  { slug: "travel", label: "Travel" },
  { slug: "experiences", label: "Experiences" },
  { slug: "cooking", label: "Cooking" },
  { slug: "science", label: "Science" },
  { slug: "data", label: "Data" },
  { slug: "nature", label: "Nature" },
  { slug: "books", label: "Books" },
  { slug: "everyday", label: "Everyday" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function isCategory(value: unknown): value is CategorySlug {
  return CATEGORIES.some((c) => c.slug === value);
}

export function categoryLabel(slug: string | null | undefined): string | null {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? null;
}
