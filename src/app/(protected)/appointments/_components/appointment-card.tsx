"use client";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  Check,
  Clock,
  DollarSign,
  Edit,
  MoreVertical,
  Stethoscope,
  Trash2,
  User,
  X,
} from "lucide-react";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

import { formatCurrencyInCents } from "@/app/(protected)/doctors/_helpers/availability";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/appointments";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  className?: string;
  variant?: "compact" | "detailed" | "modal"; // Variantes do card
  onEdit?: (appointment: AppointmentWithRelations) => void;
  onConfirm?: (appointment: AppointmentWithRelations) => void;
  onCancel?: (appointment: AppointmentWithRelations) => void;
  onRevertToPending?: (appointment: AppointmentWithRelations) => void;
  onDelete?: (appointment: AppointmentWithRelations) => void;
  isDoctor?: boolean; // Indica se estamos na visualização do médico
  showActions?: boolean; // Controla se mostra o menu de ações
  onActionComplete?: () => void; // Callback para quando uma ação é completada (ex: fechar modal)
}

export function AppointmentCard({
  appointment,
  className,
  variant = "compact",
  onEdit,
  onConfirm,
  onCancel,
  onRevertToPending,
  onDelete,
  isDoctor = false,
  showActions = false,
  onActionComplete,
}: AppointmentCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmado",
          color:
            "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300",
          icon: <Check className="h-3 w-3" />,
          badgeColor:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
        };
      case "pending":
        return {
          label: "Pendente",
          color:
            "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
          icon: <Clock className="h-3 w-3" />,
          badgeColor:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
        };
      case "canceled":
        return {
          label: "Cancelado",
          color:
            "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300",
          icon: <X className="h-3 w-3" />,
          badgeColor:
            "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
        };
      default:
        return {
          label: status,
          color:
            "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-300",
          icon: <Clock className="h-3 w-3" />,
          badgeColor:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);

  // Verificar permissões para ações
  const canMarkAsPaid = appointment.status === "pending";
  const canCancel = ["pending", "confirmed"].includes(appointment.status);
  const canEdit = appointment.status === "pending"; // Só pode editar se estiver pendente
  const canDelete = appointment.status === "canceled";
  const canRevertToPending = appointment.status === "confirmed"; // Pode voltar como pendente se estiver confirmado

  // Componente do menu de ações
  const ActionsMenu = () => {
    if (!showActions || isDoctor) return null;

    return (
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="bg-background/80 h-8 w-8 rounded-full border p-0 shadow-sm backdrop-blur-sm"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {canMarkAsPaid && onConfirm && (
              <DropdownMenuItem
                onClick={() => {
                  onConfirm(appointment);
                  onActionComplete?.();
                }}
                className="text-emerald-700 dark:text-emerald-300"
              >
                <Check className="mr-2 h-4 w-4" />
                Pago
              </DropdownMenuItem>
            )}

            {canEdit && onEdit && (
              <DropdownMenuItem
                onClick={() => {
                  onEdit(appointment);
                  onActionComplete?.();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}

            {canRevertToPending && onRevertToPending && (
              <DropdownMenuItem
                onClick={() => {
                  onRevertToPending(appointment);
                  onActionComplete?.();
                }}
                className="text-amber-700 dark:text-amber-300"
              >
                <Clock className="mr-2 h-4 w-4" />
                Voltar como Pendente
              </DropdownMenuItem>
            )}

            {canCancel && onCancel && appointment.status === "pending" && (
              <DropdownMenuItem
                onClick={() => {
                  onCancel(appointment);
                  onActionComplete?.();
                }}
                className="text-red-700 dark:text-red-300"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            )}

            {canDelete && onDelete && (
              <DropdownMenuItem
                onClick={() => {
                  onDelete(appointment);
                  onActionComplete?.();
                }}
                className="text-red-700 dark:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Variante compacta para lista
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group from-background to-muted/20 hover:border-primary/30 relative flex h-full min-h-[120px] flex-col rounded-xl border bg-gradient-to-br p-3 transition-all duration-300 hover:shadow-lg",
          "w-full max-w-full overflow-hidden",
          className,
        )}
      >
        <ActionsMenu />

        {/* Header com horário e status */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border px-2 py-1 text-sm font-bold">
              {dayjs(appointment.date)
                .tz(BRAZIL_TIMEZONE)
                .format("DD/MM HH:mm")}
            </div>
            <Badge
              variant="secondary"
              className={cn("text-xs", statusConfig.badgeColor)}
            >
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-3 w-3" />
              <span className="text-foreground truncate text-sm font-semibold">
                {appointment.patient.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="text-muted-foreground h-3 w-3" />
              <span className="text-muted-foreground truncate text-xs">
                Dr. {appointment.doctor.name}
              </span>
            </div>
          </div>

          {/* Footer com preço */}
          <div className="flex items-center gap-2 pt-2">
            <DollarSign className="text-primary h-3 w-3" />
            <span className="text-primary text-sm font-bold">
              {formatCurrencyInCents(appointment.appointmentPriceInCents)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Variante para modal (mais compacta)
  if (variant === "modal") {
    return (
      <div className="group from-background to-muted/20 hover:border-primary/30 relative flex h-full min-h-[100px] flex-col rounded-xl border bg-gradient-to-br p-2.5 transition-all duration-300 hover:shadow-lg">
        <ActionsMenu />

        {/* Header com horário e status */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border px-1.5 py-0.5 text-xs font-bold">
              {dayjs(appointment.date)
                .tz(BRAZIL_TIMEZONE)
                .format("DD/MM HH:mm")}
            </div>
            <Badge
              variant="secondary"
              className={cn("text-xs", statusConfig.badgeColor)}
            >
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 space-y-1.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <User className="text-muted-foreground h-3 w-3" />
              <span className="text-foreground truncate text-sm font-semibold">
                {appointment.patient.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Stethoscope className="text-muted-foreground h-3 w-3" />
              <span className="text-muted-foreground truncate text-xs">
                Dr. {appointment.doctor.name}
              </span>
            </div>
          </div>

          {/* Informação da especialidade */}
          <div className="bg-muted/30 rounded px-1.5 py-0.5">
            <p className="text-muted-foreground truncate text-xs">
              {appointment.doctor.specialty}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Variante detalhada (fallback)
  return (
    <div className="group from-background to-muted/20 hover:border-primary/30 relative flex h-full min-h-[140px] flex-col rounded-xl border bg-gradient-to-br p-3 transition-all duration-300 hover:shadow-lg">
      <ActionsMenu />

      {/* Header com horário e status */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border px-2 py-1 text-sm font-bold">
            {dayjs(appointment.date).tz(BRAZIL_TIMEZONE).format("HH:mm")}
          </div>
          <Badge
            variant="secondary"
            className={cn("text-xs", statusConfig.badgeColor)}
          >
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-3 w-3" />
            <span className="text-foreground truncate text-sm font-semibold">
              {appointment.patient.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="text-muted-foreground h-3 w-3" />
            <span className="text-muted-foreground truncate text-xs">
              Dr. {appointment.doctor.name}
            </span>
          </div>
        </div>

        {/* Footer com preço */}
        <div className="flex items-center gap-2 pt-2">
          <DollarSign className="text-primary h-3 w-3" />
          <span className="text-primary text-sm font-bold">
            {formatCurrencyInCents(appointment.appointmentPriceInCents)}
          </span>
        </div>
      </div>
    </div>
  );
}
