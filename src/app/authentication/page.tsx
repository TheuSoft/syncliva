import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import DoctorLoginForm from "./components/doctor-login-form";
import LoginForm from "./components/login-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    // Redirecionar baseado no role do usuário
    if (session.user.role === "doctor") {
      redirect("/doctor/dashboard");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Header com Logo e Theme Toggle */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <Logo width={160} height={40} className="cursor-pointer" />
        </div>
        <ThemeToggle />
      </div>

      {/* Container Principal */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Cabeçalho */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Faça login para acessar sua conta
            </p>
          </div>

          {/* Card de Login */}
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
            <Tabs defaultValue="Admin" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-gray-100/80 dark:bg-gray-700/50">
                <TabsTrigger
                  value="Admin"
                  className="transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Administrador
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Doctor"
                  className="transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Médico
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Admin" className="mt-0">
                <LoginForm />
              </TabsContent>

              <TabsContent value="Doctor" className="mt-0">
                <DoctorLoginForm />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Precisa de ajuda?{" "}
              <a
                href="#"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer com informações */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 Doutor Agenda. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default AuthenticationPage;
