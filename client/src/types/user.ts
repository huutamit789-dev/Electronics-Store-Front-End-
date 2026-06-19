export type UserRole = 'user' | 'admin';
export type UserStatus = 'attempt' | 'approved' | 'banned';

export interface UserRecord {
  _id: string;
  username: string;
  email: string;
  phonenumber: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}

export interface UsersApiResponse {
  success: boolean;
  message: string;
  data: {
    users: UserRecord[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UserApiResponse {
  success: boolean;
  message: string;
  data: UserRecord;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  phonenumber: string;
}

export interface UpdateUserPayload {
  username: string;
  email: string;
  phonenumber: string;
  role: UserRole;
  status: UserStatus;
}
