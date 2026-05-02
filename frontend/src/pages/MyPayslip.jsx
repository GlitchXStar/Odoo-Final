import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Eye, ChevronLeft, ChevronRight, Calendar, DollarSign
} from 'lucide-react';
import { payroll, salaryStructures } from '../services/api.js';

export default function MyPayslip() {
  const [myPayslips, setMyPayslips] = useState([]);
  const [currentSalary, setCurrentSalary] = useState({
    basic: 0, hra: 0, da: 0, conveyance: 0, medical: 0, special: 0,
    gross: 0, pf: 0, tax: 0, pt: 0, totalDeductions: 0, net: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const fetchMyPayslips = async () => {
    try {
      setLoading(true);
      const [payrollRes, salaryRes] = await Promise.all([
        payroll.getAll(),
        salaryStructures.getAll()
      ]);
      setMyPayslips(payrollRes.data || []);
      
      // Get active salary structure
      const activeSalary = salaryRes.data?.find(s => s.is_active) || {};
      if (activeSalary) {
        setCurrentSalary({
          basic: activeSalary.basic || 0,
          hra: activeSalary.hra || 0,
          da: activeSalary.da || 0,
          conveyance: activeSalary.conveyance || 0,
          medical: activeSalary.medical || 0,
          special: activeSalary.special || 0,
          gross: activeSalary.gross || 0,
          pf: activeSalary.pf || 0,
          tax: activeSalary.tax || 0,
          pt: activeSalary.professional_tax || 0,
          totalDeductions: (activeSalary.pf || 0) + (activeSalary.tax || 0) + (activeSalary.professional_tax || 0),
          net: activeSalary.net || 0,
        });
      }
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
            <DollarSign size={16} className="text-muted" />
          </div>
          <p className="text-title-lg text-ink">₹{currentSalary.gross.toLocaleString()}</p>
          <p className="text-caption text-muted mt-1">per month</p>
        </div>
        <div className="bg-canvas border border-hairline rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-muted">Deductions</span>
            <DollarSign size={16} className="text-muted" />
          </div>
          <p className="text-title-lg text-error">-₹{currentSalary.totalDeductions.toLocaleString()}</p>
          <p className="text-caption text-muted mt-1">PF + Tax + PT</p>
        </div>
        <div className="bg-ink rounded-lg p-5 text-on-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-white/60">Net Pay</span>
            <DollarSign size={16} className="text-white/60" />
          </div>
          <p className="text-title-lg">₹{currentSalary.net.toLocaleString()}</p>
          <p className="text-caption text-white/60 mt-1">take-home per month</p>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Earnings Breakdown</h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              ['Basic Salary', currentSalary.basic],
              ['HRA', currentSalary.hra],
              ['DA', currentSalary.da],
              ['Conveyance', currentSalary.conveyance],
              ['Medical', currentSalary.medical],
              ['Special Allowance', currentSalary.special],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-body-sm">
                <span className="text-muted">{label}</span>
                <span className="text-ink font-medium">₹{val.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-body-sm font-medium text-ink border-t border-hairline pt-3">
              <span>Gross Salary</span>
              <span>₹{currentSalary.gross.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Deductions Breakdown</h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              ['Provident Fund', currentSalary.pf],
              ['Income Tax (TDS)', currentSalary.tax],
              ['Professional Tax', currentSalary.pt],
            ].map(([label, val]) => (
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

      {/* Payslip History */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline">
          <h3 className="text-title-sm text-ink">Payslip History</h3>
        </div>
        <div className="divide-y divide-hairline">
          {myPayslips.map((ps) => (
            <div key={ps.id} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center">
                  <Calendar size={18} className="text-muted" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-ink">{ps.month}</p>
                  <p className="text-caption text-muted">
                    Paid on {new Date(ps.paidOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-6 text-body-sm">
                  <span className="text-muted">₹{ps.gross.toLocaleString()}</span>
                  <span className="text-error">-₹{ps.deductions.toLocaleString()}</span>
                  <span className="font-medium text-ink">₹{ps.net.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
