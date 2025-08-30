"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle, Clock, Mail, XCircle } from "lucide-react";

import { getUserDetails } from "@/actions/get-user-details";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface UserDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailsDialog({ userId, open, onOpenChange }: UserDetailsDialogProps) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user-details", userId],
    queryFn: () => getUserDetails(userId),
    enabled: open && !!userId,
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "receptionist":
        return "Recepcionista";
      case "doctor":
        return "Médico";
      default:
        return role;
    }
  };

  const getStatusLabel = (user: { role: string; receptionistDetails?: { registeredAt: Date | null } | null }) => {
    if (user.role === "receptionist" && user.receptionistDetails) {
      return user.receptionistDetails.registeredAt ? "Ativo" : "Pendente";
    }
    return "Ativo";
  };

  const getStatusVariant = (user: { role: string; receptionistDetails?: { registeredAt: Date | null } | null }) => {
    if (user.role === "receptionist" && user.receptionistDetails) {
      return user.receptionistDetails.registeredAt ? "outline" : "secondary";
    }
    return "outline";
  };

  const getStatusColor = (user: { role: string; receptionistDetails?: { registeredAt: Date | null } | null }) => {
    if (user.role === "receptionist" && user.receptionistDetails) {
      return user.receptionistDetails.registeredAt 
        ? "text-green-600 border-green-600" 
        : "text-orange-600 border-orange-600";
    }
    return "text-green-600 border-green-600";
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Carregando informações...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Erro ao carregar informações
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Erro ao carregar detalhes do usuário</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações completas sobre o usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações principais */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge 
                  variant={getStatusVariant(user)}
                  className={`text-sm ${getStatusColor(user)}`}
                >
                  {getStatusLabel(user)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de contato */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Informações de Contato</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email verificado:</span>
                <span>{user.emailVerified ? "Sim" : "Não"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de registro */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Informações de Registro</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Criado em:</span>
                <span>{format(new Date(user.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              {user.updatedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Atualizado em:</span>
                  <span>{format(new Date(user.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações específicas do recepcionista */}
          {user.role === "receptionist" && 'receptionistDetails' in user && user.receptionistDetails && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Informações do Recepcionista</h4>
                <div className="space-y-2">
                  {user.receptionistDetails.invitedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Convidado em:</span>
                      <span>{format(new Date(user.receptionistDetails.invitedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}
                  {user.receptionistDetails.registeredAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Registrado em:</span>
                      <span>{format(new Date(user.receptionistDetails.registeredAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}
                  {!user.receptionistDetails.registeredAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">Status:</span>
                      <span className="text-orange-600">Aguardando registro</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
