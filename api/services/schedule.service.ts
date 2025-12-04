// ===== SCHEDULE SERVICE =====

import { apiClient, API_CONFIG } from "../config";
import {
    ScheduleResponse,
    ScheduleRequest,
    ScheduleUpdateRequest,
} from "../types";

const ENDPOINTS = API_CONFIG.ENDPOINTS.BRANCHES;

export const scheduleService = {
    /**
     * Obtener horarios de toda la semana
     */
    getWeek: async (branchId: string): Promise<ScheduleResponse[]> => {
        return apiClient.get<ScheduleResponse[]>(ENDPOINTS.SCHEDULES(branchId));
    },

    /**
     * Obtener horario de un día específico
     */
    getDay: async (branchId: string, dayOfWeek: number): Promise<ScheduleResponse> => {
        return apiClient.get<ScheduleResponse>(ENDPOINTS.SCHEDULE_BY_DAY(branchId, dayOfWeek));
    },

    /**
     * Upsert horario (crea si no existe, actualiza si existe)
     */
    upsert: async (
        branchId: string,
        data: ScheduleRequest
    ): Promise<ScheduleResponse> => {
        return apiClient.put<ScheduleResponse>(ENDPOINTS.SCHEDULE_UPSERT(branchId), data);
    },

    /**
     * Actualizar horario de un día (PATCH)
     */
    update: async (
        branchId: string,
        dayOfWeek: number,
        data: ScheduleUpdateRequest
    ): Promise<ScheduleResponse> => {
        return apiClient.patch<ScheduleResponse>(
            ENDPOINTS.SCHEDULE_BY_DAY(branchId, dayOfWeek),
            data
        );
    },

    /**
     * Eliminar horario de un día
     */
    deleteDay: async (branchId: string, dayOfWeek: number): Promise<void> => {
        await apiClient.delete<void>(ENDPOINTS.SCHEDULE_BY_DAY(branchId, dayOfWeek));
    },
};

export default scheduleService;
