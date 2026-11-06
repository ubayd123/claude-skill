import type { Metadata } from "next";
import AuthShell from "@/components/layout/AuthShell";
import { SetPasswordForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Set your password", robots: { index: false }, referrer: "no-referrer" };

export default async function SetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthShell title="Set your password" intro="Choose a password for your Redlight Therapy Co. account. You will be signed in straight away.">
      <SetPasswordForm token={token} />
    </AuthShell>
  );
}
