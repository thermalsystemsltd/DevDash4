export interface User {
  id: number;
  email: string;
  role: 'admin' | 'viewer';
  created_at: string;
  updated_at: string | null;
  roles?: number[];
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isDisabled?: boolean;
  isLockedOut?: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isDisabled: boolean;
  isLockedOut: boolean;
  roles?: number[];
}

export interface UpdateUserRequest {
  userId: number;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isDisabled?: boolean;
  isLockedOut?: boolean;
  roles?: number[];
}

export interface BiometricsCredential {
  id: number;
  user_id: number;
  credential_id: string;
  public_key: string;
  created_at: string;
  updated_at: string | null;
}