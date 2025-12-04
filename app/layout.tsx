import type { Metadata } from "next";
import "./globals.css";
import { MuiProvider } from "@/components";
import { AuthProvider } from "@/app/features/auth";
import { LoadingProvider } from "@/contexts";
import { ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sucursales",
  description: "Sistema de gestión de sucursales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <MuiProvider>
          <ToastProvider>
            <LoadingProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </LoadingProvider>
          </ToastProvider>
        </MuiProvider>
      </body>
    </html>
  );
}


