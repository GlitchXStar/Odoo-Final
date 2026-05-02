const userService = require('../services/user.service');
const auditService = require('../services/audit.service');

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, isActive, roleId } = req.query;
    const result = await userService.getAllUsers(req.companyId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      roleId: roleId ? parseInt(roleId) : undefined,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id), req.companyId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Non-Admin cannot update their own user record
    if (req.user.roleName !== 'Admin' && id === req.user.id) {
      return res.status(403).json({ success: false, message: 'You cannot modify your own account.' });
    }

    // Only Admin can change roles
    if (req.body.roleId && req.user.roleName !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only Admin can change user roles.' });
    }

    const oldUser = await userService.getUserById(id, req.companyId);
    const user = await userService.updateUser(id, req.companyId, req.body);

    await auditService.logAction({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'USER_UPDATE',
      entityType: 'users',
      entityId: id,
      oldValues: oldUser,
      newValues: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, message: 'User updated.', data: user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await auditService.logAction({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'USER_DELETE',
      entityType: 'users',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const result = await userService.deleteUser(id, req.companyId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
