"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";

dayjs.locale("pt-br");
import { Calendar } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { formatCurrencyInCents } from "@/app/(protected)/doctors/_utils/availability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DailyAppointment {
  date: string;
  appointments: number;
  revenue: number | null;
}

interface AppointmentsChartProps {
  dailyAppointmentsData: DailyAppointment[];
  from?: string;
  to?: string;
}

const AppointmentsChart = ({
  dailyAppointmentsData,
  from,
  to,
}: AppointmentsChartProps) => {
  // Usar as datas do período selecionado ou padrão do mês atual
  const startDate = from ? dayjs(from) : dayjs().startOf("month");
  const endDate = to ? dayjs(to) : dayjs().endOf("month");

  // Gerar todos os dias do período selecionado
  const totalDays = endDate.diff(startDate, "day") + 1;
  const chartDays = Array.from({ length: totalDays }).map((_, i) =>
    startDate.add(i, "day").format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dataForDay = dailyAppointmentsData.find((item) => item.date === date);
    return {
      date: dayjs(date).format("DD/MM"),
      fullDate: date,
      appointments: dataForDay?.appointments || 0,
      revenue: Number(dataForDay?.revenue || 0),
    };
  });

  // Determinar o título do período
  const getPeriodTitle = () => {
    if (startDate.isSame(endDate, "month")) {
      return `${startDate.format("MMMM [de] YYYY")}`;
    }
    return `${startDate.format("DD/MM/YYYY")} - ${endDate.format("DD/MM/YYYY")}`;
  };

  const chartConfig = {
    appointments: {
      label: "Agendamentos",
      color: "#0B68F7",
    },
    revenue: {
      label: "Faturamento",
      color: "#10B981",
    },
  } satisfies ChartConfig;

  return (
    <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
            <Calendar className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Agendamentos e Faturamento
            </CardTitle>
            <p className="text-muted-foreground text-sm">{getPeriodTitle()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-border/30 bg-background/50 overflow-hidden rounded-lg border">
          <ChartContainer config={chartConfig} className="min-h-[200px]">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatCurrencyInCents(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === "revenue") {
                        return (
                          <>
                            <div className="h-3 w-3 rounded bg-[#10B981]" />
                            <span className="text-muted-foreground">
                              Faturamento:
                            </span>
                            <span className="font-semibold">
                              {formatCurrencyInCents(Number(value))}
                            </span>
                          </>
                        );
                      }
                      return (
                        <>
                          <div className="h-3 w-3 rounded bg-[#0B68F7]" />
                          <span className="text-muted-foreground">
                            Agendamentos:
                          </span>
                          <span className="font-semibold">{value}</span>
                        </>
                      );
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return dayjs(payload[0].payload?.fullDate).format(
                          "DD/MM/YYYY (dddd)",
                        );
                      }
                      return label;
                    }}
                  />
                }
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="appointments"
                stroke="var(--color-appointments)"
                fill="var(--color-appointments)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsChart;
