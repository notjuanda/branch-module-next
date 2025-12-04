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

// Inventory
export type {
    InventoryItem,
    InventoryRequest,
    InventoryResponse,
    ProductRequest,
    ProductResponse,
    ProductStatusUpdate,
} from "./inventory.types";

// Batch (Lotes)
export type {
    BatchRequest,
    BatchUpdateRequest,
    BatchNotificationRequest,
    BatchResponse,
    ExpiringBatchNotification,
} from "./batch.types";

// BranchStock (Stock en Sucursales)
export type {
    BranchStockRequest,
    BranchStockUpdateRequest,
    BranchStockResponse,
    BranchStockTransferRequest,
} from "./branchStock.types";

// Reports (Reportes de inventario)
export type {
    StockByBranchResponse,
    InventoryCountResponse,
    MovementType,
    MovementReportResponse,
} from "./report.types";

// Chatbot
export {
    ChatbotModel,
    MessageRole,
} from "./chatbot.types";
export type {
    MessageId,
    SessionId,
    ChatMessage,
    ChatSession,
    SendMessageRequest,
    ChangeModelRequest,
    ChatMessageResponse,
    ChatbotLoginRequest,
    ChatbotRegisterRequest,
    ChatbotAuthResponse,
} from "./chatbot.types";
