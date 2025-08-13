import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

import { DoctorSidebar } from "./_components/doctor-sidebar";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export default async function DoctorLayout({ children }: DoctorLayoutProps) {
  // Obter session usando better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // Verificar se o usuário é um médico
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <DoctorSidebar />
      <main className="bg-background min-h-screen w-full">
        <div className="bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 py-4">
          <SidebarTrigger />
          <ThemeToggle />
        </div>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
