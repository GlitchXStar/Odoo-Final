const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const getAllUsers = async (companyId, { page = 1, limit = 20, isActive, roleId }) => {
  const offset = (page - 1) * limit;
  let sql = `SELECT u.id, u.company_id, u.role_id, u.email, u.login_id, u.first_name, u.last_name,
                    u.phone, u.is_active, u.is_first_login, u.last_login, u.created_at,
                    r.name AS role_name
             FROM users u
             INNER JOIN roles r ON u.role_id = r.id
             WHERE u.company_id = $1`;
  const params = [companyId];
  let idx = 2;

  if (isActive !== undefined) {
    sql += ` AND u.is_active = $${idx++}`;
    params.push(isActive);
  }
  if (roleId) {
    sql += ` AND u.role_id = $${idx++}`;
    params.push(roleId);
  }

  // Count total
  const countSql = sql.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM');
  const countResult = await query(countSql, params);
  const total = parseInt(countResult.rows[0].count);

  sql += ` ORDER BY u.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  return {
    users: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getUserById = async (id, companyId) => {
  const result = await query(
    `SELECT u.id, u.company_id, u.role_id, u.email, u.login_id, u.first_name, u.last_name,
            u.phone, u.is_active, u.is_first_login, u.last_login, u.created_at,
            r.name AS role_name
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1 AND u.company_id = $2`,
    [id, companyId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  return result.rows[0];
};

const updateUser = async (id, companyId, updates) => {
  const user = await getUserById(id, companyId);

  const fields = [];
  const params = [];
  let idx = 1;

  if (updates.firstName) { fields.push(`first_name = $${idx++}`); params.push(updates.firstName); }
  if (updates.lastName) { fields.push(`last_name = $${idx++}`); params.push(updates.lastName); }
  if (updates.phone !== undefined) { fields.push(`phone = $${idx++}`); params.push(updates.phone); }
  if (updates.roleId) { fields.push(`role_id = $${idx++}`); params.push(updates.roleId); }
  if (updates.isActive !== undefined) { fields.push(`is_active = $${idx++}`); params.push(updates.isActive); }
  if (updates.password) {
    const hash = await bcrypt.hash(updates.password, 12);
    fields.push(`password_hash = $${idx++}`);
    params.push(hash);
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update.', 400);
  }

  params.push(id, companyId);
  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx++} AND company_id = $${idx++}
     RETURNING id, company_id, role_id, email, login_id, first_name, last_name, phone, is_active, is_first_login, created_at`,
    params
  );

  return result.rows[0];
};

const deleteUser = async (id, companyId) => {
  const user = await getUserById(id, companyId);

  await query('DELETE FROM users WHERE id = $1 AND company_id = $2', [id, companyId]);

  return { message: 'User deleted successfully.' };
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
