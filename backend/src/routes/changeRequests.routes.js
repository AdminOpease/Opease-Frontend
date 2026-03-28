import { Router } from 'express';
import * as ctrl from '../controllers/changeRequests.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createChangeRequestSchema, listChangeRequestsSchema, reviewChangeRequestSchema } from '../validators/changeRequest.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createChangeRequestSchema), ctrl.create);
router.get('/', requireRole('admin-staff'), validate(listChangeRequestsSchema), ctrl.list);
router.patch('/:id', requireRole('admin-staff'), validate(reviewChangeRequestSchema), ctrl.review);

export default router;
