"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createAdminAccount } from "@/actions/create-admin-account";
import { createAdminAccountSchema } from "@/actions/create-admin-account/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const CreateAdminAccountForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof createAdminAccountSchema>>({
    resolver: zodResolver(createAdminAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      clinicName: "",
    },
  });

  const createAccountAction = useAction(createAdminAccount, {
    onSuccess: () => {
      toast.success("Conta criada com sucesso!", {
        description: "Bem-vindo! Sua clínica foi configurada.",
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Erro ao criar conta:", error);
      toast.error("Erro ao criar conta", {
        description: error.error?.serverError || "Tente novamente",
      });
    },
  });

  const handleSubmit = async (values: z.infer<typeof createAdminAccountSchema>) => {
    createAccountAction.execute(values);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription className="text-base">
            Configure sua clínica e conta de administrador
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Dados Pessoais */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Seus Dados</h3>
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" type="email" {...field} />
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
                      <Input placeholder="Mínimo 6 caracteres" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Dados da Clínica */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Dados da Clínica</h3>
              </div>
              
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da clínica</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Criar Conta e Clínica
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link 
              href="/authentication" 
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAdminAccountForm;
