"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="via-background dark:via-background min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 dark:from-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex-1"></div>
          <div className="flex items-center">
            <Logo width={136} height={28} />
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
            <Link href="/authentication">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Acessar Sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-foreground mb-6 text-5xl leading-tight font-bold">
              Sistema de Gestão de Clínicas
              <span className="block text-blue-600">Completo e Intuitivo</span>
            </h1>
            <p className="text-muted-foreground mb-8 text-xl leading-relaxed">
              Gerencie sua clínica com eficiência. Controle agendamentos,
              pacientes, profissionais e relatórios em uma plataforma moderna e
              segura.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/authentication">
                <Button
                  size="lg"
                  className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 px-8 py-3 text-lg text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-4xl font-bold">
              Funcionalidades Principais
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Tudo que você precisa para gerenciar sua clínica de forma
              eficiente
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 transition-colors hover:border-blue-200 dark:hover:border-blue-400">
              <CardHeader>
                <Calendar className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-xl">Agendamentos</CardTitle>
                <CardDescription>
                  Sistema completo de agendamento com horários disponíveis,
                  confirmações automáticas e lembretes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-blue-200 dark:hover:border-blue-400">
              <CardHeader>
                <Users className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-xl">Gestão de Pacientes</CardTitle>
                <CardDescription>
                  Cadastro completo de pacientes com histórico, informações de
                  contato e acompanhamento.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-blue-200 dark:hover:border-blue-400">
              <CardHeader>
                <Stethoscope className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-xl">Profissionais</CardTitle>
                <CardDescription>
                  Gestão de equipe profissional com especialidades, horários de
                  trabalho e agenda personalizada.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-blue-200 dark:hover:border-blue-400">
              <CardHeader>
                <FileText className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-xl">Relatórios</CardTitle>
                <CardDescription>
                  Relatórios detalhados de consultas, faturamento e estatísticas
                  para tomada de decisões.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-blue-200 dark:hover:border-blue-400">
              <CardHeader>
                <Shield className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-xl">Segurança</CardTitle>
                <CardDescription>
                  Autenticação segura, controle de acesso por perfis e proteção
                  de dados sensíveis.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-colors hover:border-blue-200 dark:hover:border-blue-400">
              <CardHeader>
                <Clock className="mb-4 h-12 w-12 text-blue-600" />
                <CardTitle className="text-xl">Tempo Real</CardTitle>
                <CardDescription>
                  Atualizações em tempo real, notificações instantâneas e
                  sincronização automática.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots/Figma Images Section */}
      <section className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-4xl font-bold">
              Interface Moderna e Intuitiva
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Design responsivo e experiência de usuário otimizada para
              produtividade
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* 
              PLACEHOLDER PARA IMAGEM DO FIGMA - DASHBOARD
              Substitua este Card pela sua imagem do dashboard do Figma
              Exemplo: <Image src="/figma-dashboard.png" alt="Dashboard" width={600} height={400} />
            */}
            <Card className="overflow-hidden">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                <div className="text-center">
                  <Calendar className="mx-auto mb-4 h-16 w-16 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-foreground text-xl font-semibold">
                    Dashboard Principal
                  </h3>
                  <p className="text-muted-foreground">
                    Visão geral das atividades da clínica
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    🖼️ Substitua por imagem do Figma
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Dashboard Administrativo
                </h3>
                <p className="text-muted-foreground">
                  Painel principal com métricas, agendamentos do dia e resumo
                  das atividades.
                </p>
              </CardContent>
            </Card>

            {/* 
              PLACEHOLDER PARA IMAGEM DO FIGMA - AGENDAMENTOS
              Substitua este Card pela sua imagem dos agendamentos do Figma
              Exemplo: <Image src="/figma-appointments.png" alt="Agendamentos" width={600} height={400} />
            */}
            <Card className="overflow-hidden">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                <div className="text-center">
                  <Users className="mx-auto mb-4 h-16 w-16 text-green-600 dark:text-green-400" />
                  <h3 className="text-foreground text-xl font-semibold">
                    Gestão de Agendamentos
                  </h3>
                  <p className="text-muted-foreground">
                    Sistema completo de marcação de consultas
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    🖼️ Substitua por imagem do Figma
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">Agendamentos</h3>
                <p className="text-muted-foreground">
                  Interface intuitiva para marcar, editar e acompanhar consultas
                  médicas.
                </p>
              </CardContent>
            </Card>

            {/* 
              PLACEHOLDER PARA IMAGEM DO FIGMA - PACIENTES
              Substitua este Card pela sua imagem dos pacientes do Figma
              Exemplo: <Image src="/figma-patients.png" alt="Pacientes" width={600} height={400} />
            */}
            <Card className="overflow-hidden">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800">
                <div className="text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-foreground text-xl font-semibold">
                    Prontuários
                  </h3>
                  <p className="text-muted-foreground">
                    Gestão completa de pacientes
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    🖼️ Substitua por imagem do Figma
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Cadastro de Pacientes
                </h3>
                <p className="text-muted-foreground">
                  Sistema completo para gerenciar informações e histórico dos
                  pacientes.
                </p>
              </CardContent>
            </Card>

            {/* 
              PLACEHOLDER PARA IMAGEM DO FIGMA - RELATÓRIOS
              Substitua este Card pela sua imagem dos relatórios do Figma
              Exemplo: <Image src="/figma-reports.png" alt="Relatórios" width={600} height={400} />
            */}
            <Card className="overflow-hidden">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
                <div className="text-center">
                  <Shield className="mx-auto mb-4 h-16 w-16 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-foreground text-xl font-semibold">
                    Relatórios
                  </h3>
                  <p className="text-muted-foreground">
                    Análises e estatísticas detalhadas
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    🖼️ Substitua por imagem do Figma
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Relatórios Gerenciais
                </h3>
                <p className="text-muted-foreground">
                  Relatórios completos para análise de desempenho e tomada de
                  decisões.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-4xl font-bold">
              Por que escolher nosso sistema?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Benefícios que fazem a diferença no dia a dia da sua clínica
            </p>
          </div>

          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Economia de Tempo
                  </h3>
                  <p className="text-muted-foreground">
                    Automatize processos repetitivos e reduza o tempo gasto com
                    tarefas administrativas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Redução de Erros
                  </h3>
                  <p className="text-muted-foreground">
                    Sistema inteligente que previne conflitos de horários e
                    erros de agendamento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Melhor Experiência
                  </h3>
                  <p className="text-muted-foreground">
                    Interface moderna e intuitiva que facilita o trabalho de
                    toda a equipe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Controle Total</h3>
                  <p className="text-muted-foreground">
                    Tenha visibilidade completa sobre todas as operações da sua
                    clínica.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white dark:from-blue-700 dark:to-blue-900">
              <h3 className="mb-4 text-2xl font-bold">Pronto para começar?</h3>
              <p className="mb-6 text-blue-100">
                Transforme a gestão da sua clínica hoje mesmo. Sistema completo,
                seguro e fácil de usar.
              </p>
              <Link href="/authentication">
                <Button
                  size="lg"
                  className="w-full bg-white text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-200"
                >
                  Acessar Sistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted px-4 py-12">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Logo width={160} height={32} />
            </div>
            <p className="text-muted-foreground mb-6">
              Sistema de gestão para clínicas moderno e completo
            </p>
            <div className="text-muted-foreground flex justify-center gap-6 text-sm">
              <span>© 2025</span>
              <span>•</span>
              <span>Sistema de Gestão</span>
              <span>•</span>
              <span>Gestão de Clínicas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
