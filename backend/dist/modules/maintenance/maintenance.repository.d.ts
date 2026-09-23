export declare class MaintenanceRepository {
    private defaultInclude;
    findMany(params: {
        search?: string;
        status?: string;
        priority?: string;
        category?: string;
        technician?: string;
        assetId?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        tickets: ({
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
            inspectionTests: {
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
            }[];
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
        inspectionTests: {
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
        }[];
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
    }) | null>;
    findByTicketNumber(ticketNumber: string): Promise<({
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
        inspectionTests: {
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
        }[];
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
    }) | null>;
    generateTicketNumber(): Promise<string>;
    getDashboardStats(): Promise<{
        openTickets: number;
        inProgress: number;
        testing: number;
        completedThisMonth: number;
        recentTickets: ({
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
            inspectionTests: {
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
            }[];
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
        })[];
    }>;
}
export declare const maintenanceRepository: MaintenanceRepository;
//# sourceMappingURL=maintenance.repository.d.ts.map