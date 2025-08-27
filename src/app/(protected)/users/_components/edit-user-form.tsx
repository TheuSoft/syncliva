"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAction } from "next-safe-action/hooks";
import { updateUser } from "@/actions/update-user";

const formSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "receptionist"], {
    required_error: "Role é obrigatório",
    invalid_type_error: "Role deve ser 'admin' ou 'receptionist'",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface EditUserFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "receptionist";
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditUserForm({ user, open, onOpenChange, onSuccess }: EditUserFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  const updateUserAction = useAction(updateUser, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Usuário atualizado com sucesso!");
        onOpenChange(false);
        onSuccess?.();
      } else if ('error' in data) {
        toast.error(data.error || "Erro ao atualizar usuário");
      }
    },
    onError: ({ error }) => {
      toast.error("Erro ao atualizar usuário", {
        description: error.serverError || "Tente novamente",
      });
    },
  });

  const onSubmit = (values: FormData) => {
    updateUserAction.execute(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
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
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="receptionist">Recepcionista</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateUserAction.status === "executing"}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateUserAction.status === "executing"}>
                {updateUserAction.status === "executing" ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
