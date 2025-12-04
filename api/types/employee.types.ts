// ===== EMPLOYEE TYPES =====

import { EmployeeStatus } from "./common.types";

// Response
export interface EmployeeResponse {
    id: string;
    firstName: string;
    lastName: string;
    docType: string | null;
    docNumber: string | null;
    personalEmail: string | null;
    institutionalEmail: string | null;
    status: EmployeeStatus;
    hireDate: string | null;
    terminationDate: string | null;
}

// Request - Crear
export interface EmployeeRequest {
    firstName: string;
    lastName: string;
    docType?: string;
    docNumber?: string;
    personalEmail?: string;
    hireDate?: string;
}

// Request - Actualizar
export interface EmployeeUpdateRequest {
    firstName?: string;
    lastName?: string;
    docType?: string;
    docNumber?: string;
    personalEmail?: string;
    hireDate?: string;
    terminationDate?: string;
}

// Request - Cambiar estado
export interface EmployeeStatusUpdateRequest {
    status: EmployeeStatus;
}

// ===== EMPLOYEE PHONE TYPES =====

// Response
export interface EmployeePhoneResponse {
    id: string;
    employeeId: string;
    number: string;
    label: string | null;
    whatsapp: boolean;
    primary: boolean;
}

// Request
export interface EmployeePhoneRequest {
    number: string;
    label?: string;
    whatsapp: boolean;
    primary: boolean;
}

// Request - Actualizar
export interface EmployeePhoneUpdateRequest {
    number?: string;
    label?: string;
    whatsapp?: boolean;
    primary?: boolean;
}
