// ===== API TYPES - EXPORTS =====

// Common
export type {
    EmployeeStatus,
    PhoneKind,
    PhoneState,
    ApiError,
    ApiResponse,
} from "./common.types";

// Auth
export type {
    LoginRequest,
    RefreshRequest,
    ChangePasswordRequest,
    AuthResponse,
    UserMeResponse,
} from "./auth.types";

// Branch
export type {
    BranchResponse,
    BranchRequest,
    BranchUpdateRequest,
    BranchStatusUpdateRequest,
} from "./branch.types";

// Employee
export type {
    EmployeeResponse,
    EmployeeRequest,
    EmployeeUpdateRequest,
    EmployeeStatusUpdateRequest,
    EmployeePhoneResponse,
    EmployeePhoneRequest,
    EmployeePhoneUpdateRequest,
} from "./employee.types";

// Schedule
export type {
    ScheduleResponse,
    ScheduleRequest,
    ScheduleUpdateRequest,
    ScheduleWeekRequest,
    ScheduleWeekResponse,
} from "./schedule.types";

// Phone
export type {
    BranchPhoneResponse,
    BranchPhoneRequest,
    BranchPhoneUpdateRequest,
} from "./phone.types";

// Image
export type {
    BranchImageResponse,
    BranchImageRequest,
    BranchImageUpdateRequest,
} from "./image.types";

// Assignment
export type {
    BranchAssignmentResponse,
    AssignBranchRequest,
    CloseAssignmentRequest,
    CorpPhoneAssignmentResponse,
    AssignCorpPhoneRequest,
} from "./assignment.types";
