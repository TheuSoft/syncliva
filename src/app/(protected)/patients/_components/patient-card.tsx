"use client";

import { Mail, Phone, User } from "lucide-react";
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
import { patientsTable } from "@/db/schema";

import UpsertPatientForm from "./upsert-patient-form";

interface PatientCardProps {
  patient: typeof patientsTable.$inferSelect;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const [isUpsertPatientDialogOpen, setIsUpsertPatientDialogOpen] =
    useState(false);

  const patientInitials = patient.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");
    // Format as (XX) XXXXX-XXXX
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getSexLabel = (sex: "male" | "female") => {
    return sex === "male" ? "Masculino" : "Feminino";
  };

  return (
    <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="border-primary/20 h-10 w-10 border-2 shadow-sm">
            <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br font-semibold">
              {patientInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{patient.name}</h3>
            <p className="text-muted-foreground text-xs">
              {getSexLabel(patient.sex)}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-border/30" />
      <CardContent className="flex flex-col gap-2 py-3">
        <Badge
          variant="outline"
          className="border-border/40 hover:bg-muted/50 justify-start transition-colors"
        >
          <Mail className="text-muted-foreground mr-2 h-3 w-3" />
          <span className="truncate text-xs">{patient.email}</span>
        </Badge>
        <Badge
          variant="outline"
          className="border-border/40 hover:bg-muted/50 justify-start transition-colors"
        >
          <Phone className="text-muted-foreground mr-2 h-3 w-3" />
          <span className="text-xs">
            {formatPhoneNumber(patient.phoneNumber)}
          </span>
        </Badge>
        <Badge
          variant="outline"
          className="border-border/40 hover:bg-muted/50 justify-start transition-colors"
        >
          <User className="text-muted-foreground mr-2 h-3 w-3" />
          <span className="text-xs">{getSexLabel(patient.sex)}</span>
        </Badge>
      </CardContent>
      <Separator className="bg-border/30" />
      <CardFooter className="pt-3">
        <Dialog
          open={isUpsertPatientDialogOpen}
          onOpenChange={setIsUpsertPatientDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full cursor-pointer font-medium transition-colors">
              Ver detalhes
            </Button>
          </DialogTrigger>
          <UpsertPatientForm
            patient={patient}
            onSuccess={() => setIsUpsertPatientDialogOpen(false)}
            isOpen={isUpsertPatientDialogOpen}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
