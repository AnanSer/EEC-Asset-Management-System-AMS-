"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = exports.EmployeeController = void 0;
const employee_service_1 = require("./employee.service");
const employee_validator_1 = require("./employee.validator");
class EmployeeController {
    constructor(service = employee_service_1.employeeService) {
        this.service = service;
        this.getAll = async (req, res) => {
            try {
                const parsedQuery = employee_validator_1.employeeQuerySchema.parse(req.query);
                const { employees, meta } = await this.service.getEmployees(parsedQuery);
                return res.status(200).json({
                    success: true,
                    data: employees,
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
                const employee = await this.service.getEmployeeById(id);
                return res.status(200).json({
                    success: true,
                    data: employee,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.create = async (req, res) => {
            try {
                const validatedData = employee_validator_1.createEmployeeSchema.parse(req.body);
                const newEmployee = await this.service.createEmployee(validatedData);
                return res.status(201).json({
                    success: true,
                    message: 'Employee created successfully',
                    data: newEmployee,
                });
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
                return res.status(200).json({
                    success: true,
                    message: 'Employee updated successfully',
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
                const { isActive } = employee_validator_1.updateEmployeeStatusSchema.parse(req.body);
                const updated = await this.service.updateStatus(id, isActive);
                return res.status(200).json({
                    success: true,
                    message: `Employee ${isActive ? 'activated' : 'deactivated'} successfully`,
                    data: updated,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof employee_service_1.AppError) {
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
        console.error('Unhandled Employee Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
exports.EmployeeController = EmployeeController;
exports.employeeController = new EmployeeController();
//# sourceMappingURL=employee.controller.js.map