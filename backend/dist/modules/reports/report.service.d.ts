import { ReportRepository } from './report.repository';
export declare class ReportService {
    private repository;
    constructor(repository?: ReportRepository);
    getDashboard(): Promise<{
        kpis: {
            totalAssets: number;
            assignedAssets: number;
            availableAssets: number;
            activeEmployees: number;
            totalDepartments: number;
            openMaintenanceTickets: number;
            assetsUnderTesting: number;
            warrantyExpiringSoon: number;
        };
        warrantySummary: {
            expiring30: number;
            expiring60: number;
            expiring90: number;
        };
        charts: {
            assetsByDepartment: {
                departmentName: string;
                code: string;
                count: number;
            }[];
            assetsByCategory: {
                category: import(".prisma/client").$Enums.AssetCategory;
                count: number;
            }[];
            maintenanceByStatus: {
                status: import(".prisma/client").$Enums.MaintenanceStatus;
                count: number;
            }[];
            maintenanceByPriority: {
                priority: import(".prisma/client").$Enums.MaintenancePriority;
                count: number;
            }[];
            monthlyMaintenance: {
                month: string;
                count: number;
            }[];
        };
    }>;
    getAssets(query: any): Promise<{
        data: {
            id: string;
            assetCode: string;
            name: string;
            category: import(".prisma/client").$Enums.AssetCategory;
            brand: string | null;
            model: string | null;
            serialNumber: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            condition: import(".prisma/client").$Enums.AssetCondition;
            location: string | null;
            purchaseDate: Date | null;
            purchasePrice: number | null;
            warrantyExpiry: Date | null;
            department: {
                code: string;
                id: string;
                name: string;
            } | null;
            assignedTo: {
                id: string;
                employeeId: string;
                fullName: string;
            } | null;
        }[];
        summary: {
            totalValue: number;
        };
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getEmployees(query: any): Promise<{
        data: {
            id: string;
            employeeId: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            jobTitle: string;
            department: {
                code: string;
                id: string;
                name: string;
            };
            isActive: boolean;
            assignedAssetsCount: number;
            assignedAssets: {
                assetCode: string;
                category: import(".prisma/client").$Enums.AssetCategory;
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.AssetStatus;
            }[];
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getDepartments(query: any): Promise<{
        data: {
            id: string;
            code: string;
            name: string;
            location: string;
            headOfDepartment: string;
            isActive: boolean;
            employeeCount: number;
            totalAssets: number;
            assignedAssets: number;
            availableAssets: number;
            maintenanceAssets: number;
            testingAssets: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMaintenance(query: any): Promise<{
        data: {
            id: string;
            ticketNumber: string;
            title: string;
            description: string;
            priority: import(".prisma/client").$Enums.MaintenancePriority;
            status: import(".prisma/client").$Enums.MaintenanceStatus;
            cost: number | null;
            reportedBy: string;
            assignedTechnician: string;
            startDate: Date | null;
            completedDate: Date | null;
            createdAt: Date;
            asset: {
                assetCode: string;
                category: import(".prisma/client").$Enums.AssetCategory;
                id: string;
                name: string;
            };
            inspectionStatus: import(".prisma/client").$Enums.InspectionStatus;
        }[];
        summary: {
            totalCost: number;
        };
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getWarranty(query: any): Promise<{
        data: {
            id: string;
            assetCode: string;
            name: string;
            category: import(".prisma/client").$Enums.AssetCategory;
            serialNumber: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            condition: import(".prisma/client").$Enums.AssetCondition;
            purchaseDate: Date | null;
            warrantyExpiry: Date | null;
            daysRemaining: number | null;
            urgency: "CRITICAL_30" | "EXPIRED" | "HEALTHY" | "MODERATE_60" | "UPCOMING_90";
            department: {
                code: string;
                id: string;
                name: string;
            } | null;
        }[];
        buckets: {
            within30Days: number;
            within60Days: number;
            within90Days: number;
            expired: number;
        };
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
export declare const reportService: ReportService;
//# sourceMappingURL=report.service.d.ts.map