// ===== BATCH SERVICE =====
// Este servicio maneja lotes a través del proxy de sucursales
// Frontend -> nginx -> branch-module -> inventory-container

import type {
    BatchRequest,
    BatchUpdateRequest,
    BatchNotificationRequest,
    BatchResponse,
    ExpiringBatchNotification,
} from "@/api/types";
import { apiClient } from "@/api/config";

// Endpoints para batches (requieren branchId para saber a qué contenedor ir)
const getBatchEndpoints = (branchId: string) => ({
    BATCHES: `/api/branches/${branchId}/inventory/batches`,
    BATCH_BY_ID: (batchId: string) => `/api/branches/${branchId}/inventory/batches/${batchId}`,
    BATCHES_BY_PRODUCT: (productId: string) => `/api/branches/${branchId}/inventory/batches/product/${productId}`,
    EXPIRING_SOON: `/api/branches/${branchId}/inventory/batches/expiring-soon`,
    EXPIRED: `/api/branches/${branchId}/inventory/batches/expired`,
    NOTIFICATIONS: `/api/branches/${branchId}/inventory/batches/notifications`,
    BATCH_NOTIFICATION: (batchId: string) => `/api/branches/${branchId}/inventory/batches/${batchId}/notification`,
    DEACTIVATE_EXPIRED: `/api/branches/${branchId}/inventory/batches/deactivate-expired`,
});

export const batchService = {
    // Listar todos los lotes
    async list(branchId: string): Promise<BatchResponse[]> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.get<BatchResponse[]>(endpoints.BATCHES);
    },

    // Obtener lote por ID
    async getById(branchId: string, batchId: string): Promise<BatchResponse> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.get<BatchResponse>(endpoints.BATCH_BY_ID(batchId));
    },

    // Listar lotes por producto
    async listByProduct(branchId: string, productId: string): Promise<BatchResponse[]> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.get<BatchResponse[]>(endpoints.BATCHES_BY_PRODUCT(productId));
    },

    // Listar lotes próximos a vencer
    async listExpiringSoon(branchId: string): Promise<BatchResponse[]> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.get<BatchResponse[]>(endpoints.EXPIRING_SOON);
    },

    // Listar lotes vencidos
    async listExpired(branchId: string): Promise<BatchResponse[]> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.get<BatchResponse[]>(endpoints.EXPIRED);
    },

    // Obtener notificaciones de lotes por vencer
    async getExpiringNotifications(branchId: string): Promise<ExpiringBatchNotification[]> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.get<ExpiringBatchNotification[]>(endpoints.NOTIFICATIONS);
    },

    // Crear lote
    async create(branchId: string, data: BatchRequest): Promise<BatchResponse> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.post<BatchResponse>(endpoints.BATCHES, data);
    },

    // Actualizar lote
    async update(branchId: string, batchId: string, data: BatchUpdateRequest): Promise<BatchResponse> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.put<BatchResponse>(endpoints.BATCH_BY_ID(batchId), data);
    },

    // Activar/desactivar notificación
    async toggleNotification(branchId: string, batchId: string, data: BatchNotificationRequest): Promise<BatchResponse> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.patch<BatchResponse>(endpoints.BATCH_NOTIFICATION(batchId), data);
    },

    // Desactivar lotes vencidos
    async deactivateExpiredBatches(branchId: string): Promise<void> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.post<void>(endpoints.DEACTIVATE_EXPIRED);
    },

    // Eliminar lote
    async delete(branchId: string, batchId: string): Promise<void> {
        const endpoints = getBatchEndpoints(branchId);
        return apiClient.delete<void>(endpoints.BATCH_BY_ID(batchId));
    },
};
