import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { signPortalToken } from '../middleware/portalAuth.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db('portal_users').where({ email: email.toLowerCase() }).first();
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signPortalToken({
      portalUser: true,
      userId: user.id,
      email: user.email,
      isSuperAdmin: !!user.is_super_admin,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isSuperAdmin: !!user.is_super_admin,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await db('portal_users')
      .where({ id: req.portalUser.userId })
      .first();

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Account not found or inactive' });
    }

    const permissions = await db('portal_user_permissions')
      .where({ user_id: user.id })
      .select('page_key');

    const depots = await db('portal_user_depots')
      .where({ user_id: user.id })
      .select('depot_code');

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isSuperAdmin: !!user.is_super_admin,
      },
      permissions: permissions.map((p) => p.page_key),
      depots: depots.map((d) => d.depot_code),
    });
  } catch (err) {
    next(err);
  }
}
