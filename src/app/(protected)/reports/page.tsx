"use client";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalendarIcon, DollarSignIcon,DownloadIcon, FileTextIcon, UserIcon } from "lucide-react";
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
  PageTitle 
} from "@/components/ui/page-container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatCurrencyInCents } from "@/helpers/currency";
import type { AppointmentWithRelations } from "@/types/appointments";

import type { RelatorioFiltro } from "./relatorio";

export default function ReportsPage() {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [doctorId, setDoctorId] = useState<string>("all");
  const [tipoRelatorio, setTipoRelatorio] = useState<'mensal' | 'anual'>('mensal');
  const [agendamentos, setAgendamentos] = useState<AppointmentWithRelations[]>([]);
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
      if (tipoRelatorio === 'anual') {
        // Para relatório anual, buscar todos os meses do ano
        const resultados = [];
        for (let m = 1; m <= 12; m++) {
          const filtro: RelatorioFiltro = { 
            mes: m, 
            ano, 
            doctorId: doctorId === "all" || !doctorId ? undefined : doctorId 
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
          doctorId: doctorId === "all" || !doctorId ? undefined : doctorId 
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
  const agendamentosPorMes = agendamentos.reduce((acc: Record<string, AppointmentWithRelations[]>, ag) => {
    const key = `${new Date(ag.date).getMonth() + 1}/${new Date(ag.date).getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ag);
    return acc;
  }, {});

  // Calcula estatísticas
  const calcularEstatisticas = () => {
    const totalAgendamentos = agendamentos.length;
    const totalValor = agendamentos.reduce((sum, ag) => sum + ag.appointmentPriceInCents, 0);
    
    const porMedico = agendamentos.reduce((acc, ag) => {
      const medicoNome = ag.doctor?.name || 'Desconhecido';
      if (!acc[medicoNome]) {
        acc[medicoNome] = { count: 0, valor: 0 };
      }
      acc[medicoNome].count += 1;
      acc[medicoNome].valor += ag.appointmentPriceInCents;
      return acc;
    }, {} as Record<string, { count: number; valor: number }>);

    const porStatus = agendamentos.reduce((acc, ag) => {
      if (!acc[ag.status]) {
        acc[ag.status] = { count: 0, valor: 0 };
      }
      acc[ag.status].count += 1;
      acc[ag.status].valor += ag.appointmentPriceInCents;
      return acc;
    }, {} as Record<string, { count: number; valor: number }>);

    return {
      totalAgendamentos,
      totalValor,
      porMedico,
      porStatus
    };
  };

  const estatisticas = calcularEstatisticas();

  // Função para gerar PDF
  const gerarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Agendamentos', pageWidth / 2, 20, { align: 'center' });
    
    // Período
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const periodo = tipoRelatorio === 'anual' 
      ? `Período: Ano ${ano}` 
      : `Período: ${mes}/${ano}`;
    const medico = doctorId === 'all' ? 'Todos os Médicos' : doctors.find(d => d.id === doctorId)?.name || 'Médico Selecionado';
    doc.text(periodo, 20, 35);
    doc.text(`Médico: ${medico}`, 20, 45);
    doc.text(`Tipo: ${tipoRelatorio === 'anual' ? 'Relatório Anual' : 'Relatório Mensal'}`, 20, 55);
    
    // Resumo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Geral', 20, 70);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Agendamentos: ${estatisticas.totalAgendamentos}`, 20, 80);
    doc.text(`Valor Total: ${formatCurrencyInCents(estatisticas.totalValor)}`, 20, 90);
    
    let yPosition = 105;
    
    // Resumo por médico
    if (Object.keys(estatisticas.porMedico).length > 1) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Por Médico:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      Object.entries(estatisticas.porMedico).forEach(([medico, dados]) => {
        doc.text(`${medico}: ${dados.count} agendamentos - ${formatCurrencyInCents(dados.valor)}`, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }
    
    // Resumo por status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Por Status:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(estatisticas.porStatus).forEach(([status, dados]) => {
      const statusLabel = status === 'pending' ? 'Pendente' : status === 'confirmed' ? 'Confirmado' : 'Cancelado';
      doc.text(`${statusLabel}: ${dados.count} agendamentos - ${formatCurrencyInCents(dados.valor)}`, 25, yPosition);
      yPosition += 8;
    });
    
    // Tabela detalhada
    if (agendamentos.length > 0) {
      yPosition += 10;
      
      const tableData = agendamentos.map(ag => [
        ag.patient?.name || '',
        ag.doctor?.name || '',
        new Date(ag.date).toLocaleDateString('pt-BR'),
        new Date(ag.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ag.status === 'pending' ? 'Pendente' : ag.status === 'confirmed' ? 'Confirmado' : 'Cancelado',
        formatCurrencyInCents(ag.appointmentPriceInCents)
      ]);
      
      autoTable(doc, {
        head: [['Paciente', 'Médico', 'Data', 'Horário', 'Status', 'Valor']],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Salvar PDF
    const tipoArquivo = tipoRelatorio === 'anual' ? 'anual' : 'mensal';
    const nomeArquivo = `relatorio-agendamentos-${tipoArquivo}-${ano}-${doctorId === 'all' ? 'todos' : 'medico'}.pdf`;
    doc.save(nomeArquivo);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      confirmed: "default", 
      canceled: "destructive"
    } as const;
    
    const labels = {
      pending: "Pendente",
      confirmed: "Confirmado",
      canceled: "Cancelado"
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
            Visualize e analise os agendamentos confirmados e pendentes da sua clínica por período e médico.
            {tipoRelatorio === 'anual' 
              ? ' Relatório anual mostra todos os meses do ano selecionado.' 
              : ' Relatório mensal mostra apenas o mês selecionado.'} 
            Agendamentos cancelados não são incluídos nos cálculos.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {agendamentos.length > 0 && (
            <Button onClick={gerarPDF} variant="outline" className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              Exportar PDF
            </Button>
          )}
          <FileTextIcon className="h-5 w-5 text-muted-foreground" />
        </PageActions>
      </PageHeader>

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <Select value={tipoRelatorio} onValueChange={(value: 'mensal' | 'anual') => setTipoRelatorio(value)}>
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
                  {tipoRelatorio === 'mensal' ? 'Mês' : 'Mês (Inicial)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  placeholder="Mês"
                  disabled={tipoRelatorio === 'anual'}
                />
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
                <Button onClick={buscar} disabled={loading} className="w-full">
                  {loading ? "Buscando..." : "Buscar Relatório"}
                </Button>
              </div>
            </div>
            {erro && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{erro}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {agendamentos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.totalAgendamentos}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tipoRelatorio === 'anual' ? 'No ano todo' : 'No mês selecionado'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrencyInCents(estatisticas.totalValor)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receita {tipoRelatorio === 'anual' ? 'anual' : 'mensal'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrencyInCents(Math.round(estatisticas.totalValor / estatisticas.totalAgendamentos))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por agendamento
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {agendamentos.length > 0 && Object.keys(estatisticas.porMedico).length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Resumo por Médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(estatisticas.porMedico).map(([medico, dados]) => (
                  <div key={medico} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{medico}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrencyInCents(dados.valor)}</div>
                      <div className="text-sm text-muted-foreground">
                        {dados.count} {dados.count === 1 ? 'agendamento' : 'agendamentos'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {Object.keys(agendamentosPorMes).length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">
                    {loading ? 'Carregando relatórios...' : 'Nenhum agendamento encontrado'}
                  </h3>
                  <p className="text-muted-foreground">
                    {loading 
                      ? 'Aguarde enquanto buscamos os dados.'
                      : 'Tente ajustar os filtros ou verifique se há agendamentos no período selecionado.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(agendamentosPorMes).map(([mesAno, ags]) => {
              const [mesNum, anoNum] = mesAno.split('/');
              const meses = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
              ];
              const nomeCompleteMes = `${meses[parseInt(mesNum) - 1]} de ${anoNum}`;
              
              return (
                <Card key={mesAno}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {nomeCompleteMes}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {ags.length} {ags.length === 1 ? 'agendamento' : 'agendamentos'}
                        </Badge>
                        <Badge variant="secondary">
                          {formatCurrencyInCents(ags.reduce((sum, ag) => sum + ag.appointmentPriceInCents, 0))}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
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
                        {ags.map((a: AppointmentWithRelations, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {a.patient?.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                {a.doctor?.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(a.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              {new Date(a.date).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(a.status)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrencyInCents(a.appointmentPriceInCents)}
                            </TableCell>
                          </TableRow>
                        ))}
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
