import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_PORTRAIT } from "@/lib/site";
import CircleImageManager from "@/components/CircleImageManager";

export const dynamic = "force-dynamic";

export default async function PhotoSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const portraits = await prisma.sitePortrait.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, active: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight mb-2">Your photo</h1>
      <p className="text-muted mb-10">
        This is the picture of you on the About page. Past photos stay here so you can switch back.
      </p>
      <CircleImageManager
        images={portraits}
        defaultUrl={DEFAULT_PORTRAIT}
        apiPath="/api/portraits"
        noun="photo"
        cropHint="Drag to position yourself, then zoom to frame the shot."
      />
    </div>
  );
}
