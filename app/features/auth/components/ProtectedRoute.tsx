"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components";
import { Spinner } from "@/components/ui";
import { useAuth } from "../context";
import { useNavigate } from "@/hooks";
import { LOGIN_ROUTE } from "@/router/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { navigate } = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(LOGIN_ROUTE, "Redirigiendo al login...");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <Spinner fullScreen message="Verificando sesión..." />;
  }

  if (!user) {
    return null;
  }

  return <Sidebar>{children}</Sidebar>;
}
