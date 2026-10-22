import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight mb-3">Share a story</h1>
        <p className="text-muted mb-8">
          Anyone can submit an adventure. Log in or create a free account to get started.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/login" className="btn btn-secondary">
            Log in
          </Link>
          <Link href="/register" className="btn btn-primary">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-10">
      <PostEditor isAdmin={user.role === "ADMIN"} />
    </div>
  );
}
