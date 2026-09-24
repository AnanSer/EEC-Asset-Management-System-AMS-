"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = exports.EmployeeController = void 0;
const employee_service_1 = require("./employee.service");
const employee_validator_1 = require("./employee.validator");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const constants_1 = require("../../constants");
const authorization_1 = require("../../lib/authorization");
const api_1 = require("../../lib/api");
class EmployeeController {
    constructor(service = employee_service_1.employeeService) {
        this.service = service;
        this.getAll = async (req, res) => {
            try {
                const parsedQuery = employee_validator_1.employeeQuerySchema.parse(req.query);
                // Resolve authenticated user role and profile
                if (req.auth?.user) {
                    const user = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                        include: { employeeProfile: true },
                    });
                    if (user) {
                        const role = user.role;
                        // DEPARTMENT_MANAGER: View employees only inside own department
                        if (role === constants_1.ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
                            parsedQuery.departmentId = user.employeeProfile.departmentId;
                        }
                        // EMPLOYEE: View only own employee profile
                        if (role === constants_1.ROLES.EMPLOYEE) {
                            if (user.employeeProfile) {
                                const single = await this.service.getEmployeeById(user.employeeProfile.id);
                                return res.status(200).json((0, api_1.paginatedResponse)(single ? [single] : [], (0, api_1.buildPagination)(1, 10, single ? 1 : 0)));
                            }
                            else {
                                return res.status(200).json((0, api_1.paginatedResponse)([], (0, api_1.buildPagination)(1, 10, 0)));
                            }
                        }
                    }
                }
                const { employees, meta } = await this.service.getEmployees(parsedQuery);
                const pagination = (0, api_1.buildPagination)(meta.page, meta.limit, meta.total);
                return res.status(200).json((0, api_1.paginatedResponse)(employees, pagination));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = String(req.params.id);
                const employee = await this.service.getEmployeeById(id);
                if (!employee) {
                    return res.status(404).json((0, api_1.errorResponse)('Employee not found'));
                }
                // Check ownership & department access
                if (req.auth?.user) {
                    const user = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                        include: { employeeProfile: true },
                    });
                    if (user) {
                        const authContext = {
                            userId: user.id,
                            role: user.role,
                            departmentId: user.employeeProfile?.departmentId,
                            employeeProfileId: user.employeeProfile?.id,
                            employeeId: user.employeeProfile?.employeeId,
                        };
                        const allowed = (0, authorization_1.canAccessEmployee)(authContext, {
                            id: employee.id,
                            userId: employee.userId,
                            employeeId: employee.employeeId,
                            departmentId: employee.departmentId,
                        });
                        if (!allowed) {
                            return res.status(403).json((0, api_1.errorResponse)('Forbidden: You do not have permission to view this employee profile'));
                        }
                    }
                }
                return res.status(200).json((0, api_1.successResponse)(employee));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.create = async (req, res) => {
            try {
                const validatedData = employee_validator_1.createEmployeeSchema.parse(req.body);
                const newEmployee = await this.service.createEmployee(validatedData);
                return res.status(201).json((0, api_1.createdResponse)(newEmployee, null, 'Employee created successfully'));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.update = async (req, res) => {
            try {
                const id = String(req.params.id);
                const validatedData = employee_validator_1.updateEmployeeSchema.parse(req.body);
                const updated = await this.service.updateEmployee(id, validatedData);
                return res.status(200).json((0, api_1.successResponse)(updated, null, 'Employee updated successfully'));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.updateStatus = async (req, res) => {
            try {
                const id = String(req.params.id);
                const { isActive } = employee_validator_1.updateEmployeeStatusSchema.parse(req.body);
                const updated = await this.service.updateStatus(id, isActive);
                return res.status(200).json((0, api_1.successResponse)(updated, null, `Employee ${isActive ? 'activated' : 'deactivated'} successfully`));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof employee_service_1.AppError) {
            return res.status(err.statusCode).json((0, api_1.errorResponse)(err.message, err.statusCode, err.errors));
        }
        if (err?.name === 'ZodError') {
            const formattedErrors = err.issues?.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(422).json((0, api_1.errorResponse)('Validation failed', 422, formattedErrors));
        }
        console.error('Unhandled Employee Error:', err);
        return res.status(500).json((0, api_1.errorResponse)('Internal server error'));
    }
}
exports.EmployeeController = EmployeeController;
exports.employeeController = new EmployeeController();
//# sourceMappingURL=employee.controller.js.map