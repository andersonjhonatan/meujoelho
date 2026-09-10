import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const APP_NAME = "Joelho Recovery";
const APP_DESCRIPTION =
  "Protocolo de reabilitação para condropatia patelofemoral: treino por fase clínica, nutrição e histórico.";

export const metadata: Metadata = {
  // metadataBase evita URLs relativas quebradas em Open Graph / manifest.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  applicationName: APP_NAME,
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: APP_NAME },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
  // App pessoal de saúde: não faz sentido em buscador.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // maximumScale: 1 impedia o usuário de dar zoom — barreira de acessibilidade
  // real, ainda mais numa tela com texto pequeno de execução de exercício.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="relative mx-auto min-h-screen max-w-md font-sans">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Pular para o conteúdo
        </a>
        <main id="conteudo" className="px-4 pt-5">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
