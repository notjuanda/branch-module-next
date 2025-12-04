"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { chatbotAuthService } from "@/api/services";
import { chatbotTokenStorage } from "@/api/config";
import {
    ChatbotLoginRequest,
    ChatbotRegisterRequest,
    ChatbotAuthResponse,
} from "@/api/types";

interface ChatbotUser {
    userId: number;
    email: string;
    name: string;
}

interface ChatbotAuthContextType {
    user: ChatbotUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: ChatbotLoginRequest) => Promise<ChatbotAuthResponse>;
    register: (data: ChatbotRegisterRequest) => Promise<ChatbotAuthResponse>;
    logout: () => void;
}

const ChatbotAuthContext = createContext<ChatbotAuthContextType | undefined>(undefined);

interface ChatbotAuthProviderProps {
    children: ReactNode;
}

// Función para decodificar JWT y extraer datos del usuario
function decodeToken(token: string): ChatbotUser | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        const payload = JSON.parse(jsonPayload);
        return {
            userId: payload.uid,
            email: payload.email,
            name: payload.name,
        };
    } catch {
        return null;
    }
}

export function ChatbotAuthProvider({ children }: ChatbotAuthProviderProps) {
    const [user, setUser] = useState<ChatbotUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar token existente al cargar
    const checkAuth = useCallback(() => {
        try {
            const token = chatbotTokenStorage.getAccessToken();
            if (token) {
                const userData = decodeToken(token);
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch {
            chatbotTokenStorage.clearTokens();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials: ChatbotLoginRequest): Promise<ChatbotAuthResponse> => {
        const response = await chatbotAuthService.login(credentials);
        setUser({
            userId: response.userId,
            email: response.email,
            name: response.name,
        });
        return response;
    };

    const register = async (data: ChatbotRegisterRequest): Promise<ChatbotAuthResponse> => {
        const response = await chatbotAuthService.register(data);
        setUser({
            userId: response.userId,
            email: response.email,
            name: response.name,
        });
        return response;
    };

    const logout = () => {
        chatbotAuthService.logout();
        setUser(null);
    };

    const value: ChatbotAuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <ChatbotAuthContext.Provider value={value}>
            {children}
        </ChatbotAuthContext.Provider>
    );
}

export function useChatbotAuth() {
    const context = useContext(ChatbotAuthContext);
    if (context === undefined) {
        throw new Error("useChatbotAuth must be used within a ChatbotAuthProvider");
    }
    return context;
}
