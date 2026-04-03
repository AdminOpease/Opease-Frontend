import { Router } from 'express';
import * as auth from '../controllers/portalAuth.controller.js';
import * as users from '../controllers/portalUsers.controller.js';
import { authenticatePortal, requireSuperAdmin } from '../middleware/portalAuth.js';

const router = Router();

// Public
router.post('/login', auth.login);

// Authenticated
router.get('/me', authenticatePortal, auth.me);

// Super admin only
router.get('/users', authenticatePortal, requireSuperAdmin, users.list);
router.post('/users', authenticatePortal, requireSuperAdmin, users.create);
router.patch('/users/:id', authenticatePortal, requireSuperAdmin, users.update);
router.delete('/users/:id', authenticatePortal, requireSuperAdmin, users.remove);
router.put('/users/:id/permissions', authenticatePortal, requireSuperAdmin, users.setPermissions);
router.put('/users/:id/depots', authenticatePortal, requireSuperAdmin, users.setDepots);

export default router;
