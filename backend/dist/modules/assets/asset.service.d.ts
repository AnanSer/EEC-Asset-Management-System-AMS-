import { AssetRepository } from './asset.repository';
import { CreateAssetDTO, UpdateAssetDTO, AssetQueryDTO } from './asset.validator';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class AssetService {
    private repo;
    constructor(repo?: AssetRepository);
    private formatAsset;
    getAssets(query: AssetQueryDTO): Promise<{
        assets: ({
            id: any;
            assetCode: any;
            name: any;
            category: any;
            brand: any;
            model: any;
            serialNumber: any;
            status: any;
            condition: any;
            departmentId: any;
            department: any;
            location: any;
            purchaseDate: any;
            purchasePrice: number | null;
            warrantyExpiry: any;
            notes: any;
            currentAssignment: {
                id: any;
                employeeId: any;
                employeeBadgeId: any;
                employeeName: string;
                departmentName: any;
                assignedDate: any;
                remarks: any;
            } | null;
            createdAt: any;
            updatedAt: any;
            _count: any;
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
    getAssetById(id: string): Promise<{
        id: any;
        assetCode: any;
        name: any;
        category: any;
        brand: any;
        model: any;
        serialNumber: any;
        status: any;
        condition: any;
        departmentId: any;
        department: any;
        location: any;
        purchaseDate: any;
        purchasePrice: number | null;
        warrantyExpiry: any;
        notes: any;
        currentAssignment: {
            id: any;
            employeeId: any;
            employeeBadgeId: any;
            employeeName: string;
            departmentName: any;
            assignedDate: any;
            remarks: any;
        } | null;
        createdAt: any;
        updatedAt: any;
        _count: any;
    } | null>;
    createAsset(data: CreateAssetDTO): Promise<{
        id: any;
        assetCode: any;
        name: any;
        category: any;
        brand: any;
        model: any;
        serialNumber: any;
        status: any;
        condition: any;
        departmentId: any;
        department: any;
        location: any;
        purchaseDate: any;
        purchasePrice: number | null;
        warrantyExpiry: any;
        notes: any;
        currentAssignment: {
            id: any;
            employeeId: any;
            employeeBadgeId: any;
            employeeName: string;
            departmentName: any;
            assignedDate: any;
            remarks: any;
        } | null;
        createdAt: any;
        updatedAt: any;
        _count: any;
    } | null>;
    updateAsset(id: string, data: UpdateAssetDTO): Promise<{
        id: any;
        assetCode: any;
        name: any;
        category: any;
        brand: any;
        model: any;
        serialNumber: any;
        status: any;
        condition: any;
        departmentId: any;
        department: any;
        location: any;
        purchaseDate: any;
        purchasePrice: number | null;
        warrantyExpiry: any;
        notes: any;
        currentAssignment: {
            id: any;
            employeeId: any;
            employeeBadgeId: any;
            employeeName: string;
            departmentName: any;
            assignedDate: any;
            remarks: any;
        } | null;
        createdAt: any;
        updatedAt: any;
        _count: any;
    } | null>;
    updateStatus(id: string, status: string): Promise<{
        id: any;
        assetCode: any;
        name: any;
        category: any;
        brand: any;
        model: any;
        serialNumber: any;
        status: any;
        condition: any;
        departmentId: any;
        department: any;
        location: any;
        purchaseDate: any;
        purchasePrice: number | null;
        warrantyExpiry: any;
        notes: any;
        currentAssignment: {
            id: any;
            employeeId: any;
            employeeBadgeId: any;
            employeeName: string;
            departmentName: any;
            assignedDate: any;
            remarks: any;
        } | null;
        createdAt: any;
        updatedAt: any;
        _count: any;
    } | null>;
}
export declare const assetService: AssetService;
//# sourceMappingURL=asset.service.d.ts.map