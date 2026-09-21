"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = exports.DepartmentController = void 0;
const department_service_1 = require("./department.service");
const department_validator_1 = require("./department.validator");
class DepartmentController {
    constructor(service = department_service_1.departmentService) {
        this.service = service;
        this.getAll = async (req, res) => {
            try {
                const parsedQuery = department_validator_1.departmentQuerySchema.parse(req.query);
                const { departments, meta } = await this.service.getDepartments(parsedQuery);
                return res.status(200).json({
                    success: true,
                    data: departments,
                    meta,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = String(req.params.id);
                const department = await this.service.getDepartmentById(id);
                return res.status(200).json({
                    success: true,
                    data: department,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.create = async (req, res) => {
            try {
                const validatedData = department_validator_1.createDepartmentSchema.parse(req.body);
                const newDepartment = await this.service.createDepartment(validatedData);
                return res.status(201).json({
                    success: true,
                    message: 'Department created successfully',
                    data: newDepartment,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.update = async (req, res) => {
            try {
                const id = String(req.params.id);
                const validatedData = department_validator_1.updateDepartmentSchema.parse(req.body);
                const updated = await this.service.updateDepartment(id, validatedData);
                return res.status(200).json({
                    success: true,
                    message: 'Department updated successfully',
                    data: updated,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.updateStatus = async (req, res) => {
            try {
                const id = String(req.params.id);
                const { isActive } = department_validator_1.updateStatusSchema.parse(req.body);
                const updated = await this.service.updateStatus(id, isActive);
                return res.status(200).json({
                    success: true,
                    message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
                    data: updated,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof department_service_1.AppError) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.message,
                errors: err.errors,
            });
        }
        if (err?.name === 'ZodError') {
            const formattedErrors = err.issues?.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors: formattedErrors,
            });
        }
        console.error('Unhandled Department Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
exports.DepartmentController = DepartmentController;
exports.departmentController = new DepartmentController();
//# sourceMappingURL=department.controller.js.map