const leaveService = require('../services/leave.service');
const auditService = require('../services/audit.service');

const applyLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.applyLeave(req.user.id, req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Leave applied successfully.', data: leave });
  } catch (err) {
    next(err);
  }
};

const getLeaves = async (req, res, next) => {
  try {
    const { userId, status, page, limit } = req.query;

    // Employees can only see their own leaves
    const effectiveUserId = req.user.roleName === 'Employee' ? req.user.id : (userId ? parseInt(userId) : undefined);

    const result = await leaveService.getLeaves(req.companyId, {
      userId: effectiveUserId,
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const approveLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.approveLeave(
      parseInt(req.params.id), req.companyId, req.user.id
    );

    await auditService.logAction({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'LEAVE_APPROVED',
      entityType: 'leave_requests',
      entityId: leave.id,
      newValues: { status: 'Approved' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, message: 'Leave approved.', data: leave });
  } catch (err) {
    next(err);
  }
};

const rejectLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.rejectLeave(
      parseInt(req.params.id), req.companyId, req.user.id, req.body.rejectionReason
    );

    await auditService.logAction({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'LEAVE_REJECTED',
      entityType: 'leave_requests',
      entityId: leave.id,
      newValues: { status: 'Rejected', reason: req.body.rejectionReason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, message: 'Leave rejected.', data: leave });
  } catch (err) {
    next(err);
  }
};

const cancelLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.cancelLeave(
      parseInt(req.params.id), req.companyId, req.user.id
    );

    await auditService.logAction({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'LEAVE_CANCELLED',
      entityType: 'leave_requests',
      entityId: leave.id,
      newValues: { status: 'Cancelled' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, message: 'Leave cancelled.', data: leave });
  } catch (err) {
    next(err);
  }
};

module.exports = { applyLeave, getLeaves, approveLeave, rejectLeave, cancelLeave };
