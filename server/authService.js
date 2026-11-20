import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const AUTH_STORE_PATH = path.join(DATA_DIR, 'auth_store.json');
const MASTER_KEY_PATH = path.join(DATA_DIR, 'master.key');

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const MAX_AUDIT_LOGS = 500;

/**
 * Resolve or generate the 256-bit server master secret used for
 * AES-256-GCM encryption at rest and HMAC-SHA256 session tokens.
 */
function getMasterKeyBuffer() {
  if (process.env.TCG_MASTER_SECRET) {
    return crypto.createHash('sha256').update(process.env.TCG_MASTER_SECRET).digest();
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(MASTER_KEY_PATH)) {
    const rawHex = fs.readFileSync(MASTER_KEY_PATH, 'utf-8').trim();
    if (rawHex.length >= 64) {
      return Buffer.from(rawHex.slice(0, 64), 'hex');
    }
  }
  const generated = crypto.randomBytes(32);
  fs.writeFileSync(MASTER_KEY_PATH, generated.toString('hex'), { encoding: 'utf-8', mode: 0o600 });
  return generated;
}

export function hashSecret(plainText) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(plainText), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifySecret(plainText, storedHash) {
  if (!plainText || !storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, expectedHex] = storedHash.split(':');
    const actualBuf = crypto.scryptSync(String(plainText), salt, 64);
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    if (actualBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(actualBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function encryptText(plainText) {
  if (!plainText) return '';
  const key = getMasterKeyBuffer();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptText(payload) {
  if (!payload || typeof payload !== 'string') return '';
  const parts = payload.split(':');
  if (parts.length !== 3) return payload;
  try {
    const key = getMasterKeyBuffer();
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

function base64UrlEncode(objOrStr) {
  const str = typeof objOrStr === 'string' ? objOrStr : JSON.stringify(objOrStr);
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function signToken(payload) {
  const key = getMasterKeyBuffer();
  const headerB64 = base64UrlEncode({ alg: 'HS256', typ: 'TCG' });
  const bodyB64 = base64UrlEncode(payload);
  const signingInput = `${headerB64}.${bodyB64}`;
  const sig = crypto
    .createHmac('sha256', key)
    .update(signingInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${signingInput}.${sig}`;
}

function verifyTokenSignature(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const [headerB64, bodyB64, sigB64] = parts;
    const key = getMasterKeyBuffer();
    const expectedSig = crypto
      .createHmac('sha256', key)
      .update(`${headerB64}.${bodyB64}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const actualBuf = Buffer.from(sigB64, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (actualBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(actualBuf, expectedBuf)) {
      return null;
    }
    const payload = JSON.parse(base64UrlDecode(bodyB64));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function readAuthStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(AUTH_STORE_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(AUTH_STORE_PATH, 'utf-8'));
      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
        if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = [];
        if (!parsed.lockouts || typeof parsed.lockouts !== 'object') parsed.lockouts = {};
        if (!parsed.studentAccess) {
          parsed.studentAccess = {
            username: 'student',
            passwordHash: hashSecret('thakshila2026'),
            updatedAt: new Date().toISOString(),
            updatedBy: 'system'
          };
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error reading auth_store.json:', err);
    }
  }

  // Initial cryptographic seed for Developer Master Account and Common Student Portal
  const now = new Date().toISOString();
  const initialStore = {
    users: [
      {
        id: 'dev-master-1',
        username: 'developer',
        role: 'developer',
        name: 'Lead Developer & Master Administrator',
        phoneEnc: encryptText('000-0000000'),
        gmailEnc: encryptText('developer@thakshilacollege.lk'),
        passwordHash: hashSecret('TcgDev@2026'),
        pinHash: hashSecret('20052720231020050928'),
        active: true,
        createdAt: now,
        lastLoginAt: null
      }
    ],
    studentAccess: {
      username: 'student',
      passwordHash: hashSecret('thakshila2026'),
      updatedAt: now,
      updatedBy: 'system'
    },
    sessions: [],
    auditLogs: [],
    lockouts: {}
  };

  writeAuthStore(initialStore);
  return initialStore;
}

export function writeAuthStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Prune expired sessions automatically on every write
  const now = Date.now();
  store.sessions = (store.sessions || []).filter((s) => s.expiresAt > now);
  fs.writeFileSync(AUTH_STORE_PATH, JSON.stringify(store, null, 2), { encoding: 'utf-8', mode: 0o600 });
}

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

export function getUserAgent(req) {
  return String(req.headers['user-agent'] || 'Unknown Device').slice(0, 180);
}

export function recordAudit(store, entry) {
  if (!Array.isArray(store.auditLogs)) store.auditLogs = [];
  store.auditLogs.unshift({
    id: `log-${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    action: entry.action,
    username: entry.username || 'unknown',
    name: entry.name || 'Unknown',
    role: entry.role || 'visitor',
    ip: entry.ip || '127.0.0.1',
    userAgent: entry.userAgent || '',
    details: entry.details || ''
  });
  if (store.auditLogs.length > MAX_AUDIT_LOGS) {
    store.auditLogs = store.auditLogs.slice(0, MAX_AUDIT_LOGS);
  }
}

function getLockKeys(ip, scope, username) {
  const cleanUser = String(username || '').trim().toLowerCase() || 'blank';
  return [`${scope}:ip:${ip}`, `${scope}:user:${cleanUser}:${ip}`];
}

export function checkRateLimit(store, req, scope, username) {
  const ip = getClientIp(req);
  const now = Date.now();
  const keys = getLockKeys(ip, scope, username);
  let maxLockedUntil = 0;

  for (const k of keys) {
    const rec = store.lockouts[k];
    if (rec && rec.lockedUntil && rec.lockedUntil > now) {
      if (rec.lockedUntil > maxLockedUntil) maxLockedUntil = rec.lockedUntil;
    } else if (rec && rec.lockedUntil && rec.lockedUntil <= now) {
      delete store.lockouts[k];
    }
  }

  if (maxLockedUntil > now) {
    const remainingSec = Math.ceil((maxLockedUntil - now) / 1000);
    const remainingMin = Math.ceil(remainingSec / 60);
    return {
      locked: true,
      remainingSec,
      remainingMin
    };
  }
  return { locked: false, remainingSec: 0, remainingMin: 0 };
}

export function recordFailedAttempt(store, req, scope, username) {
  const ip = getClientIp(req);
  const now = Date.now();
  const keys = getLockKeys(ip, scope, username);
  let newlyLocked = false;
  let maxCount = 0;

  for (const k of keys) {
    const prev = store.lockouts[k] || { count: 0, lockedUntil: 0 };
    const nextCount = (prev.lockedUntil && prev.lockedUntil <= now ? 0 : prev.count) + 1;
    const lockedUntil = nextCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION_MS : 0;
    if (lockedUntil > 0) newlyLocked = true;
    if (nextCount > maxCount) maxCount = nextCount;
    store.lockouts[k] = { count: nextCount, lockedUntil, lastAttemptAt: now };
  }

  return {
    attemptsUsed: maxCount,
    attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - maxCount),
    newlyLocked
  };
}

export function clearRateLimit(store, req, scope, username) {
  const ip = getClientIp(req);
  const keys = getLockKeys(ip, scope, username);
  for (const k of keys) {
    delete store.lockouts[k];
  }
}

export function createSessionForUser(store, req, userObj) {
  const sid = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  const sessionRecord = {
    sid,
    uid: userObj.id,
    username: userObj.username,
    name: userObj.name,
    role: userObj.role,
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    loginAt: new Date(now).toISOString(),
    lastActiveAt: new Date(now).toISOString(),
    expiresAt
  };

  if (!Array.isArray(store.sessions)) store.sessions = [];
  store.sessions.unshift(sessionRecord);

  const token = signToken({
    sid,
    uid: userObj.id,
    username: userObj.username,
    role: userObj.role,
    exp: expiresAt
  });

  return { token, sessionRecord };
}

export function sanitizeUserForClient(user) {
  if (!user) return null;
  if (user.role === 'student') {
    return {
      id: 'student-portal',
      username: user.username,
      name: 'Thakshila Student E-Library',
      role: 'student',
      permissions: ['read_resources']
    };
  }
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    phone: decryptText(user.phoneEnc),
    gmail: decryptText(user.gmailEnc),
    active: user.active !== false,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    permissions:
      user.role === 'developer'
        ? ['edit_website', 'post_news', 'manage_diary', 'manage_resources', 'manage_admins', 'view_audit']
        : ['edit_website', 'post_news', 'manage_diary', 'manage_resources']
  };
}

function extractTokenFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (req.query && typeof req.query.token === 'string') {
    return req.query.token.trim();
  }
  return '';
}

export function authenticateRequest(req) {
  const token = extractTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyTokenSignature(token);
  if (!payload) return null;

  const store = readAuthStore();
  const session = (store.sessions || []).find((s) => s.sid === payload.sid);
  if (!session || session.expiresAt <= Date.now()) {
    return null;
  }

  if (payload.role === 'student') {
    return {
      sid: session.sid,
      user: {
        id: 'student-portal',
        username: store.studentAccess.username,
        name: 'Thakshila Student E-Library',
        role: 'student'
      }
    };
  }

  const user = (store.users || []).find((u) => u.id === payload.uid);
  if (!user || user.active === false) {
    return null;
  }

  // Periodically refresh session timestamp without excessive disk writes
  if (Date.now() - new Date(session.lastActiveAt).getTime() > 60 * 1000) {
    session.lastActiveAt = new Date().toISOString();
    writeAuthStore(store);
  }

  return { sid: session.sid, user: sanitizeUserForClient(user), rawUser: user };
}

export function requireAuth(req, res, next) {
  const ctx = authenticateRequest(req);
  if (!ctx) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Your session may have expired or been logged out.'
    });
  }
  req.authSessionId = ctx.sid;
  req.authUser = ctx.user;
  req.rawAuthUser = ctx.rawUser;
  next();
}

export function requireAdminOrDev(req, res, next) {
  requireAuth(req, res, () => {
    if (req.authUser.role !== 'admin' && req.authUser.role !== 'developer') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Administrator or Developer privileges required.'
      });
    }
    next();
  });
}

export function requireDeveloper(req, res, next) {
  requireAuth(req, res, () => {
    if (req.authUser.role !== 'developer') {
      return res.status(403).json({
        success: false,
        error: 'Restricted access. Master Developer privileges required.'
      });
    }
    next();
  });
}

export function clearExpiredLockoutsAndSave(store) {
  writeAuthStore(store);
}

// Initialize auth store immediately when module loads
readAuthStore();
