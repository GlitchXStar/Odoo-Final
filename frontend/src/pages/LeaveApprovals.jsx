import { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, ArrowRight, ChevronDown, Search
} from 'lucide-react';

const pendingRequests = [
  { id: 1, employee: 'Priya Sharma', dept: 'Engineering', type: 'Casual Leave', from: '2026-05-05', to: '2026-05-06', days: 2, reason: 'Family function in hometown.', appliedOn: '2026-05-01' },
  { id: 2, employee: 'Anjali Patel', dept: 'Marketing', type: 'Paid Leave', from: '2026-05-10', to: '2026-05-12', days: 3, reason: 'Travelling for personal work.', appliedOn: '2026-04-30' },
  { id: 3, employee: 'Arjun Mehta', dept: 'Engineering', type: 'Casual Leave', from: '2026-05-15', to: '2026-05-16', days: 2, reason: 'Doctor appointment and rest.', appliedOn: '2026-05-02' },
  { id: 4, employee: 'Sneha Desai', dept: 'HR', type: 'Sick Leave', from: '2026-05-08', to: '2026-05-09', days: 2, reason: 'Not feeling well, need to rest.', appliedOn: '2026-05-02' },
];

export default function LeaveApprovals() {
  const [requests, setRequests] = useState(pendingRequests);
  const [expandedId, setExpandedId] = useState(null);

  const handleAction = (id, action) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Leave Approvals</h1>
          <p className="text-body-sm text-muted mt-1">
            Review and manage pending leave requests.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-status-pending-bg rounded-pill text-caption font-medium text-status-pending-text">
          <Clock size={14} />
          {requests.length} pending
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-canvas border border-hairline rounded-lg p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-status-approved-bg flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-success" />
          </div>
          <h3 className="text-title-sm text-ink mb-1">All caught up!</h3>
          <p className="text-body-sm text-muted">No pending leave requests to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-canvas border border-hairline rounded-lg overflow-hidden hover:shadow-soft transition-shadow"
            >
              {/* Header Row */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center text-body-sm font-medium text-ink">
                    {req.employee.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-ink">{req.employee}</p>
                    <p className="text-caption text-muted">{req.dept} · Applied {new Date(req.appliedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 text-caption text-muted">
                    <span>{req.type}</span>
                    <span>
                      {new Date(req.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(req.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="font-medium text-ink">{req.days} day{req.days > 1 ? 's' : ''}</span>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === req.id && (
                <div className="px-6 pb-5 border-t border-hairline pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-caption text-muted">Leave Type</p>
                      <p className="text-body-sm text-ink mt-0.5">{req.type}</p>
                    </div>
                    <div>
                      <p className="text-caption text-muted">Duration</p>
                      <p className="text-body-sm text-ink mt-0.5">
                        {new Date(req.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(req.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({req.days} days)
                      </p>
                    </div>
                    <div>
                      <p className="text-caption text-muted">Department</p>
                      <p className="text-body-sm text-ink mt-0.5">{req.dept}</p>
                    </div>
                    <div>
                      <p className="text-caption text-muted">Applied On</p>
                      <p className="text-body-sm text-ink mt-0.5">
                        {new Date(req.appliedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-caption text-muted">Reason</p>
                    <p className="text-body-sm text-ink mt-0.5">{req.reason}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAction(req.id, 'approve')}
                      className="btn-primary inline-flex items-center gap-2 bg-success hover:bg-emerald-600"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'reject')}
                      className="btn-secondary inline-flex items-center gap-2 text-error border-error/30 hover:bg-red-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
