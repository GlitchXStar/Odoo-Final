const companyScopeMiddleware = (req, res, next) => {
  if (!req.user || !req.user.companyId) {
    return res.status(400).json({ success: false, message: 'Company context missing.' });
  }

  // Inject company_id into request for use in services/controllers
  req.companyId = req.user.companyId;

  // Also inject into query and body for convenience
  if (req.body && typeof req.body === 'object') {
    req.body.company_id = req.user.companyId;
  }

  next();
};

module.exports = companyScopeMiddleware;
