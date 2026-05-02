import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, Edit,
  MapPin, CreditCard, Briefcase, Clock, User,
  CalendarDays, CalendarOff, FileText, X, Save, Loader2
} from 'lucide-react';
import { employees, leaves, payroll } from '../services/api.js';
import DateDropdown from '../components/DateDropdown.jsx';

const InfoRow = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-muted" />
      </div>
      <div>
        <p className="text-caption text-muted">{label}</p>
        <p className="text-body-sm text-ink mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  const [myProfile, setMyProfile] = useState({});
  const [quickStats, setQuickStats] = useState([
    { label: 'Present Days', value: '-', icon: CalendarDays },
    { label: 'Leave Balance', value: '-', icon: CalendarOff },
    { label: 'Payslips', value: '-', icon: FileText },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const [empRes, leavesRes, payrollRes] = await Promise.all([
        employees.getMe().catch(() => ({ data: null })),
        leaves.getAll().catch(() => ({ data: { leaves: [] } })),
        payroll.getAll().catch(() => ({ data: [] }))
      ]);
      
      const d = empRes.data || {};
      const hasEmployee = !!(d && d.first_name);

      // If no employee record, fall back to user data from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

      setMyProfile({
        ...d,
        _noEmployeeRecord: !hasEmployee,
        name: hasEmployee
          ? [d.first_name, d.last_name].filter(Boolean).join(' ')
          : [storedUser.first_name, storedUser.last_name].filter(Boolean).join(' ') || '—',
        employee_id: d.employee_code || d.login_id || storedUser.login_id || '—',
        designation: d.designation || (hasEmployee ? '—' : storedUser.role_name || '—'),
        department: d.department || '—',
        email: d.email || storedUser.email || '—',
        phone: d.phone || storedUser.phone || '—',
        address: d.current_address || d.permanent_address || '—',
        join_date: d.date_of_joining || null,
        dob: d.date_of_birth || null,
        gender: d.gender || '—',
        blood_group: d.blood_group || '—',
        employment_type: d.employment_type || '—',
        status: d.status || 'Active',
        role_name: d.role_name || storedUser.role_name || '—',
      });
      
      // Calculate stats
      const leaveList = leavesRes?.data?.leaves || leavesRes?.leaves || [];
      const pendingLeaves = leaveList.filter((l) => l.status === 'Pending').length;
      const payrollList = Array.isArray(payrollRes?.data) ? payrollRes.data : [];
      setQuickStats([
        { label: 'Present Days', value: hasEmployee ? '22 / 25' : '—', icon: CalendarDays },
        { label: 'Pending Leaves', value: `${pendingLeaves}`, icon: CalendarOff },
        { label: 'Payslips', value: payrollList.length.toString(), icon: FileText },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-content mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-content mx-auto">
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">My Profile</h1>
        <p className="text-body-sm text-muted mt-1">
          View your personal and work information.
        </p>
      </div>

      {/* No employee record notice */}
      {myProfile._noEmployeeRecord && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20 text-body-sm text-warning flex items-start gap-2">
          <Calendar size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Employee profile not created yet</p>
            <p className="text-caption mt-0.5 opacity-80">
              Your user account exists but no employee record has been linked. Ask your admin to create an employee profile, or create one from the Employee Directory.
            </p>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-canvas border border-hairline rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
              <h3 className="text-title-sm text-ink">Edit Personal Details</h3>
              <button onClick={() => setEditing(false)} className="p-1.5 text-muted hover:text-ink rounded-md transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setEditError('');
              try {
                await employees.updateMe(editForm);
                setEditing(false);
                fetchMyProfile();
              } catch (err) {
                setEditError(err.message || 'Failed to save');
              } finally {
                setSaving(false);
              }
            }} className="p-6 flex flex-col gap-4">
              {editError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">{editError}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">Phone</label>
                  <input type="text" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="input-field" placeholder="Phone number" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">Date of Birth</label>
                  <DateDropdown
                    id="profileDob"
                    value={editForm.dateOfBirth || ''}
                    onChange={(v) => setEditForm({...editForm, dateOfBirth: v})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">Gender</label>
                  <select value={editForm.gender || ''} onChange={(e) => setEditForm({...editForm, gender: e.target.value})} className="input-field">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">Blood Group</label>
                  <select value={editForm.bloodGroup || ''} onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})} className="input-field">
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">Marital Status</label>
                  <select value={editForm.maritalStatus || ''} onChange={(e) => setEditForm({...editForm, maritalStatus: e.target.value})} className="input-field">
                    <option value="">Select</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink">Current Address</label>
                <textarea value={editForm.currentAddress || ''} onChange={(e) => setEditForm({...editForm, currentAddress: e.target.value})} rows={2} className="input-field resize-none" placeholder="Current address" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-caption text-ink">Permanent Address</label>
                <textarea value={editForm.permanentAddress || ''} onChange={(e) => setEditForm({...editForm, permanentAddress: e.target.value})} rows={2} className="input-field resize-none" placeholder="Permanent address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">Emergency Contact Name</label>
                  <input type="text" value={editForm.emergencyContactName || ''} onChange={(e) => setEditForm({...editForm, emergencyContactName: e.target.value})} className="input-field" placeholder="Name" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption text-ink">Emergency Contact Phone</label>
                  <input type="text" value={editForm.emergencyContactPhone || ''} onChange={(e) => setEditForm({...editForm, emergencyContactPhone: e.target.value})} className="input-field" placeholder="Phone" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-canvas border border-hairline rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-ink text-on-primary flex items-center justify-center text-title-lg font-medium">
              {myProfile.name?.split(' ').map((n) => n[0]).join('') || '?'}
            </div>
            <div>
              <h2 className="font-cal text-display-sm text-ink">{myProfile.name}</h2>
              <p className="text-body-sm text-muted mt-0.5">
                {myProfile.designation}{myProfile.department !== '—' ? ` · ${myProfile.department}` : ''}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-caption text-muted flex items-center gap-1">
                  <Briefcase size={12} />
                  {myProfile.employee_id}
                </span>
                {myProfile.role_name && myProfile.role_name !== '—' && (
                  <span className="badge badge-info">{myProfile.role_name}</span>
                )}
                <span className="badge badge-approved">{myProfile.status}</span>
              </div>
            </div>
          </div>
          {!myProfile._noEmployeeRecord && (
            <button
              onClick={() => {
                setEditForm({
                  phone: myProfile.phone !== '—' ? myProfile.phone : '',
                  dateOfBirth: myProfile.dob || '',
                  gender: myProfile.gender !== '—' ? myProfile.gender : '',
                  bloodGroup: myProfile.blood_group !== '—' ? myProfile.blood_group : '',
                  maritalStatus: myProfile.marital_status || '',
                  currentAddress: myProfile.current_address || '',
                  permanentAddress: myProfile.permanent_address || myProfile.address !== '—' ? myProfile.address : '',
                  emergencyContactName: myProfile.emergency_contact_name || '',
                  emergencyContactPhone: myProfile.emergency_contact_phone || '',
                });
                setEditing(true);
                setEditError('');
              }}
              className="btn-secondary inline-flex items-center gap-2 text-body-sm"
            >
              <Edit size={14} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-canvas border border-hairline rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center">
              <stat.icon size={18} className="text-muted" />
            </div>
            <div>
              <p className="text-caption text-muted">{stat.label}</p>
              <p className="text-title-sm text-ink">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-6 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Contact Information</h3>
          </div>
          <div className="px-6 py-2 divide-y divide-hairline">
            <InfoRow icon={Mail} label="Email" value={myProfile.email} />
            <InfoRow icon={Phone} label="Phone" value={myProfile.phone} />
            <InfoRow icon={MapPin} label="Address" value={myProfile.address} />
          </div>
        </div>

        {/* Work */}
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-6 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Work Information</h3>
          </div>
          <div className="px-6 py-2 divide-y divide-hairline">
            <InfoRow icon={Building2} label="Department" value={myProfile.department} />
            <InfoRow icon={Briefcase} label="Designation" value={myProfile.designation} />
            <InfoRow icon={Briefcase} label="Employment Type" value={myProfile.employment_type} />
            <InfoRow icon={Clock} label="Date of Joining" value={myProfile.join_date ? new Date(myProfile.join_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          </div>
        </div>

        {/* Personal */}
        <div className="bg-canvas border border-hairline rounded-lg lg:col-span-2">
          <div className="px-6 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="px-6 py-2 divide-y divide-hairline">
              <InfoRow icon={Calendar} label="Date of Birth" value={myProfile.dob ? new Date(myProfile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
              <InfoRow icon={User} label="Gender" value={myProfile.gender} />
            </div>
            <div className="px-6 py-2 divide-y divide-hairline">
              <InfoRow icon={Phone} label="Emergency Contact" value={myProfile.emergency_contact_name ? `${myProfile.emergency_contact_name}${myProfile.emergency_contact_phone ? ' · ' + myProfile.emergency_contact_phone : ''}` : '—'} />
              <InfoRow icon={User} label="Blood Group" value={myProfile.blood_group} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CalendarDays, label: 'View Attendance', to: '/app/attendance/me' },
          { icon: CalendarOff, label: 'Apply for Leave', to: '/app/time-off/apply' },
          { icon: FileText, label: 'View Payslip', to: '/app/payroll/my-payslip' },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="bg-canvas border border-hairline rounded-lg p-4 flex items-center gap-3 hover:border-ink/20 hover:shadow-soft transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center group-hover:bg-ink group-hover:text-on-primary transition-all">
              <action.icon size={18} />
            </div>
            <span className="text-body-sm font-medium text-ink">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
