// ===== CHATBOT TYPES =====

// ===== ENUMS =====
export enum ChatbotModel {
    INTERNAL_AI = "INTERNAL_AI",
    N8N = "N8N",
    UNKNOWN = "UNKNOWN",
}

export enum MessageRole {
    USER = "USER",
    ASSISTANT = "ASSISTANT",
    SYSTEM = "SYSTEM",
}

// ===== VALUE OBJECTS =====
export interface MessageId {
    value: number;
}

export interface SessionId {
    value: number;
}

// ===== DOMAIN MODELS =====
export interface ChatMessage {
    id: MessageId;
    sessionId: SessionId;
    role: MessageRole;
    messageText: string;
    rawJson: string | null;
    modelUsed: ChatbotModel | null;
    createdAt: string; // ISO date string
}

export interface ChatSession {
    id: SessionId;
    userId: number;
    sessionKey: string;
    activeModel: ChatbotModel;
    createdAt: string; // ISO date string
}

// ===== REQUEST DTOs =====
export interface SendMessageRequest {
    sessionKey: string;
    messageText: string;
}

export interface ChangeModelRequest {
    sessionKey: string;
    newModel: ChatbotModel;
}

// ===== RESPONSE DTOs =====
export interface ChatMessageResponse {
    responseText: string;
    modelUsed: ChatbotModel;
    createdAt: string; // ISO date string
}

// ===== AUTH (Chatbot Service) =====
export interface ChatbotLoginRequest {
    email: string;
    password: string;
}

export interface ChatbotRegisterRequest {
    email: string;
    name: string;
    password: string;
}

export interface ChatbotAuthResponse {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    userId: number;
    email: string;
    name: string;
}
