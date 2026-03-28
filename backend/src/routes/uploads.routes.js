import { Router } from 'express';
import * as ctrl from '../controllers/uploads.controller.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { presignedUrlSchema } from '../validators/document.validator.js';

const router = Router();

router.use(authenticate);

router.post('/presigned-url', validate(presignedUrlSchema), ctrl.presignedUrl);
router.get('/download/:documentId', ctrl.downloadUrl);

export default router;
