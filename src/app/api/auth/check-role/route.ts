import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({ 
      headers: await headers() 
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado" }, 
        { status: 401 }
      );
    }

    // Retornar o role do usuário
    return NextResponse.json({ 
      role: session.user.role || 'clinic_admin' 
    });
  } catch (error) {
    console.error("Erro ao verificar role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}
