"use client";

// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getDoctorsListAction } from "@/actions/get-doctors-list";
import { getRelatorioConsultasAction } from "@/actions/get-relatorio-consultas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyInCents } from "@/helpers/currency";
import type { AppointmentWithRelations } from "@/types/appointments";

import type { RelatorioFiltro } from "./relatorio";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export default function ReportsPage() {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [doctorId, setDoctorId] = useState<string>("all");
  const [tipoRelatorio, setTipoRelatorio] = useState<"mensal" | "anual">(
    "mensal",
  );
  const [agendamentos, setAgendamentos] = useState<AppointmentWithRelations[]>(
    [],
  );
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const list = await getDoctorsListAction();
        setDoctors(list);
      } catch {
        setErro("Erro ao buscar doutores");
      }
    }
    fetchDoctors();
  }, []);

  // Carregar relatório automaticamente ao entrar
  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscar = async () => {
    setLoading(true);
    setErro("");
    try {
      if (tipoRelatorio === "anual") {
        // Para relatório anual, buscar todos os meses do ano
        const resultados = [];
        for (let m = 1; m <= 12; m++) {
          const filtro: RelatorioFiltro = {
            mes: m,
            ano,
            doctorId: doctorId === "all" || !doctorId ? undefined : doctorId,
          };
          const resultado = await getRelatorioConsultasAction(filtro);
          resultados.push(...resultado);
        }
        setAgendamentos(resultados);
      } else {
        // Relatório mensal normal
        const filtro: RelatorioFiltro = {
          mes,
          ano,
          doctorId: doctorId === "all" || !doctorId ? undefined : doctorId,
        };
        const resultado = await getRelatorioConsultasAction(filtro);
        setAgendamentos(resultado);
      }
    } catch (error) {
      setErro((error as Error).message || "Erro ao buscar relatórios");
    } finally {
      setLoading(false);
    }
  };

  // Agrupa agendamentos por mês (comentado pois não está sendo usado)
  // const agendamentosPorMes = agendamentos.reduce(
  //   (acc: Record<string, AppointmentWithRelations[]>, ag) => {
  //     const localDate = dayjs(ag.date).tz(BRAZIL_TIMEZONE).toDate();
  //     const key = `${localDate.getMonth() + 1}/${localDate.getFullYear()}`;
  //     if (!acc[key]) acc[key] = [];
  //     acc[key].push(ag);
  //     return acc;
  //   },
  //   {},
  // );

  // Calcula estatísticas
  const calcularEstatisticas = () => {
    const totalAgendamentos = agendamentos.length;
    const totalValor = agendamentos.reduce(
      (sum, ag) => sum + ag.appointmentPriceInCents,
      0,
    );

    const porMedico = agendamentos.reduce(
      (acc, ag) => {
        const medicoNome = ag.doctor?.name || "Desconhecido";
        if (!acc[medicoNome]) {
          acc[medicoNome] = {
            agendamentos: 0,
            valor: 0,
          };
        }
        acc[medicoNome].agendamentos++;
        acc[medicoNome].valor += ag.appointmentPriceInCents;
        return acc;
      },
      {} as Record<string, { agendamentos: number; valor: number }>,
    );

    return {
      totalAgendamentos,
      totalValor,
      porMedico,
    };
  };

  const estatisticas = calcularEstatisticas();

  const exportarPDF = () => {
    // Implementar exportação PDF
    toast.info("Funcionalidade de exportação em desenvolvimento");
  };

  const exportarExcel = () => {
    // Implementar exportação Excel
    toast.info("Funcionalidade de exportação em desenvolvimento");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e analise os dados dos agendamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={exportarExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select
                value={tipoRelatorio}
                onValueChange={(value: "mensal" | "anual") =>
                  setTipoRelatorio(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoRelatorio === "mensal" && (
              <div>
                <label className="text-sm font-medium">Mês</label>
                <Select
                  value={mes.toString()}
                  onValueChange={(value) => setMes(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Janeiro</SelectItem>
                    <SelectItem value="2">Fevereiro</SelectItem>
                    <SelectItem value="3">Março</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Maio</SelectItem>
                    <SelectItem value="6">Junho</SelectItem>
                    <SelectItem value="7">Julho</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Ano</label>
              <Select
                value={ano.toString()}
                onValueChange={(value) => setAno(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Médico</label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os médicos</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={buscar} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Agendamentos
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalAgendamentos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyInCents(estatisticas.totalValor)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Médicos Atendidos
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(estatisticas.porMedico).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes dos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : erro ? (
            <div className="py-8 text-center text-red-600">{erro}</div>
          ) : agendamentos.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              Nenhum agendamento encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentos.map((ag) => (
                  <TableRow key={ag.id}>
                    <TableCell>
                      {dayjs(ag.date)
                        .tz(BRAZIL_TIMEZONE)
                        .toDate()
                        .toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                    </TableCell>
                    <TableCell>
                      {dayjs(ag.date)
                        .tz(BRAZIL_TIMEZONE)
                        .toDate()
                        .toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </TableCell>
                    <TableCell>{ag.patient.name}</TableCell>
                    <TableCell>Dr. {ag.doctor.name}</TableCell>
                    <TableCell>
                      {formatCurrencyInCents(ag.appointmentPriceInCents)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          ag.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : ag.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ag.status === "confirmed"
                          ? "Confirmado"
                          : ag.status === "pending"
                            ? "Pendente"
                            : "Cancelado"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
