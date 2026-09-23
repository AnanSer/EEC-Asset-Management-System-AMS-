"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetController = exports.AssetController = void 0;
const asset_service_1 = require("./asset.service");
const asset_validator_1 = require("./asset.validator");
class AssetController {
    constructor(service = asset_service_1.assetService) {
        this.service = service;
        this.getAll = async (req, res) => {
            try {
                const parsedQuery = asset_validator_1.assetQuerySchema.parse(req.query);
                const { assets, meta } = await this.service.getAssets(parsedQuery);
                return res.status(200).json({
                    success: true,
                    data: assets,
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
                const asset = await this.service.getAssetById(id);
                return res.status(200).json({
                    success: true,
                    data: asset,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.create = async (req, res) => {
            try {
                const validatedData = asset_validator_1.createAssetSchema.parse(req.body);
                const newAsset = await this.service.createAsset(validatedData);
                return res.status(201).json({
                    success: true,
                    message: 'Asset registered successfully',
                    data: newAsset,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.update = async (req, res) => {
            try {
                const id = String(req.params.id);
                const validatedData = asset_validator_1.updateAssetSchema.parse(req.body);
                const updated = await this.service.updateAsset(id, validatedData);
                return res.status(200).json({
                    success: true,
                    message: 'Asset updated successfully',
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
                const { status } = asset_validator_1.updateAssetStatusSchema.parse(req.body);
                const updated = await this.service.updateStatus(id, status);
                return res.status(200).json({
                    success: true,
                    message: `Asset status updated to '${status}'`,
                    data: updated,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof asset_service_1.AppError) {
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
        console.error('Unhandled Asset Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
exports.AssetController = AssetController;
exports.assetController = new AssetController();
//# sourceMappingURL=asset.controller.js.map