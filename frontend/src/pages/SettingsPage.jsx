import { useState, useEffect } from 'react';
import {
  Building2, Bell, Shield, Globe, ChevronDown, Save,
  Upload, Check, X as XIcon, Pencil, CreditCard,
  Clock, Calendar, Users, Briefcase, FileText
} from 'lucide-react';
import { company, notificationSettings, roles as rolesApi } from '../services/api.js';

const NOTIF_EMAIL = [
  { key: 'leave_request_submitted',      label: 'Leave Request Submitted',       description: 'Notify HR when an employee submits a leave request.' },
  { key: 'leave_approved_rejected',      label: 'Leave Approved / Rejected',     description: 'Notify employee when their leave request is acted upon.' },
  { key: 'payslip_generated',            label: 'Payslip Generated',             description: 'Notify employees when their monthly payslip is ready.' },
  { key: 'new_employee_onboarded',       label: 'New Employee Onboarded',        description: 'Notify HR and admin when a new employee is added.' },
  { key: 'attendance_anomaly',           label: 'Attendance Anomaly',            description: 'Alert when an employee has irregular attendance patterns.' },
  { key: 'payroll_processing_complete',  label: 'Payroll Processing Complete',   description: 'Notify admin and payroll officers when payroll run finishes.' },
];

const NOTIF_SYSTEM = [
  { key: 'daily_attendance_reminder',    label: 'Daily Attendance Reminder',     description: 'Remind employees to check in if not marked by 10 AM.' },
  { key: 'leave_balance_warning',        label: 'Leave Balance Warning',         description: 'Alert employees when leave balance drops below 2 days.' },
  { key: 'birthday_anniversary',         label: 'Birthday & Anniversary',        description: 'Notify team about employee birthdays and work anniversaries.' },
];

