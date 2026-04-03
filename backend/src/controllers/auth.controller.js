import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import * as cognito from '../config/cognito.js';
import { ConflictError } from '../utils/errors.js';
import { insertAndReturn } from '../utils/dbHelpers.js';

const DEV_SECRET = 'dev-secret';

const isDev = process.env.NODE_ENV !== 'production' &&
  (process.env.COGNITO_USER_POOL_ID || '').includes('PLACEHOLDER');

export async function signup(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone, station } = req.body;

    const existing = await db('drivers').where({ email }).first();
    if (existing) throw new ConflictError('An account with this email already exists');

    let cognitoSub = null;
    if (!isDev) {
      const cognitoResult = await cognito.signUp({ email, password, firstName, lastName, phone });
      cognitoSub = cognitoResult.UserSub;
      await cognito.addUserToGroup({ email, groupName: 'candidates' });
    } else {
      cognitoSub = 'dev-' + Date.now();
    }

    const driver = await insertAndReturn('drivers', {
      email,
      cognito_sub: cognitoSub,
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
      message: 'Account created. Please verify your email.',
      driverId: driver.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { email, code } = req.body;
    if (!isDev) {
      await cognito.confirmSignUp({ email, code });
    }
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (isDev) {
      const driver = await db('drivers').where({ email }).first();
      if (!driver) {
        return res.status(401).json({ error: 'No account found with this email' });
      }
      // If driver has a password set (invited), verify it. Otherwise allow any password in dev.
      if (driver.password_hash) {
        const valid = await bcrypt.compare(password, driver.password_hash);
        if (!valid) {
          return res.status(401).json({ error: 'Invalid password' });
        }
      }
      const payload = {
        sub: driver.cognito_sub || 'dev-' + Date.now(),
        email,
        'cognito:groups': ['candidates'],
      };
      const accessToken = jwt.sign(payload, DEV_SECRET, { expiresIn: '24h' });
      return res.json({
        accessToken,
        refreshToken: 'dev-refresh-' + Date.now(),
        idToken: accessToken,
        expiresIn: 86400,
        driver,
      });
    }

    const result = await cognito.login({ email, password });
    const auth = result.AuthenticationResult;

    res.json({
      accessToken: auth.AccessToken,
      refreshToken: auth.RefreshToken,
      idToken: auth.IdToken,
      expiresIn: auth.ExpiresIn,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken: token } = req.body;

    if (isDev) {
      // Decode the refresh token hint or return a generic dev token
      const accessToken = jwt.sign(
        { sub: 'dev-user', email: 'dev@opease.co.uk', 'cognito:groups': ['candidates'] },
        DEV_SECRET,
        { expiresIn: '24h' },
      );
      return res.json({ accessToken, idToken: accessToken, expiresIn: 86400 });
    }

    const result = await cognito.refreshToken({ refreshToken: token });
    const auth = result.AuthenticationResult;

    res.json({
      accessToken: auth.AccessToken,
      idToken: auth.IdToken,
      expiresIn: auth.ExpiresIn,
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!isDev) {
      await cognito.forgotPassword({ email });
    }
    res.json({ message: 'Password reset code sent to your email' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    if (!isDev) {
      await cognito.confirmForgotPassword({ email, code, newPassword });
    }
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
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
