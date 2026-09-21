import { CreateDepartmentDTO, UpdateDepartmentDTO } from './department.validator';
export declare class DepartmentRepository {
    findMany(params: {
        search?: string;
        isActive?: boolean;
        skip?: number;
        take?: number;
    }): Promise<{
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
        total: number;
    }>;
    findById(id: string): Promise<({
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
    }) | null>;
    findByCode(code: string): Promise<{
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
    } | null>;
    create(data: CreateDepartmentDTO): Promise<{
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
    update(id: string, data: UpdateDepartmentDTO): Promise<{
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
export declare const departmentRepository: DepartmentRepository;
//# sourceMappingURL=department.repository.d.ts.map