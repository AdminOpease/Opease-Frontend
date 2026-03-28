import { Router } from 'express';
import * as ctrl from '../controllers/rota.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listScheduleSchema, updateShiftSchema, bulkScheduleSchema } from '../validators/rota.validator.js';

const router = Router();

router.use(authenticate, requireRole('admin-staff'));

router.get('/weeks', ctrl.listWeeks);
router.get('/schedule', validate(listScheduleSchema), ctrl.getSchedule);
router.patch('/schedule/:id', validate(updateShiftSchema), ctrl.updateShift);
router.post('/schedule/bulk', validate(bulkScheduleSchema), ctrl.bulkUpdate);
router.get('/capacity', ctrl.getCapacity);

export default router;
