import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { media: { orderBy: { order: "asc" } } },
  });
  if (!post) notFound();

  const isOwner = user.id === post.authorId;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) redirect("/");

  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-10">
      <PostEditor
        isAdmin={isAdmin}
        existingPost={{
          slug: post.slug,
          title: post.title,
          body: post.body,
          category: post.category,
          media: post.media.map((m) => ({ id: m.id, url: m.url, type: m.type })),
        }}
      />
    </div>
  );
}
