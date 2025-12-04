// ===== BRANCH IMAGE SERVICE =====

import { apiClient, API_CONFIG } from "../config";
import {
    BranchImageResponse,
    BranchImageRequest,
    BranchImageUpdateRequest,
} from "../types";

const ENDPOINTS = API_CONFIG.ENDPOINTS.BRANCHES;

export const branchImageService = {
    /**
     * Listar imágenes de una sucursal
     */
    list: async (branchId: string): Promise<BranchImageResponse[]> => {
        return apiClient.get<BranchImageResponse[]>(ENDPOINTS.IMAGES(branchId));
    },

    /**
     * Obtener imagen por ID
     */
    getById: async (branchId: string, imageId: string): Promise<BranchImageResponse> => {
        return apiClient.get<BranchImageResponse>(ENDPOINTS.IMAGE_BY_ID(branchId, imageId));
    },

    /**
     * Crear imagen de sucursal
     */
    create: async (
        branchId: string,
        data: BranchImageRequest
    ): Promise<BranchImageResponse> => {
        return apiClient.post<BranchImageResponse>(ENDPOINTS.IMAGES(branchId), data);
    },

    /**
     * Actualizar imagen de sucursal
     */
    update: async (
        branchId: string,
        imageId: string,
        data: BranchImageUpdateRequest
    ): Promise<BranchImageResponse> => {
        return apiClient.put<BranchImageResponse>(
            ENDPOINTS.IMAGE_BY_ID(branchId, imageId),
            data
        );
    },

    /**
     * Eliminar imagen de sucursal
     */
    delete: async (branchId: string, imageId: string): Promise<void> => {
        await apiClient.delete<void>(ENDPOINTS.IMAGE_BY_ID(branchId, imageId));
    },

    /**
     * Establecer imagen como portada
     */
    setCover: async (branchId: string, imageId: string): Promise<BranchImageResponse> => {
        return apiClient.post<BranchImageResponse>(
            ENDPOINTS.IMAGE_SET_COVER(branchId, imageId),
            {}
        );
    },

    /**
     * Subir imagen (multipart/form-data)
     */
    upload: async (
        branchId: string,
        file: File,
        options?: { title?: string; altText?: string; cover?: boolean }
    ): Promise<BranchImageResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        if (options?.title) formData.append("title", options.title);
        if (options?.altText) formData.append("altText", options.altText);
        if (options?.cover !== undefined) formData.append("cover", String(options.cover));

        const response = await fetch(
            `${API_CONFIG.BASE_URL}${ENDPOINTS.IMAGES(branchId)}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Error al subir imagen");
        }

        return response.json();
    },
};

export default branchImageService;
