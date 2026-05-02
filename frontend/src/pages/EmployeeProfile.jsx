import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, Edit,
  MapPin, CreditCard, GraduationCap, DollarSign,
  User, Briefcase, Clock, ChevronDown, Trash2, AlertTriangle
} from 'lucide-react';
import { employees, salaryStructures, payroll as payrollApi } from '../services/api.js';

const employeeStatuses = ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'];
const statusBadgeClass = {
  Active: 'badge-approved',
  Inactive: 'badge-rejected',
  'On Leave': 'badge-pending',
  Terminated: 'badge-rejected',
  Resigned: 'badge-rejected',
};


const tabs = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'banking', label: 'Banking', icon: CreditCard },
  { key: 'skills', label: 'Skills', icon: GraduationCap },
  { key: 'salary', label: 'Salary', icon: DollarSign },
];

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-3">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={14} className="text-muted" />
        </div>
      )}
      <div>
        <p className="text-caption text-muted">{label}</p>
        <p className="text-body-sm text-ink mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [emp, setEmp] = useState(null);
  const [sal, setSal] = useState(null);
  const [latestPayroll, setLatestPayroll] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employees.delete(id);
      navigate('/app/employees');
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === emp.status) return;
    setStatusUpdating(true);
    try {
      await employees.update(id, { status: newStatus });
      setEmp(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
  }, [id]);

  const fetchEmployee = async (employeeId) => {
    try {
      setLoading(true);
      const response = await employees.getById(employeeId);
      const empData = response?.data || {};
      setEmp(empData);
      if (empData.user_id) {
        const [, payrollRes] = await Promise.allSettled([
          salaryStructures.getActiveByUser(empData.user_id)
            .then((r) => setSal(r?.data || r || null))
            .catch(() => setSal(null)),
          fetch(`/api/payroll?userId=${empData.user_id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(r => r.json()).then(r => {
            const rows = r?.data;
            if (Array.isArray(rows) && rows.length > 0) setLatestPayroll(rows[0]);
          }).catch(() => {})
        ]);
        // If no processed payroll, fetch backend estimate
        const payrollRows = payrollRes?.value;
        const hasPayroll = Array.isArray(payrollRows) && payrollRows.length > 0;
        if (!hasPayroll) {
          payrollApi.estimate(empData.user_id)
            .then((r) => setEstimate(r?.data || r || null))
            .catch(() => setEstimate(null));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load employee');
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

  if (!emp) return null;

  return (
    <div className="max-w-content mx-auto">
      {/* Back Link */}
      <Link
        to="/app/employees"
        className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to directory
      </Link>

      {/* Profile Header */}
      <div className="bg-canvas border border-hairline rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-card flex items-center justify-center text-title-lg text-ink font-medium">
              {`${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`}
            </div>
            <div>
              <h1 className="font-cal text-display-sm text-ink">{emp.first_name} {emp.last_name}</h1>
              <p className="text-body-sm text-muted mt-0.5">
                {emp.designation} · {emp.department}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-caption text-muted flex items-center gap-1">
                  <Briefcase size={12} />
                  {emp.login_id}
                </span>
                <span className="text-caption text-muted flex items-center gap-1">
                  <Calendar size={12} />
                  {emp.date_of_joining ? `Joined ${new Date(emp.date_of_joining).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : ''}
                </span>
                <div className="relative inline-flex">
                  <select
                    value={emp.status || 'Active'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusUpdating}
                    className={`badge ${statusBadgeClass[emp.status] || 'badge-approved'} appearance-none cursor-pointer pr-6 border-0 outline-none text-caption font-medium`}
                  >
                    {employeeStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/app/employees/${id}/edit`}
              className="btn-secondary inline-flex items-center gap-2 text-body-sm"
            >
              <Edit size={14} />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm font-medium text-error border border-error/20 hover:bg-error/10 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-canvas rounded-xl shadow-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-error" />
              </div>
              <div>
                <h3 className="text-title-sm text-ink">Delete Employee</h3>
                <p className="text-caption text-muted">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-body-sm text-muted mb-6">
              Are you sure you want to delete <strong>{emp.first_name} {emp.last_name}</strong>? This will permanently remove their profile, attendance records, leave data, and salary information.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-body-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-medium text-white bg-error hover:bg-error/90 transition-colors"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface-card rounded-lg w-fit">
        {tabs.map((tab) => (
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
      <div className="bg-canvas border border-hairline rounded-lg">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="p-6">
              <h3 className="text-title-sm text-ink mb-4">Contact Information</h3>
              <div className="space-y-1 divide-y divide-hairline">
                <InfoRow icon={Mail} label="Email" value={emp.email} />
                <InfoRow icon={Phone} label="Phone" value={emp.phone} />
                <InfoRow icon={MapPin} label="Location" value={emp.permanent_address || '—'} />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-title-sm text-ink mb-4">Work Information</h3>
              <div className="space-y-1 divide-y divide-hairline">
                <InfoRow icon={Building2} label="Department" value={emp.department || '—'} />
                <InfoRow icon={Briefcase} label="Designation" value={emp.designation || '—'} />
                <InfoRow icon={User} label="Employee Type" value={emp.employment_type || '—'} />
                <InfoRow icon={Clock} label="Joined" value={emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="p-6">
              <h3 className="text-title-sm text-ink mb-4">Personal Details</h3>
              <div className="space-y-1 divide-y divide-hairline">
                <InfoRow icon={Calendar} label="Date of Birth" value={emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                <InfoRow icon={User} label="Gender" value={emp.gender || '—'} />
                <InfoRow icon={User} label="Marital Status" value={emp.marital_status || '—'} />
                <InfoRow icon={User} label="Blood Group" value={emp.blood_group || '—'} />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-title-sm text-ink mb-4">Address & Emergency</h3>
              <div className="space-y-1 divide-y divide-hairline">
                <InfoRow icon={MapPin} label="Address" value={emp.permanent_address || '—'} />
                <InfoRow icon={Phone} label="Emergency Contact" value={emp.emergency_contact_phone || '—'} />
                <InfoRow icon={User} label="Emergency Person" value={emp.emergency_contact_name || '—'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="p-6 max-w-md">
            <h3 className="text-title-sm text-ink mb-4">Banking Details</h3>
            <div className="space-y-1 divide-y divide-hairline">
              <InfoRow icon={CreditCard} label="Bank Name" value={emp.bank_name || '—'} />
              <InfoRow icon={CreditCard} label="Account Number" value={emp.bank_account_number || '—'} />
              <InfoRow icon={CreditCard} label="IFSC Code" value={emp.bank_ifsc || '—'} />
              <InfoRow icon={CreditCard} label="PAN Number" value={emp.pan_number || '—'} />
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="p-6">
            <h3 className="text-title-sm text-ink mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {(emp.skills && emp.skills.length > 0) ? emp.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-ink text-on-primary rounded-full text-caption font-medium"
                >
                  {skill}
                </span>
              )) : <p className="text-body-sm text-muted">No skills listed.</p>}
            </div>

            <h3 className="text-title-sm text-ink mb-4 mt-8">Work Experience</h3>
            {(emp.experience && emp.experience.length > 0) ? (
              <div className="flex flex-col gap-4">
                {emp.experience.map((exp, i) => (
                  <div key={i} className="border border-hairline rounded-lg p-4 bg-surface-soft/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-body-sm font-medium text-ink">{exp.role}</p>
                        <p className="text-caption text-muted">{exp.company}</p>
                      </div>
                      <span className="text-caption text-muted whitespace-nowrap">
                        {exp.from || '?'} — {exp.to || 'Present'}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-body-sm text-muted mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="text-body-sm text-muted">No experience listed.</p>}
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-sm text-ink">Salary Breakdown</h3>
              <Link to={`/app/employees/${id}/salary`} className="btn-secondary inline-flex items-center gap-2 text-body-sm">
                <Edit size={14} />
                Edit Salary
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Earnings */}
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wide">Earnings</p>
                <div className="space-y-2">
                  {latestPayroll ? (() => {
                    const rows = [
                      ['Basic Salary', latestPayroll.basic],
                      ['HRA', latestPayroll.hra],
                      ['Allowances', latestPayroll.allowances],
                      ['Bonus', latestPayroll.bonus],
                    ].filter(([, val]) => Number(val) > 0);
                    const componentGross = rows.reduce((sum, [, val]) => sum + Number(val), 0);
                    return (
                      <>
                        {rows.map(([label, val]) => (
                          <div key={label} className="flex justify-between text-body-sm">
                            <span className="text-muted">{label}</span>
                            <span className="text-ink font-medium">₹{Number(val).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-body-sm border-t border-hairline pt-2 mt-2">
                          <span className="font-medium text-ink">Gross Salary</span>
                          <span className="font-medium text-ink">₹{componentGross.toLocaleString()}</span>
                        </div>
                        {Number(latestPayroll.gross_salary) < componentGross && (
                          <p className="text-caption text-muted italic mt-1">
                            Adjusted to ₹{Number(latestPayroll.gross_salary).toLocaleString()} after attendance deductions
                          </p>
                        )}
                      </>
                    );
                  })() : sal ? [
                    ['Basic Salary', sal.basic],
                    ['HRA', sal.hra],
                    ['Conveyance', sal.conveyance_allowance],
                    ['Medical', sal.medical_allowance],
                    ['Special Allowance', sal.special_allowance],
                    ['Bonus', sal.bonus],
                    ['Other Allowances', sal.other_allowances],
                  ].filter(([, val]) => Number(val) > 0).map(([label, val]) => (
                    <div key={label} className="flex justify-between text-body-sm">
                      <span className="text-muted">{label}</span>
                      <span className="text-ink font-medium">₹{Number(val).toLocaleString()}</span>
                    </div>
                  )) : <p className="text-body-sm text-muted">No salary structure set.</p>}
                  {!latestPayroll && sal && (
                    <div className="flex justify-between text-body-sm border-t border-hairline pt-2 mt-2">
                      <span className="font-medium text-ink">Gross Salary</span>
                      <span className="font-medium text-ink">₹{Number(sal.gross_salary || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions */}
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wide">Deductions</p>
                <div className="space-y-2">
                  {(() => {
                    const src = latestPayroll || estimate;
                    if (!src) return <p className="text-body-sm text-muted">No salary structure set.</p>;
                    if (!latestPayroll && estimate) {
                      return <p className="text-caption text-muted italic mb-2">Estimated (payroll not yet run)</p>;
                    }
                  })()}
                  {(latestPayroll || estimate) ? (
                    <>
                      {[
                        ['Provident Fund', (latestPayroll || estimate).pf_deduction],
                        ['ESI', (latestPayroll || estimate).esi_deduction],
                        ['Professional Tax', (latestPayroll || estimate).professional_tax],
                        ['Income Tax (TDS)', (latestPayroll || estimate).income_tax],
                      ].filter(([, v]) => Number(v) > 0).map(([label, val]) => (
                        <div key={label} className="flex justify-between text-body-sm">
                          <span className="text-muted">{label}</span>
                          <span className="text-error font-medium">-₹{Number(val).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-body-sm border-t border-hairline pt-2 mt-2">
                        <span className="font-medium text-ink">Total Deductions</span>
                        <span className="font-medium text-error">-₹{Number((latestPayroll || estimate).total_deductions).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-body-sm border-t border-hairline pt-2 mt-2">
                      <span className="font-medium text-ink">Total Deductions</span>
                      <span className="font-medium text-error">-₹0</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Net */}
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wide">Net Pay</p>
                <div className="bg-surface-card rounded-lg p-5 text-center">
                  <p className="text-caption text-muted">
                    {latestPayroll ? 'Last Processed Salary' : 'Estimated Take-home'}
                  </p>
                  <p className="text-display-sm text-ink font-cal mt-1">
                    ₹{Number((latestPayroll || estimate)?.net_salary || 0).toLocaleString()}
                  </p>
                  <p className="text-caption text-muted mt-1">per month</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
