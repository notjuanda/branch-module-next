// ===== EMPLOYEE SERVICE =====

import { apiClient, API_CONFIG } from "../config";
import {
    EmployeeResponse,
    EmployeeRequest,
    EmployeeUpdateRequest,
    EmployeeStatusUpdateRequest,
    EmployeePhoneResponse,
    EmployeePhoneRequest,
    EmployeePhoneUpdateRequest,
} from "../types";

const ENDPOINTS = API_CONFIG.ENDPOINTS.EMPLOYEES;

export const employeeService = {
    /**
     * Listar todos los empleados
     */
    list: async (): Promise<EmployeeResponse[]> => {
        return apiClient.get<EmployeeResponse[]>(ENDPOINTS.BASE);
    },

    /**
     * Obtener empleado por ID
     */
    getById: async (id: string): Promise<EmployeeResponse> => {
        return apiClient.get<EmployeeResponse>(ENDPOINTS.BY_ID(id));
    },

    /**
     * Crear empleado
     */
    create: async (data: EmployeeRequest): Promise<EmployeeResponse> => {
        return apiClient.post<EmployeeResponse>(ENDPOINTS.BASE, data);
    },

    /**
     * Actualizar empleado
     */
    update: async (id: string, data: EmployeeUpdateRequest): Promise<EmployeeResponse> => {
        return apiClient.put<EmployeeResponse>(ENDPOINTS.BY_ID(id), data);
    },

    /**
     * Actualizar estado del empleado
     */
    updateStatus: async (
        id: string,
        data: EmployeeStatusUpdateRequest
    ): Promise<EmployeeResponse> => {
        return apiClient.patch<EmployeeResponse>(ENDPOINTS.STATUS(id), data);
    },

    /**
     * Eliminar empleado
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete<void>(ENDPOINTS.BY_ID(id));
    },

    // ===== PHONES =====

    /**
     * Listar teléfonos del empleado
     */
    listPhones: async (employeeId: string): Promise<EmployeePhoneResponse[]> => {
        return apiClient.get<EmployeePhoneResponse[]>(ENDPOINTS.PHONES(employeeId));
    },

    /**
     * Crear teléfono de empleado
     */
    createPhone: async (
        employeeId: string,
        data: EmployeePhoneRequest
    ): Promise<EmployeePhoneResponse> => {
        return apiClient.post<EmployeePhoneResponse>(
            ENDPOINTS.PHONES(employeeId),
            data
        );
    },

    /**
     * Actualizar teléfono de empleado
     */
    updatePhone: async (
        employeeId: string,
        phoneId: string,
        data: EmployeePhoneUpdateRequest
    ): Promise<EmployeePhoneResponse> => {
        return apiClient.put<EmployeePhoneResponse>(
            ENDPOINTS.PHONE_BY_ID(employeeId, phoneId),
            data
        );
    },

    /**
     * Eliminar teléfono de empleado
     */
    deletePhone: async (employeeId: string, phoneId: string): Promise<void> => {
        await apiClient.delete<void>(ENDPOINTS.PHONE_BY_ID(employeeId, phoneId));
    },
};

export default employeeService;
