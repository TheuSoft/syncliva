"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CalendarIcon, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

import { getAvailableTimes } from "@/actions/agendamentos/get-available-times";
import { updateAppointment } from "@/actions/agendamentos/update-appointment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/appointments";

type Patient = { id: string; name: string; email: string };

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  availableFromWeekDay: number;
  availableToWeekDay: number;
  appointmentPriceInCents: number;
};

interface EditAppointmentModalProps {
  appointment: AppointmentWithRelations | null;
  patients: Patient[];
  doctors: Doctor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAppointmentModal({
  appointment,
  patients,
  doctors,
  open,
  onOpenChange,
}: EditAppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [availableTimes, setAvailableTimes] = useState<
    { value: string; label: string; available: boolean }[]
  >([]);

  const [customPrice, setCustomPrice] = useState<number>(0);

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

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

  useEffect(() => {
    if (appointment && open) {
      setSelectedPatientId(appointment.patientId);
      setSelectedDoctorId(appointment.doctorId);
      setSelectedDate(new Date(appointment.date));
      setCustomPrice(appointment.appointmentPriceInCents / 100);

      // ✅ Usar dayjs com timezone (mesma lógica do appointment card)
      const currentTime = dayjs(appointment.date)
        .tz(BRAZIL_TIMEZONE)
        .format("HH:mm");
      console.log("🎯 Setting selected time:", currentTime);
      setSelectedTime(currentTime);
    }
  }, [appointment, open]);

  useEffect(() => {
    async function fetchTimes() {
      if (selectedDoctorId && selectedDate) {
        const res = await getAvailableTimes({
          doctorId: selectedDoctorId,
          date: format(selectedDate, "yyyy-MM-dd"),
          excludeAppointmentId: appointment?.id, // Excluir o agendamento atual da verificação
        });
        console.log("🎯 Fetched available times:", res.data);
        setAvailableTimes(res.data || []);
      } else {
        setAvailableTimes([]);
      }
    }
    fetchTimes();
  }, [selectedDoctorId, selectedDate, appointment?.id]);

  // Garantir que o horário atual seja definido quando os horários disponíveis forem carregados
  useEffect(() => {
    if (appointment && availableTimes.length > 0 && !selectedTime) {
      // ✅ Usar dayjs com timezone (mesma lógica do appointment card)
      const currentTime = dayjs(appointment.date)
        .tz(BRAZIL_TIMEZONE)
        .format("HH:mm");
      console.log("🎯 Setting time from available times:", currentTime);
      setSelectedTime(currentTime);
    }
  }, [appointment, availableTimes, selectedTime]);

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      setCustomPrice(doctor.appointmentPriceInCents / 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !selectedDate || !selectedTime) return;

    setIsLoading(true);
    try {
      // ✅ Criar data/hora usando dayjs (mesma lógica do add-appointment)
      const [hours, minutes] = selectedTime.split(":").map(Number);

      // Criar data/hora em timezone brasileiro
      const localDateTime = dayjs(selectedDate)
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0)
        .tz(BRAZIL_TIMEZONE);

      // Converter para UTC para salvar no banco
      const utcDate = localDateTime.utc().toDate();

      const result = await updateAppointment({
        appointmentId: appointment.id,
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        date: utcDate,
        appointmentPriceInCents: Math.round(customPrice * 100),
      });

      if (result.success) {
        toast.success("Agendamento atualizado com sucesso!");
        onOpenChange(false);
      } else {
        setErrorMessage(result.message);
        setShowErrorDialog(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErrorMessage(`Erro ao atualizar agendamento: ${errorMessage}`);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Atualize os dados do agendamento abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Paciente */}
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Médico */}
            <div className="space-y-2">
              <Label>Médico</Label>
              <Select
                value={selectedDoctorId}
                onValueChange={handleDoctorChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data (Calendar) */}
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => {
                      const weekDay = date.getDay(); // 0-Dom, 1-Seg
                      const from = selectedDoctor?.availableFromWeekDay ?? 0;
                      const to = selectedDoctor?.availableToWeekDay ?? 6;
                      return weekDay < from || weekDay > to;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label>Horário</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.length === 0 ? (
                    <SelectItem value="no-times" disabled>
                      Nenhum horário disponível
                    </SelectItem>
                  ) : (
                    (() => {
                      const { morning, afternoon, evening } =
                        groupTimesByPeriod(availableTimes);

                      return (
                        <>
                          {morning.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Manhã</SelectLabel>
                              {morning.map((time) => (
                                <SelectItem
                                  key={time.value}
                                  value={time.value}
                                  disabled={
                                    !time.available &&
                                    time.value !== selectedTime
                                  }
                                >
                                  {time.label}{" "}
                                  {!time.available &&
                                    time.value !== selectedTime &&
                                    "(Indisponível)"}
                                  {time.value === selectedTime &&
                                    !time.available &&
                                    " (atual)"}
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
                                  disabled={
                                    !time.available &&
                                    time.value !== selectedTime
                                  }
                                >
                                  {time.label}{" "}
                                  {!time.available &&
                                    time.value !== selectedTime &&
                                    "(Indisponível)"}
                                  {time.value === selectedTime &&
                                    !time.available &&
                                    " (atual)"}
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
                                  disabled={
                                    !time.available &&
                                    time.value !== selectedTime
                                  }
                                >
                                  {time.label}{" "}
                                  {!time.available &&
                                    time.value !== selectedTime &&
                                    "(Indisponível)"}
                                  {time.value === selectedTime &&
                                    !time.available &&
                                    " (atual)"}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </>
                      );
                    })()
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Preço (oculto ou editável se quiser) */}
            <div className="space-y-2">
              <Label>Valor da consulta</Label>
              <NumericFormat
                value={customPrice}
                onValueChange={(values) => {
                  setCustomPrice(values.floatValue ?? 0);
                }}
                thousandSeparator="."
                decimalSeparator=","
                fixedDecimalScale
                decimalScale={2}
                allowNegative={false}
                prefix="R$ "
                placeholder="R$ 0,00"
                customInput={Input}
              />
              {selectedDoctor && (
                <p className="text-muted-foreground text-sm">
                  Preço padrão:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedDoctor.appointmentPriceInCents / 100)}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert de erro */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-red-600">
              Erro ao Atualizar
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center">
            <AlertDialogAction
              onClick={() => setShowErrorDialog(false)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Entendi
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
