"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock,User } from "lucide-react";

import { getReceptionistActivities } from "@/actions/get-receptionist-activities";
import { Badge } from "@/components/ui/badge";

export default function RecentActivities() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["receptionist-activities"],
    queryFn: () => getReceptionistActivities(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Nenhuma atividade recente para exibir.
        </p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment_created":
        return <CalendarDays className="h-4 w-4" />;
      case "patient_registered":
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "appointment_created":
        return "bg-blue-100 text-blue-800";
      case "patient_registered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityText = (activity: { type: string; patientName?: string; description?: string }) => {
    switch (activity.type) {
      case "appointment_created":
        return `Novo agendamento criado para ${activity.patientName}`;
      case "patient_registered":
        return `Paciente ${activity.patientName} cadastrado`;
      default:
        return activity.description || "Atividade realizada";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium">
              {getActivityText(activity)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(activity.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {activity.type === "appointment_created" ? "Agendamento" : 
             activity.type === "patient_registered" ? "Paciente" : "Atividade"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
