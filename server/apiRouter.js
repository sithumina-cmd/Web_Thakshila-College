import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import {
  readAuthStore,
  writeAuthStore,
  hashSecret,
  verifySecret,
  encryptText,
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  createSessionForUser,
  sanitizeUserForClient,
  recordAudit,
  getClientIp,
  getUserAgent,
  requireAuth,
  requireAdminOrDev,
  requireDeveloper
} from './authService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const RESOURCES_DB_PATH = path.join(__dirname, 'data', 'resources.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'resources');

const apiApp = express();
apiApp.use(express.json({ limit: '25mb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Security Headers
apiApp.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

let inMemoryDb = null;
const TMP_DB_PATH = path.join(os.tmpdir(), 'tcg_db.json');

function readDb() {
  if (inMemoryDb) {
    return inMemoryDb;
  }
  // Try reading from /tmp/tcg_db.json first (contains latest writes in serverless)
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.settings) parsed.settings = {};
        if (!parsed.news) parsed.news = parsed.posts || [];
        if (!parsed.sports) parsed.sports = [];
        if (!parsed.diary) parsed.diary = [];
        if (!parsed.principals) parsed.principals = [];
        if (!parsed.contactInquiries) parsed.contactInquiries = [];
        inMemoryDb = parsed;
        return inMemoryDb;
      }
    }
  } catch {}

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.settings) parsed.settings = {};
    if (!parsed.news) parsed.news = parsed.posts || [];
    if (!parsed.sports) parsed.sports = [];
    if (!parsed.diary) parsed.diary = [];
    if (!parsed.principals) parsed.principals = [];
    if (!parsed.contactInquiries) parsed.contactInquiries = [];
    inMemoryDb = parsed;
    return inMemoryDb;
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { settings: {}, news: [], sports: [], diary: [], principals: [], contactInquiries: [] };
  }
}

function writeDb(data) {
  inMemoryDb = data;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // If DB_PATH is read-only (e.g. Vercel Lambda), write to /tmp
    try {
      fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch {}
  }
  return true;
}

/**
 * Generate a clean, valid PDF binary buffer for sample resources so
 * students can download genuine readable PDF files right out of the box.
 */
function createSamplePdfBuffer(title, infoLines) {
  const safe = (t) => String(t).replace(/[^\x20-\x7E]/g, '').replace(/[()\\]/g, '\\$&');
  const lines = [title, '', ...infoLines];
  const contentOps = [
    'BT',
    '/F1 15 Tf',
    '54 740 Td',
    `(${safe(lines[0])}) Tj`,
    '/F1 11 Tf',
    '0 -22 Td'
  ];
  for (let i = 1; i < lines.length; i++) {
    contentOps.push('0 -18 Td');
    contentOps.push(`(${safe(lines[i])}) Tj`);
  }
  contentOps.push('ET');
  const stream = contentOps.join('\n');
  const objs = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const o of objs) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += o;
  }
  const xrefPos = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

let inMemoryResourcesStore = null;

