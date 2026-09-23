import { AssignmentRepository } from './assignment.repository';
import { AssignAssetDTO, TransferAssetDTO, ReturnAssetDTO, AssignmentQueryDTO } from './assignment.validator';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class AssignmentService {
    private repo;
    constructor(repo?: AssignmentRepository);
    private formatAssignment;
    getAssignments(query: AssignmentQueryDTO): Promise<{
        assignments: ({
            id: any;
            assetId: any;
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
            } | null;
            employeeId: any;
            employee: {
                id: any;
                employeeId: any;
                firstName: any;
                lastName: any;
                fullName: string;
                jobTitle: any;
                department: any;
                email: any;
            } | null;
            assignedDate: any;
            returnedDate: any;
            durationDays: number;
            conditionOnAssign: any;
            conditionOnReturn: any;
            isCurrent: any;
            remarks: any;
            createdAt: any;
            updatedAt: any;
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
    getAssignmentById(id: string): Promise<{
        id: any;
        assetId: any;
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
        } | null;
        employeeId: any;
        employee: {
            id: any;
            employeeId: any;
            firstName: any;
            lastName: any;
            fullName: string;
            jobTitle: any;
            department: any;
            email: any;
        } | null;
        assignedDate: any;
        returnedDate: any;
        durationDays: number;
        conditionOnAssign: any;
        conditionOnReturn: any;
        isCurrent: any;
        remarks: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    getAssetHistory(assetId: string): Promise<({
        id: any;
        assetId: any;
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
        } | null;
        employeeId: any;
        employee: {
            id: any;
            employeeId: any;
            firstName: any;
            lastName: any;
            fullName: string;
            jobTitle: any;
            department: any;
            email: any;
        } | null;
        assignedDate: any;
        returnedDate: any;
        durationDays: number;
        conditionOnAssign: any;
        conditionOnReturn: any;
        isCurrent: any;
        remarks: any;
        createdAt: any;
        updatedAt: any;
    } | null)[]>;
    assignAsset(data: AssignAssetDTO): Promise<{
        id: any;
        assetId: any;
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
        } | null;
        employeeId: any;
        employee: {
            id: any;
            employeeId: any;
            firstName: any;
            lastName: any;
            fullName: string;
            jobTitle: any;
            department: any;
            email: any;
        } | null;
        assignedDate: any;
        returnedDate: any;
        durationDays: number;
        conditionOnAssign: any;
        conditionOnReturn: any;
        isCurrent: any;
        remarks: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    transferAsset(assetId: string, data: TransferAssetDTO): Promise<{
        id: any;
        assetId: any;
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
        } | null;
        employeeId: any;
        employee: {
            id: any;
            employeeId: any;
            firstName: any;
            lastName: any;
            fullName: string;
            jobTitle: any;
            department: any;
            email: any;
        } | null;
        assignedDate: any;
        returnedDate: any;
        durationDays: number;
        conditionOnAssign: any;
        conditionOnReturn: any;
        isCurrent: any;
        remarks: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    returnAsset(assetId: string, data: ReturnAssetDTO): Promise<{
        id: any;
        assetId: any;
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
        } | null;
        employeeId: any;
        employee: {
            id: any;
            employeeId: any;
            firstName: any;
            lastName: any;
            fullName: string;
            jobTitle: any;
            department: any;
            email: any;
        } | null;
        assignedDate: any;
        returnedDate: any;
        durationDays: number;
        conditionOnAssign: any;
        conditionOnReturn: any;
        isCurrent: any;
        remarks: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    getDashboardStats(): Promise<{
        availableAssets: number;
        assignedAssets: number;
        employeesWithAssets: number;
        totalAssignments: number;
        activeAssignments: number;
        returnedAssignments: number;
        recentAssignments: ({
            id: any;
            assetId: any;
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
            } | null;
            employeeId: any;
            employee: {
                id: any;
                employeeId: any;
                firstName: any;
                lastName: any;
                fullName: string;
                jobTitle: any;
                department: any;
                email: any;
            } | null;
            assignedDate: any;
            returnedDate: any;
            durationDays: number;
            conditionOnAssign: any;
            conditionOnReturn: any;
            isCurrent: any;
            remarks: any;
            createdAt: any;
            updatedAt: any;
        } | null)[];
    }>;
}
export declare const assignmentService: AssignmentService;
//# sourceMappingURL=assignment.service.d.ts.map