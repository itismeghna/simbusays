import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ModerationList from "@/components/ModerationList";
import PawIcon from "@/components/PawIcon";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const posts = await prisma.post.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-heading text-2xl font-semibold text-caramel-deep mb-6 flex items-center gap-2">
        <PawIcon className="w-5 h-5 text-caramel" />
        Posts awaiting review
      </h1>
      <ModerationList posts={posts} />
    </div>
  );
}
