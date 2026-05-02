import { useState } from 'react';
import {
  Building2, Bell, Shield, Globe, ChevronDown, Save,
  Mail, Phone, MapPin, Clock, Users, CreditCard,
  Palette, Lock, Upload
} from 'lucide-react';

const settingsTabs = [
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'roles', label: 'Roles & Permissions', icon: Shield },
  { key: 'general', label: 'General', icon: Globe },
];

const roles = [
  { name: 'Admin', count: 3, permissions: ['Full access to all modules', 'User management', 'System configuration'] },
  { name: 'HR Officer', count: 5, permissions: ['Employee management', 'Leave approvals', 'Attendance tracking', 'Reports (HR)'] },
  { name: 'Payroll Officer', count: 2, permissions: ['Payroll processing', 'Payslip generation', 'Salary management', 'Reports (Payroll)'] },
  { name: 'Employee', count: 1238, permissions: ['Self-service profile', 'Leave application', 'Attendance check-in', 'View payslip'] },
];

function Toggle({ label, description, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between py-4">
      <div>
        <p className="text-body-sm font-medium text-ink">{label}</p>
        {description && <p className="text-caption text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          checked ? 'bg-ink' : 'bg-surface-strong'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">Settings</h1>
        <p className="text-body-sm text-muted mt-1">
          Manage your organization's configuration and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface-card rounded-lg w-fit">
        {settingsTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-body-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-canvas text-ink shadow-soft'
                : 'text-muted hover:text-ink'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'company' && (
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          {/* Logo Upload */}
          <div className="px-6 py-5 border-b border-hairline">
            <h3 className="text-title-sm text-ink mb-4">Company Logo</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-ink text-on-primary flex items-center justify-center font-cal text-display-sm">
                E
              </div>
              <div>
                <button className="btn-secondary inline-flex items-center gap-2 text-body-sm">
                  <Upload size={14} />
                  Upload Logo
                </button>
                <p className="text-caption text-muted mt-1">PNG, JPG up to 2MB. Recommended: 256×256px.</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Company Name</label>
              <input type="text" defaultValue="EmPay Technologies Pvt. Ltd." className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Email</label>
              <input type="email" defaultValue="admin@empay.io" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Phone</label>
              <input type="tel" defaultValue="+91 22 4000 1234" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Website</label>
              <input type="url" defaultValue="https://empay.io" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-caption text-ink">Address</label>
              <input type="text" defaultValue="42, Bandra-Kurla Complex, Mumbai, Maharashtra 400051" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">GST Number</label>
              <input type="text" defaultValue="27AABCE1234F1ZP" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">PAN Number</label>
              <input type="text" defaultValue="AABCE1234F" className="input-field" />
            </div>
          </div>

          {/* Save */}
          <div className="px-6 py-4 border-t border-hairline bg-surface-soft/30 flex justify-end">
            <button onClick={handleSave} disabled={isLoading} className="btn-primary inline-flex items-center gap-2">
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-6 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Email Notifications</h3>
            <p className="text-caption text-muted mt-0.5">Configure when the system sends email notifications.</p>
          </div>
          <div className="px-6 divide-y divide-hairline">
            <Toggle
              label="Leave Request Submitted"
              description="Notify HR when an employee submits a leave request."
              defaultChecked={true}
            />
            <Toggle
              label="Leave Approved / Rejected"
              description="Notify employee when their leave request is acted upon."
              defaultChecked={true}
            />
            <Toggle
              label="Payslip Generated"
              description="Notify employees when their monthly payslip is ready."
              defaultChecked={true}
            />
            <Toggle
              label="New Employee Onboarded"
              description="Notify HR and admin when a new employee is added."
              defaultChecked={true}
            />
            <Toggle
              label="Attendance Anomaly"
              description="Alert when an employee has irregular attendance patterns."
              defaultChecked={false}
            />
            <Toggle
              label="Payroll Processing Complete"
              description="Notify admin and payroll officers when payroll run finishes."
              defaultChecked={true}
            />
          </div>
          <div className="px-6 py-4 border-t border-hairline">
            <h3 className="text-title-sm text-ink">System Notifications</h3>
            <p className="text-caption text-muted mt-0.5">In-app notifications and reminders.</p>
          </div>
          <div className="px-6 divide-y divide-hairline">
            <Toggle
              label="Daily Attendance Reminder"
              description="Remind employees to check in if not marked by 10 AM."
              defaultChecked={true}
            />
            <Toggle
              label="Leave Balance Warning"
              description="Alert employees when leave balance drops below 2 days."
              defaultChecked={false}
            />
            <Toggle
              label="Birthday & Anniversary"
              description="Notify team about employee birthdays and work anniversaries."
              defaultChecked={true}
            />
          </div>
          <div className="px-6 py-4 border-t border-hairline bg-surface-soft/30 flex justify-end">
            <button onClick={handleSave} disabled={isLoading} className="btn-primary inline-flex items-center gap-2">
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.name} className="bg-canvas border border-hairline rounded-lg overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center">
                    <Shield size={18} className="text-muted" />
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-ink">{role.name}</p>
                    <p className="text-caption text-muted">{role.count} user{role.count > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button className="btn-secondary text-body-sm py-1.5">Edit</button>
              </div>
              <div className="px-6 pb-4">
                <p className="text-caption text-muted mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 bg-surface-card border border-hairline rounded-pill text-caption text-ink"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'general' && (
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Timezone</label>
              <div className="relative">
                <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="asia-kolkata">
                  <option value="asia-kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                  <option value="america-new_york">America/New_York (EST, UTC-5)</option>
                  <option value="europe-london">Europe/London (GMT, UTC+0)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Date Format</label>
              <div className="relative">
                <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="dd-mm-yyyy">
                  <option value="dd-mm-yyyy">DD/MM/YYYY</option>
                  <option value="mm-dd-yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Currency</label>
              <div className="relative">
                <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="inr">
                  <option value="inr">INR (₹)</option>
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Work Week</label>
              <div className="relative">
                <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="mon-fri">
                  <option value="mon-fri">Monday – Friday</option>
                  <option value="mon-sat">Monday – Saturday</option>
                  <option value="sun-thu">Sunday – Thursday</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Office Check-in Time</label>
              <input type="time" defaultValue="09:00" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-ink">Office Check-out Time</label>
              <input type="time" defaultValue="18:00" className="input-field" />
            </div>
          </div>

          <div className="px-6 pb-6">
            <h3 className="text-title-sm text-ink mb-3">Leave Policy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Casual Leave / Year', value: '12' },
                { label: 'Sick Leave / Year', value: '8' },
                { label: 'Paid Leave / Year', value: '15' },
                { label: 'Carry Forward Limit', value: '5' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">{item.label}</label>
                  <input type="number" defaultValue={item.value} className="input-field" />
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-hairline bg-surface-soft/30 flex justify-end">
            <button onClick={handleSave} disabled={isLoading} className="btn-primary inline-flex items-center gap-2">
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
