import { AccountStatus, UserRole } from '@prisma/client';
export declare class IdentityRepository {
    /**
     * Find pending user accounts with optional search, department filter, and pagination.
     */
    findPendingUsers(params: {
        skip: number;
        take: number;
        search?: string;
        departmentId?: string;
    }): Promise<({
        employeeProfile: ({
            department: {
                code: string;
                id: string;
                name: string;
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
        }) | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    /**
     * Count total pending users matching criteria.
     */
    countPendingUsers(params: {
        search?: string;
        departmentId?: string;
    }): Promise<number>;
    /**
     * Find user by unique ID with profile and department.
     */
    findUserById(id: string): Promise<({
        employeeProfile: ({
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
        }) | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    /**
     * Find user by unique email address.
     */
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
    /**
     * Find employee profile by employeeId.
     */
    findProfileByEmployeeId(employeeId: string): Promise<{
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
    /**
     * Create a pending user with employee profile in a transaction.
     */
    createRegistrationRequest(data: {
        email: string;
        passwordHash: string;
        role: UserRole;
        firstName: string;
        lastName: string;
        employeeId: string;
        departmentId: string;
        jobTitle: string;
        phone?: string | null;
        officeLocation?: string | null;
    }): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        employeeProfile: {
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
        };
    }>;
    /**
     * Update account status (e.g. APPROVED, REJECTED, SUSPENDED) and optionally role.
     */
    updateAccountStatus(id: string, status: AccountStatus, role?: UserRole): Promise<{
        employeeProfile: ({
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
        }) | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.AccountStatus;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const identityRepository: IdentityRepository;
//# sourceMappingURL=identity.repository.d.ts.map