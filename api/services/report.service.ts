// ===== REPORT SERVICE =====
// Este servicio maneja reportes a través del proxy de sucursales
// Frontend -> nginx -> branch-module -> inventory-container

import { apiClient } from "@/api/config";

import type {
    StockByBranchResponse,
    InventoryCountResponse,
    MovementReportResponse,
    MovementType,
} from "@/api/types";

// Endpoints para reports (requieren branchId para saber a qué contenedor ir)
const getReportEndpoints = (branchId: string) => ({
    STOCK_BY_BRANCH: `/api/branches/${branchId}/inventory/reports/stock/branch/${branchId}`,
    STOCK_ALL_BRANCHES: `/api/branches/${branchId}/inventory/reports/stock/all-branches`,
    INVENTORY_COUNT: `/api/branches/${branchId}/inventory/reports/inventory-count/branch/${branchId}`,
    INVENTORY_COUNT_ALL: `/api/branches/${branchId}/inventory/reports/inventory-count/all-branches`,
    MOVEMENTS: `/api/branches/${branchId}/inventory/reports/movements/branch/${branchId}`,
    MOVEMENTS_BY_TYPE: (type: MovementType) => `/api/branches/${branchId}/inventory/reports/movements/branch/${branchId}/type/${type}`,
    MOVEMENTS_BY_PRODUCT: (productId: string) => `/api/branches/${branchId}/inventory/reports/movements/product/${productId}`,
});

export const reportService = {
    /**
     * Obtener stock de una sucursal específica
     */
    async getStockByBranch(branchId: string): Promise<StockByBranchResponse[]> {
        const endpoints = getReportEndpoints(branchId);
        return apiClient.get<StockByBranchResponse[]>(endpoints.STOCK_BY_BRANCH);
    },

    /**
     * Obtener stock de todas las sucursales
     */
    async getAllStockByBranches(branchId: string): Promise<StockByBranchResponse[]> {
        const endpoints = getReportEndpoints(branchId);
        return apiClient.get<StockByBranchResponse[]>(endpoints.STOCK_ALL_BRANCHES);
    },

    /**
     * Obtener conteo de inventario de una sucursal
     */
    async getInventoryCount(branchId: string): Promise<InventoryCountResponse> {
        const endpoints = getReportEndpoints(branchId);
        return apiClient.get<InventoryCountResponse>(endpoints.INVENTORY_COUNT);
    },

    /**
     * Obtener conteo de inventario de todas las sucursales
     */
    async getAllInventoryCounts(branchId: string): Promise<InventoryCountResponse[]> {
        const endpoints = getReportEndpoints(branchId);
        return apiClient.get<InventoryCountResponse[]>(endpoints.INVENTORY_COUNT_ALL);
    },

    /**
     * Obtener movimientos de una sucursal en un rango de fechas
     */
    async getMovementsByBranch(branchId: string, from: string, to: string): Promise<MovementReportResponse[]> {
        const endpoints = getReportEndpoints(branchId);
        return apiClient.get<MovementReportResponse[]>(endpoints.MOVEMENTS, {
            params: { from, to },
        });
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
        const endpoints = getReportEndpoints(branchId);
        return apiClient.get<MovementReportResponse[]>(endpoints.MOVEMENTS_BY_TYPE(type), {
            params: { from, to },
        });
    },

    /**
     * Obtener movimientos de un producto
     */
    async getMovementsByProduct(
        branchId: string,
        productId: string,
        from: string,
        to: string
    ): Promise<MovementReportResponse[]> {
        const endpoints = getReportEndpoints(branchId);
        return apiClient.get<MovementReportResponse[]>(endpoints.MOVEMENTS_BY_PRODUCT(productId), {
            params: { from, to },
        });
    },
};

export default reportService;
