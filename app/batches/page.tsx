"use client";

import { BatchesPage } from "@/app/features/batches";
import { ProtectedRoute } from "@/app/features/auth";

export default function BatchesRoute() {
    return (
        <ProtectedRoute>
            <BatchesPage />
        </ProtectedRoute>
    );
}