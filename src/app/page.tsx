import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { readingTime } from "@/lib/format";
import { categoryLabel, isCategory } from "@/lib/categories";
import PostCard, { FeaturedPostCard } from "@/components/PostCard";
import CategoryCloud from "@/components/CategoryCloud";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const requested = (await searchParams).category;
  const active = isCategory(requested) ? requested : null;

  const [rows, grouped] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED", ...(active && { category: active }) },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        media: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.groupBy({
      by: ["category"],
      where: { status: "PUBLISHED" },
      _count: { _all: true },
    }),
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.category ?? "", g._count._all]));
  const posts = rows.map(({ body, ...post }) => ({ ...post, readingTime: readingTime(body) }));
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="pt-14 pb-14 sm:pt-20 sm:pb-16 flex flex-col items-center text-center">
        <span className="relative w-16 h-16 rounded-full overflow-hidden bg-subtle mb-5">
          <Image
            src="/images/simbu.png"
            alt="Simbu the lion"
            fill
            sizes="64px"
            loading="eager"
            className="object-cover object-top"
          />
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-4">
          Simbu Says
        </h1>
        <p className="max-w-md text-muted leading-relaxed">
          Small adventures and everyday joys, collected by Meghna and narrated in spirit by a
          rather opinionated plush lion.
        </p>
        <CategoryCloud counts={counts} active={active} />
      </section>

      {active ? (
        <section className="pt-10 border-t border-line">
          <h2 className="font-display text-3xl font-medium tracking-tight mb-1">
            {categoryLabel(active)}
          </h2>
          <p className="text-sm text-muted mb-10">
            {posts.length} {posts.length === 1 ? "story" : "stories"}
          </p>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line py-16 text-center">
              <p className="text-muted mb-5">Nothing filed under {categoryLabel(active)} yet.</p>
              <Link href="/" scroll={false} className="btn btn-secondary">
                See all stories
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      ) : !featured ? (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <p className="font-display text-xl mb-2">No stories yet</p>
          <p className="text-sm text-muted mb-6">The first adventure is on its way.</p>
          <Link href="/new-post" className="btn btn-secondary">
            Write the first one
          </Link>
        </div>
      ) : (
        <>
          <FeaturedPostCard post={featured} />
          {rest.length > 0 && (
            <section className="mt-16 sm:mt-20 pt-10 border-t border-line">
              <h2 className="text-sm font-medium text-muted mb-8">More stories</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
