// ===== CHATBOT SERVICE =====

import { chatbotApiClient, CHATBOT_ENDPOINTS } from "../config/chatbot.client";
import {
    SendMessageRequest,
    ChangeModelRequest,
    ChatMessageResponse,
    ChatMessage,
    ChatSession,
} from "../types/chatbot.types";

const ENDPOINTS = CHATBOT_ENDPOINTS.CHATBOT;

export const chatbotService = {
    /**
     * Enviar un mensaje al chatbot
     * Requiere autenticación JWT
     */
    sendMessage: async (request: SendMessageRequest): Promise<ChatMessageResponse> => {
        return chatbotApiClient.post<ChatMessageResponse>(ENDPOINTS.SEND, request);
    },

    /**
     * Obtener el historial de mensajes de una sesión
     * Requiere autenticación JWT
     */
    getHistory: async (sessionKey: string): Promise<ChatMessage[]> => {
        return chatbotApiClient.get<ChatMessage[]>(ENDPOINTS.HISTORY(sessionKey));
    },

    /**
     * Cambiar el modelo de chatbot para una sesión
     * Requiere autenticación JWT
     */
    changeModel: async (request: ChangeModelRequest): Promise<void> => {
        return chatbotApiClient.post<void>(ENDPOINTS.CHANGE_MODEL, request);
    },

    /**
     * Obtener todas las sesiones del usuario autenticado
     * Requiere autenticación JWT
     */
    getSessions: async (): Promise<ChatSession[]> => {
        return chatbotApiClient.get<ChatSession[]>(ENDPOINTS.SESSIONS);
    },

    /**
     * Eliminar todas las sesiones del usuario autenticado
     * Requiere autenticación JWT
     */
    deleteSessions: async (): Promise<void> => {
        return chatbotApiClient.delete<void>(ENDPOINTS.SESSIONS);
    },
};

export default chatbotService;
