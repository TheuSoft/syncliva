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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-red-600">
            Algo deu errado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente ou entre em contato com
            o suporte.
          </p>
          <Button onClick={reset} className="w-full cursor-pointer">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
