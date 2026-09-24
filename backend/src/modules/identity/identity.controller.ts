// EEC EAMS – Identity Module Controller (Phase 9A.2)
// Request handling and response formatting for authentication and account lifecycle.

import { Request, Response } from 'express';
import { identityService, IdentityService, AppError } from './identity.service';
import {
  registrationSchema,
  approvalSchema,
  rejectionSchema,
  pendingUserQuerySchema,
} from './identity.validator';

export class IdentityController {
  constructor(private service: IdentityService = identityService) {}

  /**
   * GET /api/identity/departments
   * Public list of active departments for registration dropdown.
   */
  getPublicDepartments = async (_req: Request, res: Response) => {
    try {
      const departments = await this.service.getPublicDepartments();
      return res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  /**
   * POST /api/identity/register
   * Submit an employee registration request.
   */
  register = async (req: Request, res: Response) => {
    try {
      const validatedData = registrationSchema.parse(req.body);
      const result = await this.service.register(validatedData);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };


  /**
   * GET /api/identity/pending
   * List pending account requests awaiting approval.
   */
  getPending = async (req: Request, res: Response) => {
    try {
      const parsedQuery = pendingUserQuerySchema.parse(req.query);
      const { users, meta } = await this.service.getPendingUsers(parsedQuery);

      return res.status(200).json({
        success: true,
        data: users,
        meta,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  /**
   * PATCH /api/identity/:id/approve
   * Approve a pending user account.
   */
  approve = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const validatedData = approvalSchema.parse(req.body);
      const result = await this.service.approveAccount(id, validatedData);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  /**
   * PATCH /api/identity/:id/reject
   * Reject a pending user account.
   */
  reject = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const validatedData = rejectionSchema.parse(req.body);
      const result = await this.service.rejectAccount(id, validatedData);

      return res.status(200).json({
        success: true,
        message: result.message,
        reason: result.reason,
        data: result.user,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  /**
   * PATCH /api/identity/:id/suspend
   * Suspend a user account.
   */
  suspend = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this.service.suspendAccount(id);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  private handleError(res: Response, err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    if (err?.name === 'ZodError') {
      const formattedErrors = err.issues?.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    console.error('Unhandled Identity Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const identityController = new IdentityController();
