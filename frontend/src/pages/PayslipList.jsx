import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Download, Eye, Calendar
} from 'lucide-react';

const payslips = [
  { id: 'PS-2026-04-001', employee: 'Priya Sharma', dept: 'Engineering', month: 'Apr 2026', gross: 57600, deductions: 7000, net: 50600, status: 'paid' },
  { id: 'PS-2026-04-002', employee: 'Rajesh Kumar', dept: 'Engineering', month: 'Apr 2026', gross: 72000, deductions: 9200, net: 62800, status: 'paid' },
  { id: 'PS-2026-04-003', employee: 'Anjali Patel', dept: 'Marketing', month: 'Apr 2026', gross: 48000, deductions: 5800, net: 42200, status: 'paid' },
  { id: 'PS-2026-04-004', employee: 'Vikram Singh', dept: 'Sales', month: 'Apr 2026', gross: 35000, deductions: 4200, net: 30800, status: 'paid' },
  { id: 'PS-2026-04-005', employee: 'Sneha Desai', dept: 'HR', month: 'Apr 2026', gross: 42000, deductions: 5100, net: 36900, status: 'paid' },
  { id: 'PS-2026-04-006', employee: 'Amit Verma', dept: 'Finance', month: 'Apr 2026', gross: 55000, deductions: 6800, net: 48200, status: 'paid' },
  { id: 'PS-2026-04-007', employee: 'Kavita Joshi', dept: 'Operations', month: 'Apr 2026', gross: 60000, deductions: 7500, net: 52500, status: 'paid' },
  { id: 'PS-2026-04-008', employee: 'Arjun Mehta', dept: 'Engineering', month: 'Apr 2026', gross: 30000, deductions: 3600, net: 26400, status: 'paid' },
];

const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

export default function PayslipList() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('2026-04');

  const filtered = payslips.filter((ps) => {
    const matchSearch = ps.employee.toLowerCase().includes(search.toLowerCase()) ||
      ps.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || ps.dept === deptFilter;
    return matchSearch && matchDept;
  });

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
              {filtered.map((ps) => (
                <tr key={ps.id} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5 text-caption font-mono text-muted">{ps.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                        {ps.employee.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-body-sm font-medium text-ink">{ps.employee}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{ps.dept}</td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{ps.month}</td>
                  <td className="px-5 py-3.5 text-body-sm text-ink text-right font-medium">₹{ps.gross.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-body-sm text-error text-right">-₹{ps.deductions.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-body-sm text-ink text-right font-medium">₹{ps.net.toLocaleString()}</td>
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
