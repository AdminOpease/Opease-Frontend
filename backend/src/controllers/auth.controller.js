import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
// Cognito is kept imported but inert — the candidate auth flow uses bcrypt
// against drivers.password_hash and JWTs signed with JWT_SECRET. When Cognito
// is eventually provisioned, these paths can be re-enabled.
// eslint-disable-next-line no-unused-vars
import * as cognito from '../config/cognito.js';
import { ConflictError } from '../utils/errors.js';
import { insertAndReturn } from '../utils/dbHelpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'opease-dev-secret-2024';
const TOKEN_EXPIRES_IN = '7d';
const TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

function issueDriverToken(driver) {
  const payload = {
    sub: driver.id,
    driverId: driver.id,
    email: driver.email,
    'cognito:groups': ['candidates'],
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  return {
    accessToken,
    refreshToken: accessToken, // single-token model — refresh just re-signs
    idToken: accessToken,
    expiresIn: TOKEN_EXPIRES_IN_SECONDS,
  };
}

export async function signup(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone, station } = req.body;
    const emailLower = String(email || '').trim().toLowerCase();

    const existing = await db('drivers').where({ email: emailLower }).first();
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 10);

    const driver = await insertAndReturn('drivers', {
      email: emailLower,
      password_hash: passwordHash,
      portal_invited: true,
      cognito_sub: null,
      first_name: firstName,
      last_name: lastName,
      phone,
      depot: station || null,
      status: 'Onboarding',
    });

    await insertAndReturn('applications', {
      driver_id: driver.id,
      date_applied: new Date().toISOString().slice(0, 10),
    });

    res.status(201).json({
      message: 'Account created',
      driverId: driver.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  // Email verification is not required in the current (non-Cognito) flow.
  res.json({ message: 'Email verification is not currently required' });
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const emailLower = String(email || '').trim().toLowerCase();

    const driver = await db('drivers').where({ email: emailLower }).first();
    if (!driver) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!driver.password_hash) {
      return res.status(401).json({
        error: 'This account has no password set. Please contact your administrator.',
      });
    }

    const valid = await bcrypt.compare(password, driver.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Don't leak the hash back to the client
    const { password_hash: _omit, ...safeDriver } = driver;
    res.json({ ...issueDriverToken(driver), driver: safeDriver });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ error: 'Missing refresh token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const driverId = decoded.driverId || decoded.sub;
    const driver = await db('drivers').where({ id: driverId }).first();
    if (!driver) return res.status(401).json({ error: 'Driver not found' });

    res.json(issueDriverToken(driver));
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function forgotPassword(req, res, next) {
  // Self-service password reset is not wired up yet. Admin resets via
  // POST /api/drivers/:id/reset-password from the client portal.
  res.json({
    message: 'Please contact your administrator to reset your password.',
  });
}

export async function resetPassword(req, res, next) {
  // Self-service password reset is not wired up yet.
  res.status(501).json({ error: 'Self-service password reset is not enabled' });
}

export async function me(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const application = await db('applications').where({ driver_id: driver.id }).first();
    res.json({ driver, application });
  } catch (err) {
    next(err);
  }
}

// Allowed fields for candidate self-update (first-time entry only)
const ALLOWED_PROFILE_FIELDS = [
  'bank_name', 'sort_code', 'account_number', 'tax_reference', 'vat_number',
  'emergency_name', 'emergency_relationship', 'emergency_phone', 'emergency_email',
];

export async function updateProfile(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Filter to only allowed fields
    const patch = {};
    for (const key of ALLOWED_PROFILE_FIELDS) {
      if (req.body[key] !== undefined) {
        patch[key] = req.body[key];
      }
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    patch.updated_at = Date.now();
    await db('drivers').where({ id: driver.id }).update(patch);
    const updated = await db('drivers').where({ id: driver.id }).first();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function submitDvlaCode(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const { dvla_check_code } = req.body;
    if (!dvla_check_code || !dvla_check_code.trim()) {
      return res.status(400).json({ error: 'DVLA check code is required' });
    }

    await db('drivers').where({ id: driver.id }).update({
      dvla_check_code: dvla_check_code.trim(),
      dvla_code_submitted_at: new Date().toISOString(),
      updated_at: Date.now(),
    });

    const updated = await db('drivers').where({ id: driver.id }).first();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function submitRtwCode(req, res, next) {
  try {
    const email = req.user.email || req.user['cognito:username'];
    const driver = await db('drivers').where({ email }).first();
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const { rtw_share_code_new } = req.body;
    if (!rtw_share_code_new || !rtw_share_code_new.trim()) {
      return res.status(400).json({ error: 'Share code is required' });
    }

    await db('drivers').where({ id: driver.id }).update({
      rtw_share_code_new: rtw_share_code_new.trim(),
      rtw_code_submitted_at: new Date().toISOString(),
      updated_at: Date.now(),
    });

    const updated = await db('drivers').where({ id: driver.id }).first();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
