// Tipos para Stock en Sucursales (BranchStock)

export interface BranchStockRequest {
    branchId: string;
    productId: string;
    batchId: string;
    quantity: number;
    minimumStock?: number;
}

export interface BranchStockUpdateRequest {
    quantity?: number;
    minimumStock?: number;
}

export interface BranchStockTransferRequest {
    sourceStockId: string;
    targetBranchId: string;
    quantity: number;
}

export interface BranchStockResponse {
    id: string;
    branchId: string;
    branchName: string;
    branchSlug?: string;  // Agregado por el agregador
    productId: string;
    productName: string;
    productBrand: string;
    batchId: string;
    batchNumber: string;
    quantity: number;
    minimumStock: number;
    lowStock: boolean;
    createdAt: string;
    updatedAt: string;
    containerPort?: number;  // Puerto del contenedor de inventario (agregado por el agregador)
}
