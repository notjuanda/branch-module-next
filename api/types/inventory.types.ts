// ===== INVENTORY TYPES =====

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    branchId: string;
}

export interface InventoryRequest {
    name: string;
    quantity: number;
    branchId: string;
}

export interface InventoryResponse {
    id: string;
    name: string;
    quantity: number;
    branchId: string;
    createdAt: string;
    updatedAt: string;
}

// ===== PRODUCT TYPES =====

export interface ProductRequest {
    name: string;
    description?: string;
    sku: string;
    brand: string;
    category?: string;
    unitPrice: number;
    unit: string;
}

export interface ProductResponse {
    id: string;
    name: string;
    description?: string;
    sku: string;
    brand: string;
    category?: string;
    unitPrice: number;
    unit: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductStatusUpdate {
    active: boolean;
}
