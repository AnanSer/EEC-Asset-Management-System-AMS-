import { Role } from './roles';

export interface EmployeeDepartment {
  id: string;
  name: string;
  code: string;
  location?: string | null;
  officeLocation?: string | null;
  building?: string | null;
  floor?: string | null;
}

export interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  position: string;
  jobTitle: string;
  departmentId: string;
  department?: EmployeeDepartment;
  officeLocation?: string | null;
  role: Role | string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'PENDING';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assetAssignments?: number;
  };
}

export interface CreateEmployeeInput {
  fullName: string;
  employeeId: string;
  email: string;
  phone?: string | null;
  position: string;
  departmentId: string;
  role: string;
  officeLocation?: string | null;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  employeeId?: string;
  email?: string;
  phone?: string | null;
  position?: string;
  departmentId?: string;
  role?: string;
  officeLocation?: string | null;
}

export interface EmployeeQuery {
  search?: string;
  departmentId?: string;
  role?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface EmployeesResponse {
  success: boolean;
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  data: Employee;
}
