// ===== BRANCH IMAGE TYPES =====

// Response
export interface BranchImageResponse {
    id: string;
    branchId: string;
    url: string;
    title: string | null;
    altText: string | null;
    cover: boolean;
}

// Request
export interface BranchImageRequest {
    url: string;
    title?: string;
    altText?: string;
    cover?: boolean;
}

// Request - Actualizar
export interface BranchImageUpdateRequest {
    url?: string;
    title?: string;
    altText?: string;
    cover?: boolean;
}
