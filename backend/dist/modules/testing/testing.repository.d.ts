import { InspectionStatus } from '@prisma/client';
export declare class TestingRepository {
    private defaultInclude;
    findByTicketId(ticketId: string): Promise<({
        ticket: {
            asset: {
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
            };
        } & {
            id: string;
            ticketNumber: string;
            assetId: string;
            title: string;
            description: string;
            priority: import(".prisma/client").$Enums.MaintenancePriority;
            status: import(".prisma/client").$Enums.MaintenanceStatus;
            cost: import("@prisma/client-runtime-utils").Decimal | null;
            startDate: Date | null;
            completedDate: Date | null;
            reportedBy: string | null;
            assignedTechnician: string | null;
            resolutionNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        ticketId: string;
        testType: string;
        status: import(".prisma/client").$Enums.InspectionStatus;
        testedBy: string;
        testDate: Date;
        findings: string | null;
        recommendations: string | null;
        passed: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findById(id: string): Promise<({
        ticket: {
            asset: {
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
            };
        } & {
            id: string;
            ticketNumber: string;
            assetId: string;
            title: string;
            description: string;
            priority: import(".prisma/client").$Enums.MaintenancePriority;
            status: import(".prisma/client").$Enums.MaintenanceStatus;
            cost: import("@prisma/client-runtime-utils").Decimal | null;
            startDate: Date | null;
            completedDate: Date | null;
            reportedBy: string | null;
            assignedTechnician: string | null;
            resolutionNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        ticketId: string;
        testType: string;
        status: import(".prisma/client").$Enums.InspectionStatus;
        testedBy: string;
        testDate: Date;
        findings: string | null;
        recommendations: string | null;
        passed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create(data: {
        ticketId: string;
        testedBy: string;
        testDate: Date;
        status: InspectionStatus;
        findings?: string | null;
        recommendations?: string | null;
        passed: boolean;
        testType: string;
    }): Promise<{
        ticket: {
            asset: {
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
            };
        } & {
            id: string;
            ticketNumber: string;
            assetId: string;
            title: string;
            description: string;
            priority: import(".prisma/client").$Enums.MaintenancePriority;
            status: import(".prisma/client").$Enums.MaintenanceStatus;
            cost: import("@prisma/client-runtime-utils").Decimal | null;
            startDate: Date | null;
            completedDate: Date | null;
            reportedBy: string | null;
            assignedTechnician: string | null;
            resolutionNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        ticketId: string;
        testType: string;
        status: import(".prisma/client").$Enums.InspectionStatus;
        testedBy: string;
        testDate: Date;
        findings: string | null;
        recommendations: string | null;
        passed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        ticket: {
            asset: {
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
            };
        } & {
            id: string;
            ticketNumber: string;
            assetId: string;
            title: string;
            description: string;
            priority: import(".prisma/client").$Enums.MaintenancePriority;
            status: import(".prisma/client").$Enums.MaintenanceStatus;
            cost: import("@prisma/client-runtime-utils").Decimal | null;
            startDate: Date | null;
            completedDate: Date | null;
            reportedBy: string | null;
            assignedTechnician: string | null;
            resolutionNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        ticketId: string;
        testType: string;
        status: import(".prisma/client").$Enums.InspectionStatus;
        testedBy: string;
        testDate: Date;
        findings: string | null;
        recommendations: string | null;
        passed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const testingRepository: TestingRepository;
//# sourceMappingURL=testing.repository.d.ts.map