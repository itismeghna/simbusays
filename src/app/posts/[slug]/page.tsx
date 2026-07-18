import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import MediaGallery from "@/components/MediaGallery";
import CommentSection from "@/components/CommentSection";
import Whiskers from "@/components/Whiskers";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      media: { orderBy: { order: "asc" } },
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!post) notFound();

  const paragraphs = post.body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <div className="flex items-center gap-3 text-caramel mb-4">
        <Whiskers />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-caramel-deep/60">
          {formatDate(post.createdAt)}
        </span>
        <Whiskers side="right" />
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-caramel-deep mb-6 text-center">
        {post.title}
      </h1>

      <MediaGallery media={post.media} />

      <div className="prose-simbu space-y-4 text-ink/85 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <CommentSection slug={post.slug} comments={post.comments} />
    </article>
  );
}
