// ===== ASSIGNMENT SERVICE =====

import { apiClient, API_CONFIG } from "../config";
import {
    BranchAssignmentResponse,
    AssignBranchRequest,
    CloseAssignmentRequest,
    CorpPhoneAssignmentResponse,
    AssignCorpPhoneRequest,
} from "../types";

const BRANCH_ENDPOINTS = API_CONFIG.ENDPOINTS.BRANCH_ASSIGNMENTS;
const CORP_PHONE_ENDPOINTS = API_CONFIG.ENDPOINTS.CORP_PHONE_ASSIGNMENTS;
const BRANCHES_ENDPOINTS = API_CONFIG.ENDPOINTS.BRANCHES;

export const assignmentService = {
    // ===== BRANCH ASSIGNMENTS =====

    /**
     * Asignar empleado a sucursal
     */
    assignToBranch: async (
        employeeId: string,
        branchId: string,
        data?: AssignBranchRequest
    ): Promise<BranchAssignmentResponse> => {
        return apiClient.post<BranchAssignmentResponse>(
            BRANCH_ENDPOINTS.ASSIGN(employeeId, branchId),
            data
        );
    },

    /**
     * Reasignar empleado a otra sucursal (cierra la anterior automáticamente)
     */
    reassignToBranch: async (
        employeeId: string,
        toBranchId: string,
        data?: AssignBranchRequest
    ): Promise<BranchAssignmentResponse> => {
        return apiClient.post<BranchAssignmentResponse>(
            BRANCH_ENDPOINTS.REASSIGN(employeeId, toBranchId),
            data
        );
    },

    /**
     * Cerrar asignación de empleado a sucursal
     */
    closeBranchAssignment: async (
        assignmentId: string,
        data?: CloseAssignmentRequest
    ): Promise<BranchAssignmentResponse> => {
        return apiClient.patch<BranchAssignmentResponse>(
            BRANCH_ENDPOINTS.CLOSE(assignmentId),
            data
        );
    },

    /**
     * Actualizar asignación (posición, notas, fechas)
     */
    updateBranchAssignment: async (
        assignmentId: string,
        data: AssignBranchRequest
    ): Promise<BranchAssignmentResponse> => {
        return apiClient.put<BranchAssignmentResponse>(
            BRANCH_ENDPOINTS.UPDATE(assignmentId),
            data
        );
    },

    /**
     * Obtener asignación activa del empleado
     */
    getActiveByEmployee: async (
        employeeId: string
    ): Promise<BranchAssignmentResponse | null> => {
        try {
            return await apiClient.get<BranchAssignmentResponse>(
                BRANCH_ENDPOINTS.ACTIVE_BY_EMPLOYEE(employeeId)
            );
        } catch {
            // 204 No Content = no tiene asignación activa
            return null;
        }
    },

    /**
     * Listar asignaciones activas en una sucursal
     */
    listActiveByBranch: async (
        branchId: string
    ): Promise<BranchAssignmentResponse[]> => {
        return apiClient.get<BranchAssignmentResponse[]>(
            BRANCHES_ENDPOINTS.ACTIVE_ASSIGNMENTS(branchId)
        );
    },

    /**
     * Obtener historial de asignaciones del empleado
     */
    getHistoryByEmployee: async (
        employeeId: string
    ): Promise<BranchAssignmentResponse[]> => {
        return apiClient.get<BranchAssignmentResponse[]>(
            BRANCH_ENDPOINTS.HISTORY_BY_EMPLOYEE(employeeId)
        );
    },

    // ===== CORPORATE PHONE ASSIGNMENTS =====

    /**
     * Asignar teléfono corporativo a empleado
     */
    assignCorpPhone: async (
        employeeId: string,
        branchPhoneId: string,
        data?: AssignCorpPhoneRequest
    ): Promise<CorpPhoneAssignmentResponse> => {
        return apiClient.post<CorpPhoneAssignmentResponse>(
            CORP_PHONE_ENDPOINTS.ASSIGN(employeeId, branchPhoneId),
            data
        );
    },

    /**
     * Cerrar asignación de teléfono corporativo
     */
    closeCorpPhoneAssignment: async (
        corpAssignId: string,
        data?: CloseAssignmentRequest
    ): Promise<CorpPhoneAssignmentResponse> => {
        return apiClient.patch<CorpPhoneAssignmentResponse>(
            CORP_PHONE_ENDPOINTS.CLOSE(corpAssignId),
            data
        );
    },

    /**
     * Obtener asignación activa de teléfono del empleado
     */
    getActiveCorpPhoneByEmployee: async (
        employeeId: string
    ): Promise<CorpPhoneAssignmentResponse> => {
        return apiClient.get<CorpPhoneAssignmentResponse>(
            CORP_PHONE_ENDPOINTS.ACTIVE_BY_EMPLOYEE(employeeId)
        );
    },

    /**
     * Obtener asignación activa por teléfono
     */
    getActiveByPhone: async (
        branchPhoneId: string
    ): Promise<CorpPhoneAssignmentResponse | null> => {
        try {
            return await apiClient.get<CorpPhoneAssignmentResponse>(
                CORP_PHONE_ENDPOINTS.ACTIVE_BY_PHONE(branchPhoneId)
            );
        } catch {
            // 204 No Content = no tiene asignación activa
            return null;
        }
    },
};

export default assignmentService;
