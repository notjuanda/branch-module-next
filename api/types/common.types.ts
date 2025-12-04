// ===== TIPOS BASE Y ENUMS =====

// Enums
export type EmployeeStatus = "ACTIVE" | "INACTIVE";
export type PhoneKind = "PUBLIC" | "CORPORATE";
export type PhoneState = "AVAILABLE" | "ASSIGNED" | "INACTIVE";

// Error Response del backend
export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}

// Respuesta genérica
export interface ApiResponse<T> {
    data: T;
    status: number;
}
