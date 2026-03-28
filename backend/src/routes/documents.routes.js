import { Router } from 'express';
import * as ctrl from '../controllers/documents.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listDocumentsSchema, createDocumentSchema, updateDocumentSchema } from '../validators/document.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listDocumentsSchema), ctrl.list);
router.get('/expiring', requireRole('admin-staff'), ctrl.getExpiring);
router.post('/', validate(createDocumentSchema), ctrl.create);
router.patch('/:id', requireRole('admin-staff'), validate(updateDocumentSchema), ctrl.update);
router.patch('/:id/archive', requireRole('admin-staff'), ctrl.archive);
router.patch('/:id/restore', requireRole('admin-staff'), ctrl.restore);
router.delete('/:id', requireRole('admin-staff'), ctrl.remove);

export default router;
