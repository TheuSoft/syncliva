"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormControl, FormMessage } from "@/components/ui/form";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const doctorLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "E-mail é obrigatório" })
    .email({ message: "E-mail inválido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

const DoctorLoginForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof doctorLoginSchema>>({
    resolver: zodResolver(doctorLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof doctorLoginSchema>) => {
    try {
      // 1. Primeiro validar se o usuário tem permissão para login como médico
      const validateResponse = await fetch('/api/auth/validate-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          expectedRole: 'doctor',
        }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        if (validateResponse.status === 403) {
          // Erro de role incorreto
          form.setError("email", {
            type: "manual",
            message: validateData.error,
          });
          return;
        } else if (validateResponse.status === 404) {
          // Usuário não encontrado - vamos permitir que o better-auth trate
        } else {
          toast.error(validateData.error || "Erro ao validar login");
          return;
        }
      }

      // 2. Se passou na validação, fazer o login
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onRequest: () => {
            form.clearErrors();
          },
          onSuccess: async () => {
            router.push("/doctor/dashboard");
          },
          onError: (ctx) => {
            if (ctx.error.message === "Invalid email or password") {
              form.setError("email", {
                type: "manual",
                message: "Email ou senha inválidos",
              });
              form.setError("password", {
                type: "manual",
                message: "Email ou senha inválidos",
              });
            } else {
              toast.error(ctx.error.message);
            }
          },
        },
      );
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro interno. Tente novamente.");
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <CardHeader>
            <CardTitle>Login do Médico</CardTitle>
            <CardDescription>
              Acesso exclusivo para médicos cadastrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu e-mail médico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar como Médico"
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Não possui conta? Entre em contato com a administração da clínica.
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default DoctorLoginForm;
