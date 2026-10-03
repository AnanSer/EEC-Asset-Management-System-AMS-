/**
 * Store Operations Controller — EEC EAMS (Phase 11E)
 */
import { Request, Response } from 'express';
import { storeService } from './store.service';
import { ROLES, Role } from '../../constants';

export class StoreController {
  private getAuthContext(req: Request) {
    const user = req.auth?.user;
    if (!user) {
      return null;
    }
    const role = (user as any).role as Role;
    return {
      id: user.id,
      email: user.email,
      role,
    };
  }

  getDashboard = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = this.getAuthContext(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // Store Dashboard is reserved for STORE_KEEPER and ADMIN
      if (user.role !== ROLES.STORE_KEEPER && user.role !== ROLES.ADMIN) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Store Operations Dashboard is restricted to Store Keeper and Admin',
        });
      }

      const data = await storeService.getDashboard();
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      console.error('Failed to get store dashboard:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load store dashboard data',
      });
    }
  };

  getAssetMovementHistory = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = this.getAuthContext(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const rawAssetId = req.params.assetId;
      const assetId = Array.isArray(rawAssetId) ? rawAssetId[0] : rawAssetId;
      if (!assetId) {
        return res.status(400).json({ success: false, message: 'Asset ID is required' });
      }

      const data = await storeService.getAssetMovementHistory(assetId);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      console.error('Failed to get asset movement history:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load asset movement history',
      });
    }
  };
}

export const storeController = new StoreController();
