import { TestingRepository } from './testing.repository';
import { CreateInspectionDTO, UpdateInspectionDTO } from './testing.validator';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class TestingService {
    private repo;
    constructor(repo?: TestingRepository);
    private formatInspection;
    getInspectionsByTicket(ticketId: string): Promise<({
        id: any;
        ticketId: any;
        testedBy: any;
        testDate: any;
        testType: any;
        status: any;
        passed: boolean;
        result: string;
        notes: any;
        findings: any;
        recommendedAction: any;
        recommendations: any;
        createdAt: any;
        updatedAt: any;
        ticket: {
            id: any;
            ticketNumber: any;
            title: any;
            category: any;
            status: any;
            priority: any;
            asset: any;
        } | null;
    } | null)[]>;
    createInspection(data: CreateInspectionDTO): Promise<{
        id: any;
        ticketId: any;
        testedBy: any;
        testDate: any;
        testType: any;
        status: any;
        passed: boolean;
        result: string;
        notes: any;
        findings: any;
        recommendedAction: any;
        recommendations: any;
        createdAt: any;
        updatedAt: any;
        ticket: {
            id: any;
            ticketNumber: any;
            title: any;
            category: any;
            status: any;
            priority: any;
            asset: any;
        } | null;
    } | null>;
    updateInspection(id: string, data: UpdateInspectionDTO): Promise<{
        id: any;
        ticketId: any;
        testedBy: any;
        testDate: any;
        testType: any;
        status: any;
        passed: boolean;
        result: string;
        notes: any;
        findings: any;
        recommendedAction: any;
        recommendations: any;
        createdAt: any;
        updatedAt: any;
        ticket: {
            id: any;
            ticketNumber: any;
            title: any;
            category: any;
            status: any;
            priority: any;
            asset: any;
        } | null;
    } | null>;
}
export declare const testingService: TestingService;
//# sourceMappingURL=testing.service.d.ts.map