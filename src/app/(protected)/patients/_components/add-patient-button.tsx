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
        <Button className="bg-primary hover:bg-primary/90 cursor-pointer shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar paciente
        </Button>
      </DialogTrigger>

      <DialogContent className="from-background to-muted/20 border-border/40 border bg-gradient-to-br">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Novo paciente
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados para cadastrar um novo paciente.
          </DialogDescription>
        </DialogHeader>

        <UpsertPatientForm isOpen={isOpen} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientButton;
