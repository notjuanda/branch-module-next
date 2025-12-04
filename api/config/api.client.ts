// ===== API CLIENT CON INTERCEPTORES =====

import { API_CONFIG } from "./api.config";
import {
    ApiException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    NetworkException,
} from "./api.errors";

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

// ===== TOKEN STORAGE =====
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
    getAccessToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    getRefreshToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens: (accessToken: string, refreshToken: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    clearTokens: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    hasTokens: (): boolean => {
        return !!tokenStorage.getAccessToken();
    },
};

// ===== REFRESH TOKEN LOGIC =====
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            }
        );

        if (!response.ok) {
            tokenStorage.clearTokens();
            return null;
        }

        const data = await response.json();
        tokenStorage.setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    } catch {
        tokenStorage.clearTokens();
        return null;
    }
};

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
        timeout = API_CONFIG.TIMEOUT,
        skipAuth = false,
    } = config;

    // Construir URL con query params
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
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

    // Headers base
    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    // Agregar token si existe y no se salta auth
    if (!skipAuth) {
        const token = tokenStorage.getAccessToken();
        if (token) {
            requestHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    // Controller para timeout
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

        // Manejar 401 - Intentar refresh
        if (response.status === 401 && !skipAuth) {
            if (!isRefreshing) {
                isRefreshing = true;
                const newToken = await refreshAccessToken();
                isRefreshing = false;

                if (newToken) {
                    onTokenRefreshed(newToken);
                    // Reintentar request con nuevo token
                    requestHeaders["Authorization"] = `Bearer ${newToken}`;
                    const retryResponse = await fetch(url, {
                        method,
                        headers: requestHeaders,
                        body: body ? JSON.stringify(body) : undefined,
                    });

                    if (!retryResponse.ok) {
                        const errorData = await retryResponse.json().catch(() => null);
                        throw ApiException.fromResponse(
                            retryResponse.status,
                            errorData,
                            endpoint
                        );
                    }

                    if (retryResponse.status === 204) {
                        return undefined as T;
                    }

                    return retryResponse.json();
                } else {
                    // No se pudo refrescar, limpiar y lanzar error
                    tokenStorage.clearTokens();
                    throw new UnauthorizedException("Sesión expirada", endpoint);
                }
            } else {
                // Ya hay un refresh en progreso, esperar
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(async (token) => {
                        try {
                            requestHeaders["Authorization"] = `Bearer ${token}`;
                            const retryResponse = await fetch(url, {
                                method,
                                headers: requestHeaders,
                                body: body ? JSON.stringify(body) : undefined,
                            });

                            if (!retryResponse.ok) {
                                const errorData = await retryResponse.json().catch(() => null);
                                reject(
                                    ApiException.fromResponse(
                                        retryResponse.status,
                                        errorData,
                                        endpoint
                                    )
                                );
                                return;
                            }

                            if (retryResponse.status === 204) {
                                resolve(undefined as T);
                                return;
                            }

                            resolve(retryResponse.json());
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
            }
        }

        // Manejar otros errores
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            switch (response.status) {
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
export const apiClient = {
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

export default apiClient;
