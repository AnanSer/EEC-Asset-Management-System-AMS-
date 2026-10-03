import { Prisma } from '@prisma/client';
import { RequestRepository } from './request.repository';
import { CreateRequestDTO, ApproveRequestDTO, RejectRequestDTO, FulfillRequestDTO, RequestQueryDTO } from './request.validator';
import { type Role } from '../../constants';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class RequestService {
    private repo;
    constructor(repo?: RequestRepository);
    /**
     * Helper to resolve active EmployeeProfile for a user
     */
    private getEmployeeProfile;
    /**
     * Create asset request (EMPLOYEE, DEPARTMENT_MANAGER, etc.)
     */
    createRequest(authUser: {
        id: string;
        email: string;
        role: Role;
    }, data: CreateRequestDTO): Promise<{
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
     * Get requests with role-based scoping and pagination
     */
    getRequests(authUser: {
        id: string;
        email: string;
        role: Role;
    }, query: RequestQueryDTO): Promise<{
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    /**
     * Get single request details
     */
    getRequestById(authUser: {
        id: string;
        email: string;
        role: Role;
    }, id: string): Promise<{
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
    }>;
    /**
     * Approve asset request (ADMIN only)
     * NOTE: Does NOT assign asset, does NOT change asset status, does NOT alter inventory.
     */
    approveRequest(adminUser: {
        id: string;
        email: string;
        role: Role;
    }, id: string, data: ApproveRequestDTO): Promise<{
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
     * Reject asset request (ADMIN only)
     */
    rejectRequest(adminUser: {
        id: string;
        email: string;
        role: Role;
    }, id: string, data: RejectRequestDTO): Promise<{
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
     * Fulfill asset request via physical handover (STORE_KEEPER or ADMIN)
     * Atomic Transaction:
     * 1. Validate request is APPROVED
     * 2. Validate asset is AVAILABLE and matches requested category
     * 3. Create AssetAssignment (isCurrent: true)
     * 4. Update Asset: status = ASSIGNED, departmentId = request.departmentId
     * 5. Update AssetRequest: status = FULFILLED, fulfilledById, fulfilledAt, assetId, handoverNotes
     */
    fulfillRequest(fulfillerUser: {
        id: string;
        email: string;
        role: Role;
    }, id: string, data: FulfillRequestDTO): Promise<{
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
     * Cancel asset request (Requester only, while PENDING)
     */
    cancelRequest(authUser: {
        id: string;
        email: string;
        role: Role;
    }, id: string): Promise<{
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
}
export declare const requestService: RequestService;
//# sourceMappingURL=request.service.d.ts.map