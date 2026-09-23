export declare class ReportRepository {
    /**
     * KPI counts and chart aggregation data for the Executive Reports Dashboard
     */
    getDashboardMetrics(): Promise<{
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
    /**
     * Assets Detailed Report with Aggregations and Filtering
     */
    getAssetsReport(params: {
        search?: string;
        category?: string;
        status?: string;
        condition?: string;
        departmentId?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        assets: {
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
        total: number;
        totalValue: number;
    }>;
    /**
     * Employees Detailed Report with Assigned Asset Counts
     */
    getEmployeesReport(params: {
        search?: string;
        departmentId?: string;
        isActive?: boolean;
        skip?: number;
        take?: number;
    }): Promise<{
        employees: {
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
        total: number;
    }>;
    /**
     * Departments Detailed Report with Comprehensive Asset Breakdown
     */
    getDepartmentsReport(params: {
        search?: string;
        isActive?: boolean;
        skip?: number;
        take?: number;
    }): Promise<{
        departments: {
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
        total: number;
    }>;
    /**
     * Maintenance Detailed Report with Service Cost Aggregations
     */
    getMaintenanceReport(params: {
        search?: string;
        status?: string;
        priority?: string;
        category?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        tickets: {
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
        total: number;
        totalCost: number;
    }>;
    /**
     * Warranty Center Detailed Report
     */
    getWarrantyReport(params: {
        search?: string;
        timeframe?: '30' | '60' | '90' | 'expired' | 'all';
        departmentId?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        assets: {
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
        total: number;
        buckets: {
            within30Days: number;
            within60Days: number;
            within90Days: number;
            expired: number;
        };
    }>;
}
export declare const reportRepository: ReportRepository;
//# sourceMappingURL=report.repository.d.ts.map