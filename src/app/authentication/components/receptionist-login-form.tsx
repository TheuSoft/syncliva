"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormControl, FormMessage } from "@/components/ui/form";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const receptionistLoginSchema = z.object({
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

const ReceptionistLoginForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof receptionistLoginSchema>>({
    resolver: zodResolver(receptionistLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof receptionistLoginSchema>) => {
    try {
      // 1. Primeiro validar se o usuário tem permissão para login como recepcionista
      const validateResponse = await fetch("/api/auth/validate-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          expectedRole: "receptionist",
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
            router.push("/receptionist/dashboard");
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
    <div className="w-full">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Login do Recepcionista
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Acesso exclusivo para recepcionistas cadastrados
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu e-mail" {...field} />
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

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transition-all duration-200 hover:from-orange-700 hover:to-red-700 hover:shadow-xl"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar como Recepcionista"
              )}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Não possui conta? Entre em contato com a administração da clínica.
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReceptionistLoginForm;
