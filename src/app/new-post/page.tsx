import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import PawIcon from "@/components/PawIcon";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      {user ? (
        <PostEditor
          isAdmin={user.role === "ADMIN"}
        />
      ) : (
        <div className="max-w-sm mx-auto text-center">
          <PawIcon className="w-10 h-10 text-caramel mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-semibold text-caramel-deep mb-2">
            Log in to write a post
          </h1>
          <p className="text-sm text-ink/60 mb-6">
            Anyone in the pride can submit an adventure. Log in or register to get started.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-caramel text-cream text-sm font-semibold hover:bg-caramel-deep transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-full bg-cream-deep text-caramel-deep text-sm font-semibold hover:bg-honey/40 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
