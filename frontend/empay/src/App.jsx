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
import ReportsDashboard from './pages/ReportsDashboard';
import SettingsPage from './pages/SettingsPage';

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
          <Route path="employees/new" element={<EmployeeForm />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="employees/:id/edit" element={<EmployeeForm />} />
          <Route path="profile" element={<MyProfilePage />} />

          {/* Attendance & Time Off */}
          <Route path="attendance" element={<AttendanceOverview />} />
          <Route path="attendance/me" element={<MyAttendance />} />
          <Route path="time-off" element={<TimeOffOverview />} />
          <Route path="time-off/apply" element={<ApplyLeave />} />
          <Route path="time-off/approvals" element={<LeaveApprovals />} />
          <Route path="time-off/me" element={<MyLeaves />} />

          {/* Payroll */}
          <Route path="payroll" element={<PayrollOverview />} />
          <Route path="payroll/process" element={<RunPayroll />} />
          <Route path="payroll/payslips" element={<PayslipList />} />
          <Route path="payroll/payslips/:payslipId" element={<PayslipDetail />} />
          <Route path="payroll/my-payslip" element={<MyPayslip />} />

          {/* Reports & Settings */}
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
