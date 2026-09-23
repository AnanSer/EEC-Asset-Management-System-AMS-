export interface SearchResultData {
    assets: Array<{
        id: string;
        assetCode: string;
        name: string;
        serialNumber: string;
        category: string;
        status: string;
        condition: string;
        departmentName?: string;
    }>;
    employees: Array<{
        id: string;
        fullName: string;
        employeeId: string;
        email: string;
        departmentName?: string;
        jobTitle?: string;
        isActive: boolean;
    }>;
    departments: Array<{
        id: string;
        departmentCode: string;
        departmentName: string;
        location?: string;
        isActive: boolean;
    }>;
    maintenance: Array<{
        id: string;
        ticketNumber: string;
        title: string;
        assetName: string;
        employeeName: string;
        status: string;
        priority: string;
    }>;
}
export declare class SearchService {
    search(query: string): Promise<SearchResultData>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=search.service.d.ts.map