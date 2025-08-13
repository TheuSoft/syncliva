"use client";

import { ArrowLeft, Building2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateClinicInfo } from "@/actions/update-clinic-info";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/ui/page-container";
import { authClient } from "@/lib/auth-client";

export default function EditClinicPage() {
  const router = useRouter();
  const session = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: session.data?.user?.clinic?.name || "",
    email: session.data?.user?.email || "",
  });

  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    name: false,
    email: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se pelo menos um campo foi selecionado
    if (!fieldsToUpdate.name && !fieldsToUpdate.email) {
      toast.error("Selecione pelo menos um campo para atualizar");
      return;
    }

    // Mostra o dialog de confirmação
    setShowConfirmDialog(true);
  };

  const confirmUpdate = async () => {
    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      // Prepara os dados apenas dos campos selecionados
      const dataToUpdate: { name?: string; adminEmail?: string } = {};

      if (fieldsToUpdate.name && formData.name.trim()) {
        dataToUpdate.name = formData.name.trim();
      }

      if (fieldsToUpdate.email && formData.email.trim()) {
        dataToUpdate.adminEmail = formData.email.trim();
      }

      const result = await updateClinicInfo(dataToUpdate);

      if (result?.data?.success) {
        // Cria mensagem personalizada baseada nos campos atualizados
        const updatedFields = [];
        if (fieldsToUpdate.name) updatedFields.push("nome da clínica");
        if (fieldsToUpdate.email) updatedFields.push("email");

        toast.success(
          `${updatedFields.join(" e ")} atualizado${updatedFields.length > 1 ? "s" : ""} com sucesso!`,
        );
        router.push("/clinic-settings");
      } else {
        toast.error("Erro ao atualizar informações");
      }
    } catch {
      toast.error("Erro ao atualizar informações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!session.data?.user?.clinic) {
    return (
      <PageContainer>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              Carregando informações da clínica...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clinic-settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Informações da Clínica
            </h1>
            <p className="text-muted-foreground">
              Atualize as informações básicas da sua clínica
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informações da Clínica</CardTitle>
            <CardDescription>
              Selecione quais informações deseja atualizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="update-name"
                    checked={fieldsToUpdate.name}
                    onCheckedChange={(checked) =>
                      setFieldsToUpdate((prev) => ({
                        ...prev,
                        name: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="update-name" className="text-sm font-medium">
                    Atualizar nome da clínica
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Clínica</Label>
                  <div className="relative">
                    <Building2 className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Digite o nome da clínica"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="pl-10"
                      disabled={!fieldsToUpdate.name}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="update-email"
                    checked={fieldsToUpdate.email}
                    onCheckedChange={(checked) =>
                      setFieldsToUpdate((prev) => ({
                        ...prev,
                        email: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="update-email" className="text-sm font-medium">
                    Atualizar email do administrador
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email do Administrador</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite o email do administrador"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10"
                      disabled={!fieldsToUpdate.email}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={
                    isLoading || (!fieldsToUpdate.name && !fieldsToUpdate.email)
                  }
                >
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/clinic-settings">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-amber-600">Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                • A alteração do nome da clínica será refletida em todo o
                sistema
              </li>
              <li>• A alteração do email afetará o login do administrador</li>
              <li>• Certifique-se de que o email esteja correto e ativo</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alterações</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja fazer essas alterações? Esta ação não
              pode ser desfeita.
              {fieldsToUpdate.name && (
                <>
                  <br />
                  <br />
                  <strong>Nome da clínica:</strong> {formData.name}
                </>
              )}
              {fieldsToUpdate.email && (
                <>
                  <br />
                  <br />
                  <strong>Email do administrador:</strong> {formData.email}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
