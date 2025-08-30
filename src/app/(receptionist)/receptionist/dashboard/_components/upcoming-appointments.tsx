"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, User } from "lucide-react";

import { getReceptionistUpcomingAppointments } from "@/actions/get-receptionist-upcoming-appointments";
import { Badge } from "@/components/ui/badge";

export default function UpcomingAppointments() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["receptionist-upcoming-appointments"],
    queryFn: () => getReceptionistUpcomingAppointments(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Nenhum agendamento próximo.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "canceled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-blue-100 text-blue-800">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {appointment.patientName}
              </p>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(appointment.status)}`}
              >
                {getStatusText(appointment.status)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(appointment.scheduledAt).toLocaleDateString("pt-BR")} às{" "}
                {new Date(appointment.scheduledAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Dr. {appointment.doctorName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
