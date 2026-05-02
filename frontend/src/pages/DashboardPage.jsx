import { useState } from 'react';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import HRDashboard from '../components/dashboard/HRDashboard';
import PayrollDashboard from '../components/dashboard/PayrollDashboard';

// In production, this would come from auth context
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
  employee: 'Employee',
};

export default function DashboardPage() {
  // For demo purposes — allow switching between role views
  const [activeRole, setActiveRole] = useState('admin');
  const ActiveDashboard = dashboardMap[activeRole];

  return (
    <div>
      {/* Role Switcher (demo only) */}
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

      {/* Render Active Dashboard */}
      <ActiveDashboard />
    </div>
  );
}
