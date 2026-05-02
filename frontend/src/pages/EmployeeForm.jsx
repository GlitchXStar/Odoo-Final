import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, ChevronDown, User, Building2,
  Mail, Phone, MapPin, CreditCard, Calendar, GraduationCap, X, Briefcase, Plus, Trash2, IndianRupee
} from 'lucide-react';
import { employees, users, roles as rolesApi, salaryStructures } from '../services/api.js';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const designations = [
  'Junior Developer', 'Senior Developer', 'Tech Lead', 'Engineering Manager',
  'Marketing Executive', 'Marketing Manager', 'Sales Executive', 'Regional Manager',
  'HR Coordinator', 'HR Manager', 'Accountant', 'Finance Manager',
  'Operations Lead', 'Operations Manager',
];

// For edit mode, this would be pre-filled from API
const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

const employeeStatuses = ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'];

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  employmentType: 'Full-Time', status: 'Active',
  department: '', designation: '', managerId: '', roleId: '',
  joinDate: '', gender: '', dob: '', maritalStatus: '',
  bloodGroup: '', address: '', city: '', state: '', pincode: '',
  emergencyName: '', emergencyPhone: '', emergencyRelation: '',
  bankName: '', accountNumber: '', ifsc: '', panNumber: '',
  skills: [],
  experience: [],
};

