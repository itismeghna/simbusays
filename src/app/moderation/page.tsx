import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ModerationList from "@/components/ModerationList";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const posts = await prisma.post.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { name: true, email: true } },
      media: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight mb-2">Review submissions</h1>
      <p className="text-muted mb-10">
        Stories from members appear here until you approve or reject them.
      </p>
      <ModerationList posts={posts} />
    </div>
  );
}
