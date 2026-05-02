import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Plus, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Mail, Phone, MoreHorizontal, Building2
} from 'lucide-react';

const employees = [
  { id: 1, name: 'Priya Sharma', email: 'priya.sharma@empay.io', phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Developer', status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'Rajesh Kumar', email: 'rajesh.kumar@empay.io', phone: '+91 98765 43211', department: 'Engineering', designation: 'Tech Lead', status: 'active', joined: '2023-06-01' },
  { id: 3, name: 'Anjali Patel', email: 'anjali.patel@empay.io', phone: '+91 98765 43212', department: 'Marketing', designation: 'Marketing Manager', status: 'active', joined: '2023-09-10' },
  { id: 4, name: 'Vikram Singh', email: 'vikram.singh@empay.io', phone: '+91 98765 43213', department: 'Sales', designation: 'Sales Executive', status: 'on-leave', joined: '2024-03-20' },
  { id: 5, name: 'Sneha Desai', email: 'sneha.desai@empay.io', phone: '+91 98765 43214', department: 'HR', designation: 'HR Coordinator', status: 'active', joined: '2023-11-05' },
  { id: 6, name: 'Amit Verma', email: 'amit.verma@empay.io', phone: '+91 98765 43215', department: 'Finance', designation: 'Accountant', status: 'active', joined: '2024-02-12' },
  { id: 7, name: 'Kavita Joshi', email: 'kavita.joshi@empay.io', phone: '+91 98765 43216', department: 'Operations', designation: 'Operations Lead', status: 'inactive', joined: '2022-08-01' },
  { id: 8, name: 'Arjun Mehta', email: 'arjun.mehta@empay.io', phone: '+91 98765 43217', department: 'Engineering', designation: 'Junior Developer', status: 'active', joined: '2025-04-28' },
  { id: 9, name: 'Rahul Nair', email: 'rahul.nair@empay.io', phone: '+91 98765 43218', department: 'Sales', designation: 'Regional Manager', status: 'active', joined: '2023-04-15' },
  { id: 10, name: 'Meera Iyer', email: 'meera.iyer@empay.io', phone: '+91 98765 43219', department: 'Engineering', designation: 'QA Engineer', status: 'active', joined: '2024-07-01' },
];

const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

const statusBadge = {
  active: 'badge-approved',
  'on-leave': 'badge-pending',
  inactive: 'badge-rejected',
};

const statusLabel = {
  active: 'Active',
  'on-leave': 'On Leave',
  inactive: 'Inactive',
};

export default function EmployeeDirectory() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchStatus =
      statusFilter === 'All' || statusLabel[emp.status] === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Employees</h1>
          <p className="text-body-sm text-muted mt-1">
            {employees.length} total employees across {departments.length - 1} departments
          </p>
        </div>
        <Link
          to="/app/employees/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add Employee
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-canvas border border-hairline rounded-lg mb-6">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1 flex items-center gap-2 bg-surface-soft rounded-md px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-body-sm text-ink placeholder:text-muted w-full"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-body-sm font-medium transition-all ${
              showFilters
                ? 'border-ink bg-ink text-on-primary'
                : 'border-hairline text-muted hover:text-ink hover:border-ink/20'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div className="flex items-center gap-4 px-4 pb-4 pt-0">
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted">Department:</span>
              <div className="relative">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="input-field py-1.5 pr-8 text-body-sm appearance-none cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted">Status:</span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field py-1.5 pr-8 text-body-sm appearance-none cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
              </div>
            </div>
            {(deptFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setDeptFilter('All');
                  setStatusFilter('All');
                }}
                className="text-caption text-muted hover:text-ink transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employee</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Designation</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Status</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Joined</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-surface-soft/50 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <Link to={`/app/employees/${emp.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink shrink-0">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-ink group-hover:underline">
                          {emp.name}
                        </p>
                        <p className="text-caption text-muted">{emp.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-muted" />
                      <span className="text-body-sm text-ink">{emp.department}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{emp.designation}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusBadge[emp.status]}`}>
                      {statusLabel[emp.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">
                    {new Date(emp.joined).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/app/employees/${emp.id}`}
                      className="p-1.5 text-muted hover:text-ink hover:bg-surface-card rounded-md transition-all inline-flex"
                    >
                      <MoreHorizontal size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted text-body-sm">
                    No employees match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-hairline">
          <span className="text-caption text-muted">
            Showing {filtered.length} of {employees.length} employees
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="px-2.5 py-1 text-caption font-medium bg-ink text-on-primary rounded-md">
              1
            </button>
            <button className="px-2.5 py-1 text-caption text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              2
            </button>
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
