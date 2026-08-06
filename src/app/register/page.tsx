import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "@/components/RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <RegisterForm />
    </div>
  );
}
