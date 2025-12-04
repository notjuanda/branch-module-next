"use client";

import { useState, useEffect, useCallback } from "react";
import { BranchResponse } from "@/api/types";
import { branchService } from "@/api/services";

interface UseBranchesReturn {
    branches: BranchResponse[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useBranches(): UseBranchesReturn {
    const [branches, setBranches] = useState<BranchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBranches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await branchService.list();
            setBranches(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar sucursales");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    return {
        branches,
        loading,
        error,
        refetch: fetchBranches,
    };
}
