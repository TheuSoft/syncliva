"use client";

import { Plus, Stethoscope } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertDoctorForm from "./upsert-doctor-form";

const AddDoctorButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="from-primary to-primary/90 hover:shadow-primary/25 bg-gradient-to-r text-white shadow-sm transition-all duration-300 hover:shadow-lg"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          <Stethoscope className="mr-2 h-4 w-4" />
          Adicionar médico
        </Button>
      </DialogTrigger>
      <UpsertDoctorForm onSuccess={() => setIsOpen(false)} isOpen={isOpen} />
    </Dialog>
  );
};

export default AddDoctorButton;
