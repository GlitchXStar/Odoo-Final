const svc = require('../services/notificationSettings.service');

const getNotificationSettings = async (req, res, next) => {
  try {
    await svc.ensureTable();
    const data = await svc.getSettings(req.companyId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const saveNotificationSettings = async (req, res, next) => {
  try {
    await svc.ensureTable();
    const { company_id, ...prefs } = req.body;
    const data = await svc.saveSettings(req.companyId, prefs);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getNotificationSettings, saveNotificationSettings };
