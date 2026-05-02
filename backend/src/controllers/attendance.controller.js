const attendanceService = require('../services/attendance.service');

const checkIn = async (req, res, next) => {
  try {
    const attendance = await attendanceService.checkIn(req.user.id, req.companyId);
    res.status(201).json({ success: true, message: 'Checked in successfully.', data: attendance });
  } catch (err) {
    next(err);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const attendance = await attendanceService.checkOut(req.user.id, req.companyId);
    res.json({ success: true, message: 'Checked out successfully.', data: attendance });
  } catch (err) {
    next(err);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { userId, date, month, year, page, limit } = req.query;

    // Employees can only see their own attendance
    const effectiveUserId = req.user.roleName === 'Employee' ? req.user.id : (userId ? parseInt(userId) : undefined);

    const result = await attendanceService.getAttendance(req.companyId, {
      userId: effectiveUserId,
      date,
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const record = await attendanceService.updateAttendance(
      parseInt(req.params.id), req.companyId, req.user.id, { status, remarks }
    );
    res.json({ success: true, message: 'Attendance updated.', data: record });
  } catch (err) {
    next(err);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: 'month and year are required' });
    const data = await attendanceService.getAttendanceSummary(req.companyId, {
      month: parseInt(month), year: parseInt(year),
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkIn, checkOut, getAttendance, updateAttendance, getAttendanceSummary };
