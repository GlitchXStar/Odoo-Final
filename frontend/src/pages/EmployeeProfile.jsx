import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, Edit,
  MapPin, CreditCard, GraduationCap, DollarSign,
  User, Briefcase, Clock
} from 'lucide-react';

// Mock employee data
const employeeData = {
  id: 1,
  name: 'Priya Sharma',
  email: 'priya.sharma@empay.io',
  phone: '+91 98765 43210',
  department: 'Engineering',
  designation: 'Senior Developer',
  status: 'active',
  joined: '2024-01-15',
  employeeId: 'EMP-001',
  reportingTo: 'Rajesh Kumar',
  location: 'Mumbai, India',
  dob: '1995-06-20',
  gender: 'Female',
  maritalStatus: 'Single',
  bloodGroup: 'O+',
  address: '42, Andheri West, Mumbai, Maharashtra - 400058',
  emergencyContact: '+91 98765 11111',
  emergencyName: 'Ramesh Sharma (Father)',
  bankName: 'HDFC Bank',
  accountNumber: 'XXXX XXXX 4521',
  ifsc: 'HDFC0001234',
  panNumber: 'ABCPS1234K',
  skills: ['React', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Docker'],
  salary: {
    basic: 35000,
    hra: 14000,
    da: 3500,
    conveyance: 1600,
    medical: 1250,
    special: 2250,
    gross: 57600,
    pf: 4200,
    tax: 2800,
    net: 50600,
  },
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
  const [activeTab, setActiveTab] = useState('overview');
  const emp = employeeData; // In production, fetch by id

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
              {emp.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h1 className="font-cal text-display-sm text-ink">{emp.name}</h1>
              <p className="text-body-sm text-muted mt-0.5">
                {emp.designation} · {emp.department}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-caption text-muted flex items-center gap-1">
                  <Briefcase size={12} />
                  {emp.employeeId}
                </span>
                <span className="text-caption text-muted flex items-center gap-1">
                  <Calendar size={12} />
                  Joined {new Date(emp.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <span className="badge badge-approved">Active</span>
              </div>
            </div>
          </div>
          <Link
            to={`/app/employees/${id}/edit`}
            className="btn-secondary inline-flex items-center gap-2 text-body-sm"
          >
            <Edit size={14} />
            Edit
          </Link>
        </div>
      </div>

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
                <InfoRow icon={MapPin} label="Location" value={emp.location} />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-title-sm text-ink mb-4">Work Information</h3>
              <div className="space-y-1 divide-y divide-hairline">
                <InfoRow icon={Building2} label="Department" value={emp.department} />
                <InfoRow icon={Briefcase} label="Designation" value={emp.designation} />
                <InfoRow icon={User} label="Reporting To" value={emp.reportingTo} />
                <InfoRow icon={Clock} label="Joined" value={new Date(emp.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="p-6">
              <h3 className="text-title-sm text-ink mb-4">Personal Details</h3>
              <div className="space-y-1 divide-y divide-hairline">
                <InfoRow icon={Calendar} label="Date of Birth" value={new Date(emp.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoRow icon={User} label="Gender" value={emp.gender} />
                <InfoRow icon={User} label="Marital Status" value={emp.maritalStatus} />
                <InfoRow icon={User} label="Blood Group" value={emp.bloodGroup} />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-title-sm text-ink mb-4">Address & Emergency</h3>
              <div className="space-y-1 divide-y divide-hairline">
                <InfoRow icon={MapPin} label="Address" value={emp.address} />
                <InfoRow icon={Phone} label="Emergency Contact" value={emp.emergencyContact} />
                <InfoRow icon={User} label="Emergency Person" value={emp.emergencyName} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="p-6 max-w-md">
            <h3 className="text-title-sm text-ink mb-4">Banking Details</h3>
            <div className="space-y-1 divide-y divide-hairline">
              <InfoRow icon={CreditCard} label="Bank Name" value={emp.bankName} />
              <InfoRow icon={CreditCard} label="Account Number" value={emp.accountNumber} />
              <InfoRow icon={CreditCard} label="IFSC Code" value={emp.ifsc} />
              <InfoRow icon={CreditCard} label="PAN Number" value={emp.panNumber} />
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="p-6">
            <h3 className="text-title-sm text-ink mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {emp.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-surface-card border border-hairline rounded-pill text-body-sm text-ink"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="p-6">
            <h3 className="text-title-sm text-ink mb-4">Salary Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Earnings */}
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wide">Earnings</p>
                <div className="space-y-2">
                  {[
                    ['Basic Salary', emp.salary.basic],
                    ['HRA', emp.salary.hra],
                    ['DA', emp.salary.da],
                    ['Conveyance', emp.salary.conveyance],
                    ['Medical', emp.salary.medical],
                    ['Special Allowance', emp.salary.special],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-body-sm">
                      <span className="text-muted">{label}</span>
                      <span className="text-ink font-medium">₹{val.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-body-sm border-t border-hairline pt-2 mt-2">
                    <span className="font-medium text-ink">Gross Salary</span>
                    <span className="font-medium text-ink">₹{emp.salary.gross.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wide">Deductions</p>
                <div className="space-y-2">
                  {[
                    ['Provident Fund', emp.salary.pf],
                    ['Professional Tax', emp.salary.tax],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-body-sm">
                      <span className="text-muted">{label}</span>
                      <span className="text-error font-medium">-₹{val.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-body-sm border-t border-hairline pt-2 mt-2">
                    <span className="font-medium text-ink">Total Deductions</span>
                    <span className="font-medium text-error">-₹{(emp.salary.pf + emp.salary.tax).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net */}
              <div>
                <p className="text-caption text-muted mb-3 uppercase tracking-wide">Net Pay</p>
                <div className="bg-surface-card rounded-lg p-5 text-center">
                  <p className="text-caption text-muted">Take-home Salary</p>
                  <p className="text-display-sm text-ink font-cal mt-1">₹{emp.salary.net.toLocaleString()}</p>
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
