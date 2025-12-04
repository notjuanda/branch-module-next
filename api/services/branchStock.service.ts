// ===== BRANCH STOCK SERVICE =====

import type {
    BranchStockRequest,
    BranchStockUpdateRequest,
    BranchStockTransferRequest,
    BranchStockResponse,
} from "@/api/types";

const INVENTORY_API_URL = process.env.NEXT_PUBLIC_API_URL_2 || "http://localhost:8081";

async function branchStockRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${INVENTORY_API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
    }

    // Manejar respuestas sin contenido (204 o body vacío)
    const contentLength = response.headers.get("content-length");
    if (response.status === 204 || contentLength === "0") {
        return undefined as T;
    }

    // Intentar parsear JSON, si falla retornar undefined
    const text = await response.text();
    if (!text) {
        return undefined as T;
    }

    return JSON.parse(text);
}

export const branchStockService = {
    /**
     * Listar todo el stock (todas las asignaciones)
     */
    async listAll(): Promise<BranchStockResponse[]> {
        return branchStockRequest<BranchStockResponse[]>("/api/branch-stock");
    },

    /**
     * Crear asignación de stock en sucursal
     */
    async create(data: BranchStockRequest): Promise<BranchStockResponse> {
        return branchStockRequest<BranchStockResponse>("/api/branch-stock", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Obtener stock por ID
     */
    async getById(stockId: string): Promise<BranchStockResponse> {
        return branchStockRequest<BranchStockResponse>(`/api/branch-stock/${stockId}`);
    },

    /**
     * Listar stock por sucursal
     */
    async listByBranch(branchId: string): Promise<BranchStockResponse[]> {
        return branchStockRequest<BranchStockResponse[]>(`/api/branch-stock/branch/${branchId}`);
    },

    /**
     * Listar stock por producto (en qué sucursales está)
     */
    async listByProduct(productId: string): Promise<BranchStockResponse[]> {
        return branchStockRequest<BranchStockResponse[]>(`/api/branch-stock/product/${productId}`);
    },

    /**
     * Listar stock por lote
     */
    async listByBatch(batchId: string): Promise<BranchStockResponse[]> {
        return branchStockRequest<BranchStockResponse[]>(`/api/branch-stock/batch/${batchId}`);
    },

    /**
     * Listar todos los productos con stock bajo
     */
    async listLowStock(): Promise<BranchStockResponse[]> {
        return branchStockRequest<BranchStockResponse[]>("/api/branch-stock/low-stock");
    },

    /**
     * Listar productos con stock bajo en una sucursal
     */
    async listLowStockByBranch(branchId: string): Promise<BranchStockResponse[]> {
        return branchStockRequest<BranchStockResponse[]>(`/api/branch-stock/low-stock/branch/${branchId}`);
    },

    /**
     * Actualizar stock
     */
    async update(stockId: string, data: BranchStockUpdateRequest): Promise<BranchStockResponse> {
        return branchStockRequest<BranchStockResponse>(`/api/branch-stock/${stockId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /**
     * Eliminar asignación de stock
     */
    async delete(stockId: string): Promise<void> {
        return branchStockRequest<void>(`/api/branch-stock/${stockId}`, {
            method: "DELETE",
        });
    },

    /**
     * Transferir stock entre sucursales
     */
    async transfer(data: BranchStockTransferRequest): Promise<BranchStockResponse> {
        return branchStockRequest<BranchStockResponse>("/api/branch-stock/transfer", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};
