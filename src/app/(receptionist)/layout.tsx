import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { SessionTimeoutProvider } from "@/providers/session-timeout-provider";

import { ReceptionistSidebar } from "./_components/receptionist-sidebar";

interface ReceptionistLayoutProps {
  children: React.ReactNode;
}

export default async function ReceptionistLayout({ children }: ReceptionistLayoutProps) {
  // Obter session usando better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // Verificar se o usuário é um recepcionista
  if (session.user.role !== "receptionist") {
    redirect("/dashboard");
  }

  return (
    <SessionTimeoutProvider timeoutMinutes={30} warningMinutes={5}>
      <SidebarProvider>
        <ReceptionistSidebar />
        <main className="bg-background min-h-screen w-full">
          <div className="bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 py-4">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          <div className="p-4">{children}</div>
        </main>
      </SidebarProvider>
    </SessionTimeoutProvider>
  );
}
