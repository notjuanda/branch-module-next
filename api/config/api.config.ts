// ===== API CONFIGURATION =====

export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    TIMEOUT: 0, // 0 => sin timeout del lado del cliente; dejar que el servidor responda cuando termine
    ENDPOINTS: {
        // Auth
        AUTH: {
            LOGIN: "/api/auth/login",
            REFRESH: "/api/auth/refresh",
            ME: "/api/auth/me",
            CHANGE_PASSWORD: "/api/auth/change-password",
        },
        // Branches
        BRANCHES: {
            BASE: "/api/branches",
            BY_ID: (id: string) => `/api/branches/${id}`,
            BY_SLUG: (slug: string) => `/api/branches/slug/${slug}`,
            STATUS: (id: string) => `/api/branches/${id}/status`,
            // Phones
            PHONES: (branchId: string) => `/api/branches/${branchId}/phones`,
            PHONE_BY_ID: (branchId: string, phoneId: string) =>
                `/api/branches/${branchId}/phones/${phoneId}`,
            // Schedules
            SCHEDULES: (branchId: string) => `/api/branches/${branchId}/schedules`,
            SCHEDULE_BY_DAY: (branchId: string, dayOfWeek: number) =>
                `/api/branches/${branchId}/schedules/${dayOfWeek}`,
            // PUT /api/branches/{branchId}/schedules -> upsert schedule
            SCHEDULE_UPSERT: (branchId: string) => `/api/branches/${branchId}/schedules`,
            // Images
            IMAGES: (branchId: string) => `/api/branches/${branchId}/images`,
            IMAGE_BY_ID: (branchId: string, imageId: string) =>
                `/api/branches/${branchId}/images/${imageId}`,
            IMAGE_SET_COVER: (branchId: string, imageId: string) =>
                `/api/branches/${branchId}/images/${imageId}/cover`,
            // Active assignments in branch
            ACTIVE_ASSIGNMENTS: (branchId: string) =>
                `/api/branches/${branchId}/assignments/active`,
        },
        // Employees
        EMPLOYEES: {
            BASE: "/api/employees",
            BY_ID: (id: string) => `/api/employees/${id}`,
            STATUS: (id: string) => `/api/employees/${id}/status`,
            // Phones
            PHONES: (employeeId: string) => `/api/employees/${employeeId}/phones`,
            PHONE_BY_ID: (employeeId: string, phoneId: string) =>
                `/api/employees/${employeeId}/phones/${phoneId}`,
        },
        // Assignments - Branch
        BRANCH_ASSIGNMENTS: {
            // Asignar empleado a sucursal
            ASSIGN: (employeeId: string, branchId: string) =>
                `/api/employees/${employeeId}/assignments/branch/${branchId}`,
            // Reasignar empleado a otra sucursal
            REASSIGN: (employeeId: string, toBranchId: string) =>
                `/api/employees/${employeeId}/assignments/branch/${toBranchId}/reassign`,
            // Cerrar asignación
            CLOSE: (assignmentId: string) =>
                `/api/assignments/branch/${assignmentId}/close`,
            // Actualizar asignación
            UPDATE: (assignmentId: string) =>
                `/api/assignments/branch/${assignmentId}`,
            // Obtener asignación activa del empleado
            ACTIVE_BY_EMPLOYEE: (employeeId: string) =>
                `/api/employees/${employeeId}/assignments/branch/active`,
            // Historial de asignaciones del empleado
            HISTORY_BY_EMPLOYEE: (employeeId: string) =>
                `/api/employees/${employeeId}/assignments/branch/history`,
        },
        // Assignments - Corporate Phone
        CORP_PHONE_ASSIGNMENTS: {
            // Asignar teléfono corporativo a empleado
            ASSIGN: (employeeId: string, branchPhoneId: string) =>
                `/api/employees/${employeeId}/assignments/corporate-phones/${branchPhoneId}`,
            // Cerrar asignación
            CLOSE: (corpAssignId: string) =>
                `/api/assignments/corporate-phones/${corpAssignId}/close`,
            // Obtener asignación activa del empleado
            ACTIVE_BY_EMPLOYEE: (employeeId: string) =>
                `/api/employees/${employeeId}/assignments/corporate-phones/active`,
            // Obtener asignación activa por teléfono
            ACTIVE_BY_PHONE: (branchPhoneId: string) =>
                `/api/phones/${branchPhoneId}/assignment/active`,
        },
    },
} as const;

