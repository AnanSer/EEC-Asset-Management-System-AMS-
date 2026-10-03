import { Request, Response } from 'express';
import { requestService, AppError } from './request.service';
import {
  createRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  fulfillRequestSchema,
  requestQuerySchema,
} from './request.validator';
import { Role } from '../../constants';
import prisma from '../../lib/prisma';

export class RequestController {
  /**
   * Helper to extract business role and user id from auth session
   */
  private async getAuthContext(req: Request) {
    const user = req.auth?.user;
    if (!user) {
      throw new AppError('Unauthorized', 401);
    }
    let role = (user as any).role as Role;
    let userId = user.id;

    if (!role || !userId) {
      const businessUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: user.id }, { email: user.email }],
        },
        select: { id: true, email: true, role: true },
      });
      if (businessUser) {
        role = businessUser.role as Role;
        userId = businessUser.id;
      }
    }

    return {
      id: userId,
      email: user.email,
      role,
    };
  }

  /**
   * POST /api/requests - Create a new asset request
   */
  async create(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const parsed = createRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
      }

      const request = await requestService.createRequest(authUser, parsed.data);

      return res.status(201).json({
        success: true,
        message: 'Asset request submitted successfully',
        data: request,
      });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }

  /**
   * GET /api/requests - List requests with filtering and pagination
   */
  async getAll(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const parsed = requestQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: parsed.error.format(),
        });
      }

      const result = await requestService.getRequests(authUser, parsed.data);

      return res.status(200).json({
        success: true,
        data: result.requests,
        meta: result.meta,
      });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }

  /**
   * GET /api/requests/:id - Retrieve single request
   */
  async getById(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;

      const request = await requestService.getRequestById(authUser, id);

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }

  /**
   * POST /api/requests/:id/approve - Approve asset request (ADMIN only)
   */
  async approve(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;
      const parsed = approveRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
      }

      const updated = await requestService.approveRequest(authUser, id, parsed.data);

      return res.status(200).json({
        success: true,
        message: 'Asset request approved successfully',
        data: updated,
      });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }

  /**
   * POST /api/requests/:id/reject - Reject asset request (ADMIN only)
   */
  async reject(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;
      const parsed = rejectRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
      }

      const updated = await requestService.rejectRequest(authUser, id, parsed.data);

      return res.status(200).json({
        success: true,
        message: 'Asset request rejected',
        data: updated,
      });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }

  /**
   * POST /api/requests/:id/fulfill - Fulfill asset request with physical handover (STORE_KEEPER / ADMIN)
   */
  async fulfill(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;
      const parsed = fulfillRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
      }

      const updated = await requestService.fulfillRequest(authUser, id, parsed.data);

      return res.status(200).json({
        success: true,
        message: 'Asset request physically fulfilled and assigned',
        data: updated,
      });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }

  /**
   * POST /api/requests/:id/cancel - Cancel pending request
   */
  async cancel(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;

      const updated = await requestService.cancelRequest(authUser, id);

      return res.status(200).json({
        success: true,
        message: 'Asset request cancelled',
        data: updated,
      });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    }
  }
}

export const requestController = new RequestController();
