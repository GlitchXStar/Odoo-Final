const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const createHoliday = async (companyId, data) => {
  const result = await query(
    `INSERT INTO holidays (company_id, name, date, type, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [companyId, data.name, data.date, data.type || 'National', data.description]
  );
  return result.rows[0];
};

const getAllHolidays = async (companyId, { year } = {}) => {
  let sql = 'SELECT * FROM holidays WHERE company_id = $1 AND is_active = true';
  const params = [companyId];

  if (year) {
    sql += ' AND EXTRACT(YEAR FROM date) = $2';
    params.push(year);
  }

  sql += ' ORDER BY date ASC';
  const result = await query(sql, params);
  return result.rows;
};

const getHolidayById = async (id, companyId) => {
  const result = await query(
    'SELECT * FROM holidays WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Holiday not found.', 404);
  }
  return result.rows[0];
};

const deleteHoliday = async (id, companyId) => {
  await getHolidayById(id, companyId);
  await query('DELETE FROM holidays WHERE id = $1 AND company_id = $2', [id, companyId]);
  return { message: 'Holiday deleted successfully.' };
};

const isHoliday = async (companyId, date) => {
  const result = await query(
    'SELECT id, name FROM holidays WHERE company_id = $1 AND date = $2 AND is_active = true',
    [companyId, date]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

module.exports = { createHoliday, getAllHolidays, getHolidayById, deleteHoliday, isHoliday };
