"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  AlertCircle,
  Check,
  Clock,
  Filter,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/cancel-appointment";
import { confirmAppointment } from "@/actions/confirm-appointment";
import { deleteAppointment } from "@/actions/delete-appointment";
import { revertToPending } from "@/actions/revert-to-pending";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppointmentWithRelations } from "@/types/appointments";

import { AppointmentCard } from "./appointment-card";
import { EditAppointmentModal } from "./edit-appointment-modal";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface SearchableAppointmentsListProps {
  initialAppointments: AppointmentWithRelations[];
  patients: { id: string; name: string; email: string }[];
  doctors: {
    id: string;
    name: string;
    specialty: string;
    availableFromWeekDay: number;
    availableToWeekDay: number;
    appointmentPriceInCents: number;
  }[];
  isDoctor?: boolean; // Indica se estamos no dashboard do médico
}

const SearchableAppointmentsList = ({
  initialAppointments,
  patients,
  doctors,
  isDoctor = false,
}: SearchableAppointmentsListProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    // Definir o mês atual como padrão
    const currentDate = new Date();
    const currentMonth = format(currentDate, "yyyy-MM");
    return currentMonth;
  });
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // ✅ Estados para modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<AppointmentWithRelations | null>(null);

  // Calcular meses disponíveis dos agendamentos agrupados por ano
  const availableMonthsByYear = useMemo(() => {
    const monthsMap = new Map<
      string,
      { key: string; label: string; year: string }
    >();

    initialAppointments.forEach((appointment) => {
      const appointmentDate = dayjs(appointment.date)
        .tz(BRAZIL_TIMEZONE)
        .toDate();
      const monthKey = format(appointmentDate, "yyyy-MM");
      const year = format(appointmentDate, "yyyy");
      // Formatar com primeira letra maiúscula
      let monthLabel = format(appointmentDate, "MMMM", { locale: ptBR });
      monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

      monthsMap.set(monthKey, { key: monthKey, label: monthLabel, year });
    });

    const months = Array.from(monthsMap.values());

    // Agrupar por ano
    const groupedByYear = months.reduce(
      (acc, month) => {
        if (!acc[month.year]) {
          acc[month.year] = [];
        }
        acc[month.year].push(month);
        return acc;
      },
      {} as Record<string, { key: string; label: string; year: string }[]>,
    );

    // Ordenar anos (mais recente primeiro) e meses dentro de cada ano
    const sortedYears = Object.keys(groupedByYear).sort((a, b) =>
      b.localeCompare(a),
    );

    sortedYears.forEach((year) => {
      groupedByYear[year].sort((a, b) => a.key.localeCompare(b.key));
    });

    return { groupedByYear, sortedYears };
  }, [initialAppointments]);

  // Estatísticas dos agendamentos
  const appointmentStats = useMemo(() => {
    const stats = {
      total: initialAppointments.length,
      confirmed: 0,
      pending: 0,
      canceled: 0,
    };

    initialAppointments.forEach((appointment) => {
      stats[appointment.status as keyof typeof stats]++;
    });

    return stats;
  }, [initialAppointments]);

  const filteredAppointments = initialAppointments.filter((appointment) => {
    const matchesSearch = appointment.patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesMonth =
      selectedMonth === "all"
        ? true
        : format(
            dayjs(appointment.date).tz(BRAZIL_TIMEZONE).toDate(),
            "yyyy-MM",
          ) === selectedMonth;

    const matchesDoctor =
      selectedDoctor === "all" ? true : appointment.doctorId === selectedDoctor;

    const matchesStatus =
      selectedStatus === "all" ? true : appointment.status === selectedStatus;

    return matchesSearch && matchesMonth && matchesDoctor && matchesStatus;
  });

  const clearFilters = (): void => {
    setSearchTerm("");
    // Voltar para o mês atual em vez de "all"
    const currentDate = new Date();
    const currentMonth = format(currentDate, "yyyy-MM");
    setSelectedMonth(currentMonth);
    setSelectedDoctor("all");
    setSelectedStatus("all");
  };

  // ✅ Função para abrir modal de edição
  const handleEditAppointment = (
    appointment: AppointmentWithRelations,
  ): void => {
    setAppointmentToEdit(appointment);
    setEditModalOpen(true);
  };

  // Funções para ações dos agendamentos
  const handleConfirmAppointment = async (
    appointment: AppointmentWithRelations,
  ) => {
    try {
      const result = await confirmAppointment({
        appointmentId: appointment.id,
      });

      if (result.success) {
        toast.success(result.message);
        // Atualizar a lista localmente em vez de recarregar a página
        // O agendamento será atualizado na próxima renderização
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleCancelAppointment = async (
    appointment: AppointmentWithRelations,
  ) => {
    try {
      const result = await cancelAppointment({ appointmentId: appointment.id });

      if (result.success) {
        toast.success(result.message);
        // Atualizar a lista localmente em vez de recarregar a página
        // O agendamento será atualizado na próxima renderização
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao cancelar agendamento");
    }
  };

  const handleRevertToPending = async (
    appointment: AppointmentWithRelations,
  ) => {
    try {
      const result = await revertToPending({ appointmentId: appointment.id });

      if (result.success) {
        toast.success(result.message);
        // Atualizar a lista localmente em vez de recarregar a página
        // O agendamento será atualizado na próxima renderização
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao reverter agendamento");
    }
  };

  const handleDeleteAppointment = async (
    appointment: AppointmentWithRelations,
  ) => {
    try {
      const result = await deleteAppointment({ appointmentId: appointment.id });

      if (result.success) {
        toast.success(result.message);
        // Atualizar a lista localmente em vez de recarregar a página
        // O agendamento será removido na próxima renderização
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao excluir agendamento");
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      {/* Estatísticas dos agendamentos */}
      <div className="flex items-center justify-end gap-2">
        <Badge
          variant="secondary"
          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
        >
          <Check className="mr-1 h-3 w-3" />
          {appointmentStats.confirmed}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
        >
          <Clock className="mr-1 h-3 w-3" />
          {appointmentStats.pending}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
        >
          <AlertCircle className="mr-1 h-3 w-3" />
          {appointmentStats.canceled}
        </Badge>
      </div>

      {/* Estatísticas dos agendamentos */}
      <div className="flex w-full max-w-full items-center justify-between overflow-hidden">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          {filteredAppointments.length} de {initialAppointments.length}{" "}
          agendamentos
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-r">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar paciente:</label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Digite o nome do paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por mês:</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {availableMonthsByYear.sortedYears.map((year) => (
                    <div key={year}>
                      <div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">
                        {year}
                      </div>
                      {availableMonthsByYear.groupedByYear[year].map(
                        ({ key, label }) => (
                          <SelectItem key={key} value={key} className="pl-6">
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isDoctor && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Filtrar por médico:
                </label>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os médicos</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por status:</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="confirmed">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="canceled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {filteredAppointments.length} resultado
              {filteredAppointments.length !== 1 ? "s" : ""} encontrado
              {filteredAppointments.length !== 1 ? "s" : ""}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de agendamentos */}
      <div className="w-full max-w-full space-y-8 overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Não há agendamentos que correspondam aos filtros aplicados.
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          (() => {
            // Agrupar agendamentos por mês
            const appointmentsByMonth = filteredAppointments.reduce(
              (acc, appointment) => {
                const appointmentDate = dayjs(appointment.date)
                  .tz(BRAZIL_TIMEZONE)
                  .toDate();
                const monthKey = format(appointmentDate, "yyyy-MM");
                const monthLabel = format(appointmentDate, "MMMM 'de' yyyy", {
                  locale: ptBR,
                });

                if (!acc[monthKey]) {
                  acc[monthKey] = {
                    label:
                      monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
                    appointments: [],
                  };
                }
                acc[monthKey].appointments.push(appointment);
                return acc;
              },
              {} as Record<
                string,
                { label: string; appointments: AppointmentWithRelations[] }
              >,
            );

            // Ordenar meses (mais recente primeiro)
            const sortedMonths = Object.entries(appointmentsByMonth).sort(
              ([a], [b]) => b.localeCompare(a),
            );

            // Ordenar agendamentos dentro de cada mês por proximidade da data atual
            sortedMonths.forEach(([, monthData]) => {
              monthData.appointments.sort((a, b) => {
                const today = dayjs().tz(BRAZIL_TIMEZONE).startOf("day");
                const dateA = dayjs(a.date).tz(BRAZIL_TIMEZONE).startOf("day");
                const dateB = dayjs(b.date).tz(BRAZIL_TIMEZONE).startOf("day");

                // Calcular diferença em dias da data atual
                const diffA = dateA.diff(today, "day");
                const diffB = dateB.diff(today, "day");

                // Se ambos são futuros, ordenar cronologicamente (mais próximo primeiro)
                if (diffA >= 0 && diffB >= 0) {
                  return dateA.isBefore(dateB) ? -1 : 1;
                }

                // Se ambos são passados, ordenar cronologicamente (mais recente primeiro)
                if (diffA < 0 && diffB < 0) {
                  return dateA.isAfter(dateB) ? -1 : 1;
                }

                // Se um é futuro e outro é passado, futuro vem primeiro
                if (diffA >= 0 && diffB < 0) return -1;
                if (diffA < 0 && diffB >= 0) return 1;

                return 0;
              });
            });

            return sortedMonths.map(([monthKey, { label, appointments }]) => (
              <div
                key={monthKey}
                className="w-full max-w-full space-y-4 overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-border h-px flex-1" />
                  <h3 className="text-foreground text-lg font-semibold">
                    {label}
                  </h3>
                  <div className="bg-border h-px flex-1" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      variant="compact"
                      onEdit={handleEditAppointment}
                      onConfirm={handleConfirmAppointment}
                      onCancel={handleCancelAppointment}
                      onRevertToPending={handleRevertToPending}
                      onDelete={handleDeleteAppointment}
                      isDoctor={isDoctor}
                      showActions={true}
                    />
                  ))}
                </div>
              </div>
            ));
          })()
        )}
      </div>

      {/* Modal de edição */}
      <EditAppointmentModal
        appointment={appointmentToEdit}
        patients={patients}
        doctors={doctors}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};

export { SearchableAppointmentsList };
