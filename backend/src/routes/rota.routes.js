import { Router } from 'express';
import * as ctrl from '../controllers/rota.controller.js';
import * as avail from '../controllers/availability.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listScheduleSchema, updateShiftSchema, bulkScheduleSchema, createTransferSchema, deleteTransferSchema } from '../validators/rota.validator.js';
import { requestAvailabilitySchema, submitAvailabilitySchema, applyAvailabilitySchema } from '../validators/availability.validator.js';

const router = Router();

// All rota routes require auth
router.use(authenticate);

// Candidate-facing availability routes (no admin role required)
router.get('/availability/mine', avail.myAvailability);
router.patch('/availability/:id', validate(submitAvailabilitySchema), avail.submitAvailability);

// Admin-only routes
router.get('/weeks', requireRole('admin-staff'), ctrl.listWeeks);
router.get('/schedule', requireRole('admin-staff'), validate(listScheduleSchema), ctrl.getSchedule);
router.patch('/schedule/:id', requireRole('admin-staff'), validate(updateShiftSchema), ctrl.updateShift);
router.post('/schedule/bulk', requireRole('admin-staff'), validate(bulkScheduleSchema), ctrl.bulkUpdate);
router.get('/capacity', requireRole('admin-staff'), ctrl.getCapacity);
router.post('/transfers', requireRole('admin-staff'), validate(createTransferSchema), ctrl.createTransfer);
router.delete('/transfers', requireRole('admin-staff'), validate(deleteTransferSchema), ctrl.deleteTransfer);
router.patch('/transfers/assignment', requireRole('admin-staff'), ctrl.updateTransferAssignment);
router.post('/availability/request', requireRole('admin-staff'), validate(requestAvailabilitySchema), avail.requestAvailability);
router.get('/availability', requireRole('admin-staff'), avail.listAvailability);
router.post('/availability/apply', requireRole('admin-staff'), validate(applyAvailabilitySchema), avail.applyAvailability);

export default router;
