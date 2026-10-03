"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestRepository = exports.RequestRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class RequestRepository {
    /**
     * Generate sequential request number: AR-YYYY-XXXX
     */
    async generateRequestNumber() {
        const year = new Date().getFullYear();
        const count = await prisma_1.default.assetRequest.count();
        const sequence = String(count + 1).padStart(4, '0');
        return `AR-${year}-${sequence}`;
    }
    /**
     * Create a new asset request
     */
    async create(data) {
        const requestNumber = await this.generateRequestNumber();
        return prisma_1.default.assetRequest.create({
            data: {
                requestNumber,
                requesterId: data.requesterId,
                departmentId: data.departmentId,
                category: data.category,
                description: data.description,
                notes: data.notes || null,
                status: client_1.RequestStatus.PENDING,
            },
            include: {
                requester: {
                    include: {
                        department: true,
                        user: { select: { id: true, email: true } },
                    },
                },
                department: true,
            },
        });
    }
    /**
     * Find request by ID with all relations
     */
    async findById(id) {
        return prisma_1.default.assetRequest.findUnique({
            where: { id },
            include: {
                requester: {
                    include: {
                        department: true,
                        user: { select: { id: true, email: true } },
                    },
                },
                department: true,
                asset: {
                    include: {
                        department: true,
                    },
                },
                approvedBy: {
                    select: { id: true, email: true },
                },
                rejectedBy: {
                    select: { id: true, email: true },
                },
                fulfilledBy: {
                    select: { id: true, email: true },
                },
            },
        });
    }
    /**
     * Find requests with filters and pagination
     */
    async findMany(params) {
        const { where, skip = 0, take = 10, orderBy = { createdAt: 'desc' } } = params;
        const [requests, total] = await Promise.all([
            prisma_1.default.assetRequest.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    requester: {
                        include: {
                            department: true,
                            user: { select: { id: true, email: true } },
                        },
                    },
                    department: true,
                    asset: true,
                    approvedBy: { select: { id: true, email: true } },
                    rejectedBy: { select: { id: true, email: true } },
                    fulfilledBy: { select: { id: true, email: true } },
                },
            }),
            prisma_1.default.assetRequest.count({ where }),
        ]);
        return { requests, total };
    }
    /**
     * Update request
     */
    async update(id, data) {
        return prisma_1.default.assetRequest.update({
            where: { id },
            data,
            include: {
                requester: {
                    include: {
                        department: true,
                        user: { select: { id: true, email: true } },
                    },
                },
                department: true,
                asset: true,
                approvedBy: { select: { id: true, email: true } },
                rejectedBy: { select: { id: true, email: true } },
                fulfilledBy: { select: { id: true, email: true } },
            },
        });
    }
    /**
     * Count requests
     */
    async count(where) {
        return prisma_1.default.assetRequest.count({ where });
    }
}
exports.RequestRepository = RequestRepository;
exports.requestRepository = new RequestRepository();
//# sourceMappingURL=request.repository.js.map