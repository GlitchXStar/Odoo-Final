import { useState, useEffect } from 'react';
import {
  Building2, Bell, Shield, Globe, ChevronDown, ChevronUp, Save,
  Mail, Phone, MapPin, Clock, Users, CreditCard,
  Palette, Lock, Upload, Check, X as XIcon, Pencil
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

const settingsTabs = [
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'roles', label: 'Roles & Permissions', icon: Shield },
  { key: 'general', label: 'General', icon: Globe },
];


function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between py-4">
      <div>
        <p className="text-body-sm font-medium text-ink">{label}</p>
        {description && <p className="text-caption text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
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
    setRolesLoading(true);
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
    setNotifLoading(true);
    notificationSettings.get()
      .then((res) => setNotifPrefs(res.data || {}))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, []);

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess('');
    setError('');
  };

  const handleSaveNotif = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await notificationSettings.save(notifPrefs);
      setSuccess('Notification preferences saved.');
    } catch (err) {
      setError(err.message || 'Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setFetchLoading(true);
    company.getMe()
      .then((res) => {
        const d = res.data || {};
        setForm({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          address: d.address || '',
          city: d.city || '',
          state: d.state || '',
          country: d.country || '',
          pincode: d.pincode || '',
          taxId: d.tax_id || '',
        });
      })
      .catch((err) => setError(err.message || 'Failed to load company settings'))
      .finally(() => setFetchLoading(false));
  }, []);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await company.update(form);
      setSuccess('Company settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const SaveButton = ({ label = 'Save Changes' }) => (
    <button onClick={handleSave} disabled={isSaving || fetchLoading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
      {isSaving
        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <Save size={16} />}
      {isSaving ? 'Saving…' : label}
    </button>
  );

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">Settings</h1>
        <p className="text-body-sm text-muted mt-1">
          Manage your organization's configuration and preferences.
        </p>
      </div>

      {/* Global alerts */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-body-sm text-error">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-success/10 border border-success/20 text-body-sm text-success">
          {success}
        </div>
      )}

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
                {form.name ? form.name.charAt(0).toUpperCase() : 'E'}
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
          {fetchLoading ? (
            <div className="p-6 flex items-center justify-center py-12">
              <span className="w-6 h-6 border-2 border-hairline border-t-ink rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">Company Name <span className="text-error">*</span></label>
                <input type="text" value={form.name} onChange={set('name')} className="input-field" placeholder="Acme Technologies Pvt. Ltd." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">Email</label>
                <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="admin@company.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">Tax ID / GST</label>
                <input type="text" value={form.taxId} onChange={(e) => { setForm((p) => ({ ...p, taxId: e.target.value.toUpperCase() })); setSuccess(''); setError(''); }} className="input-field" placeholder="27AABCE1234F1ZP" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-caption text-ink font-medium">Address</label>
                <input type="text" value={form.address} onChange={set('address')} className="input-field" placeholder="Street address" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">City</label>
                <input type="text" value={form.city} onChange={set('city')} className="input-field" placeholder="Mumbai" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">State</label>
                <input type="text" value={form.state} onChange={set('state')} className="input-field" placeholder="Maharashtra" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">Country</label>
                <input type="text" value={form.country} onChange={set('country')} className="input-field" placeholder="India" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink font-medium">Pincode</label>
                <input type="text" value={form.pincode} onChange={set('pincode')} className="input-field" placeholder="400051" />
              </div>
            </div>
          )}

          {/* Save */}
          <div className="px-6 py-4 border-t border-hairline bg-surface-soft/30 flex justify-end">
            <SaveButton label="Save Changes" />
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-canvas border border-hairline rounded-lg">
          {notifLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-6 h-6 border-2 border-hairline border-t-ink rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-hairline">
                <h3 className="text-title-sm text-ink">Email Notifications</h3>
                <p className="text-caption text-muted mt-0.5">Configure when the system sends email notifications.</p>
              </div>
              <div className="px-6 divide-y divide-hairline">
                {NOTIF_EMAIL.map((item) => (
                  <Toggle
                    key={item.key}
                    label={item.label}
                    description={item.description}
                    checked={!!notifPrefs[item.key]}
                    onChange={() => toggleNotif(item.key)}
                  />
                ))}
              </div>
              <div className="px-6 py-4 border-t border-hairline">
                <h3 className="text-title-sm text-ink">System Notifications</h3>
                <p className="text-caption text-muted mt-0.5">In-app notifications and reminders.</p>
              </div>
              <div className="px-6 divide-y divide-hairline">
                {NOTIF_SYSTEM.map((item) => (
                  <Toggle
                    key={item.key}
                    label={item.label}
                    description={item.description}
                    checked={!!notifPrefs[item.key]}
                    onChange={() => toggleNotif(item.key)}
                  />
                ))}
              </div>
              <div className="px-6 py-4 border-t border-hairline bg-surface-soft/30 flex justify-end">
                <button
                  onClick={handleSaveNotif}
                  disabled={isSaving}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {isSaving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Save size={16} />}
                  {isSaving ? 'Saving…' : 'Save Preferences'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          {rolesLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-6 h-6 border-2 border-hairline border-t-ink rounded-full animate-spin" />
            </div>
          ) : rolesData.map((role) => {
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
                        <button
                          onClick={() => handleSaveRole(role.id)}
                          disabled={savingRole}
                          className="btn-primary text-body-sm py-1.5 px-3 inline-flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {savingRole
                            ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Check size={14} />}
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="btn-secondary text-body-sm py-1.5 px-3 inline-flex items-center gap-1.5"
                        >
                          <XIcon size={14} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditRole(role)}
                        className="btn-secondary text-body-sm py-1.5 px-3 inline-flex items-center gap-1.5"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-5">
                  {isEditing ? (
                    <div>
                      <p className="text-caption text-muted mb-3">Edit permissions — toggle on/off:</p>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((perm) => (
                          <button
                            key={perm}
                            onClick={() => togglePerm(perm)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium border transition-all ${
                              editPerms[perm]
                                ? 'bg-ink text-on-primary border-ink'
                                : 'bg-surface-card text-muted border-hairline'
                            }`}
                          >
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
                        {perms.length === 0 ? (
                          <span className="text-caption text-muted italic">No permissions defined</span>
                        ) : perms.map((perm) => (
                          <span
                            key={perm}
                            className="px-2.5 py-1 bg-surface-card border border-hairline rounded-full text-caption text-ink"
                          >
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
            <SaveButton label="Save Settings" />
          </div>
        </div>
      )}
    </div>
  );
}
