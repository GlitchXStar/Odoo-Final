const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roles.controller');
const authMiddleware = require('../middleware/auth.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/', ctrl.getRoles);
router.put('/:id/permissions', roleMiddleware(ROLES.ADMIN), ctrl.updateRolePermissions);

module.exports = router;
