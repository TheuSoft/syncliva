import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";

import CreateAdminAccountForm from "./components/create-admin-account-form";

const CreateAccountPage = async () => {
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
              Bem-vindo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure sua clínica e comece hoje mesmo
            </p>
          </div>

          {/* Card de Criação de Conta */}
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
            <CreateAdminAccountForm />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Precisa de ajuda?{" "}
              <a
                href="#"
                className="cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-400"
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

export default CreateAccountPage;
