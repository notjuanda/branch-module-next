// ===== API ERROR CLASSES =====

import { ApiError } from "../types";

// Error base de la API
export class ApiException extends Error {
    public readonly status: number;
    public readonly error: string;
    public readonly path: string;
    public readonly timestamp: string;

    constructor(apiError: ApiError) {
        super(apiError.message);
        this.name = "ApiException";
        this.status = apiError.status;
        this.error = apiError.error;
        this.path = apiError.path;
        this.timestamp = apiError.timestamp;
    }

    static fromResponse(status: number, data: unknown, path: string): ApiException {
        if (isApiError(data)) {
            return new ApiException(data);
        }

        return new ApiException({
            timestamp: new Date().toISOString(),
            status,
            error: getErrorName(status),
            message: getDefaultMessage(status),
            path,
        });
    }
}

// Errores específicos
export class UnauthorizedException extends ApiException {
    constructor(message = "No autorizado", path = "") {
        super({
            timestamp: new Date().toISOString(),
            status: 401,
            error: "Unauthorized",
            message,
            path,
        });
        this.name = "UnauthorizedException";
    }
}

export class ForbiddenException extends ApiException {
    constructor(message = "Acceso denegado", path = "") {
        super({
            timestamp: new Date().toISOString(),
            status: 403,
            error: "Forbidden",
            message,
            path,
        });
        this.name = "ForbiddenException";
    }
}

export class NotFoundException extends ApiException {
    constructor(message = "Recurso no encontrado", path = "") {
        super({
            timestamp: new Date().toISOString(),
            status: 404,
            error: "Not Found",
            message,
            path,
        });
        this.name = "NotFoundException";
    }
}

export class ValidationException extends ApiException {
    constructor(message = "Error de validación", path = "") {
        super({
            timestamp: new Date().toISOString(),
            status: 400,
            error: "Bad Request",
            message,
            path,
        });
        this.name = "ValidationException";
    }
}

export class ServerException extends ApiException {
    constructor(message = "Error interno del servidor", path = "") {
        super({
            timestamp: new Date().toISOString(),
            status: 500,
            error: "Internal Server Error",
            message,
            path,
        });
        this.name = "ServerException";
    }
}

export class NetworkException extends Error {
    constructor(message = "Error de conexión") {
        super(message);
        this.name = "NetworkException";
    }
}

// ===== HELPERS =====

function isApiError(data: unknown): data is ApiError {
    return (
        typeof data === "object" &&
        data !== null &&
        "status" in data &&
        "message" in data
    );
}

function getErrorName(status: number): string {
    const names: Record<number, string> = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Unprocessable Entity",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
    };
    return names[status] || "Error";
}

function getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
        400: "Solicitud inválida",
        401: "No autorizado",
        403: "Acceso denegado",
        404: "Recurso no encontrado",
        409: "Conflicto con el estado actual",
        422: "Error de validación",
        500: "Error interno del servidor",
        502: "Error de gateway",
        503: "Servicio no disponible",
    };
    return messages[status] || "Error desconocido";
}
