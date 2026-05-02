import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Calendar, FileText, ChevronDown
} from 'lucide-react';
import { leaves, leaveTypes as leaveTypesApi, leaveBalances } from '../services/api.js';

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [form, setForm] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveTypesAndBalances();
  }, []);

  const fetchLeaveTypesAndBalances = async () => {
    try {
      const [typesRes, balancesRes] = await Promise.all([
        leaveTypesApi.getAll(),
        leaveBalances.getAll()
      ]);
      const typesRaw = typesRes?.data ?? typesRes;
      setLeaveTypes(Array.isArray(typesRaw) ? typesRaw : []);
      const balRaw = balancesRes?.data ?? balancesRes;
      setBalances(Array.isArray(balRaw) ? balRaw : []);
    } catch (err) {
      setError('Failed to load leave data');
    }
  };

  const getBalanceForType = (typeId) => {
    const bal = balances.find(b => b.leave_type_id === typeId);
    return bal ? bal.balance : 0;
  };

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const calcDays = () => {
    if (!form.fromDate || !form.toDate) return 0;
    const diff = new Date(form.toDate) - new Date(form.fromDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await leaves.apply({
        leave_type_id: form.leaveType,
        from_date: form.fromDate,
        to_date: form.toDate,
        reason: form.reason,
        days: calcDays()
      });
      navigate('/app/time-off/me');
    } catch (err) {
      setError(err.message || 'Failed to submit leave request');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto">
      {/* Back */}
      <Link
        to="/app/time-off/me"
        className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to my leaves
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">Apply for Leave</h1>
        <p className="text-body-sm text-muted mt-1">
          Submit a leave request for approval.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-canvas border border-hairline rounded-lg overflow-hidden">
            <div className="p-6 space-y-5">
              {/* Leave Type */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="leaveType" className="text-caption text-ink">
                  Leave Type <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="leaveType"
                    value={form.leaveType}
                    onChange={update('leaveType')}
                    className="input-field appearance-none pr-10 cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select leave type</option>
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({getBalanceForType(t.id)} days remaining)
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fromDate" className="text-caption text-ink">
                    From Date <span className="text-error">*</span>
                  </label>
                  <input
                    id="fromDate"
                    type="date"
                    value={form.fromDate}
                    onChange={update('fromDate')}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="toDate" className="text-caption text-ink">
                    To Date <span className="text-error">*</span>
                  </label>
                  <input
                    id="toDate"
                    type="date"
                    value={form.toDate}
                    onChange={update('toDate')}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {calcDays() > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-card rounded-md">
                  <Calendar size={14} className="text-muted" />
                  <span className="text-body-sm text-ink">
                    <span className="font-medium">{calcDays()}</span> day{calcDays() > 1 ? 's' : ''} selected
                  </span>
                </div>
              )}

              {/* Reason */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reason" className="text-caption text-ink">
                  Reason <span className="text-error">*</span>
                </label>
                <textarea
                  id="reason"
                  value={form.reason}
                  onChange={update('reason')}
                  placeholder="Briefly describe why you need the leave..."
                  rows={4}
                  className="input-field h-auto py-3 resize-none"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-hairline bg-surface-soft/30">
              <Link to="/app/time-off/me" className="btn-secondary">
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
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Leave Balance Sidebar */}
        <div className="bg-canvas border border-hairline rounded-lg h-fit">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Leave Balance</h3>
          </div>
          <div className="p-5 space-y-4">
            {leaveTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between">
                <span className="text-body-sm text-ink">{type.name}</span>
                <span className="text-body-sm font-medium text-ink">
                  {getBalanceForType(type.id)} days
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
