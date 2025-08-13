import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";

import DoctorRegisterForm from "./_components/doctor-register-form";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-4">Carregando...</p>
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
