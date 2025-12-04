// ===== BRANCH PHONE TYPES =====

import { PhoneKind, PhoneState } from "./common.types";

// Response
export interface BranchPhoneResponse {
    id: string;
    branchId: string;
    number: string;
    kind: PhoneKind;
    state: PhoneState;
    label: string | null;
    whatsapp: boolean;
    publish: boolean;
    priority: number;
}

// Request
export interface BranchPhoneRequest {
    number: string;
    kind: PhoneKind;
    state?: PhoneState;
    label?: string;
    whatsapp: boolean;
    publish: boolean;
    priority?: number;
}

// Request - Actualizar
export interface BranchPhoneUpdateRequest {
    number?: string;
    kind?: PhoneKind;
    state?: PhoneState;
    label?: string;
    whatsapp?: boolean;
    publish?: boolean;
    priority?: number;
}
