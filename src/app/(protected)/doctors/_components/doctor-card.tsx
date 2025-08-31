"use client";

import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  Edit,
  KeyIcon,
  Mail,
  MoreVertical,
  RefreshCw,
  Stethoscope,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { inviteDoctor } from "@/actions/invite-doctor";
import { resendInvite } from "@/actions/resend-invite";
import { updateInviteEmail } from "@/actions/update-invite-email";
import { formatCurrencyInCents } from "@/app/(protected)/doctors/_helpers/availability";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doctorsTable } from "@/db/schema";
import { usePersistentToken } from "@/hooks/use-persistent-token";

import { getAvailability } from "../_helpers/availability";
import { DeleteDoctorConfirmationDialog } from "./delete-doctor-confirmation-modal";
import { ResetDoctorPasswordDialog } from "./reset-password-modal";
import { TokenDisplayDialog } from "./token-display-dialog";
import UpsertDoctorForm from "./upsert-doctor-form";

interface DoctorCardProps {
  doctor: typeof doctorsTable.$inferSelect;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const [isUpsertDoctorDialogOpen, setIsUpsertDoctorDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [isUpdateEmailDialogOpen, setIsUpdateEmailDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Hook para persistir token
  const { hasGeneratedToken, tokenData, saveToken } = usePersistentToken(
    doctor.id,
  );

  // Actions
  const inviteDoctorAction = useAction(inviteDoctor, {
    onSuccess: ({ data }) => {
      if (data?.success && "inviteLink" in data) {
        setIsInviteDialogOpen(false);
        setInviteEmail("");
        saveToken({
          inviteLink: data.inviteLink,
          doctorName: data.doctorName,
          doctorEmail: data.doctorEmail,
        });
        setTimeout(() => {
          setShowTokenModal(true);
        }, 100);
        toast.success("Convite enviado com sucesso!");
      } else if ("error" in data) {
        toast.error(data.error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao enviar convite");
    },
  });

  const resendInviteAction = useAction(resendInvite, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        if (data.inviteLink && data.doctorName && data.doctorEmail) {
          saveToken({
            inviteLink: data.inviteLink,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
          });
          setTimeout(() => {
            setShowTokenModal(true);
          }, 100);
          toast.success("Token renovado com sucesso!");
        }
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao gerar token");
    },
  });

  const updateEmailAction = useAction(updateInviteEmail, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setIsUpdateEmailDialogOpen(false);
        setNewEmail("");
        if (data.inviteLink && data.doctorName && data.doctorEmail) {
          saveToken({
            inviteLink: data.inviteLink,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
          });
          setTimeout(() => {
            setShowTokenModal(true);
          }, 100);
          toast.success("Email do convite atualizado com sucesso!");
        }
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao alterar email do convite");
    },
  });

  const handleDeleteDoctorClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleResetPasswordClick = () => {
    setIsResetPasswordDialogOpen(true);
  };

  const handleResendInvite = () => {
    resendInviteAction.execute({
      doctorId: doctor.id,
      email: doctor.email!,
    });
  };

  const handleUpdateEmail = () => {
    if (!newEmail) {
      toast.error("Email é obrigatório");
      return;
    }
    if (newEmail === doctor.email) {
      toast.error("O novo email deve ser diferente do atual");
      return;
    }
    updateEmailAction.execute({ doctorId: doctor.id, newEmail });
  };

  const handleShowToken = () => {
    if (!tokenData) {
      toast.error("Nenhum token disponível para exibir");
      return;
    }
    setShowTokenModal(true);
  };

  const handleInviteDoctor = () => {
    if (!inviteEmail) {
      toast.error("Email é obrigatório");
      return;
    }
    inviteDoctorAction.execute({ doctorId: doctor.id, email: inviteEmail });
  };

  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");
  const availability = getAvailability(doctor);

  // Verificar se o médico já foi registrado
  const isRegistered = !!doctor.registeredAt;
  const hasInvite = !!doctor.inviteToken;

