import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import DoctorLoginForm from "./components/doctor-login-form";
import LoginForm from "./components/login-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    // Redirecionar baseado no role do usuário
    if (session.user.role === 'doctor') {
      redirect("/doctor/dashboard");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Tabs defaultValue="Admin" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Admin">Administrador</TabsTrigger>
          <TabsTrigger value="Doctor">Médico</TabsTrigger>
        </TabsList>
        <TabsContent value="Admin">
          <LoginForm />
        </TabsContent>
        <TabsContent value="Doctor">
          <DoctorLoginForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthenticationPage;
