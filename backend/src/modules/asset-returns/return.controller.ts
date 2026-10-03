import { Request, Response } from 'express';
import { returnService, AppError } from './return.service';
import {
  createReturnRequestSchema,
  receiveReturnSchema,
  walkInReturnSchema,
  returnQuerySchema,
} from './return.validator';
import { Role } from '../../constants';
import prisma from '../../lib/prisma';

export class ReturnController {
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
   * POST /api/returns - Create a return request
   */
  async create(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const parsed = createReturnRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
      }

      const returnRequest = await returnService.createReturnRequest(authUser, parsed.data);

      return res.status(201).json({
        success: true,
        message: 'Asset return request submitted successfully',
        data: returnRequest,
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
   * POST /api/returns/:id/receive - Store Keeper receives physical asset for a request
   */
  async receive(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;
      const parsed = receiveReturnSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
      }

      const updated = await returnService.receiveReturn(authUser, id, parsed.data);

      return res.status(200).json({
        success: true,
        message: 'Asset physically received and returned to store inventory',
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
   * POST /api/returns/walk-in - Store Keeper directly receives asset without request
   */
  async receiveWalkIn(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const parsed = walkInReturnSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
      }

      const updated = await returnService.receiveWalkInReturn(authUser, parsed.data);

      return res.status(200).json({
        success: true,
        message: 'Walk-in asset physically received and returned to store inventory',
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
   * POST /api/returns/:id/cancel - Cancel pending return request
   */
  async cancel(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;

      const updated = await returnService.cancelReturnRequest(authUser, id);

      return res.status(200).json({
        success: true,
        message: 'Asset return request cancelled',
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
   * GET /api/returns - List return requests
   */
  async getAll(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const parsed = returnQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: parsed.error.format(),
        });
      }

      const result = await returnService.getReturnRequests(authUser, parsed.data);

      return res.status(200).json({
        success: true,
        data: result.returns,
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
   * GET /api/returns/:id - Get single return request
   */
  async getById(req: Request, res: Response): Promise<any> {
    try {
      const authUser = await this.getAuthContext(req);
      const id = req.params.id as string;

      const request = await returnService.getReturnRequestById(authUser, id);

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
}

export const returnController = new ReturnController();
