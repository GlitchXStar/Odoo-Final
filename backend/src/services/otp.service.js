const crypto = require('crypto');
const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');
const emailService = require('./email.service');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

// ─── Generate 6-digit OTP ───────────────────────────────────────
const generateOTP = () => {
  // Crypto-secure 6-digit number (100000–999999)
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0);
  return String(100000 + (num % 900000));
};

// ─── Request OTP ────────────────────────────────────────────────
const requestOTP = async (identifier) => {
  // Find user by email or login_id
  const userResult = await query(
    `SELECT u.id, u.email, u.first_name, u.is_active
     FROM users u
     WHERE u.email = $1 OR u.login_id = $1`,
    [identifier]
  );

  if (userResult.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  const user = userResult.rows[0];

  if (!user.is_active) {
    throw new AppError('Account is deactivated. Contact admin.', 403);
  }

  // Invalidate all existing unused OTPs for this user
  await query(
    `UPDATE otp_verifications SET is_used = TRUE
     WHERE user_id = $1 AND is_used = FALSE`,
    [user.id]
  );

  // Generate new OTP
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP
  await query(
    `INSERT INTO otp_verifications (user_id, otp_code, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, otpCode, expiresAt]
  );

  // Send OTP via email
  try {
    await emailService.sendOTPEmail(user.email, otpCode, user.first_name);
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
    throw new AppError('Failed to send OTP email. Please try again.', 500);
  }

  // Mask email for response (jo***@example.com)
  const [localPart, domain] = user.email.split('@');
  const maskedEmail = localPart.substring(0, 2) + '***@' + domain;

  return {
    message: 'OTP sent to your registered email.',
    email: maskedEmail,
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
  };
};

// ─── Verify OTP ─────────────────────────────────────────────────
const verifyOTP = async (identifier, otpCode) => {
  // Find user
  const userResult = await query(
    `SELECT u.id, u.company_id, u.role_id, u.email, u.login_id,
            u.first_name, u.last_name, u.is_active, u.is_first_login,
            r.name AS role_name
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1 OR u.login_id = $1`,
    [identifier]
  );

  if (userResult.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  const user = userResult.rows[0];

  if (!user.is_active) {
    throw new AppError('Account is deactivated. Contact admin.', 403);
  }

  // Get the latest unused, non-expired OTP for this user
  const otpResult = await query(
    `SELECT id, otp_code, expires_at, attempts
     FROM otp_verifications
     WHERE user_id = $1 AND is_used = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [user.id]
  );

  if (otpResult.rows.length === 0) {
    throw new AppError('No valid OTP found. Please request a new one.', 400);
  }

  const otpRecord = otpResult.rows[0];

  // Check max attempts
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    // Invalidate this OTP
    await query(
      'UPDATE otp_verifications SET is_used = TRUE WHERE id = $1',
      [otpRecord.id]
    );
    throw new AppError('Maximum OTP attempts exceeded. Please request a new OTP.', 429);
  }

  // Increment attempt counter
  await query(
    'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1',
    [otpRecord.id]
  );

  // Verify OTP code
  if (otpRecord.otp_code !== otpCode) {
    const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
    throw new AppError(
      `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      401
    );
  }

  // OTP is valid — mark as used
  await query(
    'UPDATE otp_verifications SET is_used = TRUE WHERE id = $1',
    [otpRecord.id]
  );

  // Update last login & clear first-login flag
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP, is_first_login = FALSE WHERE id = $1',
    [user.id]
  );

  // Generate JWT
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { userId: user.id, companyId: user.company_id, roleId: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { user, token };
};

module.exports = { requestOTP, verifyOTP };
