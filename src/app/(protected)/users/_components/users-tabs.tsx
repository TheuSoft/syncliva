"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AdminsList from "./admins-list";
import ReceptionistsList from "./receptionists-list";

export default function UsersTabs() {
  return (
    <Tabs defaultValue="admins" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="admins">Administradores</TabsTrigger>
        <TabsTrigger value="receptionists">Recepcionistas</TabsTrigger>
      </TabsList>

      <TabsContent value="admins" className="mt-6">
        <AdminsList />
      </TabsContent>

      <TabsContent value="receptionists" className="mt-6">
        <ReceptionistsList />
      </TabsContent>
    </Tabs>
  );
}
