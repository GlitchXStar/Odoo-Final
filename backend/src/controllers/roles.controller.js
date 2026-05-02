const rolesSvc = require('../services/roles.service');

const getRoles = async (req, res, next) => {
  try {
    const data = await rolesSvc.getRoles(req.companyId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    const { company_id, ...permissions } = req.body;
    const data = await rolesSvc.updateRolePermissions(
      parseInt(req.params.id),
      permissions
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getRoles, updateRolePermissions };
