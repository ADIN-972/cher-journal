export interface User {
  id: string;
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  createdAt: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
