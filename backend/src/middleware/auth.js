import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { region, userPoolId } from '../config/cognito.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

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
 */
export function authenticate(req, res, next) {
  // Dev mode with placeholder Cognito: skip auth entirely
  if (process.env.NODE_ENV === 'development' && userPoolId.includes('PLACEHOLDER')) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.decode(authHeader.slice(7));
        if (decoded) {
          // Portal user tokens get admin-staff group so existing requireRole checks pass
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

  const authHeader = req.headers.authorization;
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
