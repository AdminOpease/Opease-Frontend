import { Router } from 'express';
import * as ctrl from '../controllers/drivers.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listDriversSchema, updateDriverSchema, updateStatusSchema } from '../validators/driver.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('admin-staff'), ctrl.create);
router.get('/', requireRole('admin-staff'), validate(listDriversSchema), ctrl.list);
router.get('/:id', ctrl.getById);
router.patch('/:id', requireRole('admin-staff'), validate(updateDriverSchema), ctrl.update);
router.patch('/:id/status', requireRole('admin-staff'), validate(updateStatusSchema), ctrl.updateStatus);
router.delete('/:id', requireRole('admin-staff'), ctrl.remove);
router.post('/:id/restore', requireRole('admin-staff'), ctrl.restore);
router.post('/:id/reset-password', requireRole('admin-staff'), ctrl.resetPassword);

export default router;
