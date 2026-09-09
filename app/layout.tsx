import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Joelho Recovery",
  description: "Treino, nutrição e histórico para reabilitação do joelho",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Joelho Recovery",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2c3e50",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="max-w-md mx-auto min-h-screen relative font-sans">
        <main className="px-4 pt-5">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
