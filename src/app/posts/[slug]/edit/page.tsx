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

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) notFound();

  const isOwner = user.id === post.authorId;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <PostEditor
        isAdmin={isAdmin}
        existingPost={{ slug: post.slug, title: post.title, body: post.body }}
      />
    </div>
  );
}
