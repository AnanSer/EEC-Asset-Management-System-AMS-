"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnRepository = exports.ReturnRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
class ReturnRepository {
    /**
     * Generates a sequential request number: RR-YYYY-XXXX
     */
    async generateRequestNumber() {
        const currentYear = new Date().getFullYear();
        const prefix = `RR-${currentYear}-`;
        const count = await prisma_1.default.assetReturnRequest.count({
            where: {
                requestNumber: {
                    startsWith: prefix,
                },
            },
        });
        const nextSeq = (count + 1).toString().padStart(4, '0');
        return `${prefix}${nextSeq}`;
    }
    async findMany(options) {
        const [returns, total] = await Promise.all([
            prisma_1.default.assetReturnRequest.findMany({
                where: options.where,
                skip: options.skip,
                take: options.take,
                orderBy: options.orderBy || { createdAt: 'desc' },
                include: {
                    requester: {
                        include: {
                            department: true,
                            user: {
                                select: { id: true, email: true },
                            },
                        },
                    },
                    department: true,
                    asset: {
                        include: {
                            assignments: {
                                orderBy: { assignedDate: 'desc' },
                                take: 5,
                                include: {
                                    employee: {
                                        include: {
                                            department: true,
                                            user: {
                                                select: { id: true, email: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    receivedBy: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            employeeProfile: {
                                select: { firstName: true, lastName: true },
                            },
                        },
                    },
                },
            }),
            prisma_1.default.assetReturnRequest.count({ where: options.where }),
        ]);
        return { returns, total };
    }
    async findById(id) {
        return prisma_1.default.assetReturnRequest.findUnique({
            where: { id },
            include: {
                requester: {
                    include: {
                        department: true,
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                },
                department: true,
                asset: {
                    include: {
                        assignments: {
                            orderBy: { assignedDate: 'desc' },
                            take: 5,
                            include: {
                                employee: {
                                    include: {
                                        department: true,
                                        user: {
                                            select: { id: true, email: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                receivedBy: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        employeeProfile: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
            },
        });
    }
    async findPendingByAssetId(assetId) {
        return prisma_1.default.assetReturnRequest.findFirst({
            where: {
                assetId,
                status: client_1.ReturnRequestStatus.PENDING,
            },
        });
    }
    async create(data) {
        return prisma_1.default.assetReturnRequest.create({
            data,
            include: {
                requester: {
                    include: {
                        department: true,
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                },
                department: true,
                asset: true,
            },
        });
    }
    async update(id, data) {
        return prisma_1.default.assetReturnRequest.update({
            where: { id },
            data,
            include: {
                requester: {
                    include: {
                        department: true,
                        user: {
                            select: { id: true, email: true },
                        },
                    },
                },
                department: true,
                asset: true,
                receivedBy: {
                    select: { id: true, email: true, role: true },
                },
            },
        });
    }
}
exports.ReturnRepository = ReturnRepository;
exports.returnRepository = new ReturnRepository();
//# sourceMappingURL=return.repository.js.map