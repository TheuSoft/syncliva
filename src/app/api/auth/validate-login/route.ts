import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { email, expectedRole } = await request.json();

    if (!email || !expectedRole) {
      return NextResponse.json(
        { error: "Email e role são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar o usuário pelo email
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o role do usuário corresponde ao esperado
    const isValidRole = user.role === expectedRole;

    if (!isValidRole) {
      let errorMessage = "";
      
      if (expectedRole === "clinic_admin" && user.role === "doctor") {
        errorMessage = "Este email está cadastrado como médico. Use a aba 'Médico' para fazer login.";
      } else if (expectedRole === "doctor" && user.role === "clinic_admin") {
        errorMessage = "Este email está cadastrado como administrador. Use a aba 'Administrador' para fazer login.";
      } else {
        errorMessage = "Tipo de usuário não autorizado para este login.";
      }

      return NextResponse.json(
        { error: errorMessage, userRole: user.role },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        valid: true, 
        userRole: user.role,
        message: "Usuário autorizado para login" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro ao validar login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
