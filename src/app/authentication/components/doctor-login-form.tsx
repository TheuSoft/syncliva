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
      const validateResponse = await fetch("/api/auth/validate-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          expectedRole: "doctor",
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
    <div className="w-full">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Login do Médico
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Acesso exclusivo para médicos cadastrados
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

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl"
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
          </div>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Não possui conta? Entre em contato com a administração da clínica.
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DoctorLoginForm;
