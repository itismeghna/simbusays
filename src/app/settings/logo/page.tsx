import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_LOGO } from "@/lib/site";
import CircleImageManager from "@/components/CircleImageManager";

export const dynamic = "force-dynamic";

export default async function LogoSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const logos = await prisma.siteLogo.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, active: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight mb-2">Site logo</h1>
      <p className="text-muted mb-10">
        Give Simbu a new look whenever you like. Past logos stay here so you can switch back.
      </p>
      <CircleImageManager
        images={logos}
        defaultUrl={DEFAULT_LOGO}
        apiPath="/api/logos"
        noun="logo"
        cropHint="Drag to position Simbu, then zoom to frame him."
        fitClass="object-cover object-top"
        showHeaderPreview
      />
    </div>
  );
}
