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
      <main className="w-full min-h-screen bg-background">
        <div className="flex items-center justify-between px-4 py-4 border-b h-16">
          <SidebarTrigger />
          <ThemeToggle />
        </div>
        <div className="p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
