export declare class AssignmentRepository {
    findMany(params: {
        search?: string;
        departmentId?: string;
        employeeId?: string;
        assetId?: string;
        isCurrent?: boolean;
        skip?: number;
        take?: number;
    }): Promise<{
        assignments: ({
            asset: {
                assetCode: string;
                brand: string | null;
                category: import(".prisma/client").$Enums.AssetCategory;
                condition: import(".prisma/client").$Enums.AssetCondition;
                department: {
                    code: string;
                    id: string;
                    name: string;
                } | null;
                departmentId: string | null;
                id: string;
                model: string | null;
                name: string;
                serialNumber: string;
                status: import(".prisma/client").$Enums.AssetStatus;
            };
            employee: {
                department: {
                    code: string;
                    id: string;
                    name: string;
                };
                departmentId: string;
                employeeId: string;
                firstName: string;
                id: string;
                jobTitle: string;
                lastName: string;
                user: {
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.UserRole;
                };
            };
        } & {
            id: string;
            assetId: string;
            employeeId: string;
            assignedDate: Date;
            returnedDate: Date | null;
            conditionOnAssign: string | null;
            conditionOnReturn: string | null;
            isCurrent: boolean;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        asset: {
            assetCode: string;
            brand: string | null;
            category: import(".prisma/client").$Enums.AssetCategory;
            condition: import(".prisma/client").$Enums.AssetCondition;
            department: {
                code: string;
                id: string;
                name: string;
            } | null;
            departmentId: string | null;
            id: string;
            model: string | null;
            name: string;
            serialNumber: string;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
        employee: {
            department: {
                code: string;
                id: string;
                name: string;
            };
            departmentId: string;
            employeeId: string;
            firstName: string;
            id: string;
            jobTitle: string;
            lastName: string;
            user: {
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        };
    } & {
        id: string;
        assetId: string;
        employeeId: string;
        assignedDate: Date;
        returnedDate: Date | null;
        conditionOnAssign: string | null;
        conditionOnReturn: string | null;
        isCurrent: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findActiveByAssetId(assetId: string): Promise<({
        asset: {
            assetCode: string;
            brand: string | null;
            category: import(".prisma/client").$Enums.AssetCategory;
            condition: import(".prisma/client").$Enums.AssetCondition;
            department: {
                code: string;
                id: string;
                name: string;
            } | null;
            departmentId: string | null;
            id: string;
            model: string | null;
            name: string;
            serialNumber: string;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
        employee: {
            department: {
                code: string;
                id: string;
                name: string;
            };
            departmentId: string;
            employeeId: string;
            firstName: string;
            id: string;
            jobTitle: string;
            lastName: string;
            user: {
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        };
    } & {
        id: string;
        assetId: string;
        employeeId: string;
        assignedDate: Date;
        returnedDate: Date | null;
        conditionOnAssign: string | null;
        conditionOnReturn: string | null;
        isCurrent: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findHistoryByAssetId(assetId: string): Promise<({
        asset: {
            assetCode: string;
            brand: string | null;
            category: import(".prisma/client").$Enums.AssetCategory;
            condition: import(".prisma/client").$Enums.AssetCondition;
            department: {
                code: string;
                id: string;
                name: string;
            } | null;
            departmentId: string | null;
            id: string;
            model: string | null;
            name: string;
            serialNumber: string;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
        employee: {
            department: {
                code: string;
                id: string;
                name: string;
            };
            departmentId: string;
            employeeId: string;
            firstName: string;
            id: string;
            jobTitle: string;
            lastName: string;
            user: {
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        };
    } & {
        id: string;
        assetId: string;
        employeeId: string;
        assignedDate: Date;
        returnedDate: Date | null;
        conditionOnAssign: string | null;
        conditionOnReturn: string | null;
        isCurrent: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getDashboardStats(): Promise<{
        availableAssets: number;
        assignedAssets: number;
        employeesWithAssets: number;
        recentAssignments: ({
            asset: {
                assetCode: string;
                brand: string | null;
                category: import(".prisma/client").$Enums.AssetCategory;
                condition: import(".prisma/client").$Enums.AssetCondition;
                department: {
                    code: string;
                    id: string;
                    name: string;
                } | null;
                departmentId: string | null;
                id: string;
                model: string | null;
                name: string;
                serialNumber: string;
                status: import(".prisma/client").$Enums.AssetStatus;
            };
            employee: {
                department: {
                    code: string;
                    id: string;
                    name: string;
                };
                departmentId: string;
                employeeId: string;
                firstName: string;
                id: string;
                jobTitle: string;
                lastName: string;
                user: {
                    email: string;
                    id: string;
                    role: import(".prisma/client").$Enums.UserRole;
                };
            };
        } & {
            id: string;
            assetId: string;
            employeeId: string;
            assignedDate: Date;
            returnedDate: Date | null;
            conditionOnAssign: string | null;
            conditionOnReturn: string | null;
            isCurrent: boolean;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        totalAssignments: number;
        activeAssignments: number;
        returnedAssignments: number;
    }>;
}
export declare const assignmentRepository: AssignmentRepository;
//# sourceMappingURL=assignment.repository.d.ts.map