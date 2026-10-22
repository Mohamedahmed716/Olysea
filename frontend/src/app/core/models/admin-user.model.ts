export interface AdminUser {
  id?: number;
  email: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  redirect?: string;
  user?: AdminUser;
}
