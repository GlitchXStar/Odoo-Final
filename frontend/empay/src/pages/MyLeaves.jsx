import { Link } from 'react-router-dom';
import {
  CalendarOff, Plus, ArrowRight, Calendar
} from 'lucide-react';

const leaveBalance = [
  { type: 'Casual Leave', total: 12, used: 6, remaining: 6 },
  { type: 'Sick Leave', total: 8, used: 4, remaining: 4 },
  { type: 'Paid Leave', total: 15, used: 7, remaining: 8 },
  { type: 'Unpaid Leave', total: '—', used: 0, remaining: '—' },
];

const myLeaves = [
  { id: 1, type: 'Casual Leave', from: '2026-05-05', to: '2026-05-06', days: 2, status: 'pending', reason: 'Family function in hometown.' },
  { id: 2, type: 'Casual Leave', from: '2026-04-15', to: '2026-04-16', days: 2, status: 'approved', reason: 'Personal work.' },
  { id: 3, type: 'Sick Leave', from: '2026-03-22', to: '2026-03-22', days: 1, status: 'approved', reason: 'Fever and headache.' },
  { id: 4, type: 'Casual Leave', from: '2026-02-10', to: '2026-02-12', days: 3, status: 'approved', reason: 'Short vacation.' },
  { id: 5, type: 'Paid Leave', from: '2026-01-20', to: '2026-01-24', days: 5, status: 'approved', reason: 'Wedding in family.' },
  { id: 6, type: 'Sick Leave', from: '2025-12-15', to: '2025-12-15', days: 1, status: 'rejected', reason: 'Feeling unwell.' },
];

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
const statusLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

export default function MyLeaves() {
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
          <div key={bal.type} className="bg-canvas border border-hairline rounded-lg p-5">
            <p className="text-caption text-muted mb-3">{bal.type}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-title-lg text-ink">{bal.remaining}</p>
                <p className="text-caption text-muted">remaining</p>
              </div>
              {typeof bal.total === 'number' && (
                <div className="text-right">
                  <p className="text-caption text-muted">{bal.used} used / {bal.total} total</p>
                  <div className="w-20 h-1.5 bg-surface-card rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-ink rounded-full"
                      style={{ width: `${(bal.used / bal.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
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
