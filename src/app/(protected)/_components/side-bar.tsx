"use client";

import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  User,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: CalendarDays,
  },
  {
    title: "Médicos",
    url: "/doctors",
    icon: Stethoscope,
  },
  {
    title: "Pacientes",
    url: "/patients",
    icon: UsersRound,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: FileText,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleSignOut = async () => {
    setShowLogoutDialog(false);
    toast.loading("Saindo...", { id: "logout" });

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logout realizado com sucesso!", { id: "logout" });
            router.push("/authentication");
          },
          onError: () => {
            toast.error("Erro ao fazer logout", { id: "logout" });
          },
        },
      });
    } catch {
      toast.error("Erro ao fazer logout", { id: "logout" });
    }
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
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
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
                      {session.data?.user?.clinic?.name?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-foreground truncate text-sm font-medium">
                      {session.data?.user?.clinic?.name}
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
                    href="/clinic-settings"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <div className="bg-primary/10 border-primary/20 rounded border p-1">
                      <User className="text-primary h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">
                      Configurações da Clínica
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowLogoutDialog(true)}
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

      {/* Dialog de confirmação de logout */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="from-background to-muted/20 border-border/40 bg-gradient-to-br shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="bg-destructive/10 border-destructive/20 flex h-10 w-10 items-center justify-center rounded-lg border">
                <LogOut className="text-destructive h-5 w-5" />
              </div>
              Confirmar Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja sair do sistema? Você será redirecionado
              para a página de login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-border/40">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sim, Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