function readResourcesStore() {
  if (inMemoryResourcesStore && inMemoryResourcesStore.length > 0) {
    return inMemoryResourcesStore;
  }
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch {}

  if (fs.existsSync(RESOURCES_DB_PATH)) {
    try {
      const list = JSON.parse(fs.readFileSync(RESOURCES_DB_PATH, 'utf-8'));
      if (Array.isArray(list) && list.length > 0) {
        inMemoryResourcesStore = list;
        return inMemoryResourcesStore;
      }
    } catch (err) {
      console.warn('Could not read resources.json, will use default seeds:', err.message);
    }
  }

  // Initial Sample Past Papers & Notes for Thakshila E-Library
  const samples = [
    {
      id: 'res-ol-math-2025',
      title: 'G.C.E. O/L Mathematics Term 3 Past Paper (2025)',
      category: 'Past Papers',
      grade: 'G.C.E. O/L (Grade 10-11)',
      subject: 'Mathematics',
      year: '2025',
      description: 'Official Thakshila College Gampaha Grade 11 Third Term Evaluation Paper I & II with revision guidelines.',
      fileName: 'TCG_OL_Mathematics_2025.pdf',
      storedFile: 'res-ol-math-2025.pdf',
      mimeType: 'application/pdf',
      fileSize: '1.4 MB',
      externalUrl: '',
      uploadedBy: 'Thakshila Academic Unit',
      downloads: 148,
      createdAt: '2026-02-15T08:00:00.000Z',
      lines: [
        'Grade: G.C.E. O/L (Grade 11) | Subject: Mathematics | Term: 3rd Term (2025)',
        '--------------------------------------------------------------------------',
        'Section A - Short Structured Questions (Answer all questions - 2 Hours)',
        '1. Calculate the compound interest on Rs. 50,000 at 8% per annum for 2 years.',
        '2. Factorize completely: x^2 - 7x + 12.',
        '3. Solve the inequality: 3x - 5 <= 16 and represent on a number line.',
        '4. Find the volume of a right circular cylinder with radius 7 cm and height 10 cm.',
        '5. A fair die is rolled once. Find the probability of obtaining a prime number.',
        '',
        'Prepared by the Mathematics Department, Thakshila College - Gampaha.'
      ]
    },
    {
      id: 'res-ol-sci-2025',
      title: 'G.C.E. O/L Science Model Paper & Marking Guide',
      category: 'Model Papers',
      grade: 'G.C.E. O/L (Grade 10-11)',
      subject: 'Science',
      year: '2025',
      description: 'Structured Biology, Chemistry, and Physics revision questions designed for G.C.E. O/L candidates.',
      fileName: 'TCG_OL_Science_Model_Paper.pdf',
      storedFile: 'res-ol-sci-2025.pdf',
      mimeType: 'application/pdf',
      fileSize: '1.2 MB',
      externalUrl: '',
      uploadedBy: 'Thakshila Science Faculty',
      downloads: 124,
      createdAt: '2026-03-01T08:00:00.000Z',
      lines: [
        'Grade: G.C.E. O/L | Subject: Science | Model Revision Paper',
        '--------------------------------------------------------------------------',
        '1. Explain the role of chlorophyll during photosynthesis and write the balanced equation.',
        '2. Draw the dot-and-cross diagram for Sodium Chloride (NaCl) ionic bonding.',
        '3. State Newtons Second Law of Motion and calculate the force needed to accelerate a 4 kg mass at 3 m/s^2.',
        '4. Differentiate between aerobic and anaerobic cellular respiration.',
        '',
        'Thakshila College - Gampaha | E-Library Digital Study Resource.'
      ]
    },
    {
      id: 'res-al-physics-2025',
      title: 'G.C.E. A/L Physics Unit 01-03 Summary Notes & Formula Sheet',
      category: 'Study Notes',
      grade: 'G.C.E. A/L (Grade 12-13)',
      subject: 'Physics',
      year: '2025',
      description: 'Essential formula compendium covering Measurements, Mechanics, and Oscillations & Waves.',
      fileName: 'TCG_AL_Physics_Formulas.pdf',
      storedFile: 'res-al-physics-2025.pdf',
      mimeType: 'application/pdf',
      fileSize: '1.8 MB',
      externalUrl: '',
      uploadedBy: 'Physical Science Unit',
      downloads: 165,
      createdAt: '2026-03-10T08:00:00.000Z',
      lines: [
        'Grade: G.C.E. A/L (Grade 12-13) | Subject: Physics | Essential Revision Notes',
        '--------------------------------------------------------------------------',
        'Unit 1: Units & Dimensions - Dimensional homogeneity checks, Vernier & Micrometer scales.',
        'Unit 2: Kinematics & Dynamics - Equations of uniform acceleration, Projectile trajectory, Conservation of Momentum.',
        'Unit 3: Work, Energy & Power - Work-Energy theorem, Rotational kinetic energy I*omega^2 / 2.',
        'Unit 4: Waves - Progressive wave equation y = A sin(wt - kx), Doppler effect.',
        '',
        'Thakshila College - Gampaha | Advanced Level Science Section.'
      ]
    },
    {
      id: 'res-ict-grade8-2025',
      title: 'Grade 8 Information & Communication Technology Term Paper',
      category: 'Term Test Papers',
      grade: 'Grade 6 – 9',
      subject: 'ICT',
      year: '2025',
      description: 'Term evaluation paper covering Number Systems, Logic Gates basics, and Flowcharting.',
      fileName: 'TCG_Grade8_ICT_Term_Paper.pdf',
      storedFile: 'res-ict-grade8-2025.pdf',
      mimeType: 'application/pdf',
      fileSize: '950 KB',
      externalUrl: '',
      uploadedBy: 'Thakshila IT Unit',
      downloads: 98,
      createdAt: '2026-04-02T08:00:00.000Z',
      lines: [
        'Grade: Junior Secondary (Grade 8) | Subject: ICT | Term Test Revision',
        '--------------------------------------------------------------------------',
        '1. Convert the decimal number 45 to its Binary equivalent.',
        '2. Name two input devices and two output devices used in a school smart classroom.',
        '3. Draw a simple flowchart to read two numbers and display the larger number.',
        '4. Explain the importance of strong passwords and safe internet practices.',
        '',
        'Thakshila College - Gampaha | Thakshila IT Unit.'
      ]
    }
  ];

  const seeded = samples.map(({ lines, ...meta }) => {
    try {
      const filePath = path.join(UPLOADS_DIR, meta.storedFile);
      if (!fs.existsSync(filePath)) {
        const buf = createSamplePdfBuffer(meta.title, lines);
        fs.writeFileSync(filePath, buf);
      }
    } catch {}
    return { ...meta, lines };
  });

  inMemoryResourcesStore = seeded;
  writeResourcesStore(seeded);
  return seeded;
}

