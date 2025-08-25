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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <div className="flex-1 sm:flex-none"></div>
          <div className="flex items-center">
            <Logo
              width={120}
              height={24}
              className="drop-shadow-sm sm:h-8 sm:w-[156px]"
            />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/authentication">
              <Button className="relative cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-sm text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:px-6 sm:py-2.5 sm:text-base dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700">
                <span className="relative z-10 flex items-center gap-1 font-medium sm:gap-2">
                  <span className="hidden sm:inline">Acessar Sistema</span>
                  <span className="sm:hidden">Login</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </span>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 transition-opacity duration-200 hover:opacity-100" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl sm:-top-40 sm:-right-40 sm:h-80 sm:w-80" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl sm:-bottom-40 sm:-left-40 sm:h-80 sm:w-80" />
        </div>

        <div className="relative container mx-auto text-center">
          <div className="mx-auto max-w-4xl lg:max-w-5xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200/50 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-sm sm:mb-8 sm:px-4 sm:py-2 sm:text-sm dark:border-blue-800/50 dark:bg-blue-950/50 dark:text-blue-300">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              Sistema em Produção
            </div>

            <h1 className="text-foreground mb-4 text-4xl leading-tight font-bold tracking-tight sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
              Gestão de Clínicas
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                Inteligente
              </span>
            </h1>

            <p className="text-muted-foreground mb-8 text-lg leading-relaxed sm:mb-10 sm:text-xl lg:text-2xl">
              Transforme a gestão da sua clínica com nossa plataforma completa.
              <br className="hidden sm:block" />
              <span className="text-foreground font-medium">
                Agendamentos, pacientes, relatórios
              </span>{" "}
              e muito mais em um só lugar.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link href="/authentication" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="relative h-12 w-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-base font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25 sm:h-14 sm:px-8 sm:py-4 sm:text-lg dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                    Começar Agora
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/30 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="bg-background/80 h-12 w-full border-2 border-blue-200 px-6 py-3 text-base font-semibold text-blue-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:bg-blue-50 sm:h-14 sm:w-auto sm:px-8 sm:py-4 sm:text-lg dark:border-blue-700 dark:text-blue-300 dark:hover:border-blue-600 dark:hover:bg-blue-950/50"
              >
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  Ver Demonstração
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                </span>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:mt-16 sm:gap-8">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 sm:text-3xl dark:text-blue-400">
                  99.9%
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Uptime
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 sm:text-3xl dark:text-green-400">
                  500+
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Clínicas Ativas
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 sm:text-3xl dark:text-purple-400">
                  24/7
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Suporte
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background/50 relative px-4 py-16 backdrop-blur-sm sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center sm:mb-16 lg:mb-20">
            <div className="mb-3 inline-flex items-center rounded-full border border-purple-200/50 bg-purple-50/80 px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm backdrop-blur-sm sm:mb-4 sm:px-4 sm:py-2 sm:text-sm dark:border-purple-800/50 dark:bg-purple-950/50 dark:text-purple-300">
              Funcionalidades Completas
            </div>
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl xl:text-6xl">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:max-w-3xl sm:text-xl lg:text-2xl">
              Uma plataforma completa com todas as ferramentas necessárias para
              <span className="text-foreground font-medium">
                {" "}
                otimizar sua clínica
              </span>
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-200/50 hover:shadow-2xl dark:hover:border-blue-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Calendar className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Agendamentos Inteligentes
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  Sistema avançado com detecção de conflitos, confirmações
                  automáticas, lembretes por SMS/email e sincronização em tempo
                  real.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 hover:border-green-200/50 hover:shadow-2xl dark:hover:border-green-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Users className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Gestão Completa
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  Prontuários digitais, histórico médico, documentos anexados,
                  acompanhamento de tratamentos e comunicação direta.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 hover:border-purple-200/50 hover:shadow-2xl md:col-span-2 lg:col-span-1 dark:hover:border-purple-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Stethoscope className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Equipe Médica
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  Gestão de especialistas, horários personalizados, agenda
                  integrada, controle de permissões e dashboard individual.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 hover:border-orange-200/50 hover:shadow-2xl dark:hover:border-orange-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <FileText className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Relatórios Avançados
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  Analytics em tempo real, métricas de performance, relatórios
                  financeiros, exportação em PDF/Excel e insights automáticos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 hover:border-red-200/50 hover:shadow-2xl dark:hover:border-red-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Shield className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Segurança Total
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  Criptografia end-to-end, backup automático, conformidade LGPD,
                  autenticação 2FA e logs de auditoria completos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 hover:border-indigo-200/50 hover:shadow-2xl md:col-span-2 lg:col-span-1 dark:hover:border-indigo-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-4">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Clock className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Tempo Real
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  Sincronização instantânea, notificações push, atualizações
                  automáticas, status online e comunicação em tempo real.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots/Demo Section */}
      <section className="from-muted/30 via-background to-muted/20 relative bg-gradient-to-br px-6 py-24 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-green-200/50 bg-green-50/80 px-4 py-2 text-sm font-medium text-green-700 shadow-sm backdrop-blur-sm dark:border-green-800/50 dark:bg-green-950/50 dark:text-green-300">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Interface em Funcionamento
            </div>
            <h2 className="text-foreground mb-6 text-5xl font-bold lg:text-6xl">
              Design Moderno & Responsivo
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl lg:text-2xl">
              Interface otimizada para produtividade com
              <span className="text-foreground font-medium">
                {" "}
                experiência fluida
              </span>{" "}
              em qualquer dispositivo
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Dashboard Demo */}
            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-2xl transition-all duration-500 hover:scale-105 hover:border-blue-200/50 hover:shadow-blue-500/10 dark:hover:border-blue-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative aspect-video overflow-hidden">
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
                  <div className="text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl">
                      <Calendar className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-foreground mb-2 text-2xl font-bold">
                      Dashboard Executivo
                    </h3>
                    <p className="text-muted-foreground">
                      Visão 360° da sua clínica
                    </p>
                    <div className="bg-background/80 text-muted-foreground mt-4 rounded-lg px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                      🎨 Preview do Sistema Real
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="relative p-8">
                <h3 className="text-foreground mb-3 text-2xl font-bold">
                  Dashboard Inteligente
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Métricas em tempo real, gráficos interativos, alertas
                  automáticos e insights para tomada de decisões estratégicas.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Analytics
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                    Tempo Real
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    Responsive
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Demo */}
            <Card className="group from-background to-muted/30 relative overflow-hidden border-2 border-transparent bg-gradient-to-br shadow-2xl transition-all duration-500 hover:scale-105 hover:border-green-200/50 hover:shadow-green-500/10 dark:hover:border-green-800/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative aspect-video overflow-hidden">
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
                  <div className="text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-foreground mb-2 text-2xl font-bold">
                      Sistema de Agendamentos
                    </h3>
                    <p className="text-muted-foreground">
                      Gestão completa e automatizada
                    </p>
                    <div className="bg-background/80 text-muted-foreground mt-4 rounded-lg px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                      � Interface Otimizada
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="relative p-4 sm:p-6 lg:p-8">
                <h3 className="text-foreground mb-2 text-xl font-bold sm:mb-3 sm:text-2xl">
                  Agendamentos Avançados
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                  Sistema inteligente com prevenção de conflitos, confirmações
                  automáticas e integração com calendários externos.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 sm:px-3 dark:bg-green-950 dark:text-green-300">
                    Automático
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 sm:px-3 dark:bg-blue-950 dark:text-blue-300">
                    Inteligente
                  </span>
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 sm:px-3 dark:bg-orange-950 dark:text-orange-300">
                    Sincronizado
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technology Stack */}
          <div className="mt-16 text-center sm:mt-20">
            <h3 className="text-foreground mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">
              Tecnologia de Ponta
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 opacity-60 transition-opacity duration-300 hover:opacity-100 sm:gap-6 lg:gap-8">
              <div className="bg-background/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-medium backdrop-blur-sm sm:px-4 sm:text-sm">
                Next.js 15
              </div>
              <div className="bg-background/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-medium backdrop-blur-sm sm:px-4 sm:text-sm">
                TypeScript
              </div>
              <div className="bg-background/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-medium backdrop-blur-sm sm:px-4 sm:text-sm">
                React Server Components
              </div>
              <div className="bg-background/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-medium backdrop-blur-sm sm:px-4 sm:text-sm">
                Tailwind CSS
              </div>
              <div className="bg-background/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-medium backdrop-blur-sm sm:px-4 sm:text-sm">
                Drizzle ORM
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & CTA Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-3xl sm:top-20 sm:right-20 sm:h-64 sm:w-64" />
          <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl sm:bottom-20 sm:left-20 sm:h-64 sm:w-64" />
        </div>

        <div className="relative container mx-auto">
          <div className="mb-12 text-center sm:mb-16 lg:mb-20">
            <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200/50 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur-sm sm:mb-4 sm:px-4 sm:py-2 sm:text-sm dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Resultados Comprovados
            </div>
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl xl:text-6xl">
              Transforme sua clínica
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:max-w-3xl sm:text-xl lg:text-2xl">
              Mais de{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                500 clínicas
              </span>{" "}
              já otimizaram seus processos com nossa plataforma
            </p>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Benefits */}
            <div className="space-y-6 sm:space-y-8">
              <div className="group bg-background/80 flex items-start gap-4 rounded-xl p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:gap-6 sm:rounded-2xl sm:p-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg sm:h-12 sm:w-12 sm:rounded-xl">
                  <CheckCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-bold sm:mb-3 sm:text-xl">
                    Economia de 40% no tempo administrativo
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    Automatização completa de processos repetitivos, eliminando
                    tarefas manuais e reduzindo drasticamente erros
                    operacionais.
                  </p>
                </div>
              </div>

              <div className="group bg-background/80 flex items-start gap-4 rounded-xl p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:gap-6 sm:rounded-2xl sm:p-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-12 sm:w-12 sm:rounded-xl">
                  <CheckCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-bold sm:mb-3 sm:text-xl">
                    Redução de 90% em conflitos de agenda
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    Algoritmo inteligente que previne sobreposições e otimiza
                    automaticamente os horários disponíveis para máxima
                    eficiência.
                  </p>
                </div>
              </div>

              <div className="group bg-background/80 flex items-start gap-4 rounded-xl p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:gap-6 sm:rounded-2xl sm:p-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg sm:h-12 sm:w-12 sm:rounded-xl">
                  <CheckCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-bold sm:mb-3 sm:text-xl">
                    Aumento de 25% na satisfação dos pacientes
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    Comunicação automatizada, lembretes inteligentes e
                    experiência digital que impressiona e fideliza seus
                    pacientes.
                  </p>
                </div>
              </div>

              <div className="group bg-background/80 flex items-start gap-4 rounded-xl p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:gap-6 sm:rounded-2xl sm:p-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg sm:h-12 sm:w-12 sm:rounded-xl">
                  <CheckCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-lg font-bold sm:mb-3 sm:text-xl">
                    ROI positivo em menos de 3 meses
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    Retorno garantido do investimento através da otimização
                    operacional e aumento da capacidade de atendimento.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 opacity-90 sm:rounded-3xl" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-xl sm:rounded-3xl" />

              <div className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-700/90 p-6 text-white shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-8 lg:p-10">
                <div className="mb-6 text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:mb-4 sm:h-16 sm:w-16">
                    <Stethoscope className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">
                    Pronto para revolucionar sua clínica?
                  </h3>
                  <p className="text-base text-blue-100 sm:text-lg">
                    Junte-se às clínicas que já transformaram sua gestão e
                    <span className="font-semibold text-white">
                      {" "}
                      aumentaram sua eficiência em 40%
                    </span>
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <Link href="/authentication" className="block">
                    <Button
                      size="lg"
                      className="group relative h-12 w-full overflow-hidden bg-white text-blue-600 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl sm:h-14"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-base font-bold sm:gap-3 sm:text-lg">
                        Começar Transformação Agora
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
                      </span>
                    </Button>
                  </Link>

                  <div className="text-center">
                    <p className="text-xs text-blue-100 sm:text-sm">
                      ✅ Setup em 24h • ✅ Suporte especializado • ✅ Sem
                      compromisso
                    </p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-white/10 blur-2xl sm:-top-4 sm:-right-4 sm:h-24 sm:w-24" />
                <div className="absolute -bottom-2 -left-2 h-20 w-20 rounded-full bg-purple-400/20 blur-3xl sm:-bottom-4 sm:-left-4 sm:h-32 sm:w-32" />
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center sm:mt-20">
            <p className="text-muted-foreground mb-6 text-xs font-medium sm:mb-8 sm:text-sm">
              Clínicas confiam em nossa plataforma
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
              <div className="border-border/50 bg-background/80 rounded-lg border px-4 py-2 shadow-sm backdrop-blur-sm sm:px-6 sm:py-3">
                <div className="text-base font-bold text-blue-600 sm:text-lg dark:text-blue-400">
                  500+
                </div>
                <div className="text-muted-foreground text-xs">
                  Clínicas Ativas
                </div>
              </div>
              <div className="border-border/50 bg-background/80 rounded-lg border px-4 py-2 shadow-sm backdrop-blur-sm sm:px-6 sm:py-3">
                <div className="text-base font-bold text-green-600 sm:text-lg dark:text-green-400">
                  99.9%
                </div>
                <div className="text-muted-foreground text-xs">Uptime SLA</div>
              </div>
              <div className="border-border/50 bg-background/80 rounded-lg border px-4 py-2 shadow-sm backdrop-blur-sm sm:px-6 sm:py-3">
                <div className="text-base font-bold text-purple-600 sm:text-lg dark:text-purple-400">
                  4.9/5
                </div>
                <div className="text-muted-foreground text-xs">Satisfação</div>
              </div>
              <div className="border-border/50 bg-background/80 rounded-lg border px-4 py-2 shadow-sm backdrop-blur-sm sm:px-6 sm:py-3">
                <div className="text-base font-bold text-orange-600 sm:text-lg dark:text-orange-400">
                  ISO 27001
                </div>
                <div className="text-muted-foreground text-xs">Certificado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-900 px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8 dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black opacity-90 dark:from-slate-900 dark:via-slate-950 dark:to-black" />

        <div className="relative container mx-auto">
          <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="md:col-span-2 lg:col-span-2">
              <div className="mb-4 sm:mb-6">
                <Logo
                  width={140}
                  height={28}
                  className="brightness-0 invert sm:h-9 sm:w-[180px]"
                />
              </div>
              <p className="mb-4 text-base leading-relaxed text-slate-300 sm:mb-6 sm:text-lg">
                Plataforma completa para gestão de clínicas médicas. Automatize
                processos, otimize resultados e ofereça a melhor experiência aos
                seus pacientes.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm sm:px-4">
                  <div className="text-xs font-bold text-green-400 sm:text-sm">
                    500+
                  </div>
                  <div className="text-xs text-slate-400">Clínicas</div>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm sm:px-4">
                  <div className="text-xs font-bold text-blue-400 sm:text-sm">
                    99.9%
                  </div>
                  <div className="text-xs text-slate-400">Uptime</div>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm sm:px-4">
                  <div className="text-xs font-bold text-purple-400 sm:text-sm">
                    24/7
                  </div>
                  <div className="text-xs text-slate-400">Suporte</div>
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-3 text-base font-bold text-white sm:mb-4 sm:text-lg">
                Produto
              </h4>
              <ul className="space-y-2 text-sm text-slate-300 sm:space-y-3 sm:text-base">
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">Funcionalidades</Link>
                </li>
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">Integrações</Link>
                </li>
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">Segurança</Link>
                </li>
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">API</Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-3 text-base font-bold text-white sm:mb-4 sm:text-lg">
                Suporte
              </h4>
              <ul className="space-y-2 text-sm text-slate-300 sm:space-y-3 sm:text-base">
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">Central de Ajuda</Link>
                </li>
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">Documentação</Link>
                </li>
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">Contato</Link>
                </li>
                <li className="transition-colors hover:text-white">
                  <Link href="/authentication">Status</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 border-t border-slate-700 pt-6 sm:mt-12 sm:pt-8">
            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
              <div className="text-xs text-slate-400 sm:text-sm">
                © 2025 Sistema de Gestão de Clínicas. Todos os direitos
                reservados.
              </div>
              <div className="flex gap-4 text-xs text-slate-400 sm:gap-6 sm:text-sm">
                <Link
                  href="/authentication"
                  className="transition-colors hover:text-white"
                >
                  Privacidade
                </Link>
                <Link
                  href="/authentication"
                  className="transition-colors hover:text-white"
                >
                  Termos
                </Link>
                <Link
                  href="/authentication"
                  className="transition-colors hover:text-white"
                >
                  LGPD
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </footer>
    </div>
  );
}
