import { Navigate } from 'react-router-dom';

function getRole() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return u?.role_name || u?.role || '';
  } catch { return ''; }
}

export const ADMIN_ROLES = ['Admin', 'HR Officer', 'Payroll Officer'];
export const HR_ROLES    = ['Admin', 'HR Officer'];
export const PAYROLL_ROLES = ['Admin', 'Payroll Officer'];

export default function RoleGuard({ allowed, redirectTo = '/app/dashboard', children }) {
  const role = getRole();
  const permitted = Array.isArray(allowed)
    ? allowed.some((r) => r.toLowerCase() === role.toLowerCase())
    : allowed.toLowerCase() === role.toLowerCase();

  return permitted ? children : <Navigate to={redirectTo} replace />;
}
