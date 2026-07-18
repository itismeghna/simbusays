import { isAuthed } from "@/lib/auth";
import LoginGate from "@/components/LoginGate";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const authed = await isAuthed();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      {authed ? <PostEditor /> : <LoginGate />}
    </div>
  );
}
