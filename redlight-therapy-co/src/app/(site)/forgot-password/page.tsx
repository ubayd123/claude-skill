import type { Metadata } from "next";
import AuthShell from "@/components/layout/AuthShell";
import { ForgotForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset password" intro="Enter the email on your account and we will send you a link to choose a new password.">
      <ForgotForm />
    </AuthShell>
  );
}
