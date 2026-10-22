import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, readingTime } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";
import MediaGallery from "@/components/MediaGallery";
import CommentSection from "@/components/CommentSection";
import ShareButtons from "@/components/ShareButtons";
import PostActions from "@/components/PostActions";
import Avatar from "@/components/Avatar";
import { ArrowLeftIcon } from "@/components/Icons";
import { categoryLabel } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      media: { orderBy: { order: "asc" } },
      comments: { orderBy: { createdAt: "asc" }, include: { user: { select: { name: true } } } },
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) notFound();

  const isOwner = user?.id === post.authorId;
  const isAdmin = user?.role === "ADMIN";
  if (post.status !== "PUBLISHED" && !isOwner && !isAdmin) notFound();

  const paragraphs = post.body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .filter(Boolean);

  const url = `https://simbusays.com/posts/${post.slug}`;

  return (
    <article className="mx-auto max-w-[720px] px-4 sm:px-6 pt-10 sm:pt-14">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-10">
        <ArrowLeftIcon className="w-4 h-4" />
        All stories
      </Link>

      {post.status !== "PUBLISHED" && (
        <p className="mb-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">
          {post.status === "PENDING"
            ? "Awaiting review — only you and Meghna can see this post for now."
            : "This post wasn't approved — only you and Meghna can see it."}
        </p>
      )}

      {categoryLabel(post.category) && (
        <Link
          href={`/?category=${post.category}`}
          className="inline-block text-xs font-medium uppercase tracking-wider text-accent hover:underline underline-offset-4 mb-4"
        >
          {categoryLabel(post.category)}
        </Link>
      )}

      <h1 className="font-display text-4xl sm:text-5xl font-medium leading-[1.1] tracking-tight mb-6">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} size="w-10 h-10 text-sm" />
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            <p className="text-xs text-muted">
              {formatDate(post.createdAt)} &middot; {readingTime(post.body)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareButtons title={post.title} url={url} />
          {(isOwner || isAdmin) && <PostActions slug={post.slug} />}
        </div>
      </div>

      <MediaGallery media={post.media} />

      <div className="space-y-6 text-[17px] sm:text-lg leading-[1.75] text-ink/90 mt-10">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>

      <CommentSection slug={post.slug} comments={post.comments} currentUser={user} />
    </article>
  );
}
