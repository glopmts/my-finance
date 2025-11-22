import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/sonner";
import { TRPCProvider } from "../server/trpc/context/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu App Financia - Controle Financeiro Inteligente",
  description:
    "Aplicativo completo para gerenciar gastos, criar orçamentos e alcançar metas financeiras. Interface intuitiva e relatórios detalhados.",
  keywords: "finanças, controle gastos, orçamento, economia, dinheiro",
  openGraph: {
    title: "Meu App Finan - Suas Finanças Sob Controle",
    description: "Gerencie seu dinheiro de forma prática e eficiente",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html lang="pt-br" suppressHydrationWarning>
        <body className={`${geistSans.variable} antialiased`}>
          <TRPCProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <main>{children}</main>
              <Toaster />
            </ThemeProvider>
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
