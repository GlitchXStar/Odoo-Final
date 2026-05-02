// API service for backend integration
const API_BASE = '';

// Helper for API calls
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Auth APIs
export const auth = {
  login: (data) => apiRequest('/api/auth/login', { method: 'POST', body: data }),
  register: (data) => apiRequest('/api/auth/register', { method: 'POST', body: data }),
  requestOtp: (data) => apiRequest('/api/auth/request-otp', { method: 'POST', body: data }),
  verifyOtp: (data) => apiRequest('/api/auth/verify-otp', { method: 'POST', body: data }),
  createUser: (data) => apiRequest('/api/auth/create-user', { method: 'POST', body: data }),
  changePassword: (data) => apiRequest('/api/auth/change-password', { method: 'POST', body: data }),
};

// Employee APIs
export const employees = {
  getAll: () => apiRequest('/api/employees'),
  getById: (id) => apiRequest(`/api/employees/${id}`),
  getMe: () => apiRequest('/api/employees/me'),
  create: (data) => apiRequest('/api/employees', { method: 'POST', body: data }),
  createWithUser: (data) => apiRequest('/api/employees/create-with-user', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/api/employees/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/api/employees/${id}`, { method: 'DELETE' }),
};

// User APIs
export const users = {
  getAll: () => apiRequest('/api/users'),
  getById: (id) => apiRequest(`/api/users/${id}`),
  update: (id, data) => apiRequest(`/api/users/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/api/users/${id}`, { method: 'DELETE' }),
};

// Company APIs
export const company = {
  getMe: () => apiRequest('/api/companies/me'),
  update: (data) => apiRequest('/api/companies/me', { method: 'PUT', body: data }),
};

// Attendance APIs
export const attendance = {
  checkIn: () => apiRequest('/api/attendance/check-in', { method: 'POST' }),
  checkOut: () => apiRequest('/api/attendance/check-out', { method: 'POST' }),
  getAll: (params = '') => apiRequest(`/api/attendance${params}`),
  update: (id, data) => apiRequest(`/api/attendance/${id}`, { method: 'PUT', body: data }),
};

// Leave APIs
export const leaves = {
  apply: (data) => apiRequest('/api/leaves/apply', { method: 'POST', body: data }),
  getAll: (params = '') => apiRequest(`/api/leaves${params}`),
  getMine: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return apiRequest(`/api/leaves?userId=${user.id}`);
  },
  approve: (id) => apiRequest(`/api/leaves/${id}/approve`, { method: 'PUT' }),
  reject: (id, rejectionReason = 'Rejected by manager') => apiRequest(`/api/leaves/${id}/reject`, { method: 'PUT', body: { rejectionReason } }),
  cancel: (id) => apiRequest(`/api/leaves/${id}/cancel`, { method: 'PUT' }),
};

// Leave Types APIs
export const leaveTypes = {
  getAll: () => apiRequest('/api/leave-types'),
  create: (data) => apiRequest('/api/leave-types', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/api/leave-types/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/api/leave-types/${id}`, { method: 'DELETE' }),
};

// Leave Balance APIs
export const leaveBalances = {
  getAll: () => apiRequest('/api/leave-balances'),
  allocate: (data) => apiRequest('/api/leave-balances/allocate', { method: 'POST', body: data }),
  bulkAllocate: (data) => apiRequest('/api/leave-balances/bulk-allocate', { method: 'POST', body: data }),
};

// Shift APIs
export const shifts = {
  getAll: () => apiRequest('/api/shifts'),
  create: (data) => apiRequest('/api/shifts', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/api/shifts/${id}`, { method: 'PUT', body: data }),
  assign: (data) => apiRequest('/api/shifts/assign', { method: 'POST', body: data }),
};

// Holiday APIs
export const holidays = {
  getAll: () => apiRequest('/api/holidays'),
  create: (data) => apiRequest('/api/holidays', { method: 'POST', body: data }),
  delete: (id) => apiRequest(`/api/holidays/${id}`, { method: 'DELETE' }),
};

// Salary Structure APIs
export const salaryStructures = {
  getAll: () => apiRequest('/api/salary-structures'),
  getByUser: (id) => apiRequest(`/api/salary-structures/user/${id}`),
  getActiveByUser: (id) => apiRequest(`/api/salary-structures/user/${id}/active`),
  create: (data) => apiRequest('/api/salary-structures', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/api/salary-structures/${id}`, { method: 'PUT', body: data }),
};

// Payroll APIs
export const payroll = {
  run: ({ month: monthStr, userId = null }) => {
    const [year, month] = monthStr.split('-').map(Number);
    return apiRequest('/api/payroll/run', { method: 'POST', body: { month, year, userId } });
  },
  getAll: () => apiRequest('/api/payroll'),
  estimate: (userId) => apiRequest(`/api/payroll/estimate?userId=${userId}`),
};

// Payslip APIs
export const payslips = {
  getById: (id) => apiRequest(`/api/payslip/${id}`),
  download: (id) => apiRequest(`/api/payslip/${id}/download`),
};

// Roles APIs
export const roles = {
  getAll: () => apiRequest('/api/roles'),
  updatePermissions: (id, permissions) => apiRequest(`/api/roles/${id}/permissions`, { method: 'PUT', body: permissions }),
};

// Notification Settings APIs
export const notificationSettings = {
  get: () => apiRequest('/api/notification-settings'),
  save: (data) => apiRequest('/api/notification-settings', { method: 'PUT', body: data }),
};

// Reports APIs
export const reports = {
  getSummary: (month, year) => apiRequest(`/api/reports/summary?month=${month}&year=${year}`),
  getDepartments: (month, year) => apiRequest(`/api/reports/departments?month=${month}&year=${year}`),
  getMonthlyTrend: (year) => apiRequest(`/api/reports/monthly-trend?year=${year}`),
  getLeaveDistribution: (month, year) => apiRequest(`/api/reports/leave-distribution?month=${month}&year=${year}`),
  getHeadcount: (month, year) => apiRequest(`/api/reports/headcount?month=${month}&year=${year}`),
  getAttendance: (month, year) => apiRequest(`/api/reports/attendance?month=${month}&year=${year}`),
  getLeave: (month, year) => apiRequest(`/api/reports/leave?month=${month}&year=${year}`),
  getPayroll: (month, year) => apiRequest(`/api/reports/payroll?month=${month}&year=${year}`),
  getAttrition: (month, year) => apiRequest(`/api/reports/attrition?month=${month}&year=${year}`),
  getCompliance: (month, year) => apiRequest(`/api/reports/compliance?month=${month}&year=${year}`),
};

// Dashboard APIs
export const dashboard = {
  getStats: () => apiRequest('/api/dashboard/stats'),
  getDepartments: () => apiRequest('/api/dashboard/departments'),
  getActivity: () => apiRequest('/api/dashboard/activity'),
};

// Health check
export const health = {
  check: () => apiRequest('/health'),
};

export default apiRequest;
