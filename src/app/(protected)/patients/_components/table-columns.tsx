"use client";

import { ColumnDef } from "@tanstack/react-table";

import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./table-actions";

type Patient = typeof patientsTable.$inferSelect;

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    header: "Nome",
    accessorKey: "name",
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "phoneNumber",
    header: "Telefone",
    accessorKey: "phoneNumber",
    cell: ({ row }) =>
      row.original.phoneNumber?.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3",
      ) || "",
  },
  {
    id: "cpf",
    header: "CPF",
    accessorKey: "cpf",
    cell: ({ row }) => row.original.cpf || "",
  },
  {
    id: "sex",
    header: "Sexo",
    accessorKey: "sex",
    cell: ({ row }) => (row.original.sex === "male" ? "Masculino" : "Feminino"),
  },
  {
    id: "addressCity",
    header: "Cidade",
    accessorKey: "addressCity",
  },
  {
    id: "addressNeighborhood",
    header: "Bairro",
    accessorKey: "addressNeighborhood",
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <PatientsTableActions patient={row.original} />,
  },
];
