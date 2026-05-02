import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, CalendarOff,
  Wallet, BarChart3, Settings, LogOut, Bell,
  Search, Menu, X, ChevronDown, User, CheckCircle, Clock, Activity
} from 'lucide-react';
import { leaves, dashboard } from '../services/api.js';

const ADMIN_ROLES  = ['admin', 'hr officer', 'payroll officer'];
const HR_ROLES     = ['admin', 'hr officer'];
const PAYROLL_ROLES = ['admin', 'payroll officer'];

function getNavItems(role) {
  const r = (role || '').toLowerCase();
  const isAdmin    = ADMIN_ROLES.includes(r);
  const isHR       = HR_ROLES.includes(r);
  const isPayroll  = PAYROLL_ROLES.includes(r);
  const isEmployee = !isAdmin;

  const main = [
    { to: '/app/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    ...(isAdmin ? [{ to: '/app/employees', icon: Users, label: 'Employees' }] : []),
    isAdmin
      ? { to: '/app/attendance', icon: CalendarDays,    label: 'Attendance' }
      : { to: '/app/attendance/me', icon: CalendarDays, label: 'My Attendance' },
    isAdmin
      ? { to: '/app/time-off',   icon: CalendarOff,     label: 'Time Off' }
      : { to: '/app/time-off/me', icon: CalendarOff,    label: 'My Leaves' },
    ...(isPayroll ? [{ to: '/app/payroll', icon: Wallet, label: 'Payroll' }] : []),
    ...(isEmployee ? [{ to: '/app/payroll/my-payslip', icon: Wallet, label: 'My Payslip' }] : []),
    ...(isAdmin ? [{ to: '/app/reports', icon: BarChart3, label: 'Reports' }] : []),
  ];

  const bottom = [
    ...(r === 'admin' ? [{ to: '/app/settings', icon: Settings, label: 'Settings' }] : []),
  ];

  return { main, bottom };
}

function getStoredUser() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) return { name: 'User', email: '', role: '' };
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || u.email || 'User';
    return { name, email: u.email || '', role: u.role_name || u.role || '' };
  } catch { return { name: 'User', email: '', role: '' }; }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const currentUser = getStoredUser();
  const { main: mainNav, bottom: bottomNav } = getNavItems(currentUser.role);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setNotifLoading(true);
    Promise.all([
      leaves.getAll().catch(() => ({ leaves: [] })),
      dashboard.getActivity().catch(() => ({ data: [] })),
    ]).then(([leavesRes, activityRes]) => {
      const pending = (leavesRes?.data?.leaves || leavesRes?.leaves || [])
        .filter((l) => l.status === 'Pending')
        .slice(0, 5)
        .map((l) => ({
          id: `leave-${l.id}`,
          icon: Clock,
          color: 'text-warning',
          title: `${l.first_name || ''} ${l.last_name || ''} requested ${l.leave_type_name || 'leave'}`.trim(),
          subtitle: `${l.total_days} day(s) · Pending approval`,
          time: l.created_at,
          link: '/app/time-off/approvals',
        }));

      const activity = (activityRes.data || [])
        .slice(0, 5)
        .map((a) => ({
          id: `act-${a.id}`,
          icon: Activity,
          color: 'text-muted',
          title: a.action || 'System activity',
          subtitle: `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'System',
          time: a.timestamp,
          link: null,
        }));

      setNotifications([...pending, ...activity]);
    }).finally(() => setNotifLoading(false));
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const unreadCount = notifications.filter((n) => n.id.startsWith('leave-')).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-soft flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`print:hidden fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-canvas border-r border-hairline flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-hairline shrink-0">
          <span className="font-cal text-xl text-ink tracking-tight">EmPay</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted hover:text-ink transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-card text-ink'
                    : 'text-muted hover:text-ink hover:bg-surface-soft'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 py-4 border-t border-hairline flex flex-col gap-1">
          {bottomNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-card text-ink'
                    : 'text-muted hover:text-ink hover:bg-surface-soft'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-medium text-muted hover:text-error hover:bg-red-50 transition-all duration-150 w-full">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="print:hidden h-16 bg-canvas border-b border-hairline flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted hover:text-ink transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-surface-soft rounded-md px-3 py-2 w-64">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-body-sm text-ink placeholder:text-muted w-full"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-canvas border border-hairline rounded text-[11px] text-muted font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-error rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-canvas border border-hairline rounded-lg shadow-elevated z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
                    <span className="text-body-sm font-semibold text-ink">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-caption text-muted">{unreadCount} pending</span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-hairline">
                    {notifLoading ? (
                      <div className="py-8 text-center text-caption text-muted">Loading…</div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <CheckCircle size={24} className="text-success mx-auto mb-2" />
                        <p className="text-caption text-muted">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setNotifOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-surface-soft transition-colors flex items-start gap-3 ${n.link ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className={`mt-0.5 shrink-0 ${n.color}`}>
                            <n.icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm text-ink leading-snug truncate">{n.title}</p>
                            <p className="text-caption text-muted mt-0.5">{n.subtitle}</p>
                          </div>
                          {n.time && (
                            <span className="text-[11px] text-muted shrink-0 mt-0.5">{timeAgo(n.time)}</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-hairline">
                      <button
                        onClick={() => { setNotifOpen(false); navigate('/app/time-off/approvals'); }}
                        className="text-caption text-primary hover:underline"
                      >
                        View all leave requests →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-soft transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-ink text-on-primary flex items-center justify-center text-caption font-medium">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-caption font-medium text-ink leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-muted capitalize leading-tight">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown size={14} className="text-muted hidden sm:block" />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-canvas border border-hairline rounded-lg shadow-elevated py-1 z-50">
                    <div className="px-3 py-2 border-b border-hairline">
                      <p className="text-caption font-medium text-ink">{currentUser.name}</p>
                      <p className="text-[11px] text-muted">{currentUser.email}</p>
                    </div>
                    <NavLink
                      to="/app/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-body-sm text-muted hover:text-ink hover:bg-surface-soft transition-all"
                    >
                      <User size={14} />
                      My Profile
                    </NavLink>
                    <NavLink
                      to="/app/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-body-sm text-muted hover:text-ink hover:bg-surface-soft transition-all"
                    >
                      <Settings size={14} />
                      Settings
                    </NavLink>
                    <div className="border-t border-hairline mt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-body-sm text-muted hover:text-error hover:bg-red-50 transition-all w-full">
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
