import {
  CalendarIcon,
  DollarSignIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { formatCurrencyInCents } from "@/app/(protected)/doctors/_helpers/availability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalPatients,
  totalDoctors,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Faturamento Total",
      value: totalRevenue ? formatCurrencyInCents(totalRevenue) : "R$ 0,00",
      icon: DollarSignIcon,
      color: "from-green-500/10 to-emerald-500/5",
      iconBg: "bg-green-500/10 border-green-500/20",
      iconColor: "text-green-600",
      description: "Receita do período",
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      icon: CalendarIcon,
      color: "from-blue-500/10 to-cyan-500/5",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      iconColor: "text-blue-600",
      description: "Consultas agendadas",
    },
    {
      title: "Pacientes Ativos",
      value: totalPatients.toString(),
      icon: UserIcon,
      color: "from-purple-500/10 to-violet-500/5",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      iconColor: "text-purple-600",
      description: "Pacientes únicos",
    },
    {
      title: "Médicos",
      value: totalDoctors.toString(),
      icon: UsersIcon,
      color: "from-orange-500/10 to-amber-500/5",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      iconColor: "text-orange-600",
      description: "Equipe médica",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`bg-gradient-to-br ${stat.color} border-border/40 border shadow-sm transition-all duration-300 hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
              <div
                className={`${stat.iconBg} flex h-12 w-12 items-center justify-center rounded-xl border`}
              >
                <Icon className={`${stat.iconColor} h-6 w-6`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-muted-foreground text-sm leading-none font-semibold">
                  {stat.title}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-xs">
                  {stat.description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-foreground text-2xl font-bold">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
