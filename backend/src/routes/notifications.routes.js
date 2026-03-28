import { Router } from 'express';
import * as ctrl from '../controllers/notifications.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createNotificationSchema, listNotificationsSchema } from '../validators/notification.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listNotificationsSchema), ctrl.list);
router.patch('/:id/read', ctrl.markRead);
router.post('/', requireRole('admin-staff'), validate(createNotificationSchema), ctrl.create);

export default router;
