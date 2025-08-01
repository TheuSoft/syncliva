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
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar por nome do paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {searchTerm && (
          <p className="text-muted-foreground mt-1 text-sm">
            Mostrando {filteredPatients.length} de {initialPatients.length}{" "}
            pacientes
          </p>
        )}
      </div>

      <DataTable data={filteredPatients} columns={columns} />
    </div>
  );
};

export default SearchablePatientsList;
