import { Router } from 'express';
import * as ctrl from '../controllers/workingHours.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listWorkingHoursSchema, createWorkingHoursSchema, updateWorkingHoursSchema, importWorkingHoursSchema } from '../validators/workingHours.validator.js';

const router = Router();

router.use(authenticate, requireRole('admin-staff'));

router.get('/', validate(listWorkingHoursSchema), ctrl.list);
router.post('/', validate(createWorkingHoursSchema), ctrl.create);
router.patch('/:id', validate(updateWorkingHoursSchema), ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/import', validate(importWorkingHoursSchema), ctrl.importData);

export default router;
