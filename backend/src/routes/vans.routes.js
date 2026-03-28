import { Router } from 'express';
import * as ctrl from '../controllers/vans.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listVansSchema, createVanSchema, updateVanSchema, listAssignmentsSchema, createAssignmentSchema } from '../validators/van.validator.js';

const router = Router();

router.use(authenticate, requireRole('admin-staff'));

router.get('/', validate(listVansSchema), ctrl.list);
router.post('/', validate(createVanSchema), ctrl.create);
router.patch('/:id', validate(updateVanSchema), ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/assignments', validate(listAssignmentsSchema), ctrl.listAssignments);
router.post('/assignments', validate(createAssignmentSchema), ctrl.createAssignment);
router.delete('/assignments/:id', ctrl.deleteAssignment);

export default router;
