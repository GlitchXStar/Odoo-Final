import { useState, useEffect, Component } from 'react';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import HRDashboard from '../components/dashboard/HRDashboard';
import PayrollDashboard from '../components/dashboard/PayrollDashboard';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
          Dashboard failed to load: {this.state.error?.message || 'Unknown error'}
        </div>
      );
    }
    return this.props.children;
  }
}

const ADMIN_ROLES = ['admin', 'hr officer', 'payroll officer'];

function getRoleKey(roleNameFromBackend) {
  const r = (roleNameFromBackend || '').toLowerCase().replace(/\s+/g, '_');
  if (r === 'admin') return 'admin';
  if (r === 'hr_officer') return 'hr_officer';
  if (r === 'payroll_officer') return 'payroll_officer';
  return 'employee';
}

const dashboardMap = {
  admin: AdminDashboard,
  hr_officer: HRDashboard,
  payroll_officer: PayrollDashboard,
  employee: EmployeeDashboard,
};

const roleLabels = {
  admin: 'Admin',
  hr_officer: 'HR Officer',
  payroll_officer: 'Payroll Officer',
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState('employee');
  const [userRoleKey, setUserRoleKey] = useState('employee');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      const key = getRoleKey(parsed.role_name || parsed.role || '');
      setUserRoleKey(key);
      setActiveRole(key);
    }
  }, []);

  const isAdminUser = ADMIN_ROLES.includes((user?.role_name || user?.role || '').toLowerCase());
  const ActiveDashboard = dashboardMap[activeRole] || EmployeeDashboard;

  return (
    <div>
      {/* Role Switcher — only visible to admins for preview purposes */}
      {isAdminUser && (
        <div className="mb-6 flex items-center gap-2 p-1 bg-surface-card rounded-lg w-fit">
          {Object.entries(roleLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveRole(key)}
              className={`px-3 py-1.5 rounded-md text-caption font-medium transition-all duration-150 ${
                activeRole === key
                  ? 'bg-canvas text-ink shadow-soft'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Render Active Dashboard */}
      <ErrorBoundary key={activeRole}>
        <ActiveDashboard />
      </ErrorBoundary>
    </div>
  );
}
