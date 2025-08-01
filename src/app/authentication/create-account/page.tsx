import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";

import CreateAdminAccountForm from "./components/create-admin-account-form";

const CreateAccountPage = async () => {
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
      
      <div className="w-full max-w-md">
        <CreateAdminAccountForm />
      </div>
    </div>
  );
};

export default CreateAccountPage;