function writeResourcesStore(list) {
  inMemoryResourcesStore = list;
  try {
    fs.mkdirSync(path.dirname(RESOURCES_DB_PATH), { recursive: true });
    fs.writeFileSync(RESOURCES_DB_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // Read-only serverless environment fallback
  }
}

// ============================================================
// 1. PUBLIC WEBSITE DATA (Public content only, NEVER auth/users!)
// ============================================================
apiApp.get('/api/data', (req, res) => {
  const db = readDb();
  res.json({
    settings: db.settings || {},
    news: db.news || [],
    sports: db.sports || [],
    diary: db.diary || [],
    principals: db.principals || [],
    posts: db.news || []
  });
});

// ============================================================
// 2. PUBLIC STUDENT LOGIN (Only student access, no Admin hint!)
// ============================================================
apiApp.post('/api/student/login', (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const store = readAuthStore();
  const cleanUser = String(username).trim();

  const limitStatus = checkRateLimit(store, req, 'student', cleanUser);
  if (limitStatus.locked) {
    recordAudit(store, {
      action: 'STUDENT_LOCKOUT_BLOCKED',
      username: cleanUser || 'unknown',
      name: 'Student Portal Visitor',
      role: 'student',
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      details: `Blocked during 15-min lockout (${limitStatus.remainingMin}m left)`
    });
    writeAuthStore(store);
    return res.status(429).json({
      success: false,
      locked: true,
      remainingMin: limitStatus.remainingMin,
      message: `Too many incorrect attempts. Student login locked for ${limitStatus.remainingMin} minute(s).`
    });
  }

  const validUser = cleanUser.toLowerCase() === store.studentAccess.username.toLowerCase();
  const validPass = verifySecret(password, store.studentAccess.passwordHash);

  if (!validUser || !validPass) {
    const attemptResult = recordFailedAttempt(store, req, 'student', cleanUser);
    recordAudit(store, {
      action: attemptResult.newlyLocked ? 'STUDENT_LOCKED' : 'STUDENT_LOGIN_FAILED',
      username: cleanUser || 'blank',
      name: 'Student Login Attempt',
      role: 'student',
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      details: attemptResult.newlyLocked
        ? 'Locked for 15 minutes after 3 failed attempts'
        : `Failed student login (${attemptResult.attemptsUsed}/3)`
    });
    writeAuthStore(store);

    if (attemptResult.newlyLocked) {
      return res.status(429).json({
        success: false,
        locked: true,
        remainingMin: 15,
        message: 'Too many incorrect attempts (3/3). Student login is locked for 15 minutes.'
      });
    }

    return res.status(401).json({
      success: false,
      attemptsRemaining: attemptResult.attemptsRemaining,
      message: `Invalid student username or password. (${attemptResult.attemptsRemaining} attempt(s) remaining)`
    });
  }

  clearRateLimit(store, req, 'student', cleanUser);
  const { token } = createSessionForUser(store, req, {
    id: 'student-portal',
    username: store.studentAccess.username,
    name: 'Student E-Library User',
    role: 'student'
  });

  recordAudit(store, {
    action: 'LOGIN_SUCCESS',
    username: store.studentAccess.username,
    name: 'Student Portal User',
    role: 'student',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: 'Logged in to E-Library Student Portal'
  });
  writeAuthStore(store);

  return res.json({
    success: true,
    user: sanitizeUserForClient({ role: 'student', username: store.studentAccess.username }),
    token
  });
});

// ============================================================
// 3. HIDDEN CONTROL DESK LOGIN (Admin & Master Developer)
// ============================================================
apiApp.post('/api/auth/login', (req, res) => {
  const { username = '', password = '', securityPin = '', loginMode = 'admin' } = req.body || {};
  const store = readAuthStore();
  const cleanUser = String(username).trim().toLowerCase();

  const limitStatus = checkRateLimit(store, req, 'staff', cleanUser);
  if (limitStatus.locked) {
    recordAudit(store, {
      action: 'LOGIN_LOCKED_BLOCKED',
      username: cleanUser || 'unknown',
      name: 'Control Desk Attempt',
      role: loginMode === 'developer' ? 'developer' : 'admin',
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      details: `Locked out (${limitStatus.remainingMin}m remaining)`
    });
    writeAuthStore(store);
    return res.status(429).json({
      success: false,
      locked: true,
      remainingMin: limitStatus.remainingMin,
      message: `Security Lockout Active: 3 failed attempts reached. Try again in ${limitStatus.remainingMin} minute(s).`
    });
  }

  const user = (store.users || []).find((u) => u.username.toLowerCase() === cleanUser);

  // Reject suspended accounts immediately
  if (user && user.active === false) {
    recordAudit(store, {
      action: 'LOGIN_SUSPENDED_BLOCKED',
      username: user.username,
      name: user.name,
      role: user.role,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      details: 'Attempted login into suspended admin account'
    });
    writeAuthStore(store);
    return res.status(403).json({
      success: false,
      message: 'This administrator account has been suspended by the Master Developer.'
    });
  }

  let valid = Boolean(user) && verifySecret(password, user.passwordHash);

  // Developer Master Login enforces high-security PIN verification
  if (valid && user.role === 'developer') {
    if (!securityPin || !verifySecret(String(securityPin).trim(), user.pinHash)) {
      valid = false;
    }
  } else if (valid && loginMode === 'developer' && user.role !== 'developer') {
    // Prevent non-developer from using developer mode
    valid = false;
  }

  if (!valid) {
    const attemptResult = recordFailedAttempt(store, req, 'staff', cleanUser);
    recordAudit(store, {
      action: attemptResult.newlyLocked ? 'LOCKOUT_TRIGGERED' : 'LOGIN_FAILED',
      username: cleanUser || 'blank',
      name: user ? user.name : 'Unknown Intruder',
      role: user ? user.role : loginMode,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      details: attemptResult.newlyLocked
        ? 'Account/IP locked for 15 minutes after 3 failed login attempts'
        : `Invalid credentials (${attemptResult.attemptsUsed}/3)`
    });
    writeAuthStore(store);

    if (attemptResult.newlyLocked) {
      return res.status(429).json({
        success: false,
        locked: true,
        remainingMin: 15,
        message: 'Security Lockout: 3 failed login attempts detected. Access locked for 15 minutes.'
      });
    }

    return res.status(401).json({
      success: false,
      attemptsRemaining: attemptResult.attemptsRemaining,
      message: `Invalid credentials. (${attemptResult.attemptsRemaining} attempt(s) remaining before 15-min lockout)`
    });
  }

  clearRateLimit(store, req, 'staff', cleanUser);
  user.lastLoginAt = new Date().toISOString();
  const { token } = createSessionForUser(store, req, user);

  recordAudit(store, {
    action: 'LOGIN_SUCCESS',
    username: user.username,
    name: user.name,
    role: user.role,
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: user.role === 'developer' ? 'Developer Master Authentication Verified' : 'Administrator Logged In'
  });
  writeAuthStore(store);

  return res.json({
    success: true,
    user: sanitizeUserForClient(user),
    token
  });
});

// Verify active session token on page load / refresh
apiApp.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.authUser });
});

