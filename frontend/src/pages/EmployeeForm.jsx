import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, ChevronDown, User, Building2,
  Mail, Phone, MapPin, CreditCard, Calendar
} from 'lucide-react';
import { employees, users } from '../services/api.js';

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const designations = [
  'Junior Developer', 'Senior Developer', 'Tech Lead', 'Engineering Manager',
  'Marketing Executive', 'Marketing Manager', 'Sales Executive', 'Regional Manager',
  'HR Coordinator', 'HR Manager', 'Accountant', 'Finance Manager',
  'Operations Lead', 'Operations Manager',
];

// For edit mode, this would be pre-filled from API
const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  employmentType: 'Full-Time',
  department: '', designation: '', managerId: '',
  joinDate: '', gender: '', dob: '', maritalStatus: '',
  bloodGroup: '', address: '', city: '', state: '', pincode: '',
  emergencyName: '', emergencyPhone: '', emergencyRelation: '',
  bankName: '', accountNumber: '', ifsc: '', panNumber: '',
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchManagers();
    if (isEdit && id) fetchEmployee(id);
  }, [isEdit, id]);

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
      setForm({
        firstName: d.first_name ?? '',
        lastName: d.last_name ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        department: d.department ?? '',
        designation: d.designation ?? '',
        managerId: d.manager_id ? String(d.manager_id) : '',
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
      });
    } catch (err) {
      setError(err.message || 'Failed to load employee');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toUserPayload = (f) => ({
    firstName: f.firstName || undefined,
    lastName: f.lastName || undefined,
    email: f.email || undefined,
    phone: f.phone || undefined,
  });

  const toApiPayload = (f) => ({
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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isEdit) {
        await employees.update(id, toApiPayload(form));
        if (userId) await users.update(userId, toUserPayload(form));
      } else {
        if (!form.email) throw new Error('Email is required.');
        if (!form.joinDate) throw new Error('Join date is required.');
        await employees.createWithUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          roleId: 4,
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
        });
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
            <FormField
              label="Join Date" id="joinDate" type="date"
              value={form.joinDate} onChange={update('joinDate')} required
            />
          </FormSection>

          {/* Personal Details */}
          <FormSection title="Personal Details" icon={Calendar}>
            <FormField
              label="Date of Birth" id="dob" type="date"
              value={form.dob} onChange={update('dob')}
            />
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
            <FormField
              label="IFSC Code" id="ifsc" placeholder="e.g. HDFC0001234"
              value={form.ifsc} onChange={update('ifsc')}
            />
            <FormField
              label="PAN Number" id="panNumber" placeholder="e.g. ABCPS1234K"
              value={form.panNumber} onChange={update('panNumber')}
            />
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
