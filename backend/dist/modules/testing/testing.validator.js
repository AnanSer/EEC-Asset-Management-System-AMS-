"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInspectionSchema = exports.createInspectionSchema = exports.inspectionResultEnum = void 0;
const zod_1 = require("zod");
exports.inspectionResultEnum = zod_1.z.enum(['PASS', 'FAIL']);
exports.createInspectionSchema = zod_1.z.object({
    ticketId: zod_1.z.string().uuid('Invalid ticket ID'),
    testedBy: zod_1.z.string().trim().min(1, 'Technician name is required'),
    testDate: zod_1.z.string().optional().nullable(),
    result: exports.inspectionResultEnum,
    testType: zod_1.z.string().trim().optional().default('QUALITY_AND_FUNCTIONALITY'),
    findings: zod_1.z.string().trim().optional().nullable(),
    recommendations: zod_1.z.string().trim().optional().nullable(),
    autoComplete: zod_1.z.boolean().optional().default(true),
});
exports.updateInspectionSchema = zod_1.z.object({
    testedBy: zod_1.z.string().trim().optional(),
    testDate: zod_1.z.string().optional().nullable(),
    result: exports.inspectionResultEnum.optional(),
    testType: zod_1.z.string().trim().optional(),
    findings: zod_1.z.string().trim().optional().nullable(),
    recommendations: zod_1.z.string().trim().optional().nullable(),
});
//# sourceMappingURL=testing.validator.js.map