// Explicit server-side Logout + Audit Log
apiApp.post('/api/auth/logout', requireAuth, (req, res) => {
  const store = readAuthStore();
  store.sessions = (store.sessions || []).filter((s) => s.sid !== req.authSessionId);

  recordAudit(store, {
    action: 'LOGOUT',
    username: req.authUser.username,
    name: req.authUser.name,
    role: req.authUser.role,
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: 'User logged out cleanly'
  });
  writeAuthStore(store);

  res.json({ success: true });
});

// Change Own Password (Admin & Developer - username is STRICTLY immutable!)
apiApp.post('/api/auth/change-password', requireAdminOrDev, (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body || {};
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long.'
    });
  }

  const store = readAuthStore();
  const user = (store.users || []).find((u) => u.id === req.authUser.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Account not found.' });
  }

  if (!verifySecret(currentPassword, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect.'
    });
  }

  user.passwordHash = hashSecret(newPassword);
  user.passwordUpdatedAt = new Date().toISOString();

  recordAudit(store, {
    action: 'PASSWORD_CHANGED',
    username: user.username,
    name: user.name,
    role: user.role,
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: 'User changed their account password'
  });
  writeAuthStore(store);

  res.json({ success: true, message: 'Your password has been updated securely.' });
});

// Developer-Only: Change Master Security PIN
apiApp.post('/api/auth/change-pin', requireDeveloper, (req, res) => {
  const { currentPassword = '', currentPin = '', newPin = '' } = req.body || {};
  if (!newPin || String(newPin).trim().length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New Master Security PIN must be at least 6 characters.'
    });
  }

  const store = readAuthStore();
  const devUser = (store.users || []).find((u) => u.id === req.authUser.id);
  if (!devUser) {
    return res.status(404).json({ success: false, message: 'Developer account not found.' });
  }

  if (
    !verifySecret(currentPassword, devUser.passwordHash) ||
    !verifySecret(String(currentPin).trim(), devUser.pinHash)
  ) {
    return res.status(401).json({
      success: false,
      message: 'Current password or current Master PIN is incorrect.'
    });
  }

  devUser.pinHash = hashSecret(String(newPin).trim());
  recordAudit(store, {
    action: 'MASTER_PIN_CHANGED',
    username: devUser.username,
    name: devUser.name,
    role: 'developer',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: 'Developer updated Master Security PIN'
  });
  writeAuthStore(store);

  res.json({ success: true, message: 'Master Security PIN updated successfully.' });
});

// ============================================================
// 4. DEVELOPER-ONLY ADMIN MANAGEMENT, SESSIONS & AUDIT LOGS
// ============================================================
apiApp.get('/api/admin/users', requireDeveloper, (req, res) => {
  const store = readAuthStore();
  const list = (store.users || []).map((u) => sanitizeUserForClient(u));
  res.json(list);
});

