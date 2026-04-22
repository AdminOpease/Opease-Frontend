import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { region, userPoolId } from '../config/cognito.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

// Portal users (the client/admin web portal) issue HS256 JWTs signed with this secret.
// Must match the secret used by backend/src/routes/portalAuth.js when signing tokens.
const PORTAL_SECRET = process.env.JWT_SECRET || 'opease-dev-secret-2024';

// JWKS client for verifying Cognito JWT signatures
const jwks = jwksClient({
  jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * Verify JWT token from Authorization header
 * Populates req.user with decoded token claims
 *
 * Resolution order:
 *   1. Portal user token (HS256, JWT_SECRET) — works in any environment
 *   2. Dev mode with placeholder Cognito — permissive fallback
 *   3. Cognito-issued token (RS256, JWKS verified) — production driver/Cognito flows
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Try portal token first — lets the client portal work without real Cognito
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), PORTAL_SECRET);
      if (decoded) {
        if (decoded.portalUser) {
          decoded['cognito:groups'] = ['admin-staff'];
        }
        req.user = decoded;
        return next();
      }
    } catch {
      // Not a portal token (bad signature / wrong algorithm) — fall through
    }
  }

  // 2. Dev mode with placeholder Cognito: skip strict verification
  if (process.env.NODE_ENV === 'development' && userPoolId.includes('PLACEHOLDER')) {
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.decode(authHeader.slice(7));
        if (decoded) {
          if (decoded.portalUser) {
            decoded['cognito:groups'] = ['admin-staff'];
          }
          req.user = decoded;
          return next();
        }
      } catch { /* ignore */ }
    }
    req.user = { sub: 'dev-user', email: 'dev@opease.co.uk', 'cognito:groups': ['admin-staff'] };
    return next();
  }

  // 3. Production Cognito JWT verification
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);
  jwt.verify(
    token,
    getKey,
    {
      issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        return next(new UnauthorizedError('Invalid or expired token'));
      }
      req.user = decoded;
      next();
    }
  );
}

/**
 * Require specific Cognito group membership
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    const groups = req.user['cognito:groups'] || [];
    const hasRole = roles.some((role) => groups.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

/**
 * Optional auth — populates req.user if token present, but doesn't require it
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  authenticate(req, res, next);
}
