"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeController = exports.StoreController = void 0;
const store_service_1 = require("./store.service");
const constants_1 = require("../../constants");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class StoreController {
    constructor() {
        this.getDashboard = async (req, res) => {
            try {
                const user = await this.getAuthContext(req);
                if (!user) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                // Store Dashboard is reserved for STORE_KEEPER and ADMIN
                if (user.role !== constants_1.ROLES.STORE_KEEPER && user.role !== constants_1.ROLES.ADMIN) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied: Store Operations Dashboard is restricted to Store Keeper and Admin',
                    });
                }
                const data = await store_service_1.storeService.getDashboard();
                return res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (err) {
                console.error('Failed to get store dashboard:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to load store dashboard data',
                });
            }
        };
        this.getAssetMovementHistory = async (req, res) => {
            try {
                const user = await this.getAuthContext(req);
                if (!user) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                const rawAssetId = req.params.assetId;
                const assetId = Array.isArray(rawAssetId) ? rawAssetId[0] : rawAssetId;
                if (!assetId) {
                    return res.status(400).json({ success: false, message: 'Asset ID is required' });
                }
                const data = await store_service_1.storeService.getAssetMovementHistory(assetId);
                if (!data) {
                    return res.status(404).json({ success: false, message: 'Asset not found' });
                }
                return res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (err) {
                console.error('Failed to get asset movement history:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to load asset movement history',
                });
            }
        };
    }
    async getAuthContext(req) {
        const user = req.auth?.user;
        if (!user) {
            return null;
        }
        let role = user.role;
        let userId = user.id;
        if (!role || !userId) {
            const businessUser = await prisma_1.default.user.findFirst({
                where: {
                    OR: [{ id: user.id }, { email: user.email }],
                },
                select: { id: true, email: true, role: true },
            });
            if (businessUser) {
                role = businessUser.role;
                userId = businessUser.id;
            }
        }
        return {
            id: userId,
            email: user.email,
            role,
        };
    }
}
exports.StoreController = StoreController;
exports.storeController = new StoreController();
//# sourceMappingURL=store.controller.js.map