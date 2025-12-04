"use client";

import { useState, useCallback } from "react";
import { BranchResponse } from "@/api/types";

export function useBranchDetail() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);

    const openDetail = useCallback((branch: BranchResponse) => {
        setSelectedBranch(branch);
        setIsOpen(true);
    }, []);

    const closeDetail = useCallback(() => {
        setIsOpen(false);
        // Delay para permitir la animación de cierre
        setTimeout(() => setSelectedBranch(null), 300);
    }, []);

    return {
        isOpen,
        selectedBranch,
        openDetail,
        closeDetail,
    };
}
