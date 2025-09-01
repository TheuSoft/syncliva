"use client";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  Filter,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { getDoctorsListAction } from "@/actions/medicos/get-doctors-list";
import { getRelatorioConsultasAction } from "@/actions/relatorios/get-relatorio-consultas";
import { formatCurrencyInCents } from "@/app/(protected)/doctors/_utils/availability";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
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
import type { AppointmentWithRelations } from "@/types/appointments";

import type { RelatorioFiltro } from "./relatorio";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

type StatusFilter = "all" | "confirmed" | "pending" | "canceled";

export default function ReportsPage() {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [doctorId, setDoctorId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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

  // Filtrar agendamentos por status
  const filteredAppointments = agendamentos.filter((appointment) => {
    if (statusFilter === "all") return true;
    return appointment.status === statusFilter;
  });

  // Calcula estatísticas
  const calcularEstatisticas = () => {
    const totalAgendamentos = agendamentos.length;
    const totalValor = agendamentos.reduce(
      (sum, ag) => sum + ag.appointmentPriceInCents,
      0,
    );

    const porStatus = agendamentos.reduce(
      (acc, ag) => {
        if (!acc[ag.status]) {
          acc[ag.status] = { count: 0, valor: 0 };
        }
        acc[ag.status].count += 1;
        acc[ag.status].valor += ag.appointmentPriceInCents;
        return acc;
      },
      {} as Record<string, { count: number; valor: number }>,
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
      porStatus,
      porMedico,
    };
  };

  const estatisticas = calcularEstatisticas();

  // Função para gerar PDF
  const exportarPDF = () => {
    if (filteredAppointments.length === 0) {
      toast.error("Nenhum agendamento para exportar");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Título
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Agendamentos", pageWidth / 2, 20, {
      align: "center",
    });

    // Período
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const periodo =
      tipoRelatorio === "anual" ? `Ano: ${ano}` : `Período: ${mes}/${ano}`;
    doc.text(periodo, pageWidth / 2, 30, { align: "center" });

    // Filtros aplicados
    const filtros = [];
    if (doctorId !== "all") {
      const doctor = doctors.find((d) => d.id === doctorId);
      filtros.push(`Médico: ${doctor?.name || "N/A"}`);
    }
    if (statusFilter !== "all") {
      const statusText = {
        confirmed: "Pagos",
        pending: "Pendentes",
        canceled: "Cancelados",
      }[statusFilter];
      filtros.push(`Status: ${statusText}`);
    }

    if (filtros.length > 0) {
      doc.text(`Filtros: ${filtros.join(", ")}`, pageWidth / 2, 40, {
        align: "center",
      });
    }

    // Resumo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo:", 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Agendamentos: ${filteredAppointments.length}`, 14, 65);
    doc.text(
      `Faturamento Total: ${formatCurrencyInCents(
        filteredAppointments.reduce(
          (sum, ag) => sum + ag.appointmentPriceInCents,
          0,
        ),
      )}`,
      14,
      75,
    );

    // Tabela de agendamentos
    const tableData = filteredAppointments.map((ag) => [
      dayjs(ag.date).tz(BRAZIL_TIMEZONE).format("DD/MM/YYYY"),
      dayjs(ag.date).tz(BRAZIL_TIMEZONE).format("HH:mm"),
      ag.patient?.name || "N/A",
      ag.doctor?.name || "N/A",
      ag.status === "confirmed"
        ? "Pago"
        : ag.status === "pending"
          ? "Pendente"
          : "Cancelado",
      formatCurrencyInCents(ag.appointmentPriceInCents),
    ]);

    autoTable(doc, {
      head: [["Data", "Horário", "Paciente", "Médico", "Status", "Valor"]],
      body: tableData,
      startY: 85,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [74, 144, 226] },
    });

    // Salvar o PDF
    const nomeArquivo =
      tipoRelatorio === "anual"
        ? `relatorio-agendamentos-${ano}.pdf`
        : `relatorio-agendamentos-${mes}-${ano}.pdf`;
    doc.save(nomeArquivo);

    toast.success("PDF exportado com sucesso!");
  };

  // Função para gerar Excel
  const exportarExcel = () => {
    if (filteredAppointments.length === 0) {
      toast.error("Nenhum agendamento para exportar");
      return;
    }

    // Preparar dados para Excel
    const excelData = filteredAppointments.map((ag) => ({
      Data: dayjs(ag.date).tz(BRAZIL_TIMEZONE).format("DD/MM/YYYY"),
      Horário: dayjs(ag.date).tz(BRAZIL_TIMEZONE).format("HH:mm"),
      Paciente: ag.patient?.name || "N/A",
      Médico: ag.doctor?.name || "N/A",
      Status:
        ag.status === "confirmed"
          ? "Pago"
          : ag.status === "pending"
            ? "Pendente"
            : "Cancelado",
      Valor: ag.appointmentPriceInCents / 100, // Converter para reais
    }));

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");

    // Salvar arquivo
    const nomeArquivo =
      tipoRelatorio === "anual"
        ? `relatorio-agendamentos-${ano}.xlsx`
        : `relatorio-agendamentos-${mes}-${ano}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);

    toast.success("Excel exportado com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Pago";
      case "pending":
        return "Pendente";
      case "canceled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Relatórios</PageTitle>
          <PageDescription>
            Visualize e analise os dados dos agendamentos
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {filteredAppointments.length > 0 && (
            <>
              <Button variant="outline" onClick={exportarPDF} className="gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                onClick={exportarExcel}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
            </>
          )}
        </PageActions>
      </PageHeader>

      <PageContent>
        {/* Filtros */}
        <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
                <Filter className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Filtros de Relatório
                </CardTitle>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Configure os parâmetros para gerar seu relatório
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Grid responsivo de filtros */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Tipo de Relatório */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Tipo de Relatório
                </label>
                <Select
                  value={tipoRelatorio}
                  onValueChange={(value: "mensal" | "anual") =>
                    setTipoRelatorio(value)
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mês (apenas para relatório mensal) */}
              {tipoRelatorio === "mensal" && (
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-medium">
                    Mês
                  </label>
                  <Select
                    value={mes.toString()}
                    onValueChange={(value) => setMes(parseInt(value))}
                  >
                    <SelectTrigger className="h-8 text-sm">
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

              {/* Ano */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Ano
                </label>
                <Select
                  value={ano.toString()}
                  onValueChange={(value) => setAno(parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Médico */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Médico
                </label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger className="h-8 text-sm">
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

              {/* Status */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-medium">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: StatusFilter) =>
                    setStatusFilter(value)
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os agendamentos</SelectItem>
                    <SelectItem value="confirmed">
                      Agendamentos pagos
                    </SelectItem>
                    <SelectItem value="pending">
                      Agendamentos pendentes
                    </SelectItem>
                    <SelectItem value="canceled">
                      Agendamentos cancelados
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botão de busca */}
            <div className="border-border/50 flex justify-end border-t pt-2">
              <Button
                onClick={buscar}
                disabled={loading}
                className="h-8 w-full gap-2 px-4 text-sm sm:w-auto"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Erro */}
        {erro && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{erro}</p>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        {filteredAppointments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="border-border/40 border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-muted-foreground text-sm font-semibold">
                    Total de Agendamentos
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-foreground text-2xl font-bold">
                  {filteredAppointments.length}
                </div>
                <p className="text-muted-foreground text-xs">
                  {tipoRelatorio === "anual"
                    ? `no ano ${ano}`
                    : `em ${mes}/${ano}`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 border bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-muted-foreground text-sm font-semibold">
                    Faturamento Total
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrencyInCents(
                    filteredAppointments.reduce(
                      (sum, ag) => sum + ag.appointmentPriceInCents,
                      0,
                    ),
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {tipoRelatorio === "anual"
                    ? `no ano ${ano}`
                    : `em ${mes}/${ano}`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 border bg-gradient-to-br from-purple-500/10 to-violet-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-muted-foreground text-sm font-semibold">
                    Agendamentos Pagos
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-foreground text-2xl font-bold">
                  {estatisticas.porStatus.confirmed?.count || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {formatCurrencyInCents(
                    estatisticas.porStatus.confirmed?.valor || 0,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 border bg-gradient-to-br from-orange-500/10 to-amber-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-muted-foreground text-sm font-semibold">
                    Médicos Atendidos
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-foreground text-2xl font-bold">
                  {Object.keys(estatisticas.porMedico).length}
                </div>
                <p className="text-muted-foreground text-xs">
                  médicos com agendamentos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de Agendamentos */}
        {filteredAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {filteredAppointments.map((ag) => (
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
                        <Badge className={getStatusColor(ag.status)}>
                          {getStatusText(ag.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {!loading && filteredAppointments.length === 0 && !erro && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Nenhum agendamento encontrado para os filtros selecionados.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </PageContent>
    </PageContainer>
  );
}
