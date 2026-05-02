import { useState, useEffect } from 'react';
import {
  Download, Calendar, ChevronDown, Users, DollarSign,
  CalendarDays, CalendarOff, TrendingUp, BarChart3,
  PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { dashboard } from '../services/api.js';

const departmentData = [
  { dept: 'Engineering', headcount: 320, attendance: 91, leaveRate: 8, avgSalary: '₹68K' },
  { dept: 'Sales', headcount: 250, attendance: 85, leaveRate: 12, avgSalary: '₹45K' },
  { dept: 'Marketing', headcount: 180, attendance: 88, leaveRate: 10, avgSalary: '₹52K' },
  { dept: 'Operations', headcount: 293, attendance: 83, leaveRate: 14, avgSalary: '₹38K' },
  { dept: 'Finance', headcount: 120, attendance: 90, leaveRate: 7, avgSalary: '₹58K' },
  { dept: 'HR', headcount: 85, attendance: 92, leaveRate: 6, avgSalary: '₹48K' },
];

const monthlyTrend = [
  { month: 'Jan', employees: 1185, payroll: 48.2, attendance: 85 },
  { month: 'Feb', employees: 1200, payroll: 49.1, attendance: 86 },
  { month: 'Mar', employees: 1215, payroll: 50.0, attendance: 84 },
  { month: 'Apr', employees: 1230, payroll: 51.5, attendance: 87 },
  { month: 'May', employees: 1248, payroll: 52.3, attendance: 87 },
];

const topLeaveTypes = [
  { type: 'Casual Leave', count: 342, percentage: 40 },
  { type: 'Sick Leave', count: 213, percentage: 25 },
  { type: 'Paid Leave', count: 171, percentage: 20 },
  { type: 'Unpaid Leave', count: 128, percentage: 15 },
];

const reportCards = [
  { label: 'Total Employees', value: '1,248', icon: Users, trend: 'up', change: '+2.4% this month' },
  { label: 'Avg Attendance', value: '87%', icon: CalendarDays, trend: 'up', change: '+1.2% this month' },
  { label: 'Leave Requests', value: '854', icon: CalendarOff, trend: 'down', change: '-3.1% this month' },
  { label: 'Payroll Cost', value: '₹52.3L', icon: DollarSign, trend: 'up', change: '+1.6% this month' },
];

const quickReports = [
  { label: 'Headcount Report', description: 'Employee count by department, status, and join date', icon: Users },
  { label: 'Attendance Report', description: 'Daily/monthly attendance with late arrivals and absences', icon: CalendarDays },
  { label: 'Leave Report', description: 'Leave utilization, balance, and approval rates', icon: CalendarOff },
  { label: 'Payroll Report', description: 'Salary disbursement, deductions, and cost analysis', icon: DollarSign },
  { label: 'Attrition Report', description: 'Employee turnover, exit trends, and retention metrics', icon: TrendingUp },
  { label: 'Compliance Report', description: 'PF, ESI, and tax filing compliance status', icon: BarChart3 },
];

export default function ReportsDashboard() {
  const [period, setPeriod] = useState('may-2026');

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Reports</h1>
          <p className="text-body-sm text-muted mt-1">
            Organization analytics and downloadable reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted" />
            <input
              type="month"
              value="2026-05"
              className="input-field py-1.5 w-auto text-body-sm"
            />
          </div>
          <button className="btn-secondary inline-flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reportCards.map((card) => (
          <div key={card.label} className="bg-canvas border border-hairline rounded-lg p-5 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted">{card.label}</span>
              <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center">
                <card.icon size={18} className="text-muted" />
              </div>
            </div>
            <p className="text-title-lg text-ink">{card.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {card.trend === 'up' ? (
                <ArrowUpRight size={14} className="text-success" />
              ) : (
                <ArrowDownRight size={14} className="text-error" />
              )}
              <span className={`text-caption ${card.trend === 'up' ? 'text-success' : 'text-error'}`}>
                {card.change}
              </span>
              <span className="text-caption text-muted">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-canvas border border-hairline rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
          <h3 className="text-title-sm text-ink">Department Breakdown</h3>
          <button className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
            <Download size={12} /> Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Headcount</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Attendance %</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Leave Rate %</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Avg. Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {departmentData.map((dept) => (
                <tr key={dept.dept} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{dept.dept}</td>
                  <td className="px-5 py-3.5 text-body-sm text-ink text-right">{dept.headcount}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-surface-card rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{ width: `${dept.attendance}%` }} />
                      </div>
                      <span className="text-body-sm text-ink w-10 text-right">{dept.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-body-sm ${dept.leaveRate > 10 ? 'text-error' : 'text-ink'}`}>
                      {dept.leaveRate}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm font-medium text-ink text-right">{dept.avgSalary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column: Trend + Leave Types */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="lg:col-span-3 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Monthly Trend</h3>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left pb-3 text-caption text-muted font-medium">Month</th>
                    <th className="text-right pb-3 text-caption text-muted font-medium">Employees</th>
                    <th className="text-right pb-3 text-caption text-muted font-medium">Payroll (₹L)</th>
                    <th className="text-right pb-3 text-caption text-muted font-medium">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {monthlyTrend.map((row) => (
                    <tr key={row.month}>
                      <td className="py-3 text-body-sm font-medium text-ink">{row.month}</td>
                      <td className="py-3 text-body-sm text-ink text-right">{row.employees}</td>
                      <td className="py-3 text-body-sm text-ink text-right">{row.payroll}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 bg-surface-card rounded-full overflow-hidden">
                            <div className="h-full bg-ink rounded-full" style={{ width: `${row.attendance}%` }} />
                          </div>
                          <span className="text-body-sm text-ink w-10 text-right">{row.attendance}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Leave Distribution</h3>
          </div>
          <div className="p-5 space-y-4">
            {topLeaveTypes.map((type) => (
              <div key={type.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-body-sm text-ink">{type.type}</span>
                  <span className="text-caption text-muted">{type.count}</span>
                </div>
                <div className="w-full h-2 bg-surface-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink rounded-full transition-all duration-500"
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="mb-2">
        <h3 className="text-title-sm text-ink mb-4">Quick Reports</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickReports.map((report) => (
          <button
            key={report.label}
            className="bg-canvas border border-hairline rounded-lg p-5 text-left hover:border-ink/20 hover:shadow-soft transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-on-primary transition-all">
                <report.icon size={18} />
              </div>
              <div>
                <p className="text-body-sm font-medium text-ink">{report.label}</p>
                <p className="text-caption text-muted mt-0.5">{report.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
