import { Prisma } from '@prisma/client';
import { CreateRequestDTO } from './request.validator';
export declare class RequestRepository {
    /**
     * Generate sequential request number: AR-YYYY-XXXX
     */
    generateRequestNumber(): Promise<string>;
    /**
     * Create a new asset request
     */
    create(data: {
        requesterId: string;
        departmentId: string;
        category: CreateRequestDTO['category'];
        description: string;
        notes?: string;
    }): Promise<{
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
        requester: {
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
                email: string;
                id: string;
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
    } & {
        id: string;
        requestNumber: string;
        requesterId: string;
        departmentId: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        description: string;
        notes: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        approvedById: string | null;
        approvedAt: Date | null;
        approvalRemarks: string | null;
        rejectedById: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        fulfilledById: string | null;
        fulfilledAt: Date | null;
        assetId: string | null;
        handoverNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Find request by ID with all relations
     */
    findById(id: string): Promise<({
        approvedBy: {
            email: string;
            id: string;
        } | null;
        asset: ({
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
            purchasePrice: Prisma.Decimal | null;
            warrantyExpiry: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
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
        fulfilledBy: {
            email: string;
            id: string;
        } | null;
        rejectedBy: {
            email: string;
            id: string;
        } | null;
        requester: {
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
                email: string;
                id: string;
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
    } & {
        id: string;
        requestNumber: string;
        requesterId: string;
        departmentId: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        description: string;
        notes: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        approvedById: string | null;
        approvedAt: Date | null;
        approvalRemarks: string | null;
        rejectedById: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        fulfilledById: string | null;
        fulfilledAt: Date | null;
        assetId: string | null;
        handoverNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    /**
     * Find requests with filters and pagination
     */
    findMany(params: {
        where?: Prisma.AssetRequestWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.AssetRequestOrderByWithRelationInput;
    }): Promise<{
        requests: ({
            approvedBy: {
                email: string;
                id: string;
            } | null;
            asset: {
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
                purchasePrice: Prisma.Decimal | null;
                warrantyExpiry: Date | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
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
            fulfilledBy: {
                email: string;
                id: string;
            } | null;
            rejectedBy: {
                email: string;
                id: string;
            } | null;
            requester: {
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
                    email: string;
                    id: string;
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
        } & {
            id: string;
            requestNumber: string;
            requesterId: string;
            departmentId: string;
            category: import(".prisma/client").$Enums.AssetCategory;
            description: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.RequestStatus;
            approvedById: string | null;
            approvedAt: Date | null;
            approvalRemarks: string | null;
            rejectedById: string | null;
            rejectedAt: Date | null;
            rejectionReason: string | null;
            fulfilledById: string | null;
            fulfilledAt: Date | null;
            assetId: string | null;
            handoverNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
    }>;
    /**
     * Update request
     */
    update(id: string, data: Prisma.AssetRequestUpdateInput): Promise<{
        approvedBy: {
            email: string;
            id: string;
        } | null;
        asset: {
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
            purchasePrice: Prisma.Decimal | null;
            warrantyExpiry: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        fulfilledBy: {
            email: string;
            id: string;
        } | null;
        rejectedBy: {
            email: string;
            id: string;
        } | null;
        requester: {
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
                email: string;
                id: string;
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
    } & {
        id: string;
        requestNumber: string;
        requesterId: string;
        departmentId: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        description: string;
        notes: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        approvedById: string | null;
        approvedAt: Date | null;
        approvalRemarks: string | null;
        rejectedById: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        fulfilledById: string | null;
        fulfilledAt: Date | null;
        assetId: string | null;
        handoverNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Count requests
     */
    count(where?: Prisma.AssetRequestWhereInput): Promise<number>;
}
export declare const requestRepository: RequestRepository;
//# sourceMappingURL=request.repository.d.ts.map