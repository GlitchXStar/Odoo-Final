import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Plus, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Mail, Phone, MoreHorizontal, Building2
} from 'lucide-react';
import { employees } from '../services/api.js';


const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

const statusBadge = {
  Active: 'badge-approved',
  'On Leave': 'badge-pending',
  Inactive: 'badge-rejected',
};

export default function EmployeeDirectory() {
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employees.getAll();
      const list = response?.data?.employees ?? response?.data ?? response;
      setEmployeeList(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filtered = employeeList.filter((emp) => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.department?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Employees</h1>
          <p className="text-body-sm text-muted mt-1">
            {employeeList.length} total employees across {departments.length - 1} departments
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
                        {`${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`}
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-ink group-hover:underline">
                          {emp.first_name} {emp.last_name}
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
                    <span className={`badge ${statusBadge[emp.status] || 'badge-pending'}`}>
                      {emp.status || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">
                    {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : '—'}
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
            Showing {filtered.length} of {employeeList.length} employees
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
