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
import { Separator } from "@/components/ui/separator";
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
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{doctorInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{doctor.name}</h3>
            <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
            {/* Status do convite/registro */}
            <div className="flex gap-1 mt-1">
              {isRegistered && (
                <Badge variant="default" className="text-xs">
                  Registrado
                </Badge>
              )}
              {hasInvite && !isRegistered && (
                <Badge variant="secondary" className="text-xs">
                  Convidado
                </Badge>
              )}
              {!hasInvite && !isRegistered && (
                <Badge variant="outline" className="text-xs">
                  Não convidado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">
          <CalendarIcon className="mr-1" />
          {availability.from.format("dddd")} a {availability.to.format("dddd")}
        </Badge>
        <Badge variant="outline">
          <ClockIcon className="mr-1" />
          {availability.from.format("HH:mm")} as{" "}
          {availability.to.format("HH:mm")}
        </Badge>
        <Badge variant="outline">
          <DollarSignIcon className="mr-1" />
          {formatCurrencyInCents(doctor.appointmentPriceInCents)}
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-2">
        <Dialog
          open={isUpsertDoctorDialogOpen}
          onOpenChange={setIsUpsertDoctorDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">Ver detalhes</Button>
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
          <div className="space-y-2">
            {!hasInvite ? (
              <InviteDoctorButton
                doctorId={doctor.id}
                doctorName={doctor.name}
                disabled={false}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
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
        
        {/* Botão de redefinir senha - apenas para médicos registrados */}
        {isRegistered && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleResetPasswordClick}
          >
            <KeyIcon />
            Redefinir Senha
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleDeleteDoctorClick}
        >
          <TrashIcon />
          Deletar médico
        </Button>
        
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
