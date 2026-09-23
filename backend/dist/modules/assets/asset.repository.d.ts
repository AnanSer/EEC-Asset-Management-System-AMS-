import { CreateAssetDTO, UpdateAssetDTO } from './asset.validator';
import { AssetStatus } from '@prisma/client';
export declare class AssetRepository {
    findMany(params: {
        search?: string;
        category?: string;
        status?: string;
        condition?: string;
        departmentId?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        assets: ({
            _count: {
                assignments: number;
                maintenanceTickets: number;
            };
            assignments: ({
                employee: {
                    department: {
                        code: string;
                        id: string;
                        name: string;
                    };
                    employeeId: string;
                    firstName: string;
                    id: string;
                    jobTitle: string;
                    lastName: string;
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
            department: {
                building: string | null;
                code: string;
                floor: string | null;
                id: string;
                name: string;
                officeLocation: string | null;
            } | null;
        } & {
            id: string;
            assetCode: string;
            name: string;
            category: import(".prisma/client").$Enums.AssetCategory;
            brand: string | null;
            model: string | null;
            serialNumber: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            condition: import(".prisma/client").$Enums.AssetCondition;
            departmentId: string | null;
            location: string | null;
            purchaseDate: Date | null;
            purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
            warrantyExpiry: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
    }>;
    findById(id: string): Promise<({
        _count: {
            assignments: number;
            maintenanceTickets: number;
        };
        assignments: ({
            employee: {
                department: {
                    code: string;
                    id: string;
                    name: string;
                };
                employeeId: string;
                firstName: string;
                id: string;
                jobTitle: string;
                lastName: string;
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
        department: {
            building: string | null;
            code: string;
            floor: string | null;
            id: string;
            name: string;
            officeLocation: string | null;
        } | null;
    } & {
        id: string;
        assetCode: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        brand: string | null;
        model: string | null;
        serialNumber: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        condition: import(".prisma/client").$Enums.AssetCondition;
        departmentId: string | null;
        location: string | null;
        purchaseDate: Date | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findByAssetCode(assetCode: string): Promise<{
        id: string;
        assetCode: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        brand: string | null;
        model: string | null;
        serialNumber: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        condition: import(".prisma/client").$Enums.AssetCondition;
        departmentId: string | null;
        location: string | null;
        purchaseDate: Date | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findBySerialNumber(serialNumber: string): Promise<{
        id: string;
        assetCode: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        brand: string | null;
        model: string | null;
        serialNumber: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        condition: import(".prisma/client").$Enums.AssetCondition;
        departmentId: string | null;
        location: string | null;
        purchaseDate: Date | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(data: CreateAssetDTO & {
        status?: AssetStatus;
    }): Promise<{
        _count: {
            assignments: number;
            maintenanceTickets: number;
        };
        assignments: ({
            employee: {
                department: {
                    code: string;
                    id: string;
                    name: string;
                };
                employeeId: string;
                firstName: string;
                id: string;
                jobTitle: string;
                lastName: string;
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
        department: {
            building: string | null;
            code: string;
            floor: string | null;
            id: string;
            name: string;
            officeLocation: string | null;
        } | null;
    } & {
        id: string;
        assetCode: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        brand: string | null;
        model: string | null;
        serialNumber: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        condition: import(".prisma/client").$Enums.AssetCondition;
        departmentId: string | null;
        location: string | null;
        purchaseDate: Date | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateAssetDTO): Promise<{
        _count: {
            assignments: number;
            maintenanceTickets: number;
        };
        assignments: ({
            employee: {
                department: {
                    code: string;
                    id: string;
                    name: string;
                };
                employeeId: string;
                firstName: string;
                id: string;
                jobTitle: string;
                lastName: string;
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
        department: {
            building: string | null;
            code: string;
            floor: string | null;
            id: string;
            name: string;
            officeLocation: string | null;
        } | null;
    } & {
        id: string;
        assetCode: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        brand: string | null;
        model: string | null;
        serialNumber: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        condition: import(".prisma/client").$Enums.AssetCondition;
        departmentId: string | null;
        location: string | null;
        purchaseDate: Date | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, status: AssetStatus): Promise<{
        _count: {
            assignments: number;
            maintenanceTickets: number;
        };
        assignments: ({
            employee: {
                department: {
                    code: string;
                    id: string;
                    name: string;
                };
                employeeId: string;
                firstName: string;
                id: string;
                jobTitle: string;
                lastName: string;
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
        department: {
            building: string | null;
            code: string;
            floor: string | null;
            id: string;
            name: string;
            officeLocation: string | null;
        } | null;
    } & {
        id: string;
        assetCode: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        brand: string | null;
        model: string | null;
        serialNumber: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        condition: import(".prisma/client").$Enums.AssetCondition;
        departmentId: string | null;
        location: string | null;
        purchaseDate: Date | null;
        purchasePrice: import("@prisma/client-runtime-utils").Decimal | null;
        warrantyExpiry: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const assetRepository: AssetRepository;
//# sourceMappingURL=asset.repository.d.ts.map