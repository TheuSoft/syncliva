"use client";

import { CalendarDays, Home, LogOut, Users } from "lucide-react";
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

const receptionistItems = [
  {
    title: "Dashboard",
    url: "/receptionist/dashboard",
    icon: Home,
  },
  {
    title: "Agendamentos",
    url: "/receptionist/appointments",
    icon: CalendarDays,
  },
  {
    title: "Pacientes",
    url: "/receptionist/patients",
    icon: Users,
  },
];

export function ReceptionistSidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/authentication";
        },
      },
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-border/30 from-muted/20 border-b bg-gradient-to-r to-transparent p-4">
        <div className="flex items-center gap-2">
          <Logo width={120} height={30} className="cursor-pointer" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wider uppercase">
            Portal Recepcionista
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {receptionistItems.map((item) => (
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
                <SidebarMenuButton className="w-full justify-start">
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarFallback className="text-xs">R</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Recepcionista</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                alignOffset={-4}
                side="right"
                sideOffset={8}
              >
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
