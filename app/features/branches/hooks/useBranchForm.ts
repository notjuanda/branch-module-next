import { useState, useCallback } from "react";
import { BranchResponse } from "@/api/types";

interface UseBranchFormResult {
    isOpen: boolean;
    branchToEdit: BranchResponse | null;
    openCreate: () => void;
    openEdit: (branch: BranchResponse) => void;
    close: () => void;
}

export function useBranchForm(): UseBranchFormResult {
    const [isOpen, setIsOpen] = useState(false);
    const [branchToEdit, setBranchToEdit] = useState<BranchResponse | null>(null);

    const openCreate = useCallback(() => {
        setBranchToEdit(null);
        setIsOpen(true);
    }, []);

    const openEdit = useCallback((branch: BranchResponse) => {
        setBranchToEdit(branch);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        // Pequeño delay para limpiar el branch después de cerrar la animación
        setTimeout(() => setBranchToEdit(null), 200);
    }, []);

    return {
        isOpen,
        branchToEdit,
        openCreate,
        openEdit,
        close,
    };
}
