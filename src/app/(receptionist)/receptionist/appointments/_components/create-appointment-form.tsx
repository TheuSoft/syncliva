"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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

import { addAppointment } from "@/actions/add-appointment";
import { getDoctorPrice } from "@/actions/get-doctor-price";

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
});

type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;

interface CreateAppointmentFormProps {
  onSuccess: () => void;
  patients: Array<{ id: string; name: string }>;
  doctors: Array<{ id: string; name: string }>;
}

export default function CreateAppointmentForm({
  onSuccess,
  patients,
  doctors,
}: CreateAppointmentFormProps) {
  const form = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      date: "",
      time: "",
    },
  });

  const addAppointmentAction = useAction(addAppointment, {
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Agendamento criado com sucesso!");
        form.reset();
        onSuccess();
      } else {
        toast.error(data?.error || "Erro ao criar agendamento");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Erro ao criar agendamento");
    },
  });

  const handleSubmit = async (values: CreateAppointmentFormData) => {
    const { date, time, ...rest } = values;
    const scheduledAt = new Date(`${date}T${time}`);
    
    try {
      const doctorPrice = await getDoctorPrice(values.doctorId);
      
      addAppointmentAction.execute({
        ...rest,
        scheduledAt,
        appointmentPriceInCents: doctorPrice,
      });
    } catch (error) {
      toast.error("Erro ao buscar preço do médico");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={addAppointmentAction.isExecuting}
          className="w-full"
        >
          {addAppointmentAction.isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Agendamento"
          )}
        </Button>
      </form>
    </Form>
  );
}
