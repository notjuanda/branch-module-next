// Tipos para Lotes (Batches)

export interface BatchRequest {
    productId: string;
    batchNumber: string;
    quantity: number;
    expirationDate: string; // LocalDate como string "YYYY-MM-DD"
    warningDaysBeforeExpiration?: number;
}

export interface BatchUpdateRequest {
    batchNumber?: string;
    quantity?: number;
    expirationDate?: string;
    warningDaysBeforeExpiration?: number;
}

export interface BatchNotificationRequest {
    notificationEnabled: boolean;
}

export interface BatchResponse {
    id: string;
    productId: string;
    productName: string;
    productBrand: string;
    batchNumber: string;
    quantity: number;
    expirationDate: string;
    warningDaysBeforeExpiration: number;
    notificationEnabled: boolean;
    expired: boolean;
    expiringSoon: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExpiringBatchNotification {
    batchId: string;
    batchNumber: string;
    productId: string;
    productName: string;
    productBrand: string;
    expirationDate: string;
    daysUntilExpiration: number;
    quantity: number;
    notificationEnabled: boolean;
}
