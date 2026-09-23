import { Router } from 'express';
import { searchController } from './search.controller';
import { requireAuth } from '../../middleware';

const router = Router();

router.use(requireAuth());
router.get('/', searchController.search);

export default router;
