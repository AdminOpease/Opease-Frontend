import { Router } from 'express';
import * as ctrl from '../controllers/planAm.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  listAmPlanSchema, createAmGroupSchema, updateAmGroupSchema,
  createAmRowSchema, updateAmRowSchema, importAmPlanSchema,
} from '../validators/plan.validator.js';

const router = Router();

router.use(authenticate, requireRole('admin-staff'));

router.get('/', validate(listAmPlanSchema), ctrl.list);
router.post('/groups', validate(createAmGroupSchema), ctrl.createGroup);
router.patch('/groups/:id', validate(updateAmGroupSchema), ctrl.updateGroup);
router.delete('/groups/:id', ctrl.deleteGroup);
router.post('/rows', validate(createAmRowSchema), ctrl.createRow);
router.patch('/rows/:id', validate(updateAmRowSchema), ctrl.updateRow);
router.delete('/rows/:id', ctrl.deleteRow);
router.post('/import', validate(importAmPlanSchema), ctrl.importPlan);
router.post('/generate', ctrl.generateFromRota);

export default router;
