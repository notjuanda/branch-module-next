// ===== CHATBOT API CLIENT =====
// Cliente API separado para el servicio de chatbot (puerto 8082)

import {
    ApiException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    NetworkException,
} from "./api.errors";

// ===== CONFIGURACIÓN =====
const CHATBOT_BASE_URL = process.env.NEXT_PUBLIC_API_URL_3 || "http://localhost:8082";
const TIMEOUT = 60000; // 60 segundos para el chatbot (las respuestas pueden tardar)

// ===== TIPOS =====
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined>;
    timeout?: number;
    skipAuth?: boolean;
}

// ===== TOKEN STORAGE PARA CHATBOT (separado del principal) =====
const CHATBOT_TOKEN_KEY = "chatbot_access_token";

export const chatbotTokenStorage = {
    getAccessToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(CHATBOT_TOKEN_KEY);
    },

    setAccessToken: (accessToken: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(CHATBOT_TOKEN_KEY, accessToken);
    },

    clearTokens: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(CHATBOT_TOKEN_KEY);
    },

    hasToken: (): boolean => {
        return !!chatbotTokenStorage.getAccessToken();
    },
};

// ===== ENDPOINTS =====
export const CHATBOT_ENDPOINTS = {
    // Auth (el chatbot tiene su propio auth)
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
    },
    // Chatbot
    CHATBOT: {
        SEND: "/api/chatbot/send",
        HISTORY: (sessionKey: string) => `/api/chatbot/history/${sessionKey}`,
        CHANGE_MODEL: "/api/chatbot/change-model",
        SESSIONS: "/api/chatbot/sessions",
    },
} as const;

// ===== API CLIENT =====
async function request<T>(
    endpoint: string,
    config: RequestConfig = {}
): Promise<T> {
    const {
        method = "GET",
        body,
        headers = {},
        params,
        timeout = TIMEOUT,
        skipAuth = false,
    } = config;

    // Construir URL con parámetros
    let url = `${CHATBOT_BASE_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    // Headers
    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    // Agregar token si no se salta auth
    if (!skipAuth) {
        const token = chatbotTokenStorage.getAccessToken();
        if (token) {
            requestHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    // Configurar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Manejar errores
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            switch (response.status) {
                case 401:
                    throw new UnauthorizedException(
                        errorData?.message || "No autorizado",
                        endpoint
                    );
                case 403:
                    throw new ForbiddenException(
                        errorData?.message || "Acceso denegado",
                        endpoint
                    );
                case 404:
                    throw new NotFoundException(
                        errorData?.message || "No encontrado",
                        endpoint
                    );
                default:
                    throw ApiException.fromResponse(response.status, errorData, endpoint);
            }
        }

        // Respuesta exitosa
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiException) {
            throw error;
        }

        if (error instanceof Error) {
            if (error.name === "AbortError") {
                throw new NetworkException("Tiempo de espera agotado");
            }
            throw new NetworkException(error.message);
        }

        throw new NetworkException("Error de conexión desconocido");
    }
}

// ===== MÉTODOS HTTP =====
export const chatbotApiClient = {
    get: <T>(endpoint: string, config?: Omit<RequestConfig, "method" | "body">) =>
        request<T>(endpoint, { ...config, method: "GET" }),

    post: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, "method">) =>
        request<T>(endpoint, { ...config, method: "POST", body }),

    put: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, "method">) =>
        request<T>(endpoint, { ...config, method: "PUT", body }),

    patch: <T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, "method">) =>
        request<T>(endpoint, { ...config, method: "PATCH", body }),

    delete: <T>(endpoint: string, config?: Omit<RequestConfig, "method" | "body">) =>
        request<T>(endpoint, { ...config, method: "DELETE" }),
};

export default chatbotApiClient;
