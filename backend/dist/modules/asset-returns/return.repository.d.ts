import { Prisma } from '@prisma/client';
export declare class ReturnRepository {
    /**
     * Generates a sequential request number: RR-YYYY-XXXX
     */
    generateRequestNumber(): Promise<string>;
    findMany(options: {
        where?: Prisma.AssetReturnRequestWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.AssetReturnRequestOrderByWithRelationInput;
    }): Promise<{
        returns: ({
            asset: {
                assignments: ({
                    employee: {
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
        total: number;
    }>;
    findById(id: string): Promise<({
        asset: {
            assignments: ({
                employee: {
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
    }) | null>;
    findPendingByAssetId(assetId: string): Promise<{
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
    } | null>;
    create(data: Prisma.AssetReturnRequestCreateInput): Promise<{
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
    update(id: string, data: Prisma.AssetReturnRequestUpdateInput): Promise<{
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
}
export declare const returnRepository: ReturnRepository;
//# sourceMappingURL=return.repository.d.ts.map