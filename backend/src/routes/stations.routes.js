import { Router } from 'express';
import * as ctrl from '../controllers/stations.controller.js';

const router = Router();

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
