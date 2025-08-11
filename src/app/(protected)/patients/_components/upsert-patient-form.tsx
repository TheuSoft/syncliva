"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";

import { upsertPatient } from "@/actions/upsert-patient";
import {
  UpsertPatientSchema,
  upsertPatientSchema,
} from "@/actions/upsert-patient/schema";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { patientsTable } from "@/db/schema";

interface Props {
  patient?: typeof patientsTable.$inferSelect;
  onSuccess: () => void;
  isOpen: boolean;
}

export default function UpsertPatientForm({
  patient,
  onSuccess,
  isOpen,
}: Props) {
  const form = useForm<UpsertPatientSchema>({
    resolver: zodResolver(upsertPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      sex: undefined,
      cpf: "",
      addressZipCode: "",
      addressStreet: "",
      addressNumber: "",
      addressNeighborhood: "",
      addressCity: "",
      addressState: "",
      ...patient,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchCep = form.watch("addressZipCode");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        email: "",
        phoneNumber: "",
        sex: undefined,
        cpf: "",
        addressZipCode: "",
        addressStreet: "",
        addressNumber: "",
        addressNeighborhood: "",
        addressCity: "",
        addressState: "",
        ...patient,
      });
    }
  }, [isOpen, patient, form]);

  useEffect(() => {
    const fetchAddress = async () => {
      const rawCep = watchCep?.replace(/\D/g, "");
      if (rawCep?.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
          const data = await res.json();
          if (!data.erro) {
            form.setValue("addressStreet", data.logradouro || "");
            form.setValue("addressNeighborhood", data.bairro || "");
            form.setValue("addressCity", data.localidade || "");
            form.setValue("addressState", data.uf || "");
          }
        } catch (error) {
          console.error("Erro ao buscar endereço via CEP:", error);
        }
      }
    };

    fetchAddress();
  }, [watchCep, form]);

  const onSubmit = async (values: UpsertPatientSchema) => {
    try {
      setIsSubmitting(true);
      const result = await upsertPatient({ ...values, id: patient?.id }); // ✅ Session handled on server
      
      // Verifica se há erros de validação
      if (result.validationErrors) {
        // Erros de validação são tratados automaticamente pelo form
        console.log("Erros de validação:", result.validationErrors);
        // Exibir o primeiro erro de validação encontrado
        toast.error("Há campos inválidos no formulário. Verifique e tente novamente.");
      }
      // Verifica se há erro específico retornado pela action
      else if (result.data && typeof result.data === 'object' && 'error' in result.data) {
        // Se a action retornou um erro específico (como CPF duplicado)
        const errorMessage = result.data.error as string;
        toast.error(errorMessage);
        // Se for erro de CPF, destacar o campo no formulário
        if (errorMessage.includes("CPF")) {
          form.setError("cpf", { 
            type: "manual", 
            message: "CPF já cadastrado no sistema"
          });
        }
      } 
      // Verifica se a operação foi bem-sucedida
      else if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        // Se não houve erro, tudo ocorreu bem
        toast.success("Paciente salvo com sucesso!");
        onSuccess();
      }
    } catch (err) {
      console.error("Erro ao salvar paciente:", err);
      toast.error("Erro ao salvar paciente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {patient ? "Editar paciente" : "Adicionar paciente"}
        </DialogTitle>
        <DialogDescription>Preencha os dados abaixo.</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* E-mail */}
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Telefone */}
          <FormField
            name="phoneNumber"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    allowEmptyFormatting
                    value={field.value || ""}
                    onValueChange={(v) => field.onChange(v.formattedValue)}
                    customInput={Input}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sexo */}
          <FormField
            name="sex"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CPF */}
          <FormField
            name="cpf"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>CPF {patient ? "(não editável)" : ""}</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="###.###.###-##"
                    mask="_"
                    allowEmptyFormatting
                    value={field.value || ""}
                    onValueChange={(v) => field.onChange(v.formattedValue)}
                    customInput={Input}
                    className={fieldState.error ? "border-red-500 focus-visible:ring-red-500" : ""}
                    disabled={!!patient} // Desabilitar edição do CPF quando estiver editando um paciente existente
                  />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />

          {/* CEP */}
          <FormField
            name="addressZipCode"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="#####-###"
                    mask="_"
                    allowEmptyFormatting
                    value={field.value || ""}
                    onValueChange={(v) => field.onChange(v.formattedValue)}
                    customInput={Input}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Endereço */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="addressStreet"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="addressNumber"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="addressNeighborhood"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="addressCity"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="addressState"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
