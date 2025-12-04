"use client";

import { ComponentType } from "react";

// Importar las pages de las features
import { LoginPage } from "@/app/features/auth/pages";
import { BranchesPage } from "@/app/features/branches/pages";
import { EmployeesPage } from "@/app/features/employees/pages";
import { ProductsPage } from "@/app/features/products/pages"

// ===== TYPES =====
export interface RouteConfig {
    path: string;
    component: ComponentType;
    isProtected: boolean;
    title: string;
}

// ===== PATHS =====
export const PATHS = {
    LOGIN: "/login",
    BRANCHES: "/branches",
    EMPLOYEES: "/employees",
    PRODUCTS: "/products",
} as const;

// ===== ROUTES CONFIGURATION =====
export const ROUTES: RouteConfig[] = [
    {
        path: PATHS.LOGIN,
        component: LoginPage,
        isProtected: false,
        title: "Iniciar Sesión",
    },
    {
        path: PATHS.BRANCHES,
        component: BranchesPage,
        isProtected: true,
        title: "Sucursales",
    },
    {
        path: PATHS.EMPLOYEES,
        component: EmployeesPage,
        isProtected: true,
        title: "Empleados",
    },
    {
        path: PATHS.PRODUCTS,
        component: ProductsPage,
        isProtected: true,
        title: "Productos",
    },
];

// ===== HELPER FUNCTIONS =====
export function getRoute(pathname: string): RouteConfig | undefined {
    // Primero buscar coincidencia exacta
    const exactMatch = ROUTES.find((route) => route.path === pathname);
    if (exactMatch) return exactMatch;

    // Buscar coincidencia por prefijo (para rutas dinámicas)
    const prefixMatch = ROUTES.find((route) =>
        pathname.startsWith(route.path + "/")
    );
    return prefixMatch;
}

export function isProtectedPath(pathname: string): boolean {
    const route = getRoute(pathname);
    return route?.isProtected ?? false;
}

// ===== DEFAULT ROUTES =====
export const DEFAULT_ROUTE = PATHS.BRANCHES;
export const LOGIN_ROUTE = PATHS.LOGIN;
