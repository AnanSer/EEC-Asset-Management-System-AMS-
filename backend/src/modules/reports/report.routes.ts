import { Router } from 'express';
import { reportController } from './report.controller';

const router = Router();

router.get('/dashboard', reportController.getDashboard);
router.get('/assets', reportController.getAssets);
router.get('/employees', reportController.getEmployees);
router.get('/departments', reportController.getDepartments);
router.get('/maintenance', reportController.getMaintenance);
router.get('/warranty', reportController.getWarranty);

export default router;
