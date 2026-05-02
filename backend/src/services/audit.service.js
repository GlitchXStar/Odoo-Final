const { query } = require('../config/db');

const logAction = async ({ userId, companyId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent }) => {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, company_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, companyId, action, entityType, entityId,
       oldValues ? JSON.stringify(oldValues) : null,
       newValues ? JSON.stringify(newValues) : null,
       ipAddress, userAgent]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

const getAuditLogs = async (companyId, { entityType, entityId, userId, limit = 50, offset = 0 }) => {
  let sql = `SELECT * FROM audit_logs WHERE company_id = $1`;
  const params = [companyId];
  let idx = 2;

  if (entityType) {
    sql += ` AND entity_type = $${idx++}`;
    params.push(entityType);
  }
  if (entityId) {
    sql += ` AND entity_id = $${idx++}`;
    params.push(entityId);
  }
  if (userId) {
    sql += ` AND user_id = $${idx++}`;
    params.push(userId);
  }

  sql += ` ORDER BY timestamp DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

module.exports = { logAction, getAuditLogs };
