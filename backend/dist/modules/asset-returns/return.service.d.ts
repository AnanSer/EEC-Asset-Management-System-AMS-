import { ReturnRepository } from './return.repository';
import { CreateReturnRequestDTO, ReceiveReturnDTO, WalkInReturnDTO, ReturnQueryDTO } from './return.validator';
import { Role } from '../../constants';
import { Prisma } from '@prisma/client';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class ReturnService {
    private repo;
    constructor(repo?: ReturnRepository);
    /**
     * Helper to fetch authenticated user's EmployeeProfile
     */
    private getEmployeeProfile;
    /**
     * POST /api/returns - Create a new return request
     * Path A: Employee or Department Manager creates request
     */
    createReturnRequest(authUser: {
        id: string;
        email: string;
        role: Role;
    }, data: CreateReturnRequestDTO): Promise<{
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
        assetId: string;
        departmentId: string;
        status: import(".prisma/client").$Enums.ReturnRequestStatus;
        reason: string;
        requestedAt: Date;
        receivedById: string | null;
        receivedAt: Date | null;
        conditionOnReturn: string | null;
        returnLocation: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * POST /api/returns/:id/receive - Store Keeper physically receives asset for a request
     * Path A fulfillment
     */
    receiveReturn(authUser: {
        id: string;
        email: string;
        role: Role;
    }, requestId: string, data: ReceiveReturnDTO): Promise<{
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
        receivedBy: {
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        assetId: string;
        departmentId: string;
        status: import(".prisma/client").$Enums.ReturnRequestStatus;
        reason: string;
        requestedAt: Date;
        receivedById: string | null;
        receivedAt: Date | null;
        conditionOnReturn: string | null;
        returnLocation: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * POST /api/returns/walk-in - Store Keeper directly receives asset without prior request
     * Path B fulfillment
     */
    receiveWalkInReturn(authUser: {
        id: string;
        email: string;
        role: Role;
    }, data: WalkInReturnDTO): Promise<{
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
        receivedBy: {
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        assetId: string;
        departmentId: string;
        status: import(".prisma/client").$Enums.ReturnRequestStatus;
        reason: string;
        requestedAt: Date;
        receivedById: string | null;
        receivedAt: Date | null;
        conditionOnReturn: string | null;
        returnLocation: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * POST /api/returns/:id/cancel - Cancel pending return request
     */
    cancelReturnRequest(authUser: {
        id: string;
        email: string;
        role: Role;
    }, id: string): Promise<{
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
        receivedBy: {
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        assetId: string;
        departmentId: string;
        status: import(".prisma/client").$Enums.ReturnRequestStatus;
        reason: string;
        requestedAt: Date;
        receivedById: string | null;
        receivedAt: Date | null;
        conditionOnReturn: string | null;
        returnLocation: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * GET /api/returns - List return requests with filters and pagination
     */
    getReturnRequests(authUser: {
        id: string;
        email: string;
        role: Role;
    }, query: ReturnQueryDTO): Promise<{
        returns: ({
            asset: {
                assignments: ({
                    employee: {
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
            receivedBy: {
                email: string;
                employeeProfile: {
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
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
            assetId: string;
            departmentId: string;
            status: import(".prisma/client").$Enums.ReturnRequestStatus;
            reason: string;
            requestedAt: Date;
            receivedById: string | null;
            receivedAt: Date | null;
            conditionOnReturn: string | null;
            returnLocation: string | null;
            notes: string | null;
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
     * GET /api/returns/:id - Retrieve single return request details
     */
    getReturnRequestById(authUser: {
        id: string;
        email: string;
        role: Role;
    }, id: string): Promise<{
        asset: {
            assignments: ({
                employee: {
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
        receivedBy: {
            email: string;
            employeeProfile: {
                firstName: string;
                lastName: string;
            } | null;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        assetId: string;
        departmentId: string;
        status: import(".prisma/client").$Enums.ReturnRequestStatus;
        reason: string;
        requestedAt: Date;
        receivedById: string | null;
        receivedAt: Date | null;
        conditionOnReturn: string | null;
        returnLocation: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const returnService: ReturnService;
//# sourceMappingURL=return.service.d.ts.map