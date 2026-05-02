import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Eye, ChevronLeft, ChevronRight, Calendar, IndianRupee
} from 'lucide-react';
import { payroll } from '../services/api.js';

export default function MyPayslip() {
  const [myPayslips, setMyPayslips] = useState([]);
  const [currentSalary, setCurrentSalary] = useState({
    basic: 0, hra: 0, allowances: 0, bonus: 0,
    gross: 0, pf: 0, esi: 0, tax: 0, tds: 0, pt: 0, otherDeductions: 0, totalDeductions: 0, net: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const fetchMyPayslips = async () => {
    try {
      setLoading(true);
      const payrollRes = await payroll.getAll();
      const list = Array.isArray(payrollRes?.data) ? payrollRes.data : [];
      setMyPayslips(list);

      // Derive salary breakdown from the most recent payroll record
      const latest = list[0] || {};
      setCurrentSalary({
        basic:           Number(latest.basic)            || 0,
        hra:             Number(latest.hra)              || 0,
        allowances:      Number(latest.allowances)       || 0,
        bonus:           Number(latest.bonus)            || 0,
        gross:           Number(latest.gross_salary)     || 0,
        pf:              Number(latest.pf_deduction)     || 0,
        esi:             Number(latest.esi_deduction)    || 0,
        tax:             Number(latest.income_tax)       || 0,
        tds:             Number(latest.tds)              || 0,
        pt:              Number(latest.professional_tax) || 0,
        otherDeductions: Number(latest.other_deductions) || 0,
        totalDeductions: Number(latest.total_deductions) || 0,
        net:             Number(latest.net_salary)       || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load payslips');
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

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">My Payslip</h1>
        <p className="text-body-sm text-muted mt-1">
          View your salary details and download payslips.
        </p>
      </div>

      {/* Current Salary Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-canvas border border-hairline rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-muted">Gross Salary</span>
            <IndianRupee size={16} className="text-muted" />
          </div>
          <p className="text-title-lg text-ink">₹{currentSalary.gross.toLocaleString()}</p>
          <p className="text-caption text-muted mt-1">per month</p>
        </div>
        <div className="bg-canvas border border-hairline rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-muted">Deductions</span>
            <IndianRupee size={16} className="text-muted" />
          </div>
          <p className="text-title-lg text-error">-₹{currentSalary.totalDeductions.toLocaleString()}</p>
          <p className="text-caption text-muted mt-1">PF + Tax + PT</p>
        </div>
        <div className="bg-ink rounded-lg p-5 text-on-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-white/60">Net Pay</span>
            <IndianRupee size={16} className="text-white/60" />
          </div>
          <p className="text-title-lg">₹{currentSalary.net.toLocaleString()}</p>
          <p className="text-caption text-white/60 mt-1">take-home per month</p>
        </div>
      </div>

      {/* Salary Breakdown */}
      {currentSalary.basic === 0 && currentSalary.hra === 0 && currentSalary.allowances === 0 ? (
        <div className="bg-surface-card border border-hairline rounded-lg p-6 mb-8">
          <p className="text-body-sm text-muted text-center">
            Detailed salary breakdown not available. Your salary structure may not be configured yet. Contact your HR/Payroll team.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Earnings Breakdown</h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              ['Basic Salary', currentSalary.basic],
              ['HRA', currentSalary.hra],
              ['Allowances', currentSalary.allowances],
              ['Bonus', currentSalary.bonus],
            ].filter(([, val]) => val > 0).map(([label, val]) => (
              <div key={label} className="flex justify-between text-body-sm">
                <span className="text-muted">{label}</span>
                <span className="text-ink font-medium">₹{val.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between text-body-sm font-medium text-ink border-t border-hairline pt-3">
              <span>Gross Salary</span>
              <span>₹{currentSalary.gross.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Deductions Breakdown</h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              ['Provident Fund (PF)', currentSalary.pf],
              ['ESI', currentSalary.esi],
              ['Income Tax (TDS)', currentSalary.tax],
              ['TDS', currentSalary.tds],
              ['Professional Tax', currentSalary.pt],
              ['Other Deductions', currentSalary.otherDeductions],
            ].filter(([, val]) => val > 0).map(([label, val]) => (
              <div key={label} className="flex justify-between text-body-sm">
                <span className="text-muted">{label}</span>
                <span className="text-error font-medium">-₹{val.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-body-sm font-medium text-error border-t border-hairline pt-3">
              <span>Total Deductions</span>
              <span>-₹{currentSalary.totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Payslip History */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline">
          <h3 className="text-title-sm text-ink">Payslip History</h3>
        </div>
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1fr_auto] gap-4 px-5 py-2.5 bg-surface-soft border-b border-hairline">
          <span className="text-caption text-muted font-medium">Month</span>
          <div className="grid grid-cols-[100px_100px_110px_60px] gap-4 text-right">
            <span className="text-caption text-muted font-medium">Base Salary</span>
            <span className="text-caption text-muted font-medium">Deductions</span>
            <span className="text-caption text-muted font-medium">Net Received</span>
            <span className="text-caption text-muted font-medium">Actions</span>
          </div>
        </div>
        <div className="divide-y divide-hairline">
          {myPayslips.map((ps) => (
            <div key={ps.id} className="px-5 py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center hover:bg-surface-soft/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center">
                  <Calendar size={18} className="text-muted" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-ink">
                    {new Date(ps.year, ps.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-caption text-muted">
                    Generated on {ps.created_at ? new Date(ps.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[100px_100px_110px_60px] gap-4 items-center text-right">
                <div>
                  <p className="text-body-sm text-ink">₹{Number(ps.gross_salary).toLocaleString('en-IN')}</p>
                  <p className="sm:hidden text-caption text-muted">Base Salary</p>
                </div>
                <div>
                  <p className="text-body-sm text-error font-medium">-₹{Number(ps.total_deductions).toLocaleString('en-IN')}</p>
                  <p className="sm:hidden text-caption text-muted">Deductions</p>
                </div>
                <div>
                  <p className="text-body-sm text-ink font-semibold">₹{Number(ps.net_salary).toLocaleString('en-IN')}</p>
                  <p className="sm:hidden text-caption text-muted">Net Received</p>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/app/payslip/${ps.id}`}
                    className="p-1.5 text-muted hover:text-ink hover:bg-surface-card rounded-md transition-all"
                    title="View"
                  >
                    <Eye size={14} />
                  </Link>
                  <a
                    href={`/api/payslip/${ps.id}/download`}
                    download
                    className="p-1.5 text-muted hover:text-ink hover:bg-surface-card rounded-md transition-all"
                    title="Download PDF"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