  return (
    <Card className="group border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card hover:shadow-primary/5 relative overflow-hidden border backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
      {/* Header com avatar e informações principais */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="border-primary/20 h-12 w-12 border-2 shadow-sm">
              <AvatarFallback className="from-primary/10 to-primary/20 text-primary bg-gradient-to-br font-semibold">
                {doctorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate text-base leading-tight font-semibold">
                {doctor.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <Stethoscope className="text-muted-foreground h-3 w-3" />
                <p className="text-muted-foreground text-sm font-medium">
                  {doctor.specialty}
                </p>
              </div>
            </div>
          </div>

          {/* Menu de ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Ação principal - Ver Detalhes */}
              <DropdownMenuItem
                onClick={() => setIsUpsertDoctorDialogOpen(true)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Ações para médicos registrados */}
              {isRegistered && (
                <>
                  <DropdownMenuItem
                    onClick={handleResetPasswordClick}
                    className="cursor-pointer text-emerald-700"
                  >
                    <KeyIcon className="mr-2 h-4 w-4" />
                    Redefinir Senha
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Ações para médicos não registrados */}
              {!isRegistered && (
                <>
                  {!hasInvite ? (
                    <DropdownMenuItem
                      onClick={() => setIsInviteDialogOpen(true)}
                      className="cursor-pointer text-blue-700"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Convite
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {doctor.email && (
                        <>
                          {!hasGeneratedToken ? (
                            <DropdownMenuItem
                              onClick={handleResendInvite}
                              className="cursor-pointer text-amber-700"
                              disabled={resendInviteAction.isExecuting}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              {resendInviteAction.isExecuting
                                ? "Gerando..."
                                : "Reenviar Convite"}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={handleShowToken}
                              className="cursor-pointer text-amber-700"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Ver Token
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setIsUpdateEmailDialogOpen(true)}
                            className="cursor-pointer text-blue-700"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Alterar Email
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Ação de exclusão */}
              <DropdownMenuItem
                onClick={handleDeleteDoctorClick}
                className="cursor-pointer text-red-700"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Excluir Médico
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {isRegistered && (
            <Badge
              variant="default"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm"
            >
              ✓ Ativo
            </Badge>
          )}
          {hasInvite && !isRegistered && (
            <Badge
              variant="secondary"
              className="border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700"
            >
              Convidado
            </Badge>
          )}
          {!hasInvite && !isRegistered && (
            <Badge
              variant="outline"
              className="border-muted-foreground/40 text-muted-foreground border-dashed"
            >
              Pendente
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Informações principais */}
      <CardContent className="space-y-3 pb-4">
        {/* Preço da consulta - destaque */}
        <div className="from-primary/10 to-primary/5 border-primary/20 rounded-lg border bg-gradient-to-r p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="text-primary h-4 w-4" />
              <span className="text-foreground text-sm font-medium">
                Valor da Consulta
              </span>
            </div>
            <span className="text-primary text-lg font-bold">
              {formatCurrencyInCents(doctor.appointmentPriceInCents)}
            </span>
          </div>
        </div>

        {/* Disponibilidade */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 border-border/30 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <CalendarIcon className="text-primary h-4 w-4" />
              <span className="text-foreground text-sm font-medium">Dias</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {availability.from.format("ddd")} a{" "}
              {availability.to.format("ddd")}
            </p>
          </div>

          <div className="bg-muted/30 border-border/30 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2">
              <ClockIcon className="text-primary h-4 w-4" />
              <span className="text-foreground text-sm font-medium">
                Horário
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {availability.from.format("HH:mm")} às{" "}
              {availability.to.format("HH:mm")}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Modais */}
      <Dialog
        open={isUpsertDoctorDialogOpen}
        onOpenChange={setIsUpsertDoctorDialogOpen}
      >
        <UpsertDoctorForm
          doctor={{
            ...doctor,
            availableFromTime: availability.from.format("HH:mm:ss"),
            availableToTime: availability.to.format("HH:mm:ss"),
          }}
          onSuccess={() => setIsUpsertDoctorDialogOpen(false)}
          isOpen={isUpsertDoctorDialogOpen}
        />
      </Dialog>

      {/* Modal para enviar convite */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Convite</DialogTitle>
            <DialogDescription>
              Digite o email para enviar o convite ao médico {doctor.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteEmail">Email do Médico</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Digite o email do médico"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsInviteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInviteDoctor}
                disabled={inviteDoctorAction.isExecuting}
              >
                {inviteDoctorAction.isExecuting
                  ? "Enviando..."
                  : "Enviar Convite"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para alterar email */}
      <Dialog
        open={isUpdateEmailDialogOpen}
        onOpenChange={setIsUpdateEmailDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Email do Convite</DialogTitle>
            <DialogDescription>
              Digite o novo email para o convite do médico {doctor.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentEmail">Email Atual</Label>
              <Input
                id="currentEmail"
                value={doctor.email || ""}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newEmail">Novo Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Digite o novo email"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUpdateEmailDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateEmail}
                disabled={updateEmailAction.isExecuting}
              >
                {updateEmailAction.isExecuting
                  ? "Alterando..."
                  : "Alterar Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDoctorConfirmationDialog
        doctor={doctor}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <ResetDoctorPasswordDialog
        doctor={doctor}
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      />
      {tokenData && (
        <TokenDisplayDialog
          open={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          inviteLink={tokenData.inviteLink}
          doctorName={tokenData.doctorName}
          doctorEmail={tokenData.doctorEmail}
        />
      )}
    </Card>
  );
};

export default DoctorCard;
