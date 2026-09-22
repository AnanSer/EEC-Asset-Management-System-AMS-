import { Request, Response } from 'express';
import { assetService, AssetService, AppError } from './asset.service';
import {
  createAssetSchema,
  updateAssetSchema,
  updateAssetStatusSchema,
  assetQuerySchema,
} from './asset.validator';

export class AssetController {
  constructor(private service: AssetService = assetService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const parsedQuery = assetQuerySchema.parse(req.query);
      const { assets, meta } = await this.service.getAssets(parsedQuery);

      return res.status(200).json({
        success: true,
        data: assets,
        meta,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const asset = await this.service.getAssetById(id);

      return res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validatedData = createAssetSchema.parse(req.body);
      const newAsset = await this.service.createAsset(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Asset registered successfully',
        data: newAsset,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const validatedData = updateAssetSchema.parse(req.body);
      const updated = await this.service.updateAsset(id, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Asset updated successfully',
        data: updated,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { status } = updateAssetStatusSchema.parse(req.body);
      const updated = await this.service.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: `Asset status updated to '${status}'`,
        data: updated,
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

    console.error('Unhandled Asset Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const assetController = new AssetController();
