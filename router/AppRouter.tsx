"use client";

import { usePathname } from "next/navigation";
import { getRoute } from "./routes";
import { ProtectedRoute } from "@/app/features/auth";

export function AppRouter() {
  const pathname = usePathname();
  const route = getRoute(pathname);

  if (!route) {
    return <div>404 - Página no encontrada</div>;
  }

  const Component = route.component;

  if (route.isProtected) {
    return (
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
    );
  }

  return <Component />;
}
