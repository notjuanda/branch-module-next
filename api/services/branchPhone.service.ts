// ===== BRANCH PHONE SERVICE =====

import { apiClient, API_CONFIG } from "../config";
import {
    BranchPhoneResponse,
    BranchPhoneRequest,
    BranchPhoneUpdateRequest,
} from "../types";

const ENDPOINTS = API_CONFIG.ENDPOINTS.BRANCHES;

export const branchPhoneService = {
    /**
     * Listar teléfonos de una sucursal
     */
    list: async (branchId: string): Promise<BranchPhoneResponse[]> => {
        return apiClient.get<BranchPhoneResponse[]>(ENDPOINTS.PHONES(branchId));
    },

    /**
     * Obtener teléfono por ID
     */
    getById: async (branchId: string, phoneId: string): Promise<BranchPhoneResponse> => {
        return apiClient.get<BranchPhoneResponse>(ENDPOINTS.PHONE_BY_ID(branchId, phoneId));
    },

    /**
     * Crear teléfono de sucursal
     */
    create: async (
        branchId: string,
        data: BranchPhoneRequest
    ): Promise<BranchPhoneResponse> => {
        return apiClient.post<BranchPhoneResponse>(ENDPOINTS.PHONES(branchId), data);
    },

    /**
     * Actualizar teléfono de sucursal
     */
    update: async (
        branchId: string,
        phoneId: string,
        data: BranchPhoneUpdateRequest
    ): Promise<BranchPhoneResponse> => {
        return apiClient.put<BranchPhoneResponse>(
            ENDPOINTS.PHONE_BY_ID(branchId, phoneId),
            data
        );
    },

    /**
     * Eliminar teléfono de sucursal
     */
    delete: async (branchId: string, phoneId: string): Promise<void> => {
        await apiClient.delete<void>(ENDPOINTS.PHONE_BY_ID(branchId, phoneId));
    },
};

export default branchPhoneService;