apiApp.post('/api/admin/users', requireDeveloper, (req, res) => {
  const { username = '', password = '', name = '', phone = '', gmail = '' } = req.body || {};
  const cleanUsername = String(username).trim().toLowerCase();

  if (!/^[a-z0-9._-]{3,32}$/.test(cleanUsername)) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 3–32 characters (letters, numbers, dot, underscore, hyphen).'
    });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long.'
    });
  }
  if (!name.trim() || !phone.trim() || !gmail.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name, Phone Number, and Gmail are all required.'
    });
  }

  const store = readAuthStore();
  if (
    cleanUsername === store.studentAccess.username.toLowerCase() ||
    (store.users || []).some((u) => u.username.toLowerCase() === cleanUsername)
  ) {
    return res.status(409).json({
      success: false,
      message: 'An account with this username already exists.'
    });
  }

  const newAdmin = {
    id: `admin-${crypto.randomUUID()}`,
    username: cleanUsername,
    role: 'admin',
    name: name.trim(),
    phoneEnc: encryptText(phone.trim()),
    gmailEnc: encryptText(gmail.trim()),
    passwordHash: hashSecret(password),
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: req.authUser.username,
    lastLoginAt: null
  };

  store.users.push(newAdmin);
  recordAudit(store, {
    action: 'ADMIN_CREATED',
    username: req.authUser.username,
    name: req.authUser.name,
    role: 'developer',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: `Created admin '${newAdmin.username}' (${newAdmin.name})`
  });
  writeAuthStore(store);

  res.status(201).json({ success: true, user: sanitizeUserForClient(newAdmin) });
});

apiApp.patch('/api/admin/users/:id/status', requireDeveloper, (req, res) => {
  const { id } = req.params;
  const { active } = req.body || {};
  const store = readAuthStore();
  const target = (store.users || []).find((u) => u.id === id);

  if (!target) {
    return res.status(404).json({ success: false, message: 'Admin user not found.' });
  }
  if (target.role === 'developer') {
    return res.status(400).json({ success: false, message: 'Master Developer account cannot be disabled.' });
  }

  target.active = Boolean(active);
  if (!target.active) {
    // Immediately revoke any active sessions for suspended user
    store.sessions = (store.sessions || []).filter((s) => s.uid !== target.id);
  }

  recordAudit(store, {
    action: target.active ? 'ADMIN_ACTIVATED' : 'ADMIN_SUSPENDED',
    username: req.authUser.username,
    name: req.authUser.name,
    role: 'developer',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: `${target.active ? 'Activated' : 'Suspended'} admin '${target.username}'`
  });
  writeAuthStore(store);

  res.json({ success: true, user: sanitizeUserForClient(target) });
});

apiApp.delete('/api/admin/users/:id', requireDeveloper, (req, res) => {
  const { id } = req.params;
  const store = readAuthStore();
  const target = (store.users || []).find((u) => u.id === id);

  if (!target) {
    return res.status(404).json({ success: false, message: 'Admin user not found.' });
  }
  if (target.role === 'developer') {
    return res.status(400).json({ success: false, message: 'Master Developer account cannot be deleted.' });
  }

  store.users = store.users.filter((u) => u.id !== id);
  store.sessions = (store.sessions || []).filter((s) => s.uid !== id);

  recordAudit(store, {
    action: 'ADMIN_DELETED',
    username: req.authUser.username,
    name: req.authUser.name,
    role: 'developer',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: `Deleted admin '${target.username}' (${target.name})`
  });
  writeAuthStore(store);

  res.json({ success: true, id });
});

// Active Sessions Tracker (Developer sees who is currently logged in)
apiApp.get('/api/admin/sessions', requireDeveloper, (req, res) => {
  const store = readAuthStore();
  const now = Date.now();
  const activeList = (store.sessions || [])
    .filter((s) => s.expiresAt > now)
    .map((s) => ({
      ...s,
      isCurrent: s.sid === req.authSessionId
    }));
  res.json(activeList);
});

// Force-Logout any session by SID
apiApp.delete('/api/admin/sessions/:sid', requireDeveloper, (req, res) => {
  const { sid } = req.params;
  const store = readAuthStore();
  const targetSession = (store.sessions || []).find((s) => s.sid === sid);

  if (!targetSession) {
    return res.status(404).json({ success: false, message: 'Session not found or already ended.' });
  }

  store.sessions = store.sessions.filter((s) => s.sid !== sid);
  recordAudit(store, {
    action: 'FORCED_LOGOUT',
    username: req.authUser.username,
    name: req.authUser.name,
    role: 'developer',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: `Developer forced logout of '${targetSession.username}' (${targetSession.role})`
  });
  writeAuthStore(store);

  res.json({ success: true, sid });
});

// Full Security Audit Log (Who Logged In & Logged Out)
apiApp.get('/api/admin/audit-logs', requireDeveloper, (req, res) => {
  const store = readAuthStore();
  res.json(store.auditLogs || []);
});

// Common Student Portal Credentials Config (Developer-only)
apiApp.get('/api/admin/student-config', requireDeveloper, (req, res) => {
  const store = readAuthStore();
  res.json({
    username: store.studentAccess.username,
    updatedAt: store.studentAccess.updatedAt,
    updatedBy: store.studentAccess.updatedBy
  });
});

