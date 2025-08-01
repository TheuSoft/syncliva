"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import UpsertPatientForm from "./upsert-patient-form";

const AddPatientButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar paciente
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo paciente.
          </DialogDescription>
        </DialogHeader>

        <UpsertPatientForm isOpen={isOpen} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientButton;
