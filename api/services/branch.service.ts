// ===== BRANCH SERVICE =====

import { apiClient, API_CONFIG } from "../config";
import {
    BranchResponse,
    BranchRequest,
    BranchUpdateRequest,
    BranchStatusUpdateRequest,
} from "../types";

const ENDPOINTS = API_CONFIG.ENDPOINTS.BRANCHES;

export const branchService = {
    /**
     * Listar todas las sucursales
     */
    list: async (): Promise<BranchResponse[]> => {
        return apiClient.get<BranchResponse[]>(ENDPOINTS.BASE);
    },

    /**
     * Obtener sucursal por ID
     */
    getById: async (id: string): Promise<BranchResponse> => {
        return apiClient.get<BranchResponse>(ENDPOINTS.BY_ID(id));
    },

    /**
     * Obtener sucursal por slug
     */
    getBySlug: async (slug: string): Promise<BranchResponse> => {
        return apiClient.get<BranchResponse>(ENDPOINTS.BY_SLUG(slug));
    },

    /**
     * Crear sucursal
     */
    create: async (data: BranchRequest): Promise<BranchResponse> => {
        return apiClient.post<BranchResponse>(ENDPOINTS.BASE, data);
    },

    /**
     * Actualizar sucursal
     */
    update: async (id: string, data: BranchUpdateRequest): Promise<BranchResponse> => {
        return apiClient.put<BranchResponse>(ENDPOINTS.BY_ID(id), data);
    },

    /**
     * Actualizar estado de sucursal
     */
    updateStatus: async (
        id: string,
        data: BranchStatusUpdateRequest
    ): Promise<BranchResponse> => {
        return apiClient.patch<BranchResponse>(ENDPOINTS.STATUS(id), data);
    },

    /**
     * Eliminar sucursal
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete<void>(ENDPOINTS.BY_ID(id));
    },
};

export default branchService;
