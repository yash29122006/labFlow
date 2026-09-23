export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface StudentRegisterRequest {
  uid: string;
  name: string;
  department: string;
  academicYear?: number;
  year?: number;
  semester: number;
  rollNumber?: number;
  batch?: string;
  email: string;
  password?: string;
}

export interface FacultyRequest {
  facultyId: string;
  name: string;
  department: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  uid: string;
  name: string;
  department?: string;
  academicYear?: number;
  year?: number;
  semester?: number;
  rollNumber?: number;
  batch?: string;
  email?: string;
  role: Role;
  active?: boolean;
}

export interface LoginResponse {
  token: string;
  role: Role;
  user: UserResponse;
}
