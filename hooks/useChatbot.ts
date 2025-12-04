// ===== USE CHATBOT HOOK =====

import { useState, useCallback } from "react";
import { chatbotService } from "@/api/services";
import {
    ChatMessage,
    ChatSession,
    ChatMessageResponse,
    ChatbotModel,
    SendMessageRequest,
} from "@/api/types";

interface UseChatbotReturn {
    // Estado
    messages: ChatMessage[];
    sessions: ChatSession[];
    isLoading: boolean;
    isSending: boolean;
    error: string | null;
    
    // Acciones
    sendMessage: (sessionKey: string, messageText: string) => Promise<ChatMessageResponse | null>;
    loadHistory: (sessionKey: string) => Promise<void>;
    tryLoadHistory: (sessionKey: string) => Promise<boolean>;
    loadSessions: () => Promise<void>;
    changeModel: (sessionKey: string, newModel: ChatbotModel) => Promise<void>;
    deleteSessions: () => Promise<void>;
    clearError: () => void;
    clearMessages: () => void;
}

export function useChatbot(): UseChatbotReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper para parsear errores del chatbot
    const parseError = (err: unknown): string => {
        if (err instanceof Error) {
            const message = err.message.toLowerCase();
            if (message.includes("429") || message.includes("resource exhausted") || message.includes("too many requests")) {
                return "El servicio está ocupado. Por favor, espera unos segundos e intenta de nuevo.";
            }
            if (message.includes("timeout") || message.includes("tiempo")) {
                return "La respuesta tardó demasiado. Intenta de nuevo.";
            }
            if (message.includes("network") || message.includes("conexión")) {
                return "Error de conexión. Verifica tu internet.";
            }
            return err.message;
        }
        return "Error desconocido";
    };

    const sendMessage = useCallback(async (
        sessionKey: string,
        messageText: string
    ): Promise<ChatMessageResponse | null> => {
        setIsSending(true);
        setError(null);

        try {
            const request: SendMessageRequest = { sessionKey, messageText };
            const response = await chatbotService.sendMessage(request);
            
            // Recargar historial después de enviar
            const updatedHistory = await chatbotService.getHistory(sessionKey);
            setMessages(updatedHistory);
            
            return response;
        } catch (err) {
            setError(parseError(err));
            return null;
        } finally {
            setIsSending(false);
        }
    }, []);

    const loadHistory = useCallback(async (sessionKey: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const history = await chatbotService.getHistory(sessionKey);
            setMessages(history);
        } catch (err) {
            setError(parseError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Intenta cargar historial silenciosamente (sin mostrar error si no existe sesión)
    // Retorna true si encontró sesión con mensajes, false si no
    const tryLoadHistory = useCallback(async (sessionKey: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const history = await chatbotService.getHistory(sessionKey);
            setMessages(history);
            return history.length > 0;
        } catch {
            // Sesión no existe, simplemente ignorar
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadSessions = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const userSessions = await chatbotService.getSessions();
            setSessions(userSessions);
        } catch (err) {
            setError(parseError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const changeModel = useCallback(async (
        sessionKey: string,
        newModel: ChatbotModel
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            await chatbotService.changeModel({ sessionKey, newModel });
            // Recargar sesiones para reflejar el cambio
            await loadSessions();
        } catch (err) {
            setError(parseError(err));
        } finally {
            setIsLoading(false);
        }
    }, [loadSessions]);

    const deleteSessions = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            await chatbotService.deleteSessions();
            setSessions([]);
            setMessages([]);
        } catch (err) {
            setError(parseError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        sessions,
        isLoading,
        isSending,
        error,
        sendMessage,
        loadHistory,
        tryLoadHistory,
        loadSessions,
        changeModel,
        deleteSessions,
        clearError,
        clearMessages,
    };
}

export default useChatbot;
