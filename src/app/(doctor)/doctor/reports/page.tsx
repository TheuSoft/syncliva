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

import { getDoctorReportsAction } from "@/actions/get-doctor-reports";
import type { RelatorioFiltro } from "@/app/(protected)/reports/relatorio";
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
import type { AppointmentWithRelations } from "@/types/appointments";

export default function DoctorReportsPage() {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [tipoRelatorio, setTipoRelatorio] = useState<"mensal" | "anual">(
    "mensal",
  );
  const [agendamentos, setAgendamentos] = useState<AppointmentWithRelations[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>("");

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
          };
          const resultado = await getDoctorReportsAction(filtro);
          resultados.push(...resultado);
        }
        setAgendamentos(resultados);
      } else {
        // Relatório mensal normal
        const filtro: RelatorioFiltro = {
          mes,
          ano,
        };
        const resultado = await getDoctorReportsAction(filtro);
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
      const key = `${new Date(ag.date).getMonth() + 1}/${new Date(ag.date).getFullYear()}`;
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
      porStatus,
    };
  };

  const estatisticas = calcularEstatisticas();

  // Função para gerar PDF
  const gerarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Título
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Consultas - Médico", pageWidth / 2, 20, {
      align: "center",
    });

    // Período
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const periodo =
      tipoRelatorio === "anual" ? `Ano: ${ano}` : `Período: ${mes}/${ano}`;
    doc.text(periodo, pageWidth / 2, 30, { align: "center" });

    // Resumo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo:", 14, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Consultas: ${estatisticas.totalAgendamentos}`, 14, 60);
    doc.text(
      `Faturamento Total: ${formatCurrencyInCents(estatisticas.totalValor)}`,
      14,
      70,
    );

    // Tabela de agendamentos
    const tableData = agendamentos.map((ag) => [
      new Date(ag.date).toLocaleDateString("pt-BR"),
      new Date(ag.date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ag.patient?.name || "N/A",
      ag.status === "confirmed"
        ? "Agendamento pago"
        : ag.status === "pending"
          ? "Pendente"
          : "Cancelado",
      formatCurrencyInCents(ag.appointmentPriceInCents),
    ]);

    autoTable(doc, {
      head: [["Data", "Horário", "Paciente", "Status", "Valor"]],
      body: tableData,
      startY: 80,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [74, 144, 226] },
    });

    // Salvar o PDF
    const nomeArquivo =
      tipoRelatorio === "anual"
        ? `relatorio-consultas-medico-${ano}.pdf`
        : `relatorio-consultas-medico-${mes}-${ano}.pdf`;
    doc.save(nomeArquivo);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Meus Relatórios de Consulta</PageTitle>
          <PageDescription>
            Visualize e analise suas consultas realizadas, faturamento e
            estatísticas
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {agendamentos.length > 0 && (
            <Button onClick={gerarPDF} className="gap-2">
              <DownloadIcon className="h-4 w-4" />
              Exportar PDF
            </Button>
          )}
        </PageActions>
      </PageHeader>

      <PageContent>
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Filtros de Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Tipo de Relatório */}
              <div className="space-y-2">
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

              {/* Ano */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano</label>
                <Input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(parseInt(e.target.value))}
                  min="2020"
                  max="2030"
                />
              </div>

              {/* Mês (apenas para relatório mensal) */}
              {tipoRelatorio === "mensal" && (
                <div className="space-y-2">
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

              {/* Botão Buscar */}
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-0">Buscar</label>
                <Button onClick={buscar} disabled={loading} className="w-full">
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
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
        {agendamentos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Consultas
                </CardTitle>
                <UserIcon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {estatisticas.totalAgendamentos}
                </div>
                <p className="text-muted-foreground text-xs">
                  {tipoRelatorio === "anual"
                    ? `no ano ${ano}`
                    : `em ${mes}/${ano}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Faturamento Total
                </CardTitle>
                <DollarSignIcon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrencyInCents(estatisticas.totalValor)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {tipoRelatorio === "anual"
                    ? `no ano ${ano}`
                    : `em ${mes}/${ano}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Consultas Confirmadas
                </CardTitle>
                <CalendarIcon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {estatisticas.porStatus.confirmed?.count || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {formatCurrencyInCents(
                    estatisticas.porStatus.confirmed?.valor || 0,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Consultas Pendentes
                </CardTitle>
                <CalendarIcon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {estatisticas.porStatus.pending?.count || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {formatCurrencyInCents(
                    estatisticas.porStatus.pending?.valor || 0,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de Agendamentos */}
        {agendamentos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Consultas Realizadas</CardTitle>
            </CardHeader>
            <CardContent>
              {tipoRelatorio === "anual" ? (
                // Exibição por mês para relatório anual
                <div className="space-y-6">
                  {Object.entries(agendamentosPorMes)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([mesAno, consultas]) => (
                      <div key={mesAno}>
                        <h3 className="mb-3 text-lg font-semibold">
                          {mesAno} ({consultas.length} consultas -{" "}
                          {formatCurrencyInCents(
                            consultas.reduce(
                              (sum, c) => sum + c.appointmentPriceInCents,
                              0,
                            ),
                          )}
                          )
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Horário</TableHead>
                              <TableHead>Paciente</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {consultas.map((agendamento) => (
                              <TableRow key={agendamento.id}>
                                <TableCell>
                                  {new Date(
                                    agendamento.date,
                                  ).toLocaleDateString("pt-BR")}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    agendamento.date,
                                  ).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>
                                <TableCell>
                                  {agendamento.patient?.name || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      agendamento.status === "confirmed"
                                        ? "default"
                                        : agendamento.status === "pending"
                                          ? "secondary"
                                          : "destructive"
                                    }
                                  >
                                    {agendamento.status === "confirmed"
                                      ? "Agendamento pago"
                                      : agendamento.status === "pending"
                                        ? "Pendente"
                                        : "Cancelado"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {formatCurrencyInCents(
                                    agendamento.appointmentPriceInCents,
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                </div>
              ) : (
                // Exibição simples para relatório mensal
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendamentos.map((agendamento) => (
                      <TableRow key={agendamento.id}>
                        <TableCell>
                          {new Date(agendamento.date).toLocaleDateString(
                            "pt-BR",
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(agendamento.date).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          {agendamento.patient?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              agendamento.status === "confirmed"
                                ? "default"
                                : agendamento.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {agendamento.status === "confirmed"
                              ? "Agendamento pago"
                              : agendamento.status === "pending"
                                ? "Pendente"
                                : "Cancelado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrencyInCents(
                            agendamento.appointmentPriceInCents,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {!loading && agendamentos.length === 0 && !erro && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <FileTextIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Nenhuma consulta encontrada para o período selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </PageContent>
    </PageContainer>
  );
}
