const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const getRoles = async (companyId) => {
  const result = await query(
    `SELECT r.id, r.name, r.permissions, r.is_active,
            COUNT(u.id)::int AS user_count
     FROM roles r
     LEFT JOIN users u ON u.role_id = r.id AND u.company_id = $1 AND u.is_active = true
     WHERE r.is_active = true
     GROUP BY r.id
     ORDER BY r.id`,
    [companyId]
  );
  return result.rows;
};

const updateRolePermissions = async (roleId, permissions) => {
  const existing = await query('SELECT id FROM roles WHERE id = $1 AND is_active = true', [roleId]);
  if (existing.rows.length === 0) throw new AppError('Role not found.', 404);

  const result = await query(
    'UPDATE roles SET permissions = $1 WHERE id = $2 RETURNING *',
    [JSON.stringify(permissions), roleId]
  );
  return result.rows[0];
};

module.exports = { getRoles, updateRolePermissions };
