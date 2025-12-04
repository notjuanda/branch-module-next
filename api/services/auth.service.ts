// ===== AUTH SERVICE =====

import { apiClient, API_CONFIG, tokenStorage } from "../config";
import {
    LoginRequest,
    RefreshRequest,
    ChangePasswordRequest,
    AuthResponse,
    UserMeResponse,
} from "../types";

const ENDPOINTS = API_CONFIG.ENDPOINTS.AUTH;

export const authService = {
    /**
     * Iniciar sesión
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            ENDPOINTS.LOGIN,
            credentials,
            { skipAuth: true }
        );
        // Guardar tokens
        tokenStorage.setTokens(response.accessToken, response.refreshToken);
        return response;
    },

    /**
     * Refrescar token
     */
    refresh: async (request: RefreshRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            ENDPOINTS.REFRESH,
            request,
            { skipAuth: true }
        );
        tokenStorage.setTokens(response.accessToken, response.refreshToken);
        return response;
    },

    /**
     * Obtener usuario actual
     */
    me: async (): Promise<UserMeResponse> => {
        return apiClient.get<UserMeResponse>(ENDPOINTS.ME);
    },

    /**
     * Cambiar contraseña
     */
    changePassword: async (request: ChangePasswordRequest): Promise<void> => {
        await apiClient.post<void>(ENDPOINTS.CHANGE_PASSWORD, request);
    },

    /**
     * Cerrar sesión
     */
    logout: (): void => {
        tokenStorage.clearTokens();
    },

    /**
     * Verificar si hay sesión activa
     */
    isAuthenticated: (): boolean => {
        return tokenStorage.hasTokens();
    },
};

export default authService;
