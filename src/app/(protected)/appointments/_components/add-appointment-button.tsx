"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
// ✅ importando tipos reais baseados no Drizzle ORM
import { doctorsTable, patientsTable } from "@/db/schema";

import AddAppointmentForm from "./add-appointment-form";

type Patient = typeof patientsTable.$inferSelect;
type Doctor = typeof doctorsTable.$inferSelect;

interface AddAppointmentButtonProps {
  patients: Patient[];
  doctors: Doctor[];
  onSuccess?: () => void;
}

const AddAppointmentButton = ({
  patients,
  doctors,
  onSuccess,
}: AddAppointmentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>

      {isOpen && (
        <AddAppointmentForm
          patients={patients}
          doctors={doctors}
          isOpen={isOpen}
          onSuccess={() => {
            setIsOpen(false);
            onSuccess?.();
          }}
        />
      )}
    </Dialog>
  );
};

export default AddAppointmentButton;
