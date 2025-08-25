"use client";

import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  KeyIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { doctorsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import { getAvailability } from "../_helpers/availability";
import { DeleteDoctorConfirmationDialog } from "./delete-doctor-confirmation-modal";
import { InviteDoctorButton } from "./invite-doctor-button";
import { ResendInviteButton } from "./resend-invite-button";
import { ResetDoctorPasswordDialog } from "./reset-password-modal";
import { UpdateInviteEmailButton } from "./update-invite-email-button";
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

  // Remove deleteDoctorAction pois agora será usado no modal
  const handleDeleteDoctorClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleResetPasswordClick = () => {
    setIsResetPasswordDialogOpen(true);
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
    <Card className="from-background to-muted/20 border-border/40 hover:border-primary/30 hover:from-primary/5 hover:to-primary/10 group overflow-hidden rounded-lg border bg-gradient-to-br shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="border-primary/20 h-9 w-9 border-2 shadow-sm">
            <AvatarFallback className="from-primary/10 to-primary/20 text-primary bg-gradient-to-br text-sm font-semibold">
              {doctorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground truncate text-sm leading-tight font-semibold">
              {doctor.name}
            </h3>
            <p className="text-muted-foreground text-xs leading-tight font-medium">
              {doctor.specialty}
            </p>
            {/* Status do convite/registro */}
            <div className="mt-1 flex gap-1">
              {isRegistered && (
                <Badge
                  variant="default"
                  className="h-4 border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 px-1.5 py-0 text-xs text-white shadow-sm"
                >
                  ✓ Ativo
                </Badge>
              )}
              {hasInvite && !isRegistered && (
                <Badge
                  variant="secondary"
                  className="h-4 border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 px-1.5 py-0 text-xs text-amber-700"
                >
                  📧 Convidado
                </Badge>
              )}
              {!hasInvite && !isRegistered && (
                <Badge
                  variant="outline"
                  className="border-muted-foreground/40 text-muted-foreground h-4 border-dashed px-1.5 py-0 text-xs"
                >
                  ⏳ Pendente
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-1.5 px-3 py-2">
        <div className="bg-muted/30 border-border/30 rounded-md border p-1.5">
          <div className="mb-0.5 flex items-center gap-1">
            <CalendarIcon className="text-primary h-3 w-3" />
            <span className="text-foreground text-xs font-medium">
              Disponibilidade
            </span>
          </div>
          <p className="text-muted-foreground text-xs leading-tight">
            {availability.from.format("ddd")} a {availability.to.format("ddd")}
          </p>
        </div>

        <div className="bg-primary/5 border-primary/20 rounded-md border p-1.5">
          <div className="mb-0.5 flex items-center gap-1">
            <ClockIcon className="text-primary h-3 w-3" />
            <span className="text-foreground text-xs font-medium">Horário</span>
          </div>
          <p className="text-muted-foreground text-xs leading-tight">
            {availability.from.format("HH:mm")} às{" "}
            {availability.to.format("HH:mm")}
          </p>
        </div>

        <div className="from-primary/10 to-primary/5 border-primary/20 rounded-md border bg-gradient-to-r p-1.5">
          <div className="mb-0.5 flex items-center gap-1">
            <DollarSignIcon className="text-primary h-3 w-3" />
            <span className="text-foreground text-xs font-medium">
              Consulta
            </span>
          </div>
          <p className="text-primary text-sm leading-tight font-bold">
            {formatCurrencyInCents(doctor.appointmentPriceInCents)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-border/30 from-muted/10 to-muted/5 flex flex-col gap-1.5 border-t bg-gradient-to-r px-3 pt-2 pb-3">
        <Dialog
          open={isUpsertDoctorDialogOpen}
          onOpenChange={setIsUpsertDoctorDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 h-7 w-full transform border-0 bg-gradient-to-r text-xs text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            >
              👁️ Ver detalhes
            </Button>
          </DialogTrigger>
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
        {/* Botões de convite - apenas se não estiver registrado */}
        {!isRegistered && (
          <div className="w-full space-y-1">
            {!hasInvite ? (
              <InviteDoctorButton
                doctorId={doctor.id}
                doctorName={doctor.name}
                disabled={false}
              />
            ) : (
              <div className="flex w-full flex-col gap-1">
                <div className="flex gap-1">
                  <InviteDoctorButton
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    disabled={true}
                  />
                  {doctor.email && (
                    <ResendInviteButton
                      doctorId={doctor.id}
                      doctorName={doctor.name}
                      doctorEmail={doctor.email}
                      disabled={false}
                    />
                  )}
                </div>
                {doctor.email && (
                  <UpdateInviteEmailButton
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    currentEmail={doctor.email}
                    disabled={false}
                  />
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex w-full gap-1">
          {/* Botão de redefinir senha - apenas para médicos registrados */}
          {isRegistered && (
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-muted/20 text-foreground border-border/40 hover:border-border/60 h-7 flex-1 transform text-xs shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              onClick={handleResetPasswordClick}
            >
              <KeyIcon className="mr-1 h-3 w-3" />
              Senha
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className={`${isRegistered ? "flex-1" : "w-full"} h-7 transform border-red-200 text-xs text-red-600 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-red-300 hover:bg-red-50 hover:shadow-md dark:border-red-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/20`}
            onClick={handleDeleteDoctorClick}
          >
            <TrashIcon className="mr-1 h-3 w-3" />
            Deletar
          </Button>
        </div>{" "}
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
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
