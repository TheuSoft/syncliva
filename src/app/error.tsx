"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-red-600">
            Algo deu errado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
          </p>
          <Button onClick={reset} className="w-full">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}