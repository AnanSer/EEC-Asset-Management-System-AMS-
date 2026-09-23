"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingRepository = exports.TestingRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class TestingRepository {
    constructor() {
        this.defaultInclude = {
            ticket: {
                include: {
                    asset: {
                        include: {
                            department: true,
                        },
                    },
                },
            },
        };
    }
    async findByTicketId(ticketId) {
        return prisma_1.default.inspectionTest.findMany({
            where: { ticketId },
            orderBy: { createdAt: 'desc' },
            include: this.defaultInclude,
        });
    }
    async findById(id) {
        return prisma_1.default.inspectionTest.findUnique({
            where: { id },
            include: this.defaultInclude,
        });
    }
    async create(data) {
        return prisma_1.default.inspectionTest.create({
            data,
            include: this.defaultInclude,
        });
    }
    async update(id, data) {
        return prisma_1.default.inspectionTest.update({
            where: { id },
            data,
            include: this.defaultInclude,
        });
    }
}
exports.TestingRepository = TestingRepository;
exports.testingRepository = new TestingRepository();
//# sourceMappingURL=testing.repository.js.map