apiApp.put('/api/admin/student-config', requireDeveloper, (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const store = readAuthStore();

  const cleanUser = String(username).trim().toLowerCase();
  if (cleanUser) {
    if (!/^[a-z0-9._-]{3,32}$/.test(cleanUser)) {
      return res.status(400).json({ success: false, message: 'Invalid student username format.' });
    }
    if ((store.users || []).some((u) => u.username.toLowerCase() === cleanUser)) {
      return res.status(409).json({ success: false, message: 'Cannot collide with an Admin username.' });
    }
    store.studentAccess.username = cleanUser;
  }

  if (password && String(password).trim()) {
    if (String(password).trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Student password must be at least 6 characters.' });
    }
    store.studentAccess.passwordHash = hashSecret(String(password).trim());
  }

  store.studentAccess.updatedAt = new Date().toISOString();
  store.studentAccess.updatedBy = req.authUser.username;

  recordAudit(store, {
    action: 'STUDENT_ACCESS_UPDATED',
    username: req.authUser.username,
    name: req.authUser.name,
    role: 'developer',
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    details: `Updated Common Student Login (${store.studentAccess.username})`
  });
  writeAuthStore(store);

  res.json({
    success: true,
    username: store.studentAccess.username,
    updatedAt: store.studentAccess.updatedAt
  });
});

// ============================================================
// 5. E-LIBRARY PAST PAPERS & STUDENT RESOURCES
// ============================================================
apiApp.get('/api/resources', (req, res) => {
  const list = readResourcesStore();
  res.json(list);
});

apiApp.post('/api/resources', requireAdminOrDev, (req, res) => {
  const {
    title = '',
    category = 'Past Papers',
    grade = 'G.C.E. O/L (Grade 10-11)',
    subject = 'General',
    year = String(new Date().getFullYear()),
    description = '',
    fileName = '',
    fileBase64 = '',
    mimeType = 'application/pdf',
    externalUrl = ''
  } = req.body || {};

  if (!title.trim()) {
    return res.status(400).json({ error: 'Resource title is required.' });
  }
  if (!fileBase64 && !externalUrl.trim()) {
    return res.status(400).json({ error: 'Please upload a PDF/document file or provide a resource URL.' });
  }

  const list = readResourcesStore();
  const id = `res-${Date.now()}`;
  let storedFile = '';
  let fileSize = 'External Link';
  let finalFileName = fileName ? path.basename(fileName) : `${id}.pdf`;

  if (fileBase64) {
    try {
      const base64Part = String(fileBase64).includes(',')
        ? String(fileBase64).split(',')[1]
        : String(fileBase64);
      const buffer = Buffer.from(base64Part, 'base64');
      const safeExt = path.extname(finalFileName).replace(/[^a-zA-Z0-9.]/g, '') || '.pdf';
      storedFile = `${id}${safeExt}`;
      try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        fs.writeFileSync(path.join(UPLOADS_DIR, storedFile), buffer);
      } catch {
        // Read-only serverless fallback
      }
      fileSize = buffer.length >= 1024 * 1024
        ? `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(buffer.length / 1024))} KB`;
    } catch (err) {
      return res.status(400).json({ error: 'Invalid uploaded file data.' });
    }
  }

  const newResource = {
    id,
    title: title.trim(),
    category: category.trim() || 'Past Papers',
    grade: grade.trim() || 'General',
    subject: subject.trim() || 'General',
    year: String(year).trim(),
    description: description.trim(),
    fileName: finalFileName,
    storedFile,
    fileBase64: fileBase64 || '',
    mimeType,
    fileSize,
    externalUrl: externalUrl.trim(),
    uploadedBy: req.authUser?.name || 'Administrator',
    downloads: 0,
    createdAt: new Date().toISOString()
  };

  list.unshift(newResource);
  writeResourcesStore(list);
  res.status(201).json(newResource);
});

