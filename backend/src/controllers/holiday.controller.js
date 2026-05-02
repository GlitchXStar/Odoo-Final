const holidayService = require('../services/holiday.service');

const createHoliday = async (req, res, next) => {
  try {
    const holiday = await holidayService.createHoliday(req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Holiday created.', data: holiday });
  } catch (err) {
    next(err);
  }
};

const getAllHolidays = async (req, res, next) => {
  try {
    const { year } = req.query;
    const holidays = await holidayService.getAllHolidays(req.companyId, { year: year ? parseInt(year) : undefined });
    res.json({ success: true, data: holidays });
  } catch (err) {
    next(err);
  }
};

const deleteHoliday = async (req, res, next) => {
  try {
    const result = await holidayService.deleteHoliday(parseInt(req.params.id), req.companyId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { createHoliday, getAllHolidays, deleteHoliday };
