// ===== CHATBOT AUTH SERVICE =====

import { chatbotApiClient, CHATBOT_ENDPOINTS } from "../config/chatbot.client";
import { chatbotTokenStorage } from "../config/chatbot.client";
import {
    ChatbotLoginRequest,
    ChatbotRegisterRequest,
    ChatbotAuthResponse,
} from "../types/chatbot.types";

const ENDPOINTS = CHATBOT_ENDPOINTS.AUTH;

export const chatbotAuthService = {
    /**
     * Iniciar sesión en el chatbot
     */
    login: async (credentials: ChatbotLoginRequest): Promise<ChatbotAuthResponse> => {
        const response = await chatbotApiClient.post<ChatbotAuthResponse>(
            ENDPOINTS.LOGIN,
            credentials,
            { skipAuth: true }
        );
        // Guardar token del chatbot
        chatbotTokenStorage.setAccessToken(response.accessToken);
        return response;
    },

    /**
     * Registrar nuevo usuario en el chatbot
     */
    register: async (data: ChatbotRegisterRequest): Promise<ChatbotAuthResponse> => {
        const response = await chatbotApiClient.post<ChatbotAuthResponse>(
            ENDPOINTS.REGISTER,
            data,
            { skipAuth: true }
        );
        // Guardar token del chatbot
        chatbotTokenStorage.setAccessToken(response.accessToken);
        return response;
    },

    /**
     * Cerrar sesión del chatbot
     */
    logout: (): void => {
        chatbotTokenStorage.clearTokens();
    },

    /**
     * Verificar si hay sesión activa
     */
    isAuthenticated: (): boolean => {
        return chatbotTokenStorage.hasToken();
    },

    /**
     * Obtener el token actual
     */
    getToken: (): string | null => {
        return chatbotTokenStorage.getAccessToken();
    },
};

export default chatbotAuthService;
