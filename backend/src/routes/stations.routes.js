import { Router } from 'express';
import * as ctrl from '../controllers/stations.controller.js';

const router = Router();

// Public endpoint
router.get('/', ctrl.list);

export default router;