apiApp.delete('/api/resources/:id', requireAdminOrDev, (req, res) => {
  const { id } = req.params;
  const list = readResourcesStore();
  const target = list.find((r) => r.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  if (target.storedFile) {
    try {
      const filePath = path.join(UPLOADS_DIR, path.basename(target.storedFile));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {}
  }

  const next = list.filter((r) => r.id !== id);
  writeResourcesStore(next);
  res.json({ success: true, id });
});

apiApp.get('/api/resources/:id/download', (req, res) => {
  const { id } = req.params;
  const list = readResourcesStore();
  const target = list.find((r) => r.id === id);

  if (!target) {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  target.downloads = (target.downloads || 0) + 1;
  writeResourcesStore(list);

  if (target.storedFile) {
    try {
      const filePath = path.join(UPLOADS_DIR, path.basename(target.storedFile));
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', target.mimeType || 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${(target.fileName || 'resource.pdf').replace(/"/g, '')}"`
        );
        return fs.createReadStream(filePath).pipe(res);
      }
    } catch {}
  }

  if (target.fileBase64) {
    try {
      const base64Part = String(target.fileBase64).includes(',')
        ? String(target.fileBase64).split(',')[1]
        : String(target.fileBase64);
      const buffer = Buffer.from(base64Part, 'base64');
      res.setHeader('Content-Type', target.mimeType || 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${(target.fileName || 'resource.pdf').replace(/"/g, '')}"`
      );
      return res.end(buffer);
    } catch {}
  }

  if (target.externalUrl) {
    return res.redirect(target.externalUrl);
  }

  // Synthesize genuine sample PDF so downloads NEVER fail
  const pdfBuf = createSamplePdfBuffer(target.title, target.lines || [
    `Grade: ${target.grade || 'General'} | Subject: ${target.subject || 'General'} | Year: ${target.year || '2025'}`,
    '--------------------------------------------------------------------------',
    'Official Thakshila College - Gampaha Digital Past Paper / Study Resource',
    'Available for students on the Thakshila E-Library portal.'
  ]);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${(target.fileName || `${target.title}.pdf`).replace(/"/g, '')}"`
  );
  return res.end(pdfBuf);
});

// ============================================================
// 6. PROTECTED WEBSITE CONTENT ENDPOINTS (Admin or Developer ONLY)
// ============================================================
apiApp.put('/api/settings', requireAdminOrDev, (req, res) => {
  const db = readDb();
  db.settings = {
    ...db.settings,
    ...(req.body || {})
  };
  writeDb(db);
  res.json({ success: true, settings: db.settings });
});

// News CRUD
apiApp.get('/api/news', (req, res) => {
  const db = readDb();
  res.json(db.news || []);
});

apiApp.post('/api/news', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const {
    title = '',
    content = '',
    image = '',
    eventDate = '',
    eventTime = '',
    location = '',
    category = 'General',
    priority = 'normal',
    audience = 'All Students & Parents',
    author,
    authorRole,
    pinned = false
  } = req.body || {};

  if (!title.trim() && !content.trim()) {
    return res.status(400).json({ error: 'News title or content is required.' });
  }

  const newNews = {
    id: `news-${Date.now()}`,
    type: 'news',
    title: title.trim(),
    content: content.trim(),
    image: image || '',
    eventDate: eventDate || '',
    eventTime: eventTime || '',
    location: location || '',
    category: category || 'General',
    priority: priority || 'normal',
    audience: audience || 'All Students & Parents',
    author: author || req.authUser.name || 'Thakshila College Admin',
    authorRole: authorRole || (req.authUser.role === 'developer' ? 'Master Administrator' : 'Official Editorial Admin'),
    createdAt: new Date().toISOString(),
    likes: 0,
    pinned: Boolean(pinned)
  };

  if (!Array.isArray(db.news)) db.news = [];
  db.news.unshift(newNews);
  db.posts = db.news;
  writeDb(db);
  res.status(201).json(newNews);
});

apiApp.put('/api/news/:id', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const idx = (db.news || []).findIndex((n) => n.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'News item not found.' });
  }

  const updated = {
    ...db.news[idx],
    ...req.body,
    id,
    updatedAt: new Date().toISOString()
  };

  db.news[idx] = updated;
  db.posts = db.news;
  writeDb(db);
  res.json(updated);
});

apiApp.delete('/api/news/:id', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const initialLen = (db.news || []).length;
  db.news = (db.news || []).filter((n) => n.id !== id);
  db.posts = db.news;

  if (db.news.length === initialLen) {
    return res.status(404).json({ error: 'News item not found.' });
  }

  writeDb(db);
  res.json({ success: true, id });
});

apiApp.post('/api/news/:id/like', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { delta = 1 } = req.body || {};
  const item = (db.news || []).find((n) => n.id === id);

  if (!item) {
    return res.status(404).json({ error: 'News item not found.' });
  }

  item.likes = Math.max(0, (item.likes || 0) + (delta >= 0 ? 1 : -1));
  writeDb(db);
  res.json(item);
});

// ============================================================
// Sports & Athletics CRUD
// ============================================================
apiApp.get('/api/sports', (req, res) => {
  const db = readDb();
  res.json(db.sports || []);
});

