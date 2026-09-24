import { IdentityRepository } from './identity.repository';
import { RegistrationRequestDTO, ApprovalRequestDTO, RejectionRequestDTO, PendingUserQueryDTO, PendingUserResponse } from './identity.validator';
export declare class AppError extends Error {
    statusCode: number;
    errors?: any;
    constructor(message: string, statusCode?: number, errors?: any);
}
export declare class IdentityService {
    private repo;
    constructor(repo?: IdentityRepository);
    private formatPendingUser;
    /**
     * List pending account requests with search, department filtering, and pagination.
     */
    getPendingUsers(query: PendingUserQueryDTO): Promise<{
        users: PendingUserResponse[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Submit an employee registration request.
     * Creates Better Auth credentials and pending business user + employee profile.
     */
    register(data: RegistrationRequestDTO): Promise<{
        message: string;
        user: PendingUserResponse;
    }>;
    /**
     * Get active departments for public registration dropdown.
     */
    getPublicDepartments(): Promise<{
        code: string;
        id: string;
        name: string;
    }[]>;
    /**
     * Approve a pending user account.
     */
    approveAccount(id: string, data: ApprovalRequestDTO): Promise<{
        message: string;
        user: PendingUserResponse;
    }>;
    /**
     * Reject a pending user account.
     */
    rejectAccount(id: string, data: RejectionRequestDTO): Promise<{
        message: string;
        reason: string;
        user: PendingUserResponse;
    }>;
    /**
     * Suspend user account (Future use placeholder).
     */
    suspendAccount(id: string): Promise<{
        message: string;
        user: PendingUserResponse;
    }>;
}
export declare const identityService: IdentityService;
//# sourceMappingURL=identity.service.d.ts.map