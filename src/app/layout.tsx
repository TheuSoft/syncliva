import "./globals.css";

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/providers/react-query";
import { ThemeProvider } from "@/providers/theme-provider";

// Carregando a fonte do Google Fonts via App Router (Next.js 13+)
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap", // ← importante para evitar FOUT (Flash of Unstyled Text)
});

export const metadata: Metadata = {
  title: "Syncliva",
  description: "Gerenciamento de Clinicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Adicionando suppressHydrationWarning também no body */}
      <body
        className={`${manrope.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ReactQueryProvider>
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
