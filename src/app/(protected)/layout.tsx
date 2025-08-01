import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

import { AppSidebar } from "./_components/side-bar";
import { GlobalTokenDialog } from "./doctors/_components/global-token-dialog";
import { TokenDialogProvider } from "./doctors/_components/token-dialog-context";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // Redirecionar médicos para seu dashboard específico
  if (session.user.role === "doctor") {
    redirect("/doctor/dashboard");
  }

  return (
    <TokenDialogProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full min-h-screen bg-background">
          <div className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          <div className="p-4">
            {children}
          </div>
        </main>
        <GlobalTokenDialog />
      </SidebarProvider>
    </TokenDialogProvider>
  );
}
