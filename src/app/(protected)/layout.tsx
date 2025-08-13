import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

import { AppSidebar } from "./_components/side-bar";
import { GlobalTokenDialog } from "./doctors/_components/global-token-dialog";
import { TokenDialogProvider } from "./doctors/_components/token-dialog-context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <main className="bg-background min-h-screen w-full">
          <div className="bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 py-4">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          <div className="p-4">{children}</div>
        </main>
        <GlobalTokenDialog />
      </SidebarProvider>
    </TokenDialogProvider>
  );
}
