const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const getAllCompanies = async () => {
  const result = await query('SELECT * FROM companies WHERE is_active = true ORDER BY name');
  return result.rows;
};

const getCompanyById = async (id) => {
  const result = await query('SELECT * FROM companies WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    throw new AppError('Company not found.', 404);
  }
  return result.rows[0];
};

const createCompany = async (data) => {
  const result = await query(
    `INSERT INTO companies (name, code, email, phone, address, city, state, country, pincode, tax_id, logo_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [data.name, data.code, data.email, data.phone, data.address,
     data.city, data.state, data.country, data.pincode, data.taxId, data.logoUrl]
  );
  return result.rows[0];
};

const updateCompany = async (id, updates) => {
  await getCompanyById(id);

  const fields = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    name: 'name', email: 'email', phone: 'phone', address: 'address',
    city: 'city', state: 'state', country: 'country', pincode: 'pincode',
    taxId: 'tax_id', logoUrl: 'logo_url', isActive: 'is_active',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (updates[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      params.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update.', 400);
  }

  params.push(id);
  const result = await query(
    `UPDATE companies SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );

  return result.rows[0];
};

module.exports = { getAllCompanies, getCompanyById, createCompany, updateCompany };
