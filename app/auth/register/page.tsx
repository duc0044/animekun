import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AuthPageClient } from "../auth-page-client";

export const metadata = { title: "Đăng ký – ANIMEKUN" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  const { error, check_email } = await searchParams;

  return <AuthPageClient mode="register" error={error} checkEmail={!!check_email} />;
}
