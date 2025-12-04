// ===== BRANCH TYPES =====

// Response
export interface BranchResponse {
    id: string;
    name: string;
    slug: string;
    address: string;
    primaryPhone: string | null;
    lat: number;
    lng: number;
    active: boolean;
    coverImageUrl: string | null;
}

// Request - Crear
export interface BranchRequest {
    name: string;
    slug: string;
    address: string;
    primaryPhone?: string;
    lat: number;
    lng: number;
}

// Request - Actualizar
export interface BranchUpdateRequest {
    name?: string;
    slug?: string;
    address?: string;
    primaryPhone?: string;
    lat?: number;
    lng?: number;
}

// Request - Cambiar estado
export interface BranchStatusUpdateRequest {
    active: boolean;
}
