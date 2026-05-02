import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeForm from './pages/EmployeeForm';
import MyProfilePage from './pages/MyProfilePage';
import AttendanceOverview from './pages/AttendanceOverview';
import MyAttendance from './pages/MyAttendance';
import TimeOffOverview from './pages/TimeOffOverview';
import ApplyLeave from './pages/ApplyLeave';
import LeaveApprovals from './pages/LeaveApprovals';
import MyLeaves from './pages/MyLeaves';
import PayrollOverview from './pages/PayrollOverview';
import RunPayroll from './pages/RunPayroll';
import PayslipList from './pages/PayslipList';
import PayslipDetail from './pages/PayslipDetail';
import MyPayslip from './pages/MyPayslip';
import SalaryEditor from './pages/SalaryEditor';
import ReportsDashboard from './pages/ReportsDashboard';
import ReportDetail from './pages/ReportDetail';
import SettingsPage from './pages/SettingsPage';
import RoleGuard, { ADMIN_ROLES, HR_ROLES, PAYROLL_ROLES } from './components/RoleGuard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App Routes (protected — wrapped in AppLayout) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Employee Management */}
          <Route path="employees" element={<EmployeeDirectory />} />
          <Route path="employees/new" element={<RoleGuard allowed={HR_ROLES}><EmployeeForm /></RoleGuard>} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="employees/:id/edit" element={<RoleGuard allowed={HR_ROLES}><EmployeeForm /></RoleGuard>} />
          <Route path="employees/:id/salary" element={<RoleGuard allowed={PAYROLL_ROLES}><SalaryEditor /></RoleGuard>} />
          <Route path="profile" element={<MyProfilePage />} />

          {/* Attendance & Time Off */}
          <Route path="attendance" element={<RoleGuard allowed={HR_ROLES}><AttendanceOverview /></RoleGuard>} />
          <Route path="attendance/me" element={<MyAttendance />} />
          <Route path="time-off" element={<RoleGuard allowed={HR_ROLES}><TimeOffOverview /></RoleGuard>} />
          <Route path="time-off/apply" element={<ApplyLeave />} />
          <Route path="time-off/approvals" element={<RoleGuard allowed={HR_ROLES}><LeaveApprovals /></RoleGuard>} />
          <Route path="time-off/me" element={<MyLeaves />} />

          {/* Payroll */}
          <Route path="payroll" element={<RoleGuard allowed={PAYROLL_ROLES}><PayrollOverview /></RoleGuard>} />
          <Route path="payroll/process" element={<RoleGuard allowed={PAYROLL_ROLES}><RunPayroll /></RoleGuard>} />
          <Route path="payroll/payslips" element={<RoleGuard allowed={PAYROLL_ROLES}><PayslipList /></RoleGuard>} />
          <Route path="payroll/payslips/:payslipId" element={<RoleGuard allowed={PAYROLL_ROLES}><PayslipDetail /></RoleGuard>} />
          <Route path="payroll/my-payslip" element={<MyPayslip />} />
          <Route path="payslip/:payslipId" element={<PayslipDetail />} />

          {/* Reports & Settings — Admin only */}
          <Route path="reports" element={<RoleGuard allowed={['Admin']}><ReportsDashboard /></RoleGuard>} />
          <Route path="reports/:type" element={<RoleGuard allowed={['Admin']}><ReportDetail /></RoleGuard>} />
          <Route path="settings" element={<RoleGuard allowed={['Admin']}><SettingsPage /></RoleGuard>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
