// ===== ASSIGNMENT TYPES =====

// ===== Branch Assignment =====

// Response
export interface BranchAssignmentResponse {
    id: string;
    employeeId: string;
    branchId: string;
    startDate: string;
    endDate: string | null;
    position: string | null;
    notes: string | null;
    active: boolean;
}

// Request - Asignar/Reasignar/Actualizar
export interface AssignBranchRequest {
    startDate?: string | null;
    position?: string | null;
    notes?: string | null;
}

// Request - Cerrar asignación
export interface CloseAssignmentRequest {
    endDate?: string | null;
}

// ===== Corporate Phone Assignment =====

// Response
export interface CorpPhoneAssignmentResponse {
    id: string;
    employeeId: string;
    branchId: string;
    branchPhoneId: string;
    startDate: string;
    endDate: string | null;
    active: boolean;
}

// Request - Asignar teléfono corporativo
export interface AssignCorpPhoneRequest {
    startDate?: string | null;
}