const sidebarItems = [
  { key: 'company',       label: 'Company Profile',       icon: Building2,  desc: 'Organization info & branding' },
  { key: 'work',          label: 'Work Schedule',          icon: Clock,      desc: 'Timings, week & holidays' },
  { key: 'payroll',       label: 'Payroll & Compliance',   icon: CreditCard, desc: 'Tax, PF, ESI settings' },
  { key: 'leave',         label: 'Leave Policy',           icon: Calendar,   desc: 'Leave types & quotas' },
  { key: 'notifications', label: 'Notifications',          icon: Bell,       desc: 'Email & system alerts' },
  { key: 'roles',         label: 'Roles & Permissions',    icon: Shield,     desc: 'Access control' },
];

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between py-3.5">
      <div className="pr-4">
        <p className="text-body-sm font-medium text-ink">{label}</p>
        {description && <p className="text-caption text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          checked ? 'bg-ink' : 'bg-surface-strong'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}

function Section({ title, description, children, footer }) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-hairline">
          <h3 className="text-title-sm text-ink">{title}</h3>
          {description && <p className="text-caption text-muted mt-0.5">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3.5 border-t border-hairline bg-surface-soft/30 flex justify-end">
          {footer}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-caption text-ink font-medium">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    city: '', state: '', country: '', pincode: '', taxId: '',
  });
  const [notifPrefs, setNotifPrefs] = useState({});
  const [notifLoading, setNotifLoading] = useState(true);
  const [rolesData, setRolesData] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [editPerms, setEditPerms] = useState({});
  const [savingRole, setSavingRole] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    rolesApi.getAll()
      .then((res) => setRolesData(res.data || []))
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  }, []);

  const startEditRole = (role) => {
    setEditingRole(role.id);
    const perms = Array.isArray(role.permissions) ? role.permissions : Object.keys(role.permissions || {});
    const map = {};
    perms.forEach((p) => { map[p] = true; });
    setEditPerms(map);
  };

  const togglePerm = (perm) => setEditPerms((p) => ({ ...p, [perm]: !p[perm] }));

  const handleSaveRole = async (roleId) => {
    setSavingRole(true);
    try {
      const permList = Object.entries(editPerms).filter(([, v]) => v).map(([k]) => k);
      const res = await rolesApi.updatePermissions(roleId, permList);
      setRolesData((prev) => prev.map((r) => r.id === roleId ? { ...r, permissions: res.data.permissions } : r));
      setEditingRole(null);
      setSuccess('Role permissions updated.');
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setSavingRole(false);
    }
  };

  useEffect(() => {
    notificationSettings.get()
      .then((res) => setNotifPrefs(res.data || {}))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, []);

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess(''); setError('');
  };

  const handleSaveNotif = async () => {
    setIsSaving(true); setError(''); setSuccess('');
    try {
      await notificationSettings.save(notifPrefs);
      setSuccess('Notification preferences saved.');
    } catch (err) {
      setError(err.message || 'Failed to save preferences.');
    } finally { setIsSaving(false); }
  };

  useEffect(() => {
    company.getMe()
      .then((res) => {
        const d = res.data || {};
        setForm({
          name: d.name || '', email: d.email || '', phone: d.phone || '',
          address: d.address || '', city: d.city || '', state: d.state || '',
          country: d.country || '', pincode: d.pincode || '', taxId: d.tax_id || '',
        });
      })
      .catch((err) => setError(err.message || 'Failed to load company settings'))
      .finally(() => setFetchLoading(false));
  }, []);

  const set = (field) => (e) => { setForm((p) => ({ ...p, [field]: e.target.value })); setSuccess(''); setError(''); };

  const handleSave = async () => {
    setIsSaving(true); setError(''); setSuccess('');
    try {
      await company.update(form);
      setSuccess('Settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally { setIsSaving(false); }
  };

  const SaveBtn = ({ label = 'Save Changes', onClick = handleSave, disabled = false }) => (
    <button onClick={onClick} disabled={isSaving || fetchLoading || disabled} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
      {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
      {isSaving ? 'Saving...' : label}
    </button>
  );

  const Spinner = () => (
    <div className="flex items-center justify-center py-16">
      <span className="w-6 h-6 border-2 border-hairline border-t-ink rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">Settings</h1>
        <p className="text-body-sm text-muted mt-1">Manage your organization's configuration and preferences.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-body-sm text-error flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-error/60 hover:text-error"><XIcon size={14} /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-success/10 border border-success/20 text-body-sm text-success flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess('')} className="text-success/60 hover:text-success"><XIcon size={14} /></button>
        </div>
      )}

      {/* Sidebar + Content Layout */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <nav className="bg-canvas border border-hairline rounded-lg overflow-hidden">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-hairline last:border-b-0 transition-all ${
                  activeTab === item.key
                    ? 'bg-surface-soft border-l-2 border-l-ink'
                    : 'hover:bg-surface-soft/50'
                }`}
              >
                <item.icon size={16} className={`mt-0.5 shrink-0 ${activeTab === item.key ? 'text-ink' : 'text-muted'}`} />
                <div>
                  <p className={`text-body-sm font-medium ${activeTab === item.key ? 'text-ink' : 'text-muted'}`}>{item.label}</p>
                  <p className="text-[11px] text-muted mt-0.5">{item.desc}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* COMPANY PROFILE */}
          {activeTab === 'company' && (
            <>
              <Section title="Company Logo" description="Upload your organization's logo for branding.">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-ink text-on-primary flex items-center justify-center font-cal text-display-sm">
                    {form.name ? form.name.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div>
                    <button className="btn-secondary inline-flex items-center gap-2 text-body-sm">
                      <Upload size={14} /> Upload Logo
                    </button>
                    <p className="text-caption text-muted mt-1">PNG, JPG up to 2MB. Recommended 256x256px.</p>
                  </div>
                </div>
              </Section>

              <Section
                title="Company Information"
                description="Basic details about your organization."
                footer={<SaveBtn />}
              >
                {fetchLoading ? <Spinner /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Company Name" required>
                      <input type="text" value={form.name} onChange={set('name')} className="input-field" placeholder="Acme Technologies Pvt. Ltd." />
                    </Field>
                    <Field label="Email">
                      <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="admin@company.com" />
                    </Field>
                    <Field label="Phone">
                      <input type="tel" value={form.phone} onChange={set('phone')} className="input-field" placeholder="+91 98765 43210" />
                    </Field>
                    <Field label="Tax ID / GST">
                      <input type="text" value={form.taxId} onChange={(e) => { setForm((p) => ({ ...p, taxId: e.target.value.toUpperCase() })); setSuccess(''); setError(''); }} className="input-field" placeholder="27AABCE1234F1ZP" />
                    </Field>
                    <Field label="Address">
                      <input type="text" value={form.address} onChange={set('address')} className="input-field md:col-span-2" placeholder="Street address" />
                    </Field>
                    <Field label="City">
                      <input type="text" value={form.city} onChange={set('city')} className="input-field" placeholder="Mumbai" />
                    </Field>
                    <Field label="State">
                      <input type="text" value={form.state} onChange={set('state')} className="input-field" placeholder="Maharashtra" />
                    </Field>
                    <Field label="Country">
                      <input type="text" value={form.country} onChange={set('country')} className="input-field" placeholder="India" />
                    </Field>
                    <Field label="Pincode">
                      <input type="text" value={form.pincode} onChange={set('pincode')} className="input-field" placeholder="400051" />
                    </Field>
                  </div>
                )}
              </Section>
            </>
          )}

          {/* WORK SCHEDULE */}
          {activeTab === 'work' && (
            <Section
              title="Work Schedule"
              description="Configure office timings, work week, and timezone."
              footer={<SaveBtn label="Save Schedule" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Timezone">
                  <div className="relative">
                    <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="asia-kolkata">
                      <option value="asia-kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                      <option value="america-new_york">America/New_York (EST, UTC-5)</option>
                      <option value="europe-london">Europe/London (GMT, UTC+0)</option>
                      <option value="asia-dubai">Asia/Dubai (GST, UTC+4)</option>
                      <option value="asia-singapore">Asia/Singapore (SGT, UTC+8)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </Field>
                <Field label="Work Week">
                  <div className="relative">
                    <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="mon-fri">
                      <option value="mon-fri">Monday - Friday (5 days)</option>
                      <option value="mon-sat">Monday - Saturday (6 days)</option>
                      <option value="sun-thu">Sunday - Thursday (5 days)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </Field>
                <Field label="Office Check-in Time">
                  <input type="time" defaultValue="09:00" className="input-field" />
                </Field>
                <Field label="Office Check-out Time">
                  <input type="time" defaultValue="18:00" className="input-field" />
                </Field>
                <Field label="Date Format">
                  <div className="relative">
                    <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="dd-mm-yyyy">
                      <option value="dd-mm-yyyy">DD/MM/YYYY</option>
                      <option value="mm-dd-yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </Field>
                <Field label="Currency">
                  <div className="relative">
                    <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="inr">
                      <option value="inr">INR (&#8377;)</option>
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (&euro;)</option>
                      <option value="gbp">GBP (&pound;)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </Field>
              </div>
            </Section>
          )}

          {/* PAYROLL & COMPLIANCE */}
          {activeTab === 'payroll' && (
            <Section
              title="Payroll & Compliance"
              description="Configure statutory deductions and compliance rules."
              footer={<SaveBtn label="Save Payroll Settings" />}
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-body-sm font-medium text-ink mb-3">Provident Fund (PF)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Employee Contribution %">
                      <input type="number" defaultValue="12" className="input-field" />
                    </Field>
                    <Field label="Employer Contribution %">
                      <input type="number" defaultValue="12" className="input-field" />
                    </Field>
                    <Field label="PF Basic Cap">
                      <input type="number" defaultValue="15000" className="input-field" />
                    </Field>
                  </div>
                </div>
                <div className="border-t border-hairline pt-5">
                  <h4 className="text-body-sm font-medium text-ink mb-3">ESI (Employee State Insurance)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Employee Rate %">
                      <input type="number" defaultValue="0.75" step="0.01" className="input-field" />
                    </Field>
                    <Field label="Employer Rate %">
                      <input type="number" defaultValue="3.25" step="0.01" className="input-field" />
                    </Field>
                    <Field label="ESI Wage Ceiling">
                      <input type="number" defaultValue="21000" className="input-field" />
                    </Field>
                  </div>
                </div>
                <div className="border-t border-hairline pt-5">
                  <h4 className="text-body-sm font-medium text-ink mb-3">Professional Tax</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="State">
                      <div className="relative">
                        <select className="input-field appearance-none pr-10 cursor-pointer" defaultValue="maharashtra">
                          <option value="maharashtra">Maharashtra</option>
                          <option value="karnataka">Karnataka</option>
                          <option value="west-bengal">West Bengal</option>
                          <option value="telangana">Telangana</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Max Monthly PT">
                      <input type="number" defaultValue="200" className="input-field" />
                    </Field>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* LEAVE POLICY */}
          {activeTab === 'leave' && (
            <Section
              title="Leave Policy"
              description="Define leave types, annual quotas, and carry-forward rules."
              footer={<SaveBtn label="Save Leave Policy" />}
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Casual Leave / Year', value: '12', icon: Calendar },
                    { label: 'Sick Leave / Year', value: '8', icon: FileText },
                    { label: 'Paid Leave / Year', value: '15', icon: Briefcase },
                    { label: 'Carry Forward Limit', value: '5', icon: Users },
                  ].map((item) => (
                    <div key={item.label} className="bg-surface-soft rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon size={14} className="text-muted" />
                        <label className="text-caption text-ink font-medium">{item.label}</label>
                      </div>
                      <input type="number" defaultValue={item.value} className="input-field" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-hairline pt-5">
                  <h4 className="text-body-sm font-medium text-ink mb-3">Additional Rules</h4>
                  <div className="space-y-0 divide-y divide-hairline">
                    <Toggle label="Allow half-day leaves" description="Employees can apply for half-day leave." checked={true} onChange={() => {}} />
                    <Toggle label="Allow carry forward" description="Unused leaves are carried to the next year." checked={true} onChange={() => {}} />
                    <Toggle label="Manager approval required" description="All leave requests need manager approval." checked={true} onChange={() => {}} />
                    <Toggle label="Allow backdated leaves" description="Employees can apply for past-date leaves." checked={false} onChange={() => {}} />
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <>
              <Section
                title="Email Notifications"
                description="Configure when the system sends email notifications."
              >
                {notifLoading ? <Spinner /> : (
                  <div className="divide-y divide-hairline -my-1">
                    {NOTIF_EMAIL.map((item) => (
                      <Toggle key={item.key} label={item.label} description={item.description}
                        checked={!!notifPrefs[item.key]} onChange={() => toggleNotif(item.key)} />
                    ))}
                  </div>
                )}
              </Section>

              <Section
                title="System Notifications"
                description="In-app notifications and reminders."
                footer={<SaveBtn label="Save Preferences" onClick={handleSaveNotif} />}
              >
                {notifLoading ? <Spinner /> : (
                  <div className="divide-y divide-hairline -my-1">
                    {NOTIF_SYSTEM.map((item) => (
                      <Toggle key={item.key} label={item.label} description={item.description}
                        checked={!!notifPrefs[item.key]} onChange={() => toggleNotif(item.key)} />
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}

          {/* ROLES & PERMISSIONS */}
          {activeTab === 'roles' && (
            <>
              {rolesLoading ? <Spinner /> : rolesData.map((role) => {
                const isEditing = editingRole === role.id;
                const perms = Array.isArray(role.permissions) ? role.permissions : [];
                return (
                  <div key={role.id} className="bg-canvas border border-hairline rounded-lg overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center">
                          <Shield size={18} className="text-muted" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-ink">{role.name}</p>
                          <p className="text-caption text-muted">
                            {role.user_count} user{role.user_count !== 1 ? 's' : ''}
                            <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                              role.is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                            }`}>{role.is_active ? 'Active' : 'Inactive'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveRole(role.id)} disabled={savingRole}
                              className="btn-primary text-body-sm py-1.5 px-3 inline-flex items-center gap-1.5 disabled:opacity-60">
                              {savingRole ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                              Save
                            </button>
                            <button onClick={() => setEditingRole(null)}
                              className="btn-secondary text-body-sm py-1.5 px-3 inline-flex items-center gap-1.5">
                              <XIcon size={14} /> Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => startEditRole(role)}
                            className="btn-secondary text-body-sm py-1.5 px-3 inline-flex items-center gap-1.5">
                            <Pencil size={14} /> Edit
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="px-6 pb-5">
                      {isEditing ? (
                        <div>
                          <p className="text-caption text-muted mb-3">Edit permissions - toggle on/off:</p>
                          <div className="flex flex-wrap gap-2">
                            {perms.map((perm) => (
                              <button key={perm} onClick={() => togglePerm(perm)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium border transition-all ${
                                  editPerms[perm] ? 'bg-ink text-on-primary border-ink' : 'bg-surface-card text-muted border-hairline'
                                }`}>
                                {editPerms[perm] ? <Check size={11} /> : <XIcon size={11} />}
                                {perm}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-caption text-muted mb-2">Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {perms.length === 0
                              ? <span className="text-caption text-muted italic">No permissions defined</span>
                              : perms.map((perm) => (
                                <span key={perm} className="px-2.5 py-1 bg-surface-card border border-hairline rounded-full text-caption text-ink">
                                  {perm}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
