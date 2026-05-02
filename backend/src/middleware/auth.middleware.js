const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data to ensure account is still active
    const result = await query(
      `SELECT u.id, u.company_id, u.role_id, u.email, u.login_id, u.first_name, u.last_name,
              u.is_active, u.is_first_login,
              r.name AS role_name, r.permissions
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    req.user = {
      id: user.id,
      companyId: user.company_id,
      roleId: user.role_id,
      roleName: user.role_name,
      email: user.email,
      loginId: user.login_id,
      firstName: user.first_name,
      lastName: user.last_name,
      isFirstLogin: user.is_first_login,
      permissions: user.permissions,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(err);
  }
};

module.exports = authMiddleware;
