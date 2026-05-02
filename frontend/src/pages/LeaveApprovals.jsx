import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, ArrowRight, ChevronDown, Search, Ban
} from 'lucide-react';
import { leaves } from '../services/api.js';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
const statusBadge = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected', Cancelled: 'badge-rejected' };

export default function LeaveApprovals() {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [activeTab, setActiveTab] = useState('Pending');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaves.getAll();
      const list = response?.data?.leaves ?? response?.data ?? response;
      setAllRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setActionLoading(id);
      if (action === 'approve') {
        await leaves.approve(id);
      } else if (action === 'reject') {
        const reason = rejectionReasons[id]?.trim() || 'Rejected by manager';
        await leaves.reject(id, reason);
      } else if (action === 'cancel') {
        await leaves.cancel(id);
      }
      setRejectionReasons((prev) => { const n = { ...prev }; delete n[id]; return n; });
      await fetchLeaves();
    } catch (err) {
      setError(err.message || `Failed to ${action} leave`);
    } finally {
      setActionLoading(null);
    }
  };

  const requests = activeTab === 'All' ? allRequests : allRequests.filter(r => r.status === activeTab);
  const pendingCount = allRequests.filter(r => r.status === 'Pending').length;

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
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error mb-4">
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
          <h1 className="font-cal text-display-md text-ink">Leave Approvals</h1>
          <p className="text-body-sm text-muted mt-1">
            Review and manage pending leave requests.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-status-pending-bg rounded-pill text-caption font-medium text-status-pending-text">
          <Clock size={14} />
          {pendingCount} pending
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-hairline">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-body-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-caption text-muted">
                ({allRequests.filter(r => r.status === tab).length})
              </span>
            )}
          </button>
        ))}
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
                    {`${req.first_name?.[0] || ''}${req.last_name?.[0] || ''}`}
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-ink">{req.first_name} {req.last_name}</p>
                    <p className="text-caption text-muted">{req.department} · Applied {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 text-caption text-muted">
                    <span>{req.leave_type_name}</span>
                    <span>
                      {req.start_date ? new Date(req.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'} — {req.end_date ? new Date(req.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </span>
                    <span className="font-medium text-ink">{req.total_days} day{req.total_days > 1 ? 's' : ''}</span>
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
                      <p className="text-body-sm text-ink mt-0.5">{req.leave_type_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-caption text-muted">Duration</p>
                      <p className="text-body-sm text-ink mt-0.5">
                        {req.start_date ? new Date(req.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'} — {req.end_date ? new Date(req.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'} ({req.total_days} days)
                      </p>
                    </div>
                    <div>
                      <p className="text-caption text-muted">Department</p>
                      <p className="text-body-sm text-ink mt-0.5">{req.department || '—'}</p>
                    </div>
                    <div>
                      <p className="text-caption text-muted">Applied On</p>
                      <p className="text-body-sm text-ink mt-0.5">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-caption text-muted">Applicant's Reason</p>
                    <p className="text-body-sm text-ink mt-0.5">{req.reason || '—'}</p>
                  </div>
                  <div className="mb-4">
                    <label className="text-caption text-muted block mb-1.5">Rejection Reason <span className="text-muted">(required to reject)</span></label>
                    <textarea
                      rows={2}
                      value={rejectionReasons[req.id] || ''}
                      onChange={(e) => setRejectionReasons((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      placeholder="Enter reason for rejection..."
                      className="w-full input-field text-body-sm resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {req.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleAction(req.id, 'approve')}
                          disabled={actionLoading === req.id}
                          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'reject')}
                          disabled={!rejectionReasons[req.id]?.trim() || actionLoading === req.id}
                          className="btn-secondary inline-flex items-center gap-2 text-error border-error/30 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                    {(req.status === 'Pending' || req.status === 'Approved') && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel ${req.first_name}'s ${req.leave_type_name} leave?`)) {
                            handleAction(req.id, 'cancel');
                          }
                        }}
                        disabled={actionLoading === req.id}
                        className="btn-secondary inline-flex items-center gap-2 text-error border-error/30 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Ban size={16} />
                        Cancel Leave
                      </button>
                    )}
                    {(req.status === 'Rejected' || req.status === 'Cancelled') && (
                      <span className={`badge ${statusBadge[req.status]}`}>{req.status}</span>
                    )}
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
