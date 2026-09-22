import { CreateEmployeeDTO, UpdateEmployeeDTO } from './employee.validator';
export declare class EmployeeRepository {
    findMany(params: {
        search?: string;
        departmentId?: string;
        role?: string;
        isActive?: boolean;
        skip?: number;
        take?: number;
    }): Promise<{
        employees: ({
            _count: {
                assetAssignments: number;
            };
            department: {
                building: string | null;
                code: string;
                floor: string | null;
                id: string;
                location: string | null;
                name: string;
                officeLocation: string | null;
            };
            user: {
                createdAt: Date;
                email: string;
                id: string;
                isEmailVerified: boolean;
                role: import(".prisma/client").$Enums.UserRole;
                status: import(".prisma/client").$Enums.AccountStatus;
            };
        } & {
            id: string;
            userId: string;
            employeeId: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            jobTitle: string;
            departmentId: string;
            officeLocation: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        _count: {
            assetAssignments: number;
        };
        department: {
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
        };
        user: {
            createdAt: Date;
            email: string;
            id: string;
            isEmailVerified: boolean;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
        };
    } & {
        id: string;
        userId: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        jobTitle: string;
        departmentId: string;
        officeLocation: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findByEmployeeId(employeeId: string): Promise<{
        id: string;
        userId: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        jobTitle: string;
        departmentId: string;
        officeLocation: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findUserByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createWithTransaction(data: CreateEmployeeDTO): Promise<{
        _count: {
            assetAssignments: number;
        };
        department: {
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
        };
        user: {
            createdAt: Date;
            email: string;
            id: string;
            isEmailVerified: boolean;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
        };
    } & {
        id: string;
        userId: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        jobTitle: string;
        departmentId: string;
        officeLocation: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateWithTransaction(id: string, currentProfile: any, data: UpdateEmployeeDTO): Promise<{
        _count: {
            assetAssignments: number;
        };
        department: {
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
        };
        user: {
            createdAt: Date;
            email: string;
            id: string;
            isEmailVerified: boolean;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
        };
    } & {
        id: string;
        userId: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        jobTitle: string;
        departmentId: string;
        officeLocation: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, isActive: boolean): Promise<{
        _count: {
            assetAssignments: number;
        };
        department: {
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
        };
        user: {
            createdAt: Date;
            email: string;
            id: string;
            isEmailVerified: boolean;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
        };
    } & {
        id: string;
        userId: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        jobTitle: string;
        departmentId: string;
        officeLocation: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const employeeRepository: EmployeeRepository;
//# sourceMappingURL=employee.repository.d.ts.map