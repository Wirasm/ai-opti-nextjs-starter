import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/core/supabase/server";
import { signOut } from "@/features/auth/actions";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="font-semibold">
              Dashboard
            </a>
            <a
              href="/dashboard/communities"
              className="text-muted-foreground hover:text-foreground"
            >
              Communities
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
