// ===== REPORT SERVICE =====

import type {
    StockByBranchResponse,
    InventoryCountResponse,
    MovementReportResponse,
    MovementType,
} from "@/api/types";

const INVENTORY_API_URL = process.env.NEXT_PUBLIC_API_URL_2 || "http://localhost:8081";

async function reportRequest<T>(
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

    return response.json();
}

export const reportService = {
    // ===== STOCK POR SUCURSAL =====
    
    /**
     * Obtener stock de una sucursal específica
     */
    async getStockByBranch(branchId: string): Promise<StockByBranchResponse[]> {
        return reportRequest<StockByBranchResponse[]>(`/api/reports/stock/branch/${branchId}`);
    },

    /**
     * Obtener stock de todas las sucursales
     */
    async getAllStockByBranches(): Promise<StockByBranchResponse[]> {
        return reportRequest<StockByBranchResponse[]>("/api/reports/stock/all-branches");
    },

    // ===== CONTEO DE INVENTARIO =====

    /**
     * Obtener conteo de inventario de una sucursal
     */
    async getInventoryCount(branchId: string): Promise<InventoryCountResponse> {
        return reportRequest<InventoryCountResponse>(`/api/reports/inventory-count/branch/${branchId}`);
    },

    /**
     * Obtener conteo de inventario de todas las sucursales
     */
    async getAllInventoryCounts(): Promise<InventoryCountResponse[]> {
        return reportRequest<InventoryCountResponse[]>("/api/reports/inventory-count/all-branches");
    },

    // ===== MOVIMIENTOS =====

    /**
     * Obtener movimientos de una sucursal en un rango de fechas
     */
    async getMovementsByBranch(
        branchId: string,
        from: string,
        to: string
    ): Promise<MovementReportResponse[]> {
        const params = new URLSearchParams({ from, to });
        return reportRequest<MovementReportResponse[]>(
            `/api/reports/movements/branch/${branchId}?${params}`
        );
    },

    /**
     * Obtener movimientos por tipo
     */
    async getMovementsByType(
        branchId: string,
        type: MovementType,
        from: string,
        to: string
    ): Promise<MovementReportResponse[]> {
        const params = new URLSearchParams({ from, to });
        return reportRequest<MovementReportResponse[]>(
            `/api/reports/movements/branch/${branchId}/type/${type}?${params}`
        );
    },

    /**
     * Obtener movimientos de un producto
     */
    async getMovementsByProduct(
        productId: string,
        from: string,
        to: string
    ): Promise<MovementReportResponse[]> {
        const params = new URLSearchParams({ from, to });
        return reportRequest<MovementReportResponse[]>(
            `/api/reports/movements/product/${productId}?${params}`
        );
    },
};

export default reportService;
