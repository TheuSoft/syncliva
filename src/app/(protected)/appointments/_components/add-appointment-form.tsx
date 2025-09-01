"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { Search } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef } from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { addAppointment } from "@/actions/agendamentos/add-appointment";
import { getAvailableTimes } from "@/actions/agendamentos/get-available-times";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, patientsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  appointmentPrice: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
});

interface AddAppointmentFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const AddAppointmentForm = ({
  patients,
  doctors,
  onSuccess,
  isOpen,
}: AddAppointmentFormProps) => {
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [isPatientSelectOpen, setIsPatientSelectOpen] = useState(false);
  const [isDoctorSelectOpen, setIsDoctorSelectOpen] = useState(false);

  const patientSearchRef = useRef<HTMLInputElement>(null);
  const doctorSearchRef = useRef<HTMLInputElement>(null);

  // Filtrar pacientes baseado no termo de busca
  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) {
      return patients;
    }

    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()),
    );
  }, [patients, patientSearchTerm]);

  // Filtrar médicos baseado no termo de busca
  const filteredDoctors = useMemo(() => {
    if (!doctorSearchTerm.trim()) {
      return doctors;
    }

    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(doctorSearchTerm.toLowerCase()),
    );
  }, [doctors, doctorSearchTerm]);
  // Função helper para agrupar horários por período do dia
  const groupTimesByPeriod = (
    times: Array<{ value: string; available: boolean; label: string }>,
  ) => {
    const morning = times.filter((time) => {
      const hour = parseInt(time.value.split(":")[0]);
      return hour >= 6 && hour < 12;
    });

    const afternoon = times.filter((time) => {
      const hour = parseInt(time.value.split(":")[0]);
      return hour >= 12 && hour < 18;
    });

    const evening = times.filter((time) => {
      const hour = parseInt(time.value.split(":")[0]);
      return hour >= 18 && hour <= 23;
    });

    return { morning, afternoon, evening };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPrice: 0,
      date: undefined,
      time: "",
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedPatientId = form.watch("patientId");
  const selectedDate = form.watch("date");

  const {
    data: availableTimes,
    isLoading: isLoadingTimes,
    error: timesError,
  } = useQuery({
    queryKey: ["available-times", selectedDate, selectedDoctorId],
    queryFn: () =>
      getAvailableTimes({
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        doctorId: selectedDoctorId,
      }),
    enabled: !!selectedDate && !!selectedDoctorId,
  });

  // Debug logs
  useEffect(() => {
    console.log("🔍 Debug - Add Appointment Form:", {
      selectedDate,
      selectedDoctorId,
      availableTimes,
      isLoadingTimes,
      timesError,
      enabled: !!selectedDate && !!selectedDoctorId,
    });
  }, [
    selectedDate,
    selectedDoctorId,
    availableTimes,
    isLoadingTimes,
    timesError,
  ]);

  // Atualizar o preço quando o médico for selecionado
  useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find(
        (doctor) => doctor.id === selectedDoctorId,
      );
      if (selectedDoctor) {
        form.setValue(
          "appointmentPrice",
          selectedDoctor.appointmentPriceInCents / 100,
        );
      }
    }
  }, [selectedDoctorId, doctors, form]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId: "",
        doctorId: "",
        appointmentPrice: 0,
        date: undefined,
        time: "",
      });
    }
  }, [isOpen, form]);

  const createAppointmentAction = useAction(addAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao criar agendamento.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAppointmentAction.execute({
      ...values,
      appointmentPriceInCents: values.appointmentPrice * 100,
    });
  };

  const isDateAvailable = (date: Date) => {
    if (!selectedDoctorId) return false;
    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === selectedDoctorId,
    );
    if (!selectedDoctor) return false;
    const dayOfWeek = date.getDay();
    return (
      dayOfWeek >= selectedDoctor?.availableFromWeekDay &&
      dayOfWeek <= selectedDoctor?.availableToWeekDay
    );
  };

  // ✅ NOVA FUNÇÃO: Validação correta de data (CORREÇÃO PRINCIPAL)
  const isDateDisabled = (date: Date) => {
    // Criar data de hoje sem horário para comparação justa
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Criar cópia da data selecionada sem horário
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Desabilitar apenas datas anteriores a hoje
    return selectedDate < today || !isDateAvailable(date);
  };

  const isDateTimeEnabled = selectedPatientId && selectedDoctorId;

  // Limpar filtros quando o modal for fechado
  useEffect(() => {
    if (!isOpen) {
      setPatientSearchTerm("");
      setDoctorSearchTerm("");
      setIsPatientSelectOpen(false);
      setIsDoctorSelectOpen(false);
    }
  }, [isOpen]);

  // Manter foco no input de busca quando o select estiver aberto
  useEffect(() => {
    if (isPatientSelectOpen && patientSearchRef.current) {
      // Pequeno delay para garantir que o DOM esteja pronto
      setTimeout(() => {
        if (patientSearchRef.current) {
          patientSearchRef.current.focus();
        }
      }, 10);
    }
  }, [isPatientSelectOpen]);

  useEffect(() => {
    if (isDoctorSelectOpen && doctorSearchRef.current) {
      // Pequeno delay para garantir que o DOM esteja pronto
      setTimeout(() => {
        if (doctorSearchRef.current) {
          doctorSearchRef.current.focus();
        }
      }, 10);
    }
  }, [isDoctorSelectOpen]);

  // Adicionar listener para manter foco durante digitação
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se o foco estiver no input de busca, impedir que o Select intercepte
      if (
        document.activeElement === patientSearchRef.current ||
        document.activeElement === doctorSearchRef.current
      ) {
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
        <DialogDescription>
          Crie um novo agendamento para sua clínica.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  open={isPatientSelectOpen}
                  onOpenChange={setIsPatientSelectOpen}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent onKeyDown={(e) => e.stopPropagation()}>
                    {/* Campo de busca */}
                    <div
                      className="flex items-center px-3 py-2"
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        ref={patientSearchRef}
                        placeholder="Buscar paciente..."
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          // Parar a propagação de TODAS as teclas para evitar interferência do Select
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();

                          // Permitir apenas navegação manual específica
                          if (
                            e.key === "ArrowDown" ||
                            e.key === "ArrowUp" ||
                            e.key === "Enter"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onFocus={(e) => e.target.select()}
                        autoComplete="off"
                        spellCheck="false"
                        onCompositionStart={(e) => e.stopPropagation()}
                        onCompositionEnd={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="bg-border h-px" />

                    {/* Lista de pacientes filtrados */}
                    {filteredPatients.length === 0 ? (
                      <div className="text-muted-foreground py-6 text-center text-sm">
                        Nenhum paciente encontrado
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id}
                          onSelect={() => {
                            // Limpar o filtro quando um paciente for selecionado
                            setPatientSearchTerm("");
                          }}
                          className="cursor-pointer"
                        >
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            {patient.name}
                          </span>
                        </SelectItem>
                      ))
                    )}
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  open={isDoctorSelectOpen}
                  onOpenChange={setIsDoctorSelectOpen}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent onKeyDown={(e) => e.stopPropagation()}>
                    {/* Campo de busca */}
                    <div
                      className="flex items-center px-3 py-2"
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        ref={doctorSearchRef}
                        placeholder="Buscar médico..."
                        value={doctorSearchTerm}
                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          // Parar a propagação de TODAS as teclas para evitar interferência do Select
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();

                          // Permitir apenas navegação manual específica
                          if (
                            e.key === "ArrowDown" ||
                            e.key === "ArrowUp" ||
                            e.key === "Enter"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onFocus={(e) => e.target.select()}
                        autoComplete="off"
                        spellCheck="false"
                        onCompositionStart={(e) => e.stopPropagation()}
                        onCompositionEnd={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="bg-border h-px" />

                    {/* Lista de médicos filtrados */}
                    {filteredDoctors.length === 0 ? (
                      <div className="text-muted-foreground py-6 text-center text-sm">
                        Nenhum médico encontrado
                      </div>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <SelectItem
                          key={doctor.id}
                          value={doctor.id}
                          onSelect={() => {
                            // Limpar o filtro quando um médico for selecionado
                            setDoctorSearchTerm("");
                          }}
                          className="cursor-pointer"
                        >
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            {doctor.name} - {doctor.specialty}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <NumericFormat
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value.floatValue);
                  }}
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
                  prefix="R$ "
                  allowNegative={false}
                  disabled={!selectedDoctorId}
                  customInput={Input}
                  placeholder="R$ 0,00"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        disabled={!isDateTimeEnabled}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={isDateDisabled} // ✅ CORREÇÃO: Usar nova função
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isDateTimeEnabled || !selectedDate}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingTimes && (
                      <SelectItem value="loading" disabled>
                        Carregando horários...
                      </SelectItem>
                    )}
                    {!isLoadingTimes &&
                      (!availableTimes?.data ||
                        availableTimes.data.length === 0) && (
                        <SelectItem value="no-times" disabled>
                          Nenhum horário disponível
                        </SelectItem>
                      )}
                    {!isLoadingTimes &&
                      availableTimes?.data &&
                      availableTimes.data.length > 0 &&
                      (() => {
                        const { morning, afternoon, evening } =
                          groupTimesByPeriod(availableTimes.data);

                        return (
                          <>
                            {morning.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Manhã</SelectLabel>
                                {morning.map((time) => (
                                  <SelectItem
                                    key={time.value}
                                    value={time.value}
                                    disabled={!time.available}
                                  >
                                    {time.label}{" "}
                                    {!time.available && "(Indisponível)"}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}

                            {afternoon.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Tarde</SelectLabel>
                                {afternoon.map((time) => (
                                  <SelectItem
                                    key={time.value}
                                    value={time.value}
                                    disabled={!time.available}
                                  >
                                    {time.label}{" "}
                                    {!time.available && "(Indisponível)"}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}

                            {evening.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Noite</SelectLabel>
                                {evening.map((time) => (
                                  <SelectItem
                                    key={time.value}
                                    value={time.value}
                                    disabled={!time.available}
                                  >
                                    {time.label}{" "}
                                    {!time.available && "(Indisponível)"}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                          </>
                        );
                      })()}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={createAppointmentAction.isPending}>
              {createAppointmentAction.isPending
                ? "Criando..."
                : "Criar agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddAppointmentForm;
