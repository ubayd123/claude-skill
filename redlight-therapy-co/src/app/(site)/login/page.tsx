import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/layout/AuthShell";
import { LoginForm } from "@/components/forms/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Trade sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "" } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/account");
  return (
    <AuthShell title="Trade sign in" intro="Sign in to your wholesale account to see trade pricing, send enquiries and download documents.">
      <LoginForm next={next} />
      <p className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
        No account yet? <Link href="/wholesale#apply" className="font-semibold text-red link-u">Apply for wholesale access</Link>
      </p>
    </AuthShell>
  );
}
