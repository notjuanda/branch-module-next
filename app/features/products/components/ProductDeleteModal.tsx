"use client";

import { ConfirmDeleteModal, useToast } from "@/components/ui";
import { ProductResponse } from "@/api/types";
import { inventoryService } from "@/api/services";

interface ProductDeleteModalProps {
    open: boolean;
    onClose: () => void;
    product: ProductResponse | null;
    branchId: string;
    onSuccess?: () => void;
}

export default function ProductDeleteModal({
    open,
    onClose,
    product,
    branchId,
    onSuccess,
}: ProductDeleteModalProps) {
    const { showSuccess, showError } = useToast();

    const handleConfirm = async () => {
        if (!product || !branchId) return;

        try {
            await inventoryService.deleteProduct(branchId, product.id);
            showSuccess("Producto eliminado correctamente");
            onSuccess?.();
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            showError("Error al eliminar el producto");
            throw error; // Re-throw para que ConfirmDeleteModal maneje el estado
        }
    };

    return (
        <ConfirmDeleteModal
            open={open}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Eliminar Producto"
            itemName={product?.name}
            confirmText="Eliminar Producto"
            cancelText="Cancelar"
        />
    );
}
