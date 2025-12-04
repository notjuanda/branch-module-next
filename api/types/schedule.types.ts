// ===== SCHEDULE TYPES =====

// Response
export interface ScheduleResponse {
    id: string;
    branchId: string;
    dayOfWeek: number; // 0-6 (Domingo-Sábado)
    closed: boolean;
    open: string | null; // HH:mm:ss
    close: string | null; // HH:mm:ss
}

// Request
export interface ScheduleRequest {
    dayOfWeek: number;
    closed: boolean;
    open?: string;
    close?: string;
}

// Request - Actualizar
export interface ScheduleUpdateRequest {
    closed?: boolean;
    open?: string;
    close?: string;
}

// Request - Semana completa
export interface ScheduleWeekRequest {
    schedules: ScheduleRequest[];
}

// Response - Semana completa
export interface ScheduleWeekResponse {
    schedules: ScheduleResponse[];
}
