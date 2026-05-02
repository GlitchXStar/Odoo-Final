import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, CalendarOff,
  Wallet, BarChart3, Settings, LogOut, Bell,
  Search, Menu, X, ChevronDown, User
} from 'lucide-react';

// Navigation config by role
const navSections = {
  main: [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/employees', icon: Users, label: 'Employees' },
    { to: '/app/attendance', icon: CalendarDays, label: 'Attendance' },
    { to: '/app/time-off', icon: CalendarOff, label: 'Time Off' },
    { to: '/app/payroll', icon: Wallet, label: 'Payroll' },
    { to: '/app/reports', icon: BarChart3, label: 'Reports' },
  ],
  bottom: [
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ],
};

// Mock user — will be replaced with actual auth context
const mockUser = {
  name: 'Admin User',
  email: 'admin@empay.io',
  role: 'admin',
  avatar: null,
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

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
          {navSections.main.map((item) => (
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
          {navSections.bottom.map((item) => (
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
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-medium text-muted hover:text-error hover:bg-red-50 transition-all duration-150 w-full">
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
            <button className="relative p-2 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-soft transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-ink text-on-primary flex items-center justify-center text-caption font-medium">
                  {mockUser.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-caption font-medium text-ink leading-tight">
                    {mockUser.name}
                  </span>
                  <span className="text-[11px] text-muted capitalize leading-tight">
                    {mockUser.role.replace('_', ' ')}
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
                      <p className="text-caption font-medium text-ink">{mockUser.name}</p>
                      <p className="text-[11px] text-muted">{mockUser.email}</p>
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
                      <button className="flex items-center gap-2 px-3 py-2 text-body-sm text-muted hover:text-error hover:bg-red-50 transition-all w-full">
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
