const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

// ─── Auto Password Generation ───────────────────────────────────
const generateSecurePassword = (length = 12) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;

  const bytes = crypto.randomBytes(length);
  let password = '';

  // Guarantee at least one character from each category
  password += upper[bytes[0] % upper.length];
  password += lower[bytes[1] % lower.length];
  password += digits[bytes[2] % digits.length];
  password += symbols[bytes[3] % symbols.length];

  for (let i = 4; i < length; i++) {
    password += all[bytes[i] % all.length];
  }

  // Shuffle using Fisher-Yates with crypto randomness
  const arr = password.split('');
  const shuffleBytes = crypto.randomBytes(arr.length);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
};

// ─── Login ID Generation ────────────────────────────────────────
// Format: [CompanyCode2][Initials4][Year4][Serial4]
// Example: OIJODO20220001
const generateLoginId = async (companyId, firstName, lastName, joiningYear) => {
  // 1. Get company name for prefix
  const companyResult = await query('SELECT name FROM companies WHERE id = $1', [companyId]);
  if (companyResult.rows.length === 0) {
    throw new AppError('Company not found.', 404);
  }
  const companyName = companyResult.rows[0].name.replace(/[^A-Za-z]/g, '');
  const companyCode = companyName.substring(0, 2).toUpperCase();

  // 2. Employee initials (first 2 of first name + first 2 of last name)
  const fnClean = firstName.replace(/[^A-Za-z]/g, '');
  const lnClean = lastName.replace(/[^A-Za-z]/g, '');
  const initials = (fnClean.substring(0, 2) + lnClean.substring(0, 2)).toUpperCase();

  // 3. Year
  const yearStr = String(joiningYear);

  // 4. Get next serial for this company + year
  const serialResult = await query(
    `SELECT COALESCE(MAX(CAST(RIGHT(login_id, 4) AS INTEGER)), 0) AS max_serial
     FROM users
     WHERE company_id = $1
       AND login_id IS NOT NULL
       AND LENGTH(login_id) >= 14
       AND SUBSTRING(login_id, 7, 4) = $2`,
    [companyId, yearStr]
  );

  const nextSerial = (serialResult.rows[0].max_serial || 0) + 1;
  const serialStr = String(nextSerial).padStart(4, '0');

  const loginId = `${companyCode}${initials}${yearStr}${serialStr}`;

  // 5. Verify uniqueness (safety check)
  const existing = await query('SELECT id FROM users WHERE login_id = $1', [loginId]);
  if (existing.rows.length > 0) {
    // Extremely rare collision — append extra digit
    return `${companyCode}${initials}${yearStr}${String(nextSerial + 1).padStart(4, '0')}`;
  }

  return loginId;
};

// ─── Create User (Admin/HR only) ────────────────────────────────
const createUser = async ({ email, firstName, lastName, phone, companyId, roleId, dateOfJoining }) => {
  // Check if email already exists
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AppError('Email already registered.', 409);
  }

  // Verify company exists
  const company = await query('SELECT id, name FROM companies WHERE id = $1 AND is_active = true', [companyId]);
  if (company.rows.length === 0) {
    throw new AppError('Company not found or inactive.', 404);
  }

  // Verify role exists
  const role = await query('SELECT id FROM roles WHERE id = $1 AND is_active = true', [roleId]);
  if (role.rows.length === 0) {
    throw new AppError('Role not found or inactive.', 404);
  }

  // Auto-generate password
  const tempPassword = generateSecurePassword(12);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  // Auto-generate login ID
  const joiningYear = dateOfJoining
    ? new Date(dateOfJoining).getFullYear()
    : new Date().getFullYear();
  const loginId = await generateLoginId(companyId, firstName, lastName, joiningYear);

  const result = await query(
    `INSERT INTO users (company_id, role_id, email, password_hash, first_name, last_name, phone, login_id, is_first_login)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
     RETURNING id, company_id, role_id, email, first_name, last_name, phone, login_id, is_first_login, is_active, created_at`,
    [companyId, roleId, email, passwordHash, firstName, lastName, phone, loginId]
  );

  const user = result.rows[0];

  return {
    user,
    generatedPassword: tempPassword,
    loginId,
  };
};

// ─── Login (supports email OR login_id) ─────────────────────────
const login = async ({ identifier, password }) => {
  // Try matching by email first, then login_id
  const result = await query(
    `SELECT u.id, u.company_id, u.role_id, u.email, u.login_id, u.password_hash,
            u.first_name, u.last_name, u.is_active, u.is_first_login,
            r.name AS role_name
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1 OR u.login_id = $1`,
    [identifier]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid credentials.', 401);
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new AppError('Account is deactivated. Contact admin.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid credentials.', 401);
  }

  // Update last login
  await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

  const token = generateToken(user.id, user.company_id, user.role_id);

  delete user.password_hash;

  return { user, token };
};

// ─── Change Password ────────────────────────────────────────────
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const result = await query('SELECT id, password_hash, is_first_login FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  const user = result.rows[0];

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 401);
  }

  // Prevent reuse of same password
  const isSame = await bcrypt.compare(newPassword, user.password_hash);
  if (isSame) {
    throw new AppError('New password must be different from current password.', 400);
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  await query(
    'UPDATE users SET password_hash = $1, is_first_login = FALSE WHERE id = $2',
    [newHash, userId]
  );

  return { message: 'Password changed successfully.' };
};

// ─── JWT Token ──────────────────────────────────────────────────
const generateToken = (userId, companyId, roleId) => {
  return jwt.sign(
    { userId, companyId, roleId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = { createUser, login, changePassword, generateLoginId, generateSecurePassword };
