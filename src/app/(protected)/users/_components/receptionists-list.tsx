"use client";

import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Users } from "lucide-react";
import { useState } from "react";

import { getReceptionists } from "@/actions/get-receptionists";
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

import EditUserForm from "./edit-user-form";
import InviteReceptionistButton from "./invite-receptionist-button";
import UserDetailsDialog from "./user-details-dialog";

export default function ReceptionistsList() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<{
    id: string;
    name: string;
    email: string;
    role: "admin" | "receptionist";
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: receptionists, isLoading, error } = useQuery({
    queryKey: ["receptionists"],
    queryFn: () => getReceptionists(),
  });

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsDialogOpen(true);
  };

  const handleEditUser = (receptionist: { id: string; name: string; email: string | null }) => {
    setSelectedUserForEdit({
      id: receptionist.id,
      name: receptionist.name,
      email: receptionist.email || "",
      role: "receptionist",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Carregando recepcionistas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Erro ao carregar recepcionistas</div>
      </div>
    );
  }

  if (!receptionists || receptionists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum recepcionista encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Adicione recepcionistas para ajudar no gerenciamento da clínica.
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
              <TableHead>Ações</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receptionists.map((receptionist) => (
              <TableRow key={receptionist.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {receptionist.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{receptionist.name}</div>
                      <Badge variant="secondary" className="text-xs">
                        Recepcionista
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{receptionist.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={receptionist.registeredAt ? "outline" : "secondary"}
                    className={receptionist.registeredAt 
                      ? "text-green-600 border-green-600" 
                      : "text-orange-600 border-orange-600"
                    }
                  >
                    {receptionist.registeredAt ? "Ativo" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!receptionist.registeredAt && (
                    <InviteReceptionistButton
                      receptionistId={receptionist.id}
                      receptionistName={receptionist.name}
                      currentEmail={receptionist.email || undefined}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(receptionist.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(receptionist.id)}>
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(receptionist)}>
                        Editar
                      </DropdownMenuItem>
                      {!receptionist.registeredAt && (
                        <DropdownMenuItem>Reenviar convite</DropdownMenuItem>
                      )}
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
            // Recarregar a lista de recepcionistas
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
