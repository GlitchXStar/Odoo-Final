import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarOff, Plus, ArrowRight, Calendar
} from 'lucide-react';
import { leaves, leaveBalances } from '../services/api.js';

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
const statusLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export default function MyLeaves() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const [leavesRes, balancesRes] = await Promise.all([
        leaves.getAll(),
        leaveBalances.getAll()
      ]);
      const leavesRaw = leavesRes?.data?.leaves ?? leavesRes?.data ?? leavesRes;
      setMyLeaves(Array.isArray(leavesRaw) ? leavesRaw : []);
      const balRaw = balancesRes?.data ?? balancesRes;
      setLeaveBalance(Array.isArray(balRaw) ? balRaw : []);
    } catch (err) {
      setError(err.message || 'Failed to load leave data');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">My Leaves</h1>
          <p className="text-body-sm text-muted mt-1">
            View your leave history and apply for new time off.
          </p>
        </div>
        <Link to="/app/time-off/apply" className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} />
          Apply for Leave
        </Link>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {leaveBalance.map((bal) => (
          <div key={bal.leave_type_name} className="bg-canvas border border-hairline rounded-lg p-5">
            <p className="text-caption text-muted mb-3">{bal.leave_type_name}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-title-lg text-ink">{bal.balance}</p>
                <p className="text-caption text-muted">remaining</p>
              </div>
              <div className="text-right">
                <p className="text-caption text-muted">{bal.used} used / {bal.allocated} total</p>
                <div className="w-20 h-1.5 bg-surface-card rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-ink rounded-full"
                    style={{ width: `${bal.allocated > 0 ? (bal.used / bal.allocated) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave History */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline">
          <h3 className="text-title-sm text-ink">Leave History</h3>
        </div>
        <div className="divide-y divide-hairline">
          {myLeaves.map((leave) => (
            <div key={leave.id} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center">
                  <CalendarOff size={18} className="text-muted" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-ink">{leave.type}</p>
                  <p className="text-caption text-muted">
                    {new Date(leave.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {leave.days > 1 && ` — ${new Date(leave.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    {' · '}
                    {leave.days} day{leave.days > 1 ? 's' : ''}
                  </p>
                  <p className="text-caption text-muted mt-0.5">{leave.reason}</p>
                </div>
              </div>
              <span className={`badge ${statusBadge[leave.status]}`}>
                {statusLabel[leave.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
