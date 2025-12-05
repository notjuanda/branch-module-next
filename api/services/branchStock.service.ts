// ===== BRANCH STOCK SERVICE =====
// Este servicio maneja stock de sucursales a través del proxy
// Frontend -> nginx -> branch-module -> inventory-container

import { apiClient } from "@/api/config";

import type {
    BranchStockRequest,
    BranchStockUpdateRequest,
    BranchStockTransferRequest,
    BranchStockResponse,
} from "@/api/types";

// Endpoints para branch-stock (requieren branchId para saber a qué contenedor ir)
const getBranchStockEndpoints = (branchId: string) => ({
    BRANCH_STOCK: `/api/branches/${branchId}/inventory/branch-stock`,
    STOCK_BY_ID: (stockId: string) => `/api/branches/${branchId}/inventory/branch-stock/${stockId}`,
    STOCK_BY_PRODUCT: (productId: string) => `/api/branches/${branchId}/inventory/branch-stock/product/${productId}`,
    STOCK_BY_BATCH: (batchId: string) => `/api/branches/${branchId}/inventory/branch-stock/batch/${batchId}`,
    LOW_STOCK: `/api/branches/${branchId}/inventory/branch-stock/low-stock`,
    TRANSFER: (stockId: string) => `/api/branches/${branchId}/inventory/branch-stock/${stockId}/transfer`,
});

export const branchStockService = {
    /**
     * Listar stock de una sucursal específica
     */
    async listByBranch(branchId: string): Promise<BranchStockResponse[]> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.get<BranchStockResponse[]>(endpoints.BRANCH_STOCK);
    },

    /**
     * Listar stock por producto en una sucursal
     */
    async listByProduct(branchId: string, productId: string): Promise<BranchStockResponse[]> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.get<BranchStockResponse[]>(endpoints.STOCK_BY_PRODUCT(productId));
    },

    /**
     * Listar stock por lote en una sucursal
     */
    async listByBatch(branchId: string, batchId: string): Promise<BranchStockResponse[]> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.get<BranchStockResponse[]>(endpoints.STOCK_BY_BATCH(batchId));
    },

    /**
     * Listar todos los productos con stock bajo en una sucursal
     */
    async listLowStock(branchId: string): Promise<BranchStockResponse[]> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.get<BranchStockResponse[]>(endpoints.LOW_STOCK);
    },

    /**
     * Obtener stock por ID
     */
    async getById(branchId: string, stockId: string): Promise<BranchStockResponse> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.get<BranchStockResponse>(endpoints.STOCK_BY_ID(stockId));
    },

    /**
     * Crear asignación de stock en sucursal
     */
    async create(branchId: string, data: BranchStockRequest): Promise<BranchStockResponse> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.post<BranchStockResponse>(endpoints.BRANCH_STOCK, data);
    },

    /**
     * Actualizar stock
     */
    async update(branchId: string, stockId: string, data: BranchStockUpdateRequest): Promise<BranchStockResponse> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.put<BranchStockResponse>(endpoints.STOCK_BY_ID(stockId), data);
    },

    /**
     * Eliminar asignación de stock
     */
    async delete(branchId: string, stockId: string): Promise<void> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.delete<void>(endpoints.STOCK_BY_ID(stockId));
    },

    /**
     * Transferir stock entre sucursales
     */
    async transfer(branchId: string, stockId: string, data: BranchStockTransferRequest): Promise<BranchStockResponse> {
        const endpoints = getBranchStockEndpoints(branchId);
        return apiClient.post<BranchStockResponse>(endpoints.TRANSFER(stockId), data);
    },
};
