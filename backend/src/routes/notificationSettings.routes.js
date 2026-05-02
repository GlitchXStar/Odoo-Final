const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationSettings.controller');
const authMiddleware = require('../middleware/auth.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/', ctrl.getNotificationSettings);
router.put('/', ctrl.saveNotificationSettings);

module.exports = router;
