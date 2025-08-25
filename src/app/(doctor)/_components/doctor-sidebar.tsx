"use client";

import { FileText, Home, LogOut, Pill, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const doctorItems = [
  {
    title: "Dashboard",
    url: "/doctor/dashboard",
    icon: Home,
  },
  {
    title: "Pacientes Marcados",
    url: "/doctor/appointments",
    icon: Users,
  },
  {
    title: "Relatórios de Consulta",
    url: "/doctor/reports",
    icon: FileText,
  },
  {
    title: "Gerar Receita Médica",
    url: "/doctor/prescriptions",
    icon: Pill,
  },
];

export function DoctorSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  return (
    <Sidebar className="from-background via-background to-muted/10 border-border/40 border-r bg-gradient-to-br">
      <SidebarHeader className="border-border/30 from-primary/8 via-primary/4 h-16 border-b bg-gradient-to-r to-transparent px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center">
          <Logo width={136} height={28} />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wider uppercase">
            Portal Médico
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {doctorItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="group hover:bg-primary/10 data-[active=true]:from-primary/15 data-[active=true]:to-primary/5 data-[active=true]:border-primary/20 relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-[1.02] data-[active=true]:border data-[active=true]:bg-gradient-to-r data-[active=true]:shadow-sm"
                  >
                    <Link
                      href={item.url}
                      className="flex w-full items-center gap-3 px-3 py-2.5"
                    >
                      <div className="bg-primary/10 border-primary/20 group-hover:bg-primary/15 rounded-md border p-1.5 transition-colors">
                        <item.icon className="text-primary h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-border/30 from-muted/20 border-t bg-gradient-to-r to-transparent p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="from-background to-muted/20 border-border/40 rounded-lg border bg-gradient-to-r p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <Avatar className="border-primary/20 border-2 shadow-sm">
                    <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br font-semibold">
                      {session.data?.user?.name?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-foreground truncate text-sm font-medium">
                      Dr. {session.data?.user?.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="from-background to-muted/20 border-border/40 w-56 border bg-gradient-to-br shadow-lg">
                <DropdownMenuItem
                  asChild
                  className="hover:bg-primary/10 rounded-md transition-colors"
                >
                  <Link
                    href="/doctor/profile"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <div className="bg-primary/10 border-primary/20 rounded border p-1">
                      <User className="text-primary h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">Minha Conta</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                >
                  <div className="flex w-full items-center gap-3 px-3 py-2">
                    <div className="bg-destructive/10 border-destructive/20 rounded border p-1">
                      <LogOut className="text-destructive h-3 w-3" />
                    </div>
                    <span className="text-destructive text-sm font-medium">
                      Sair
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
