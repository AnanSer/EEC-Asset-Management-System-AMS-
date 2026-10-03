export interface StoreKpis {
    availableAssets: number;
    assignedAssets: number;
    pendingHandovers: number;
    pendingReturns: number;
}
export interface StoreActivityItem {
    id: string;
    type: 'HANDOVER' | 'RETURN' | 'TRANSFER' | 'LOCATION_CHANGE' | 'ASSIGNMENT';
    assetId: string;
    assetCode: string;
    assetName: string;
    category: string;
    employeeName: string;
    departmentName: string;
    location: string;
    timestamp: string;
    actorName: string;
    details: string;
}
export interface AssetMovementEvent {
    id: string;
    type: 'ASSIGNMENT' | 'TRANSFER' | 'RETURN' | 'MAINTENANCE' | 'TESTING' | 'LOCATION_CHANGE';
    date: string;
    title: string;
    actorName?: string;
    employeeName?: string;
    departmentName?: string;
    location?: string;
    condition?: string | null;
    status?: string;
    details?: string | null;
}
export declare class StoreService {
    /**
     * Retrieves live Store Dashboard KPIs & Recent Activity feed
     * All numbers are strictly derived from actual asset/request/return records.
     */
    getDashboard(): Promise<{
        kpis: StoreKpis;
        recentActivity: StoreActivityItem[];
    }>;
    /**
     * Builds the comprehensive chronological movement history for an individual asset
     * Displayed on Asset Details: Assigned → Transferred → Returned → Assigned → ...
     */
    getAssetMovementHistory(assetId: string): Promise<{
        asset: {
            id: string;
            assetCode: string;
            name: string;
            category: import(".prisma/client").$Enums.AssetCategory;
            status: import(".prisma/client").$Enums.AssetStatus;
            location: string | null;
        };
        events: AssetMovementEvent[];
    } | null>;
}
export declare const storeService: StoreService;
//# sourceMappingURL=store.service.d.ts.map