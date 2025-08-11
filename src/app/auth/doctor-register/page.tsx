import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";

import DoctorRegisterForm from "./_components/doctor-register-form";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DoctorRegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DoctorRegisterForm />
    </Suspense>
  );
}
