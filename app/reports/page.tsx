"use client";

import { ReportsPage } from "@/app/features/reports";
import { ProtectedRoute } from "@/app/features/auth";

export default function ReportsRoute() {
    return (
        <ProtectedRoute>
            <ReportsPage />
        </ProtectedRoute>
    );
}