apiApp.post('/api/sports', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const {
    title = '',
    content = '',
    summary = '',
    image = '',
    date = '',
    category = 'Cricket',
    tournament = '',
    result = '',
    venue = '',
    author = 'Thakshila College Sports Council',
    pinned = false
  } = req.body || {};

  if (!title.trim()) {
    return res.status(400).json({ error: 'Sports post title is required.' });
  }

  const newPost = {
    id: `sports-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    summary: (summary || content.slice(0, 120)).trim(),
    image: image || '/Pictures/Front of School.jpeg',
    date: date || new Date().toISOString().split('T')[0],
    category: category || 'Cricket',
    tournament: (tournament || '').trim(),
    result: (result || '').trim(),
    venue: (venue || '').trim(),
    author: author || 'Thakshila College Sports Council',
    likes: 0,
    pinned: Boolean(pinned),
    createdAt: new Date().toISOString()
  };

  db.sports = [newPost, ...(db.sports || [])];
  writeDb(db);
  res.status(201).json(newPost);
});

apiApp.put('/api/sports/:id', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const idx = (db.sports || []).findIndex((s) => s.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Sports post not found.' });
  }

  const existing = db.sports[idx];
  const payload = req.body || {};

  db.sports[idx] = {
    ...existing,
    ...payload,
    id: existing.id,
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json(db.sports[idx]);
});

apiApp.delete('/api/sports/:id', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const initialLen = (db.sports || []).length;
  db.sports = (db.sports || []).filter((s) => s.id !== id);

  if (db.sports.length === initialLen) {
    return res.status(404).json({ error: 'Sports post not found.' });
  }

  writeDb(db);
  res.json({ success: true, id });
});

apiApp.post('/api/sports/:id/like', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { delta = 1 } = req.body || {};
  const item = (db.sports || []).find((s) => s.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Sports post not found.' });
  }

  item.likes = Math.max(0, (item.likes || 0) + (delta >= 0 ? 1 : -1));
  writeDb(db);
  res.json(item);
});

// Thakshila Diary CRUD
apiApp.get('/api/diary', (req, res) => {
  const db = readDb();
  res.json(db.diary || []);
});

apiApp.post('/api/diary', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const {
    title = '',
    content = '',
    summary = '',
    image = '',
    date = '',
    category = 'School Life',
    author,
    tags = []
  } = req.body || {};

  if (!title.trim() && !content.trim()) {
    return res.status(400).json({ error: 'Diary title or story content is required.' });
  }

  const newDiary = {
    id: `diary-${Date.now()}`,
    title: title.trim(),
    summary: summary.trim(),
    content: content.trim(),
    image: image || '/Pictures/Front of School.jpeg',
    date: date || new Date().toISOString().split('T')[0],
    category: category || 'School Life',
    author: author || req.authUser.name || 'Thakshila College',
    tags: Array.isArray(tags)
      ? tags
      : String(tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
    createdAt: new Date().toISOString(),
    likes: 0
  };

  if (!Array.isArray(db.diary)) db.diary = [];
  db.diary.unshift(newDiary);
  writeDb(db);
  res.status(201).json(newDiary);
});

apiApp.put('/api/diary/:id', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const idx = (db.diary || []).findIndex((d) => d.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Diary entry not found.' });
  }

  const updated = {
    ...db.diary[idx],
    ...req.body,
    id,
    updatedAt: new Date().toISOString()
  };

  db.diary[idx] = updated;
  writeDb(db);
  res.json(updated);
});

apiApp.delete('/api/diary/:id', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const initialLen = (db.diary || []).length;
  db.diary = (db.diary || []).filter((d) => d.id !== id);

  if (db.diary.length === initialLen) {
    return res.status(404).json({ error: 'Diary entry not found.' });
  }

  writeDb(db);
  res.json({ success: true, id });
});

apiApp.post('/api/diary/:id/like', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { delta = 1 } = req.body || {};
  const entry = (db.diary || []).find((d) => d.id === id);

  if (!entry) {
    return res.status(404).json({ error: 'Diary entry not found.' });
  }

  entry.likes = Math.max(0, (entry.likes || 0) + (delta >= 0 ? 1 : -1));
  writeDb(db);
  res.json(entry);
});

// Principals CRUD Endpoints (Protected!)
apiApp.get('/api/principals', (req, res) => {
  const db = readDb();
  res.json(db.principals || []);
});

apiApp.put('/api/principals', requireAdminOrDev, (req, res) => {
  const db = readDb();
  const list = req.body;
  if (Array.isArray(list)) {
    db.principals = list;
    writeDb(db);
    return res.json({ success: true, principals: db.principals });
  }
  return res.status(400).json({ success: false, message: 'Expected array of principals' });
});

apiApp.post('/api/principals', requireAdminOrDev, (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.principals)) db.principals = [];
  const p = req.body || {};
  if (p.id) {
    const idx = db.principals.findIndex((item) => item.id === p.id);
    if (idx !== -1) {
      db.principals[idx] = { ...db.principals[idx], ...p };
    } else {
      db.principals.unshift(p);
    }
  } else {
    p.id = 'principal_' + Date.now();
    db.principals.unshift(p);
  }
  writeDb(db);
  res.json({ success: true, principal: p, principals: db.principals });
});

apiApp.delete('/api/principals/:id', requireAdminOrDev, (req, res) => {
  const db = readDb();
  if (!Array.isArray(db.principals)) db.principals = [];
  db.principals = db.principals.filter((p) => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, principals: db.principals });
});

// Public Contact Inquiries Submission
apiApp.post('/api/contact', (req, res) => {
  const db = readDb();
  const { name, email, phone, subject, message } = req.body || {};

  if (!name || (!email && !phone) || !message) {
    return res.status(400).json({ error: 'Name, contact detail, and message are required.' });
  }

  const inquiry = {
    id: `inquiry-${Date.now()}`,
    name: name.trim(),
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    subject: (subject || 'General Inquiry').trim(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.contactInquiries)) db.contactInquiries = [];
  db.contactInquiries.unshift(inquiry);
  writeDb(db);
  res.status(201).json({ success: true, message: 'Message sent successfully!' });
});

export default apiApp;
