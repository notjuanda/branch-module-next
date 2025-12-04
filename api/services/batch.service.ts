import type {
    BatchRequest,
    BatchUpdateRequest,
    BatchNotificationRequest,
    BatchResponse,
    ExpiringBatchNotification,
} from "@/api/types";

const INVENTORY_API_URL = process.env.NEXT_PUBLIC_API_URL_2 || "http://localhost:8081";

async function batchRequest<T>(
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

export const batchService = {
    // Listar todos los lotes
    async list(): Promise<BatchResponse[]> {
        return batchRequest<BatchResponse[]>("/api/batches");
    },

    // Obtener lote por ID
    async getById(batchId: string): Promise<BatchResponse> {
        return batchRequest<BatchResponse>(`/api/batches/${batchId}`);
    },

    // Listar lotes por producto
    async listByProduct(productId: string): Promise<BatchResponse[]> {
        return batchRequest<BatchResponse[]>(`/api/batches/product/${productId}`);
    },

    // Listar lotes próximos a vencer
    async listExpiringSoon(): Promise<BatchResponse[]> {
        return batchRequest<BatchResponse[]>("/api/batches/expiring-soon");
    },

    // Listar lotes vencidos
    async listExpired(): Promise<BatchResponse[]> {
        return batchRequest<BatchResponse[]>("/api/batches/expired");
    },

    // Obtener notificaciones de lotes por vencer
    async getExpiringNotifications(): Promise<ExpiringBatchNotification[]> {
        return batchRequest<ExpiringBatchNotification[]>("/api/batches/notifications");
    },

    // Crear lote
    async create(data: BatchRequest): Promise<BatchResponse> {
        return batchRequest<BatchResponse>("/api/batches", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    // Actualizar lote
    async update(batchId: string, data: BatchUpdateRequest): Promise<BatchResponse> {
        return batchRequest<BatchResponse>(`/api/batches/${batchId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    // Activar/desactivar notificación
    async toggleNotification(
        batchId: string,
        data: BatchNotificationRequest
    ): Promise<BatchResponse> {
        return batchRequest<BatchResponse>(`/api/batches/${batchId}/notification`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    // Desactivar lotes vencidos
    async deactivateExpiredBatches(): Promise<void> {
        return batchRequest<void>("/api/batches/deactivate-expired", {
            method: "POST",
        });
    },

    // Eliminar lote
    async delete(batchId: string): Promise<void> {
        return batchRequest<void>(`/api/batches/${batchId}`, {
            method: "DELETE",
        });
    },
};
