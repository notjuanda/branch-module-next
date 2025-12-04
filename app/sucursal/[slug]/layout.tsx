import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sucursal",
  description: "Información de la sucursal",
};

export default function BranchLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No necesita AuthProvider - es ruta pública
  return <>{children}</>;
}
