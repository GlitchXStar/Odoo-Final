const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateUserSchema } = require('../validations/user.validation');
const { ROLES } = require('../config/constants');

// All user routes require authentication and company scope
router.use(authMiddleware, companyScopeMiddleware);

router.get('/', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', roleMiddleware(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
