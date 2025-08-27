"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CalendarIcon,
  DollarSignIcon,
  DownloadIcon,
  FileTextIcon,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { getDoctorsListAction } from "@/actions/get-doctors-list";
import { getRelatorioConsultasAction } from "@/actions/get-relatorio-consultas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatCurrencyInCents } from "@/helpers/currency";
import { convertToLocalDate } from "@/helpers/date";
import type { AppointmentWithRelations } from "@/types/appointments";

import type { RelatorioFiltro } from "./relatorio";

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

  // Agrupa agendamentos por mês
  const agendamentosPorMes = agendamentos.reduce(
    (acc: Record<string, AppointmentWithRelations[]>, ag) => {
      const localDate = convertToLocalDate(ag.date);
      const key = `${localDate.getMonth() + 1}/${localDate.getFullYear()}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(ag);
      return acc;
    },
    {},
  );

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
          acc[medicoNome] = { count: 0, valor: 0 };
        }
        acc[medicoNome].count += 1;
        acc[medicoNome].valor += ag.appointmentPriceInCents;
        return acc;
      },
      {} as Record<string, { count: number; valor: number }>,
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

    return {
      totalAgendamentos,
      totalValor,
      porMedico,
      porStatus,
    };
  };

  const estatisticas = calcularEstatisticas();

  // Função para gerar PDF otimizado para gestão
  const gerarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // ✅ Cabeçalho compacto
    doc.setFillColor(52, 73, 94);
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Syncliva - Relatório de Agendamentos", 20, 20);

    // Período no cabeçalho
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const periodo =
      tipoRelatorio === "anual"
        ? `${ano}`
        : `${mes.toString().padStart(2, "0")}/${ano}`;
    doc.text(
      `${periodo} | ${new Date().toLocaleDateString("pt-BR")}`,
      pageWidth - 20,
      20,
      { align: "right" },
    );

    let yPos = 45;

    // ✅ Métricas principais em linha compacta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    const metricas = [
      `Total: ${estatisticas.totalAgendamentos} agendamentos`,
      `Faturamento: ${formatCurrencyInCents(estatisticas.totalValor)}`,
      `Ticket médio: ${formatCurrencyInCents(Math.round(estatisticas.totalValor / estatisticas.totalAgendamentos || 0))}`,
    ];

    metricas.forEach((metrica, index) => {
      const xPos = 20 + index * 60;
      doc.text(metrica, xPos, yPos);
    });

    yPos += 15;

    // ✅ Status breakdown compacto
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Status dos Agendamentos:", 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    Object.entries(estatisticas.porStatus).forEach(([status, dados]) => {
      const statusLabel =
        status === "pending"
          ? "Pendentes"
          : status === "confirmed"
            ? "Confirmados"
            : "Cancelados";
      const porcentagem = (
        (dados.count / estatisticas.totalAgendamentos) *
        100
      ).toFixed(1);
      doc.text(
        `${statusLabel}: ${dados.count} (${porcentagem}%) - ${formatCurrencyInCents(dados.valor)}`,
        25,
        yPos,
      );
      yPos += 6;
    });

    // ✅ Por médico (apenas se múltiplos)
    if (Object.keys(estatisticas.porMedico).length > 1) {
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Por Profissional:", 20, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      Object.entries(estatisticas.porMedico).forEach(([medico, dados]) => {
        const porcentagem = (
          (dados.count / estatisticas.totalAgendamentos) *
          100
        ).toFixed(1);
        doc.text(
          `${medico}: ${dados.count} (${porcentagem}%) - ${formatCurrencyInCents(dados.valor)}`,
          25,
          yPos,
        );
        yPos += 6;
      });
    }

    // ✅ Tabela otimizada - apenas informações essenciais
    if (agendamentos.length > 0) {
      yPos += 10;

      const tableData = agendamentos.map((ag) => [
        convertToLocalDate(ag.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        convertToLocalDate(ag.date).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ag.patient?.name || "",
        ag.doctor?.name || "",
        ag.status === "pending"
          ? "Pendente"
          : ag.status === "confirmed"
            ? "Pago"
            : "Cancelado",
        formatCurrencyInCents(ag.appointmentPriceInCents),
      ]);

      autoTable(doc, {
        head: [["Data", "Hora", "Paciente", "Médico", "Status", "Valor"]],
        body: tableData,
        startY: yPos,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Data
          1: { cellWidth: 18 }, // Hora
          2: { cellWidth: 45 }, // Paciente
          3: { cellWidth: 40 }, // Médico
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 25, halign: "right" }, // Valor
        },
        margin: { left: 20, right: 20 },
        alternateRowStyles: { fillColor: [248, 249, 250] },
      });
    }

    // ✅ Rodapé compacto
    const finalTableY =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY || yPos + 20;
    const footerY = finalTableY + 15;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Syncliva | Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
      20,
      footerY,
    );

    // ✅ Salvar PDF com nome descritivo
    const tipoArquivo = tipoRelatorio === "anual" ? "anual" : "mensal";
    const periodoFinal =
      tipoRelatorio === "anual"
        ? ano
        : `${ano}-${String(mes).padStart(2, "0")}`;
    const medicoFinal =
      doctorId === "all" ? "todos-profissionais" : "medico-especifico";
    const nomeArquivo = `SyncLiva-Relatorio-${tipoArquivo}-${periodoFinal}-${medicoFinal}.pdf`;

    doc.save(nomeArquivo);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      confirmed: "default",
      canceled: "destructive",
    } as const;

    const labels = {
      pending: "Pendente",
      confirmed: "Agendamento pago",
      canceled: "Cancelado",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Relatórios de Agendamentos</PageTitle>
          <PageDescription>
            Visualize e analise os agendamentos pagos e pendentes da sua clínica
            por período e médico.
            {tipoRelatorio === "anual"
              ? " Relatório anual mostra todos os meses do ano selecionado."
              : " Relatório mensal mostra apenas o mês selecionado."}
            Agendamentos cancelados não são incluídos nos cálculos.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {agendamentos.length > 0 && (
            <Button
              onClick={gerarPDF}
              variant="outline"
              className="hover:bg-primary/10 flex items-center gap-2 transition-colors"
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar PDF
            </Button>
          )}
        </PageActions>
      </PageHeader>

      <PageContent>
        <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
                <CalendarIcon className="text-primary h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-semibold">
                Filtros de Busca
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <Select
                  value={tipoRelatorio}
                  onValueChange={(value: "mensal" | "anual") =>
                    setTipoRelatorio(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Relatório Mensal
                      </div>
                    </SelectItem>
                    <SelectItem value="anual">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Relatório Anual
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {tipoRelatorio === "mensal" ? "Mês" : "Mês (Inicial)"}
                </label>
                <Select
                  value={mes.toString()}
                  onValueChange={(value) => setMes(parseInt(value))}
                  disabled={tipoRelatorio === "anual"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano</label>
                <Input
                  type="number"
                  min={2020}
                  max={2100}
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  placeholder="Ano"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Médico</label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um Doutor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Todos os Médicos
                      </div>
                    </SelectItem>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {doc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <Button
                  onClick={buscar}
                  disabled={loading}
                  className="w-full cursor-pointer"
                >
                  {loading ? "Buscando..." : "Buscar Relatório"}
                </Button>
              </div>
            </div>
            {erro && (
              <div className="bg-destructive/10 border-destructive/20 mt-4 rounded-md border p-3">
                <p className="text-destructive text-sm">{erro}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {agendamentos.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="border-border/40 border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-muted-foreground text-sm font-semibold">
                      Total de Agendamentos
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-foreground text-2xl font-bold">
                    {estatisticas.totalAgendamentos}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {tipoRelatorio === "anual"
                      ? "No ano todo"
                      : "No mês selecionado"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/40 border bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-2">
                      <DollarSignIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-muted-foreground text-sm font-semibold">
                      Valor Total
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrencyInCents(estatisticas.totalValor)}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Receita {tipoRelatorio === "anual" ? "anual" : "mensal"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/40 border bg-gradient-to-br from-purple-500/10 to-violet-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2">
                      <DollarSignIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-muted-foreground text-sm font-semibold">
                      Valor Médio
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-foreground text-2xl font-bold">
                    {formatCurrencyInCents(
                      Math.round(
                        estatisticas.totalValor /
                          estatisticas.totalAgendamentos,
                      ),
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Por agendamento
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {agendamentos.length > 0 &&
          Object.keys(estatisticas.porMedico).length > 1 && (
            <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
                    <UserIcon className="text-primary h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    Resumo por Médico
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(estatisticas.porMedico).map(
                    ([medico, dados]) => (
                      <div
                        key={medico}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{medico}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrencyInCents(dados.valor)}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {dados.count}{" "}
                            {dados.count === 1 ? "agendamento" : "agendamentos"}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {Object.keys(agendamentosPorMes).length === 0 ? (
          <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm">
            <CardContent className="py-12">
              <div className="space-y-4 text-center">
                <div className="bg-muted/30 border-border/30 mx-auto w-fit rounded-xl border p-3">
                  <FileTextIcon className="text-muted-foreground h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {loading
                      ? "Carregando relatórios..."
                      : "Nenhum agendamento encontrado"}
                  </h3>
                  <p className="text-muted-foreground">
                    {loading
                      ? "Aguarde enquanto buscamos os dados."
                      : "Tente ajustar os filtros ou verifique se há agendamentos no período selecionado."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(agendamentosPorMes).map(([mesAno, ags]) => {
              const [mesNum, anoNum] = mesAno.split("/");
              const meses = [
                "Janeiro",
                "Fevereiro",
                "Março",
                "Abril",
                "Maio",
                "Junho",
                "Julho",
                "Agosto",
                "Setembro",
                "Outubro",
                "Novembro",
                "Dezembro",
              ];
              const nomeCompleteMes = `${meses[parseInt(mesNum) - 1]} de ${anoNum}`;

              return (
                <Card
                  key={mesAno}
                  className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
                          <CalendarIcon className="text-primary h-5 w-5" />
                        </div>
                        <span className="text-lg font-semibold">
                          {nomeCompleteMes}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-700"
                        >
                          {ags.length}{" "}
                          {ags.length === 1 ? "agendamento" : "agendamentos"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          {formatCurrencyInCents(
                            ags.reduce(
                              (sum, ag) => sum + ag.appointmentPriceInCents,
                              0,
                            ),
                          )}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-border/30 bg-background/50 overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Médico</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ags.map(
                            (a: AppointmentWithRelations, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">
                                  {a.patient?.name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="text-muted-foreground h-4 w-4" />
                                    {a.doctor?.name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {convertToLocalDate(
                                    a.date,
                                  ).toLocaleDateString("pt-BR")}
                                </TableCell>
                                <TableCell>
                                  {convertToLocalDate(
                                    a.date,
                                  ).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(a.status)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrencyInCents(
                                    a.appointmentPriceInCents,
                                  )}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}
