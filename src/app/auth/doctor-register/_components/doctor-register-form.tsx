"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { registerDoctor, validateInvite } from "@/actions/doctor-registration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DoctorRegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [doctorInfo, setDoctorInfo] = useState<{
    id: string;
    name: string;
    specialty: string;
    email: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { execute: executeValidateInvite, isExecuting: isValidating } =
    useAction(validateInvite, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          setDoctorInfo(data.doctor);
          setFormData((prev) => ({
            ...prev,
            name: data.doctor?.name || "",
            email: data.doctor?.email || "",
          }));
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Token inválido ou expirado");
        router.push("/authentication");
      },
    });

  const { execute: executeRegister, isExecuting: isRegistering } = useAction(
    registerDoctor,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message);
          router.push("/authentication?tab=signin");
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao registrar");
      },
    },
  );

  useEffect(() => {
    if (!token) {
      toast.error("Token não fornecido");
      router.push("/authentication");
      return;
    }

    executeValidateInvite({ token });
  }, [token, executeValidateInvite, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    executeRegister({
      token,
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground mt-4">Validando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!doctorInfo) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Complete seu Registro
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Bem-vindo, Dr. {doctorInfo.name}! Complete seu registro para acessar
            o sistema.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                value={doctorInfo.specialty}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? "Registrando..." : "Completar Registro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