// Mock pre-fill for edit mode
const existingEmployee = {
  firstName: 'Priya', lastName: 'Sharma',
  email: 'priya.sharma@empay.io', phone: '+91 98765 43210',
  department: 'Engineering', designation: 'Senior Developer', reportingTo: 'Rajesh Kumar',
  joinDate: '2024-01-15', gender: 'Female', dob: '1995-06-20', maritalStatus: 'Single',
  bloodGroup: 'O+', address: '42, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400058',
  emergencyName: 'Ramesh Sharma', emergencyPhone: '+91 98765 11111', emergencyRelation: 'Father',
  bankName: 'HDFC Bank', accountNumber: '1234567890', ifsc: 'HDFC0001234', panNumber: 'ABCPS1234K',
};

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="border-b border-hairline last:border-0">
      <div className="px-6 py-4 bg-surface-soft/50 flex items-center gap-2">
        <Icon size={16} className="text-muted" />
        <h3 className="text-title-sm text-ink">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, id, type = 'text', placeholder, value, onChange, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption text-ink">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children || (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field"
          required={required}
        />
      )}
    </div>
  );
}

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [userId, setUserId] = useState(null);
  const [managerList, setManagerList] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [salary, setSalary] = useState({
    basic: '', hra: '', conveyanceAllowance: '', medicalAllowance: '',
    specialAllowance: '', bonus: '', otherAllowances: '', effectiveFrom: '',
  });
  const [salaryId, setSalaryId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = (currentUser.role_name || '').toLowerCase() === 'admin';

  useEffect(() => {
    fetchManagers();
    if (isAdmin) rolesApi.getAll().then(r => setAllRoles(r?.data || [])).catch(() => {});
    if (isEdit && id) fetchEmployee(id);
  }, [isEdit, id]);

  const updateSalary = (field) => (e) =>
    setSalary(prev => ({ ...prev, [field]: e.target.value }));

  const fetchManagers = async () => {
    try {
      const res = await employees.getAll();
      const list = res?.data?.employees ?? res?.data ?? res;
      setManagerList(Array.isArray(list) ? list : []);
    } catch { setManagerList([]); }
  };

  const fetchEmployee = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await employees.getById(employeeId);
      const d = response?.data || {};
      setUserId(d.user_id || null);
      // Fetch salary structure
      if (d.user_id) {
        try {
          const salRes = await salaryStructures.getActiveByUser(d.user_id);
          const s = salRes?.data || salRes;
          if (s && s.id) {
            setSalaryId(s.id);
            setSalary({
              basic: s.basic || '', hra: s.hra || '',
              conveyanceAllowance: s.conveyance_allowance || '',
              medicalAllowance: s.medical_allowance || '',
              specialAllowance: s.special_allowance || '',
              bonus: s.bonus || '', otherAllowances: s.other_allowances || '',
              effectiveFrom: s.effective_from ? s.effective_from.slice(0, 10) : '',
            });
          }
        } catch {}
      }
      setForm({
        firstName: d.first_name ?? '',
        lastName: d.last_name ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        status: d.status ?? 'Active',
        department: d.department ?? '',
        designation: d.designation ?? '',
        managerId: d.manager_id ? String(d.manager_id) : '',
        roleId: d.role_id ? String(d.role_id) : '',
        joinDate: d.date_of_joining ? d.date_of_joining.slice(0, 10) : '',
        gender: d.gender ?? '',
        dob: d.date_of_birth ? d.date_of_birth.slice(0, 10) : '',
        maritalStatus: d.marital_status ?? '',
        bloodGroup: d.blood_group ?? '',
        address: d.permanent_address ?? '',
        city: '',
        state: '',
        pincode: '',
        emergencyName: d.emergency_contact_name ?? '',
        emergencyPhone: d.emergency_contact_phone ?? '',
        emergencyRelation: d.emergency_contact_relation ?? '',
        bankName: d.bank_name ?? '',
        accountNumber: d.bank_account_number ?? '',
        ifsc: d.bank_ifsc ?? '',
        panNumber: d.pan_number ?? '',
        skills: Array.isArray(d.skills) ? d.skills : [],
        experience: Array.isArray(d.experience) ? d.experience : [],
      });
    } catch (err) {
      setError(err.message || 'Failed to load employee');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field) => (e) => {
    let val = e.target.value;
    if (field === 'panNumber' || field === 'ifsc') val = val.toUpperCase();
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const toUserPayload = (f) => ({
    firstName: f.firstName || undefined,
    lastName: f.lastName || undefined,
    email: f.email || undefined,
    phone: f.phone || undefined,
  });

  const toApiPayload = (f) => ({
    status: f.status || undefined,
    department: f.department || undefined,
    designation: f.designation || undefined,
    managerId: f.managerId ? Number(f.managerId) : undefined,
    gender: f.gender || undefined,
    maritalStatus: f.maritalStatus || undefined,
    bloodGroup: f.bloodGroup || undefined,
    dateOfBirth: f.dob || undefined,
    emergencyContactName: f.emergencyName || undefined,
    emergencyContactPhone: f.emergencyPhone || undefined,
    permanentAddress: f.address ? [f.address, f.city, f.state, f.pincode].filter(Boolean).join(', ') : undefined,
    panNumber: f.panNumber || undefined,
    bankAccountNumber: f.accountNumber || undefined,
    bankName: f.bankName || undefined,
    bankIfsc: f.ifsc || undefined,
    skills: f.skills && f.skills.length > 0 ? f.skills : undefined,
    experience: f.experience && f.experience.length > 0 ? f.experience : undefined,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isEdit) {
        await employees.update(id, toApiPayload(form));
        if (userId) {
          const userUpdate = toUserPayload(form);
          if (form.roleId) userUpdate.roleId = parseInt(form.roleId);
          await users.update(userId, userUpdate);
        }
        // Save salary structure
        if (salary.basic && Number(salary.basic) > 0) {
          const salPayload = {
            userId, basic: Number(salary.basic), hra: Number(salary.hra) || 0,
            conveyanceAllowance: Number(salary.conveyanceAllowance) || 0,
            medicalAllowance: Number(salary.medicalAllowance) || 0,
            specialAllowance: Number(salary.specialAllowance) || 0,
            bonus: Number(salary.bonus) || 0, otherAllowances: Number(salary.otherAllowances) || 0,
            effectiveFrom: salary.effectiveFrom || new Date().toISOString().split('T')[0],
          };
          if (salaryId) await salaryStructures.update(salaryId, salPayload);
          else await salaryStructures.create(salPayload);
        }
      } else {
        if (!form.email) throw new Error('Email is required.');
        if (!form.joinDate) throw new Error('Join date is required.');
        await employees.createWithUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          roleId: form.roleId ? parseInt(form.roleId) : 4,
          dateOfJoining: form.joinDate,
          employmentType: form.employmentType,
          department: form.department || undefined,
          designation: form.designation || undefined,
          managerId: form.managerId ? Number(form.managerId) : undefined,
          gender: form.gender || undefined,
          maritalStatus: form.maritalStatus || undefined,
          bloodGroup: form.bloodGroup || undefined,
          dateOfBirth: form.dob || undefined,
          emergencyContactName: form.emergencyName || undefined,
          emergencyContactPhone: form.emergencyPhone || undefined,
          permanentAddress: form.address ? [form.address, form.city, form.state, form.pincode].filter(Boolean).join(', ') : undefined,
          panNumber: form.panNumber || undefined,
          bankAccountNumber: form.accountNumber || undefined,
          bankName: form.bankName || undefined,
          bankIfsc: form.ifsc || undefined,
          skills: form.skills.length > 0 ? form.skills : undefined,
          experience: form.experience.length > 0 ? form.experience : undefined,
        });
        // Save salary for new employee
        if (salary.basic && Number(salary.basic) > 0) {
          const newRes = await employees.getAll();
          const allEmps = newRes?.data?.employees ?? newRes?.data ?? [];
          const created = allEmps.find(emp => emp.email === form.email);
          if (created?.user_id) {
            await salaryStructures.create({
              userId: created.user_id, basic: Number(salary.basic),
              hra: Number(salary.hra) || 0, conveyanceAllowance: Number(salary.conveyanceAllowance) || 0,
              medicalAllowance: Number(salary.medicalAllowance) || 0, specialAllowance: Number(salary.specialAllowance) || 0,
              bonus: Number(salary.bonus) || 0, otherAllowances: Number(salary.otherAllowances) || 0,
              effectiveFrom: salary.effectiveFrom || form.joinDate || new Date().toISOString().split('T')[0],
            });
          }
        }
      }
      navigate('/app/employees');
    } catch (err) {
      setError(err.message || 'Failed to save employee');
      setIsLoading(false);
    }
  };

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

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h1>
          <p className="text-body-sm text-muted mt-1">
            {isEdit
              ? `Update details for ${form.firstName} ${form.lastName}`
              : 'Fill in the details to add a new employee.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden mb-6">
          {/* Basic Info */}
          <FormSection title="Basic Information" icon={User}>
            <FormField
              label="First Name" id="firstName" placeholder="First name"
              value={form.firstName} onChange={update('firstName')} required
            />
            <FormField
              label="Last Name" id="lastName" placeholder="Last name"
              value={form.lastName} onChange={update('lastName')} required
            />
            <FormField
              label="Email" id="email" type="email" placeholder="employee@empay.io"
              value={form.email} onChange={update('email')} required
            />
            <FormField
              label="Phone" id="phone" type="tel" placeholder="+91 98765 43210"
              value={form.phone} onChange={update('phone')} required
            />
          </FormSection>

          {/* Work Info */}
          <FormSection title="Work Information" icon={Building2}>
            {isEdit && (
              <FormField label="Status" id="status" required>
                <div className="relative">
                  <select
                    id="status"
                    value={form.status}
                    onChange={update('status')}
                    className="input-field appearance-none pr-10 cursor-pointer"
                    required
                  >
                    {employeeStatuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </FormField>
            )}
            <FormField label="Employment Type" id="employmentType" required>
              <div className="relative">
                <select
                  id="employmentType"
                  value={form.employmentType}
                  onChange={update('employmentType')}
                  className="input-field appearance-none pr-10 cursor-pointer"
                  required
                >
                  {employmentTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </FormField>
            <FormField label="Department" id="department" required>
              <div className="relative">
                <select
                  id="department"
                  value={form.department}
                  onChange={update('department')}
                  className="input-field appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="" disabled>Select department</option>
                  {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </FormField>
            <FormField label="Designation" id="designation" required>
              <div className="relative">
                <select
                  id="designation"
                  value={form.designation}
                  onChange={update('designation')}
                  className="input-field appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="" disabled>Select designation</option>
                  {designations.map((d) => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </FormField>
            {isAdmin && allRoles.length > 0 && (
              <FormField label="Role" id="roleId" required>
                <div className="relative">
                  <select
                    id="roleId"
                    value={form.roleId}
                    onChange={update('roleId')}
                    className="input-field appearance-none pr-10 cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select role</option>
                    {allRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </FormField>
            )}
            <FormField label="Reporting To" id="managerId">
              <div className="relative">
                <select
                  id="managerId"
                  value={form.managerId}
                  onChange={update('managerId')}
                  className="input-field appearance-none pr-10 cursor-pointer"
                >
                  <option value="">— None —</option>
                  {managerList
                    .filter((m) => !isEdit || m.user_id !== userId)
                    .map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.first_name} {m.last_name}
                        {m.designation ? ` · ${m.designation}` : ''}
                      </option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </FormField>
            <FormField label="Join Date" id="joinDate" required>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={form.joinDate ? parseInt(form.joinDate.split('-')[2]) : ''}
                    onChange={(e) => {
                      const [y, m] = (form.joinDate || `${new Date().getFullYear()}-01-01`).split('-');
                      setForm(prev => ({...prev, joinDate: `${y}-${m}-${String(e.target.value).padStart(2,'0')}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="relative flex-[2]">
                  <select
                    value={form.joinDate ? parseInt(form.joinDate.split('-')[1]) : ''}
                    onChange={(e) => {
                      const [y, , d] = (form.joinDate || `${new Date().getFullYear()}-01-01`).split('-');
                      setForm(prev => ({...prev, joinDate: `${y}-${String(e.target.value).padStart(2,'0')}-${d}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Month</option>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={form.joinDate ? parseInt(form.joinDate.split('-')[0]) : ''}
                    onChange={(e) => {
                      const [, m, d] = (form.joinDate || `${new Date().getFullYear()}-01-01`).split('-');
                      setForm(prev => ({...prev, joinDate: `${e.target.value}-${m}-${d}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>
            </FormField>
          </FormSection>

          {/* Personal Details */}
          <FormSection title="Personal Details" icon={Calendar}>
            <FormField label="Date of Birth" id="dob">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={form.dob ? parseInt(form.dob.split('-')[2]) : ''}
                    onChange={(e) => {
                      const [y, m] = (form.dob || `${new Date().getFullYear()}-01-01`).split('-');
                      setForm(prev => ({...prev, dob: `${y}-${m}-${String(e.target.value).padStart(2,'0')}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="relative flex-[2]">
                  <select
                    value={form.dob ? parseInt(form.dob.split('-')[1]) : ''}
                    onChange={(e) => {
                      const [y, , d] = (form.dob || `${new Date().getFullYear()}-01-01`).split('-');
                      setForm(prev => ({...prev, dob: `${y}-${String(e.target.value).padStart(2,'0')}-${d}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Month</option>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={form.dob ? parseInt(form.dob.split('-')[0]) : ''}
                    onChange={(e) => {
                      const [, m, d] = (form.dob || `${new Date().getFullYear()}-01-01`).split('-');
                      setForm(prev => ({...prev, dob: `${e.target.value}-${m}-${d}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>
            </FormField>
            <FormField label="Gender" id="gender">
              <div className="relative">
                <select
                  id="gender"
                  value={form.gender}
                  onChange={update('gender')}
                  className="input-field appearance-none pr-10 cursor-pointer"
                >
                  <option value="" disabled>Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </FormField>
            <FormField label="Marital Status" id="maritalStatus">
              <div className="relative">
                <select
                  id="maritalStatus"
                  value={form.maritalStatus}
                  onChange={update('maritalStatus')}
                  className="input-field appearance-none pr-10 cursor-pointer"
                >
                  <option value="" disabled>Select status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </FormField>
            <FormField
              label="Blood Group" id="bloodGroup" placeholder="e.g. O+"
              value={form.bloodGroup} onChange={update('bloodGroup')}
            />
          </FormSection>

          {/* Address */}
          <FormSection title="Address" icon={MapPin}>
            <div className="md:col-span-2">
              <FormField
                label="Street Address" id="address" placeholder="Street address"
                value={form.address} onChange={update('address')}
              />
            </div>
            <FormField
              label="City" id="city" placeholder="City"
              value={form.city} onChange={update('city')}
            />
            <FormField
              label="State" id="state" placeholder="State"
              value={form.state} onChange={update('state')}
            />
            <FormField
              label="PIN Code" id="pincode" placeholder="400001"
              value={form.pincode} onChange={update('pincode')}
            />
          </FormSection>

          {/* Emergency Contact */}
          <FormSection title="Emergency Contact" icon={Phone}>
            <FormField
              label="Contact Name" id="emergencyName" placeholder="Name"
              value={form.emergencyName} onChange={update('emergencyName')}
            />
            <FormField
              label="Phone Number" id="emergencyPhone" type="tel" placeholder="+91 98765 43210"
              value={form.emergencyPhone} onChange={update('emergencyPhone')}
            />
            <FormField
              label="Relationship" id="emergencyRelation" placeholder="e.g. Father, Spouse"
              value={form.emergencyRelation} onChange={update('emergencyRelation')}
            />
          </FormSection>

          {/* Banking */}
          <FormSection title="Banking Details" icon={CreditCard}>
            <FormField
              label="Bank Name" id="bankName" placeholder="e.g. HDFC Bank"
              value={form.bankName} onChange={update('bankName')}
            />
            <FormField
              label="Account Number" id="accountNumber" placeholder="Account number"
              value={form.accountNumber} onChange={update('accountNumber')}
            />
            <FormField label="IFSC Code" id="ifsc">
              <input
                id="ifsc"
                type="text"
                value={form.ifsc}
                onChange={update('ifsc')}
                placeholder="e.g. HDFC0001234"
                className="input-field uppercase"
                maxLength={11}
                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                title="IFSC format: 4 letters, 0, 6 alphanumeric (e.g. HDFC0001234)"
              />
            </FormField>
            <FormField label="PAN Number" id="panNumber">
              <input
                id="panNumber"
                type="text"
                value={form.panNumber}
                onChange={update('panNumber')}
                placeholder="e.g. ABCPS1234K"
                className="input-field uppercase"
                maxLength={10}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCPS1234K)"
              />
            </FormField>
          </FormSection>

          {/* Skills & Expertise */}
          <FormSection title="Skills & Expertise" icon={GraduationCap}>
            <div className="md:col-span-2">
              <label className="text-caption text-ink mb-1.5 block">Skills</label>
              <div
                className="input-field flex flex-wrap items-center gap-1.5 min-h-[42px] cursor-text py-1.5"
                onClick={(e) => { e.currentTarget.querySelector('input')?.focus(); }}
              >
                {form.skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-ink text-on-primary rounded-full text-caption font-medium whitespace-nowrap">
                    {skill}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) })); }}
                      className="hover:text-white/60 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={form.skills.length === 0 ? "Type a skill and press Space" : ""}
                  className="bg-transparent border-none outline-none text-body-sm text-ink placeholder:text-muted flex-1 min-w-[120px] py-0.5"
                  onKeyDown={(e) => {
                    const val = e.target.value.trim();
                    if ((e.key === ' ' || e.key === 'Enter' || e.key === ',') && val) {
                      e.preventDefault();
                      if (!form.skills.includes(val)) {
                        setForm(prev => ({ ...prev, skills: [...prev.skills, val] }));
                      }
                      e.target.value = '';
                    }
                    if (e.key === 'Backspace' && !e.target.value && form.skills.length > 0) {
                      setForm(prev => ({ ...prev, skills: prev.skills.slice(0, -1) }));
                    }
                  }}
                />
              </div>
              <p className="text-caption text-muted mt-1.5">Press Space, Enter, or comma to add a skill. Backspace to remove.</p>
            </div>
          </FormSection>

          {/* Experience */}
          <FormSection title="Work Experience" icon={Briefcase}>
            <div className="md:col-span-2 flex flex-col gap-4">
              {form.experience.map((exp, i) => (
                <div key={i} className="border border-hairline rounded-lg p-4 relative bg-surface-soft/30">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }))}
                    className="absolute top-3 right-3 p-1 text-muted hover:text-error transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-caption text-ink">Company *</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...form.experience];
                          updated[i] = { ...updated[i], company: e.target.value };
                          setForm(prev => ({ ...prev, experience: updated }));
                        }}
                        placeholder="Company name"
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-caption text-ink">Role / Title *</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...form.experience];
                          updated[i] = { ...updated[i], role: e.target.value };
                          setForm(prev => ({ ...prev, experience: updated }));
                        }}
                        placeholder="Job title"
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-caption text-ink">From</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-[2]">
                          <select
                            value={exp.from ? parseInt(exp.from.split('-')[1]) : ''}
                            onChange={(e) => {
                              const updated = [...form.experience];
                              const y = exp.from ? exp.from.split('-')[0] : String(new Date().getFullYear());
                              updated[i] = { ...updated[i], from: `${y}-${String(e.target.value).padStart(2, '0')}` };
                              setForm(prev => ({ ...prev, experience: updated }));
                            }}
                            className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Month</option>
                            {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                          <select
                            value={exp.from ? parseInt(exp.from.split('-')[0]) : ''}
                            onChange={(e) => {
                              const updated = [...form.experience];
                              const m = exp.from ? exp.from.split('-')[1] : '01';
                              updated[i] = { ...updated[i], from: `${e.target.value}-${m}` };
                              setForm(prev => ({ ...prev, experience: updated }));
                            }}
                            className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Year</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-caption text-ink">To</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-[2]">
                          <select
                            value={exp.to ? parseInt(exp.to.split('-')[1]) : ''}
                            onChange={(e) => {
                              const updated = [...form.experience];
                              const y = exp.to ? exp.to.split('-')[0] : String(new Date().getFullYear());
                              updated[i] = { ...updated[i], to: `${y}-${String(e.target.value).padStart(2, '0')}` };
                              setForm(prev => ({ ...prev, experience: updated }));
                            }}
                            className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                          >
                            <option value="">Present</option>
                            {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                          <select
                            value={exp.to ? parseInt(exp.to.split('-')[0]) : ''}
                            onChange={(e) => {
                              const updated = [...form.experience];
                              const m = exp.to ? exp.to.split('-')[1] : '01';
                              updated[i] = { ...updated[i], to: e.target.value ? `${e.target.value}-${m}` : '' };
                              setForm(prev => ({ ...prev, experience: updated }));
                            }}
                            className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                          >
                            <option value="">Year</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    <label className="text-caption text-ink">Description</label>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => {
                        const updated = [...form.experience];
                        updated[i] = { ...updated[i], description: e.target.value };
                        setForm(prev => ({ ...prev, experience: updated }));
                      }}
                      rows={2}
                      placeholder="Brief description of your role"
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, experience: [...prev.experience, { company: '', role: '', from: '', to: '', description: '' }] }))}
                className="btn-secondary inline-flex items-center gap-2 text-body-sm w-fit"
              >
                <Plus size={14} />
                Add Experience
              </button>
            </div>
          </FormSection>

          {/* Salary Structure */}
          <FormSection title="Salary Structure" icon={IndianRupee}>
            <FormField
              label="Basic Salary" id="basic" type="number" placeholder="e.g. 30000"
              value={salary.basic} onChange={updateSalary('basic')} required
            />
            <FormField
              label="HRA" id="hra" type="number" placeholder="e.g. 12000"
              value={salary.hra} onChange={updateSalary('hra')}
            />
            <FormField
              label="Conveyance Allowance" id="conveyanceAllowance" type="number" placeholder="0"
              value={salary.conveyanceAllowance} onChange={updateSalary('conveyanceAllowance')}
            />
            <FormField
              label="Medical Allowance" id="medicalAllowance" type="number" placeholder="0"
              value={salary.medicalAllowance} onChange={updateSalary('medicalAllowance')}
            />
            <FormField
              label="Special Allowance" id="specialAllowance" type="number" placeholder="0"
              value={salary.specialAllowance} onChange={updateSalary('specialAllowance')}
            />
            <FormField
              label="Bonus" id="bonus" type="number" placeholder="0"
              value={salary.bonus} onChange={updateSalary('bonus')}
            />
            <FormField
              label="Other Allowances" id="otherAllowances" type="number" placeholder="0"
              value={salary.otherAllowances} onChange={updateSalary('otherAllowances')}
            />
            <FormField label="Effective From" id="effectiveFrom">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={salary.effectiveFrom ? parseInt(salary.effectiveFrom.split('-')[2]) : ''}
                    onChange={(e) => {
                      const [y, m] = (salary.effectiveFrom || `${new Date().getFullYear()}-01-01`).split('-');
                      setSalary(prev => ({...prev, effectiveFrom: `${y}-${m}-${String(e.target.value).padStart(2,'0')}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="relative flex-[2]">
                  <select
                    value={salary.effectiveFrom ? parseInt(salary.effectiveFrom.split('-')[1]) : ''}
                    onChange={(e) => {
                      const [y, , d] = (salary.effectiveFrom || `${new Date().getFullYear()}-01-01`).split('-');
                      setSalary(prev => ({...prev, effectiveFrom: `${y}-${String(e.target.value).padStart(2,'0')}-${d}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Month</option>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={salary.effectiveFrom ? parseInt(salary.effectiveFrom.split('-')[0]) : ''}
                    onChange={(e) => {
                      const [, m, d] = (salary.effectiveFrom || `${new Date().getFullYear()}-01-01`).split('-');
                      setSalary(prev => ({...prev, effectiveFrom: `${e.target.value}-${m}-${d}`}));
                    }}
                    className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>
            </FormField>
            {(salary.basic || salary.hra || salary.conveyanceAllowance || salary.medicalAllowance || salary.specialAllowance || salary.bonus || salary.otherAllowances) && (
              <div className="md:col-span-2 p-4 bg-surface-soft rounded-lg flex items-center justify-between">
                <span className="text-body-sm font-medium text-ink">Gross Salary</span>
                <span className="text-title-sm text-ink font-cal">
                  ₹{(
                    Number(salary.basic || 0) + Number(salary.hra || 0) +
                    Number(salary.conveyanceAllowance || 0) + Number(salary.medicalAllowance || 0) +
                    Number(salary.specialAllowance || 0) + Number(salary.bonus || 0) +
                    Number(salary.otherAllowances || 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </FormSection>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/app/employees"
            className="btn-secondary inline-flex items-center gap-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary inline-flex items-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Save Changes' : 'Add Employee'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
