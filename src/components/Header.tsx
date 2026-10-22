import Image from "next/image";
import Link from "next/link";
import HeaderAuthMenu from "./HeaderAuthMenu";
import { PencilIcon } from "./Icons";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLogoUrl } from "@/lib/site";

export default async function Header() {
  const [user, logoUrl] = await Promise.all([getCurrentUser(), getLogoUrl()]);
  const pendingCount =
    user?.role === "ADMIN" ? await prisma.post.count({ where: { status: "PENDING" } }) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto max-w-5xl h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="relative w-8 h-8 rounded-full overflow-hidden bg-subtle shrink-0">
            <Image
              src={logoUrl}
              alt=""
              fill
              sizes="32px"
              className="object-cover object-top"
            />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight whitespace-nowrap">
            Simbu Says
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link href="/about" className="btn btn-ghost px-3">
            About
          </Link>
          <Link href="/new-post" className="btn btn-primary px-3 sm:px-4">
            <PencilIcon className="w-3.5 h-3.5" />
            Write
          </Link>
          <HeaderAuthMenu user={user} pendingCount={pendingCount} />
        </nav>
      </div>
    </header>
  );
}
