import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user?.studio && !user.studio.onboardingCompleted) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}
