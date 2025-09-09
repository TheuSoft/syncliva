"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = () => {
    const confirmed = window.confirm(
      "Tem certeza de que deseja sair do sistema?",
    );

    if (confirmed) {
      authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/authentication");
          },
        },
      });
    }
  };

  return <Button onClick={handleSignOut}>Sair</Button>;
};

export default SignOutButton;
