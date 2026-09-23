import { MaintenanceRepository } from './maintenance.repository';
import { CreateMaintenanceDTO, UpdateMaintenanceDTO, UpdateMaintenanceStatusDTO, MaintenanceQueryDTO } from './maintenance.validator';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class MaintenanceService {
    private repo;
    constructor(repo?: MaintenanceRepository);
    private formatTicket;
    getTickets(query: MaintenanceQueryDTO): Promise<{
        tickets: ({
            id: any;
            ticketNumber: any;
            assetId: any;
            category: any;
            title: any;
            description: any;
            priority: any;
            status: any;
            cost: number | null;
            startDate: any;
            completedDate: any;
            reportedBy: any;
            assignedTechnician: any;
            resolutionNotes: any;
            createdAt: any;
            updatedAt: any;
            asset: {
                id: any;
                assetCode: any;
                name: any;
                category: any;
                brand: any;
                model: any;
                serialNumber: any;
                status: any;
                condition: any;
                department: any;
                currentHolder: {
                    id: any;
                    employeeId: any;
                    fullName: string;
                    departmentName: any;
                } | null;
            } | null;
            inspectionTests: any;
            latestInspection: any;
        } | null)[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getTicketById(id: string): Promise<{
        id: any;
        ticketNumber: any;
        assetId: any;
        category: any;
        title: any;
        description: any;
        priority: any;
        status: any;
        cost: number | null;
        startDate: any;
        completedDate: any;
        reportedBy: any;
        assignedTechnician: any;
        resolutionNotes: any;
        createdAt: any;
        updatedAt: any;
        asset: {
            id: any;
            assetCode: any;
            name: any;
            category: any;
            brand: any;
            model: any;
            serialNumber: any;
            status: any;
            condition: any;
            department: any;
            currentHolder: {
                id: any;
                employeeId: any;
                fullName: string;
                departmentName: any;
            } | null;
        } | null;
        inspectionTests: any;
        latestInspection: any;
    } | null>;
    createTicket(data: CreateMaintenanceDTO): Promise<{
        id: any;
        ticketNumber: any;
        assetId: any;
        category: any;
        title: any;
        description: any;
        priority: any;
        status: any;
        cost: number | null;
        startDate: any;
        completedDate: any;
        reportedBy: any;
        assignedTechnician: any;
        resolutionNotes: any;
        createdAt: any;
        updatedAt: any;
        asset: {
            id: any;
            assetCode: any;
            name: any;
            category: any;
            brand: any;
            model: any;
            serialNumber: any;
            status: any;
            condition: any;
            department: any;
            currentHolder: {
                id: any;
                employeeId: any;
                fullName: string;
                departmentName: any;
            } | null;
        } | null;
        inspectionTests: any;
        latestInspection: any;
    } | null>;
    updateTicket(id: string, data: UpdateMaintenanceDTO): Promise<{
        id: any;
        ticketNumber: any;
        assetId: any;
        category: any;
        title: any;
        description: any;
        priority: any;
        status: any;
        cost: number | null;
        startDate: any;
        completedDate: any;
        reportedBy: any;
        assignedTechnician: any;
        resolutionNotes: any;
        createdAt: any;
        updatedAt: any;
        asset: {
            id: any;
            assetCode: any;
            name: any;
            category: any;
            brand: any;
            model: any;
            serialNumber: any;
            status: any;
            condition: any;
            department: any;
            currentHolder: {
                id: any;
                employeeId: any;
                fullName: string;
                departmentName: any;
            } | null;
        } | null;
        inspectionTests: any;
        latestInspection: any;
    } | null>;
    updateStatus(id: string, data: UpdateMaintenanceStatusDTO): Promise<{
        id: any;
        ticketNumber: any;
        assetId: any;
        category: any;
        title: any;
        description: any;
        priority: any;
        status: any;
        cost: number | null;
        startDate: any;
        completedDate: any;
        reportedBy: any;
        assignedTechnician: any;
        resolutionNotes: any;
        createdAt: any;
        updatedAt: any;
        asset: {
            id: any;
            assetCode: any;
            name: any;
            category: any;
            brand: any;
            model: any;
            serialNumber: any;
            status: any;
            condition: any;
            department: any;
            currentHolder: {
                id: any;
                employeeId: any;
                fullName: string;
                departmentName: any;
            } | null;
        } | null;
        inspectionTests: any;
        latestInspection: any;
    } | null>;
    getDashboardStats(): Promise<{
        openTickets: number;
        inProgress: number;
        testing: number;
        completedThisMonth: number;
        recentTickets: ({
            id: any;
            ticketNumber: any;
            assetId: any;
            category: any;
            title: any;
            description: any;
            priority: any;
            status: any;
            cost: number | null;
            startDate: any;
            completedDate: any;
            reportedBy: any;
            assignedTechnician: any;
            resolutionNotes: any;
            createdAt: any;
            updatedAt: any;
            asset: {
                id: any;
                assetCode: any;
                name: any;
                category: any;
                brand: any;
                model: any;
                serialNumber: any;
                status: any;
                condition: any;
                department: any;
                currentHolder: {
                    id: any;
                    employeeId: any;
                    fullName: string;
                    departmentName: any;
                } | null;
            } | null;
            inspectionTests: any;
            latestInspection: any;
        } | null)[];
    }>;
}
export declare const maintenanceService: MaintenanceService;
//# sourceMappingURL=maintenance.service.d.ts.map