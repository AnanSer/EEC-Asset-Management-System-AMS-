import { DepartmentRepository } from './department.repository';
import { CreateDepartmentDTO, UpdateDepartmentDTO, DepartmentQueryDTO } from './department.validator';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class DepartmentService {
    private repo;
    constructor(repo?: DepartmentRepository);
    getDepartments(query: DepartmentQueryDTO): Promise<{
        departments: ({
            _count: {
                assets: number;
                employees: number;
            };
        } & {
            id: string;
            name: string;
            code: string;
            description: string | null;
            location: string | null;
            officeLocation: string | null;
            building: string | null;
            floor: string | null;
            headOfDepartment: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getDepartmentById(id: string): Promise<{
        _count: {
            assets: number;
            employees: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        location: string | null;
        officeLocation: string | null;
        building: string | null;
        floor: string | null;
        headOfDepartment: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDepartment(data: CreateDepartmentDTO): Promise<{
        _count: {
            assets: number;
            employees: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        location: string | null;
        officeLocation: string | null;
        building: string | null;
        floor: string | null;
        headOfDepartment: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<{
        _count: {
            assets: number;
            employees: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        location: string | null;
        officeLocation: string | null;
        building: string | null;
        floor: string | null;
        headOfDepartment: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, isActive: boolean): Promise<{
        _count: {
            assets: number;
            employees: number;
        };
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        location: string | null;
        officeLocation: string | null;
        building: string | null;
        floor: string | null;
        headOfDepartment: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const departmentService: DepartmentService;
//# sourceMappingURL=department.service.d.ts.map