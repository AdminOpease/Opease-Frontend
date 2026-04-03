import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export async function list(req, res, next) {
  try {
    const users = await db('portal_users')
      .select('id', 'email', 'first_name', 'last_name', 'is_super_admin', 'is_active', 'created_at')
      .orderBy('created_at', 'asc');

    // Fetch permissions and depots for all users
    const allPerms = await db('portal_user_permissions').select('user_id', 'page_key');
    const allDepots = await db('portal_user_depots').select('user_id', 'depot_code');

    const permsByUser = {};
    for (const p of allPerms) {
      if (!permsByUser[p.user_id]) permsByUser[p.user_id] = [];
      permsByUser[p.user_id].push(p.page_key);
    }

    const depotsByUser = {};
    for (const d of allDepots) {
      if (!depotsByUser[d.user_id]) depotsByUser[d.user_id] = [];
      depotsByUser[d.user_id].push(d.depot_code);
    }

    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      isSuperAdmin: !!u.is_super_admin,
      isActive: !!u.is_active,
      permissions: permsByUser[u.id] || [],
      depots: depotsByUser[u.id] || [],
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { email, password, firstName, lastName, isSuperAdmin, permissions, depots } = req.body;

    const existing = await db('portal_users').where({ email: email.toLowerCase() }).first();
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const userId = uuid();
    const hash = await bcrypt.hash(password, 10);

    await db('portal_users').insert({
      id: userId,
      email: email.toLowerCase(),
      password_hash: hash,
      first_name: firstName,
      last_name: lastName,
      is_super_admin: !!isSuperAdmin,
      is_active: true,
    });

    // Insert permissions
    if (permissions?.length > 0) {
      await db('portal_user_permissions').insert(
        permissions.map((key) => ({ id: uuid(), user_id: userId, page_key: key }))
      );
    }

    // Insert depots
    if (depots?.length > 0) {
      await db('portal_user_depots').insert(
        depots.map((code) => ({ id: uuid(), user_id: userId, depot_code: code }))
      );
    }

    res.status(201).json({ id: userId, email: email.toLowerCase(), firstName, lastName });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, isSuperAdmin, isActive } = req.body;

    const user = await db('portal_users').where({ id }).first();
    if (!user) throw new NotFoundError('User');

    const patch = { updated_at: new Date() };
    if (email) patch.email = email.toLowerCase();
    if (firstName) patch.first_name = firstName;
    if (lastName) patch.last_name = lastName;
    if (typeof isSuperAdmin === 'boolean') patch.is_super_admin = isSuperAdmin;
    if (typeof isActive === 'boolean') patch.is_active = isActive;
    if (password) patch.password_hash = await bcrypt.hash(password, 10);

    await db('portal_users').where({ id }).update(patch);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await db('portal_users').where({ id }).update({ is_active: false, updated_at: new Date() });
    res.json({ message: 'Deactivated' });
  } catch (err) {
    next(err);
  }
}

export async function setPermissions(req, res, next) {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // string[]

    await db('portal_user_permissions').where({ user_id: id }).del();
    if (permissions?.length > 0) {
      await db('portal_user_permissions').insert(
        permissions.map((key) => ({ id: uuid(), user_id: id, page_key: key }))
      );
    }

    res.json({ permissions });
  } catch (err) {
    next(err);
  }
}

export async function setDepots(req, res, next) {
  try {
    const { id } = req.params;
    const { depots } = req.body; // string[]

    await db('portal_user_depots').where({ user_id: id }).del();
    if (depots?.length > 0) {
      await db('portal_user_depots').insert(
        depots.map((code) => ({ id: uuid(), user_id: id, depot_code: code }))
      );
    }

    res.json({ depots });
  } catch (err) {
    next(err);
  }
}
