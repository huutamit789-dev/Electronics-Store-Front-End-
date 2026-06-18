// src/types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}