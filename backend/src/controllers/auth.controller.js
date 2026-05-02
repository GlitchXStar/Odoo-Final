const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');
const otpService = require('../services/otp.service');
const { sendWelcomeAdminEmail, sendCredentialsEmail } = require('../services/email.service');

const registerAdmin = async (req, res, next) => {
  try {
    const result = await authService.registerAdmin(req.body);

    await auditService.logAction({
      userId: result.user.id,
      companyId: result.company.id,
      action: 'ADMIN_REGISTERED',
      entityType: 'users',
      entityId: result.user.id,
      newValues: {
        email: result.user.email,
        loginId: result.loginId,
        companyName: result.company.name,
        companyCode: result.company.code,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Fire-and-forget — email failure must not block the registration response
    sendWelcomeAdminEmail(result.user.email, {
      firstName:   result.user.first_name,
      lastName:    result.user.last_name,
      loginId:     result.loginId,
      companyName: result.company.name,
      companyCode: result.company.code,
    }).catch((err) => console.error('Welcome email failed:', err.message));

    res.status(201).json({
      success: true,
      message: 'Registration successful. You can now log in with your email/Login ID and password.',
      data: {
        loginId: result.loginId,
        email: result.user.email,
        company: {
          id: result.company.id,
          name: result.company.name,
          code: result.company.code,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, companyId, roleId, dateOfJoining } = req.body;

    const result = await authService.createUser({
      email, firstName, lastName, phone,
      companyId: companyId || req.companyId,
      roleId, dateOfJoining,
    });

    await auditService.logAction({
      userId: req.user.id,
      companyId: companyId || req.companyId,
      action: 'USER_CREATED',
      entityType: 'users',
      entityId: result.user.id,
      newValues: { email, firstName, lastName, loginId: result.loginId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Fire-and-forget credentials email — includes company name for context
    sendCredentialsEmail(result.user.email, {
      firstName:         result.user.first_name,
      loginId:           result.loginId,
      temporaryPassword: result.generatedPassword,
      companyName:       result.user.company_name || '',
    }).catch((e) => console.error('Credentials email failed:', e.message));

    res.status(201).json({
      success: true,
      message: 'User created successfully. Credentials have been emailed to the user.',
      data: {
        user: result.user,
        credentials: {
          loginId: result.loginId,
          temporaryPassword: result.generatedPassword,
          email: result.user.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const result = await authService.login({ identifier, password });

    await auditService.logAction({
      userId: result.user.id,
      companyId: result.user.company_id,
      action: 'USER_LOGIN',
      entityType: 'users',
      entityId: result.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: result.user.is_first_login
        ? 'Login successful. Password change required.'
        : 'Login successful.',
      data: result,
      requirePasswordChange: result.user.is_first_login,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(req.user.id, {
      currentPassword, newPassword,
    });

    await auditService.logAction({
      userId: req.user.id,
      companyId: req.user.companyId,
      action: 'PASSWORD_CHANGED',
      entityType: 'users',
      entityId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const requestOTP = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const result = await otpService.requestOTP(identifier);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;

    const result = await otpService.verifyOTP(identifier, otp);

    await auditService.logAction({
      userId: result.user.id,
      companyId: result.user.company_id,
      action: 'USER_LOGIN_OTP',
      entityType: 'users',
      entityId: result.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'OTP verified. Login successful.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerAdmin, createUser, login, changePassword, requestOTP, verifyOTP };
