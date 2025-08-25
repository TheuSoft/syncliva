// src/app/(protected)/patients/_components/searchable-patients-list.tsx
"use client"; // ✅ Este SIM pode ser Client Component

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { patientsTable } from "@/db/schema";

interface SearchablePatientsListProps {
  initialPatients: (typeof patientsTable.$inferSelect)[];
  columns: ColumnDef<typeof patientsTable.$inferSelect>[];
}

const SearchablePatientsList = ({
  initialPatients,
  columns,
}: SearchablePatientsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Filtragem no lado cliente
  const filteredPatients = initialPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="from-background to-muted/20 border-border/40 rounded-lg border bg-gradient-to-br p-4 shadow-sm">
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Buscar por nome do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-border/60 focus:border-primary/60 max-w-sm transition-colors"
          />
          {searchTerm && (
            <p className="text-muted-foreground text-sm font-medium">
              Mostrando{" "}
              <span className="text-primary font-semibold">
                {filteredPatients.length}
              </span>{" "}
              de{" "}
              <span className="text-foreground font-semibold">
                {initialPatients.length}
              </span>{" "}
              pacientes
            </p>
          )}
        </div>
      </div>

      <div className="from-background to-muted/20 border-border/40 overflow-hidden rounded-lg border bg-gradient-to-br shadow-sm">
        <DataTable data={filteredPatients} columns={columns} />
      </div>
    </div>
  );
};

export default SearchablePatientsList;
