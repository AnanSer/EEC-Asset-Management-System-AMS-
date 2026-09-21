/**
 * EEC organizational department types and interfaces.
 */

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  location?: string | null;
  officeLocation?: string | null;
  building?: string | null;
  floor?: string | null;
  headOfDepartment?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
    assets: number;
  };
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string | null;
  location?: string | null;
  officeLocation?: string | null;
  building?: string | null;
  floor?: string | null;
  headOfDepartment?: string | null;
  isActive?: boolean;
}

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

export interface DepartmentQueryParams {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DepartmentsResponse {
  success: boolean;
  data: Department[];
  meta: PaginationMeta;
}

export interface DepartmentResponse {
  success: boolean;
  message?: string;
  data: Department;
}

/** Default empty list for initialization */
export const DEPARTMENTS: Department[] = [];
