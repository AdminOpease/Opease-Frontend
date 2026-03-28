import { Router } from 'express';
import * as ctrl from '../controllers/applications.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { submitApplicationSchema, listApplicationsSchema, updateApplicationSchema, removeApplicationSchema } from '../validators/application.validator.js';

const router = Router();

// Public: submit application from application-form
router.post('/', validate(submitApplicationSchema), ctrl.submit);

// Candidate: confirm flex app setup / DL retry
router.post('/confirm-flex', authenticate, ctrl.confirmFlex);
router.post('/confirm-dl', authenticate, ctrl.confirmDl);
router.post('/book-driving-test', authenticate, ctrl.bookDrivingTest);
router.post('/book-training', authenticate, ctrl.bookTraining);

// Admin routes
router.get('/', authenticate, requireRole('admin-staff'), validate(listApplicationsSchema), ctrl.list);
router.get('/:id', authenticate, requireRole('admin-staff'), ctrl.getById);
router.patch('/:id', authenticate, requireRole('admin-staff'), validate(updateApplicationSchema), ctrl.update);
router.post('/:id/activate', authenticate, requireRole('admin-staff'), ctrl.activate);
router.post('/:id/remove', authenticate, requireRole('admin-staff'), validate(removeApplicationSchema), ctrl.removeApp);

export default router;
