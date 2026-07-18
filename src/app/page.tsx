import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import Whiskers from "@/components/Whiskers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      media: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div>
      <section className="mx-auto max-w-5xl px-5 pt-14 pb-10 flex flex-col items-center text-center">
        <div className="relative w-28 h-28 rounded-full overflow-hidden ring-8 ring-cream-deep shadow-md mb-5">
          <Image
            src="/images/simbu.png"
            alt="Simbu the lion"
            fill
            sizes="112px"
            className="object-cover object-top"
          />
        </div>
        <div className="flex items-center gap-3 text-caramel mb-3">
          <Whiskers />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-caramel-deep/70">
            Roars, rambles &amp; real adventures
          </span>
          <Whiskers side="right" />
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold text-caramel-deep mb-4">
          Simbu Says
        </h1>
        <p className="max-w-xl text-ink/70">
          Curated adventures from Meghna, narrated in spirit by a very opinionated
          plush lion. Expect day trips, small joys, and the occasional roar.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        {posts.length === 0 ? (
          <div className="rounded-3xl bg-cream-deep/60 py-16 text-center text-caramel-deep/70">
            <p className="font-heading text-xl mb-2">No adventures posted yet</p>
            <p className="text-sm">Simbu is waiting patiently. Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
