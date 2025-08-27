"use client";

import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, User } from "lucide-react";
import { useState } from "react";

import { getAdmins } from "@/actions/get-admins";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import UserDetailsDialog from "./user-details-dialog";
import EditUserForm from "./edit-user-form";

export default function AdminsList() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<{
    id: string;
    name: string;
    email: string;
    role: "admin" | "receptionist";
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: admins, isLoading, error } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getAdmins(),
  });

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsDialogOpen(true);
  };

  const handleEditUser = (admin: { id: string; name: string; email: string }) => {
    setSelectedUserForEdit({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Carregando administradores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Erro ao carregar administradores</div>
      </div>
    );
  }

  if (!admins || admins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum administrador encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Você é o primeiro administrador da clínica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {admin.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{admin.name}</div>
                      <Badge variant="secondary" className="text-xs">
                        Administrador
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(admin.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(admin.id)}>
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(admin)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de detalhes do usuário */}
      {selectedUserId && (
        <UserDetailsDialog
          userId={selectedUserId}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}

      {/* Dialog de edição do usuário */}
      {selectedUserForEdit && (
        <EditUserForm
          user={selectedUserForEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => {
            // Recarregar a lista de administradores
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
