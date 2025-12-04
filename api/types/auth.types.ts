// ===== AUTH TYPES =====

// Request
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Response
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  roles: string[];
}

export interface UserMeResponse {
  userId: string;
  employeeId: string | null;
  username: string;
  fullName: string;
  roles: string[];
}
