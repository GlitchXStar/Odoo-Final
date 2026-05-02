import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Download, Eye, Calendar
} from 'lucide-react';
import { payroll } from '../services/api.js';

const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

export default function PayslipList() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('2026-04');

  useEffect(() => {
    fetchPayslips();
  }, [monthFilter]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const response = await payroll.getAll();
      const raw = response?.data ?? response;
      setPayslips(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message || 'Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payslips.filter((ps) => {
    const fullName = `${ps.first_name || ''} ${ps.last_name || ''}`.toLowerCase();
    const matchSearch = !search || fullName.includes(search.toLowerCase()) ||
      String(ps.id).includes(search);
    const matchDept = deptFilter === 'All' || ps.department === deptFilter;
    const [fYear, fMonth] = monthFilter.split('-').map(Number);
    const matchMonth = ps.month === fMonth && ps.year === fYear;
    return matchSearch && matchDept && matchMonth;
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
          <h1 className="font-cal text-display-md text-ink">Payslips</h1>
          <p className="text-body-sm text-muted mt-1">
            View and download generated payslips.
          </p>
        </div>
        <button className="btn-secondary inline-flex items-center gap-2">
          <Download size={16} />
          Export All
        </button>
      </div>

      {/* Filters */}
      <div className="bg-canvas border border-hairline rounded-lg mb-6">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-surface-soft rounded-md px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search by name or payslip ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-body-sm text-ink placeholder:text-muted w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted" />
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="input-field py-1.5 w-auto text-body-sm"
            />
          </div>
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input-field py-1.5 pr-8 text-body-sm appearance-none cursor-pointer"
            >
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Payslip ID</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employee</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Month</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Gross</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Deductions</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Net Pay</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-body-sm text-muted">No payslips found.</td>
                </tr>
              ) : filtered.map((ps) => (
                <tr key={ps.id} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5 text-caption font-mono text-muted">#{ps.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                        {`${ps.first_name?.[0] || ''}${ps.last_name?.[0] || ''}`}
                      </div>
                      <span className="text-body-sm font-medium text-ink">{ps.first_name} {ps.last_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{ps.department || '—'}</td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">
                    {new Date(ps.year, ps.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-ink text-right font-medium">₹{Number(ps.gross_salary).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-body-sm text-error text-right">-₹{Number(ps.total_deductions).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-body-sm text-ink text-right font-medium">₹{Number(ps.net_salary).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/app/payroll/payslips/${ps.id}`}
                        className="p-1.5 text-muted hover:text-ink hover:bg-surface-card rounded-md transition-all"
                        title="View"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        className="p-1.5 text-muted hover:text-ink hover:bg-surface-card rounded-md transition-all"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-hairline">
          <span className="text-caption text-muted">
            Showing {filtered.length} of {payslips.length} payslips
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="px-2.5 py-1 text-caption font-medium bg-ink text-on-primary rounded-md">1</button>
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
