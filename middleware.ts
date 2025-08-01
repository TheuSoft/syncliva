import { NextResponse } from "next/server";

export default function middleware() {
  // Por enquanto, apenas permitir todas as requisições
  // A proteção de rotas é feita nos layouts das páginas
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/(protected)/:path*",
    "/doctor/:path*",
  ],
};
