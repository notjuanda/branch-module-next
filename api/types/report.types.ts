// ===== REPORT TYPES =====

// Stock por sucursal
export interface StockByBranchResponse {
    branchId: string;
    branchName: string;
    productId: string;
    productName: string;
    productBrand: string;
    productSku: string;
    totalQuantity: number;
    activeBatches: number;
}

// Conteo de inventario
export interface InventoryCountResponse {
    branchId: string;
    branchName: string;
    totalProducts: number;
    totalBatches: number;
    totalQuantity: number;
    lowStockItems: number;
    expiringBatches: number;
    expiredBatches: number;
}

// Tipo de movimiento
export type MovementType = "ENTRY" | "EXIT" | "TRANSFER" | "ADJUSTMENT" | "EXPIRED_WRITE_OFF";

// Reporte de movimientos
export interface MovementReportResponse {
    movementId: string;
    productId: string;
    productName: string;
    productBrand: string;
    batchId: string;
    batchNumber: string;
    sourceBranchId: string | null;
    sourceBranchName: string | null;
    destinationBranchId: string | null;
    destinationBranchName: string | null;
    quantity: number;
    movementType: MovementType;
    reason: string | null;
    performedBy: string | null;
    createdAt: string;
}
