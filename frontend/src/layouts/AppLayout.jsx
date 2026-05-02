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
  const isAdminExact = r === 'admin';
  const isHR         = r === 'hr officer';
  const isPayroll    = r === 'payroll officer';
  const isManagement = isAdminExact || isHR || isPayroll;
  const isEmployee   = !isManagement;

  // Employees & HR & Payroll who are NOT Admin or HR see "My" pages
  const canSeeEmployees  = isAdminExact || isHR;
  const canSeeAttendance = isAdminExact || isHR;
  const canSeeTimeOff    = isAdminExact || isHR;
  const canSeePayroll    = isAdminExact || isPayroll;
  const canSeeReports    = isAdminExact;

  const main = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ...(canSeeEmployees  ? [{ to: '/app/employees', icon: Users, label: 'Employees' }] : []),
    // Admin views for attendance/time-off
    ...(canSeeAttendance ? [{ to: '/app/attendance', icon: CalendarDays, label: 'Attendance' }] : []),
    ...(canSeeTimeOff    ? [{ to: '/app/time-off', icon: CalendarOff, label: 'Time Off' }] : []),
    // Personal pages — everyone except Admin gets these
    ...(!isAdminExact ? [
      { to: '/app/attendance/me', icon: CalendarDays, label: 'My Attendance' },
      { to: '/app/time-off/me', icon: CalendarOff, label: 'My Leaves' },
    ] : []),
    ...(canSeePayroll ? [{ to: '/app/payroll', icon: Wallet, label: 'Payroll' }] : []),
    ...(!canSeePayroll ? [{ to: '/app/payroll/my-payslip', icon: Wallet, label: 'My Payslip' }] : []),
    ...(canSeeReports ? [{ to: '/app/reports', icon: BarChart3, label: 'Reports' }] : []),
  ];

  const bottom = [
    ...(isAdminExact ? [{ to: '/app/settings', icon: Settings, label: 'Settings' }] : []),
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIdx, setSearchIdx] = useState(0);
  const searchInputRef = useRef(null);
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

  // Command palette: ⌘K / Ctrl+K
  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setSearchQuery('');
        setSearchIdx(0);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    const allNav = [...mainNav, ...bottomNav].map(n => ({
      label: n.label, to: n.to, type: 'page', icon: n.icon,
    }));
    if (!q) { setSearchResults(allNav); setSearchIdx(0); return; }
    const filtered = allNav.filter(n => n.label.toLowerCase().includes(q));
    setSearchResults(filtered);
    setSearchIdx(0);
  }, [searchQuery, searchOpen]);

  const executeSearch = (item) => {
    navigate(item.to);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSearchIdx(i => Math.min(i + 1, searchResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSearchIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && searchResults[searchIdx]) { executeSearch(searchResults[searchIdx]); }
  };

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

            {/* Search trigger */}
            <button
              onClick={() => { setSearchOpen(true); setSearchQuery(''); setSearchIdx(0); }}
              className="hidden md:flex items-center gap-2 bg-surface-soft rounded-md px-3 py-2 w-64 text-left hover:bg-surface-card transition-colors"
            >
              <Search size={16} className="text-muted" />
              <span className="text-body-sm text-muted flex-1">Search...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-canvas border border-hairline rounded text-[11px] text-muted font-mono">
                ⌘K
              </kbd>
            </button>
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
                    {currentUser.role.toLowerCase() === 'admin' && (
                      <NavLink
                        to="/app/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-body-sm text-muted hover:text-ink hover:bg-surface-soft transition-all"
                      >
                        <Settings size={14} />
                        Settings
                      </NavLink>
                    )}
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

      {/* Command Palette */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <div
            className="relative bg-canvas border border-hairline rounded-xl shadow-lg w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
              <Search size={18} className="text-muted shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="bg-transparent border-none outline-none text-body-sm text-ink placeholder:text-muted w-full"
              />
              <kbd className="shrink-0 px-1.5 py-0.5 bg-surface-soft border border-hairline rounded text-[11px] text-muted font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2">
              {searchResults.length === 0 ? (
                <p className="px-4 py-6 text-center text-body-sm text-muted">No results found.</p>
              ) : searchResults.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => executeSearch(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-body-sm transition-colors ${
                      i === searchIdx ? 'bg-surface-soft text-ink' : 'text-muted hover:bg-surface-soft/50 hover:text-ink'
                    }`}
                  >
                    {Icon && <Icon size={16} className="shrink-0" />}
                    <span className="flex-1">{item.label}</span>
                    {i === searchIdx && (
                      <span className="text-caption text-muted">Enter ↵</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
