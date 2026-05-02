import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, Edit,
  MapPin, CreditCard, Briefcase, Clock, User,
  CalendarDays, CalendarOff, FileText
} from 'lucide-react';

// Mock current employee data
const myProfile = {
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@empay.io',
  phone: '+91 98765 43211',
  department: 'Engineering',
  designation: 'Tech Lead',
  status: 'active',
  joined: '2023-06-01',
  employeeId: 'EMP-002',
  reportingTo: 'Amit Verma',
  location: 'Mumbai, India',
  dob: '1992-03-15',
  gender: 'Male',
  maritalStatus: 'Married',
  bloodGroup: 'B+',
  address: '101, Bandra East, Mumbai, Maharashtra - 400051',
};

const quickStats = [
  { label: 'Present Days', value: '22 / 25', icon: CalendarDays },
  { label: 'Leave Balance', value: '8 days', icon: CalendarOff },
  { label: 'Payslips', value: '12', icon: FileText },
];

function InfoRow({ label, value, icon: Icon }) {
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
  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">My Profile</h1>
        <p className="text-body-sm text-muted mt-1">
          View your personal and work information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-canvas border border-hairline rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-ink text-on-primary flex items-center justify-center text-title-lg font-medium">
              {myProfile.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="font-cal text-display-sm text-ink">{myProfile.name}</h2>
              <p className="text-body-sm text-muted mt-0.5">
                {myProfile.designation} · {myProfile.department}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-caption text-muted flex items-center gap-1">
                  <Briefcase size={12} />
                  {myProfile.employeeId}
                </span>
                <span className="badge badge-approved">Active</span>
              </div>
            </div>
          </div>
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
            <InfoRow icon={MapPin} label="Location" value={myProfile.location} />
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
            <InfoRow icon={User} label="Reporting To" value={myProfile.reportingTo} />
            <InfoRow icon={Clock} label="Joined" value={new Date(myProfile.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
          </div>
        </div>

        {/* Personal */}
        <div className="bg-canvas border border-hairline rounded-lg lg:col-span-2">
          <div className="px-6 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="px-6 py-2 divide-y divide-hairline">
              <InfoRow icon={Calendar} label="Date of Birth" value={new Date(myProfile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <InfoRow icon={User} label="Gender" value={myProfile.gender} />
            </div>
            <div className="px-6 py-2 divide-y divide-hairline">
              <InfoRow icon={User} label="Marital Status" value={myProfile.maritalStatus} />
              <InfoRow icon={User} label="Blood Group" value={myProfile.bloodGroup} />
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
