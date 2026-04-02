import { Router } from 'express';
import * as ctrl from '../controllers/planPm.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  listPmPlanSchema, createPmSectionSchema, updatePmSectionSchema, addPmDriverSchema,
} from '../validators/plan.validator.js';

const router = Router();

router.use(authenticate, requireRole('admin-staff'));

router.get('/', validate(listPmPlanSchema), ctrl.list);
router.post('/sections', validate(createPmSectionSchema), ctrl.createSection);
router.patch('/sections/:id', validate(updatePmSectionSchema), ctrl.updateSection);
router.delete('/sections/:id', ctrl.deleteSection);
router.post('/sections/:id/drivers', validate(addPmDriverSchema), ctrl.addDriver);
router.delete('/sections/:sectionId/drivers/:driverId', ctrl.removeDriver);
router.post('/generate', ctrl.generateFromRota);

export default router;
