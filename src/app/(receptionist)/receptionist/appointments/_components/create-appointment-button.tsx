"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { getDoctorsListAction } from "@/actions/get-doctors-list";
import { getReceptionistPatients } from "@/actions/get-receptionist-patients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import CreateAppointmentForm from "./create-appointment-form";

export default function CreateAppointmentButton() {
  const [open, setOpen] = useState(false);

  const { data: patients } = useQuery({
    queryKey: ["receptionist-patients"],
    queryFn: () => getReceptionistPatients(),
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: () => getDoctorsListAction(),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Agendamento</DialogTitle>
          <DialogDescription>
            Agende uma consulta para um paciente
          </DialogDescription>
        </DialogHeader>
        <CreateAppointmentForm 
          onSuccess={() => setOpen(false)}
          patients={patients || []}
          doctors={doctors || []}
        />
      </DialogContent>
    </Dialog>
  );
}
