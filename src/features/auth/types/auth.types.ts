export type UserRole = 'admin' | 'staff' | 'cashier' | 'kitchen' | 'head_chef';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}
