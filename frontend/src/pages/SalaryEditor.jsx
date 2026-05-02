import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { employees, salaryStructures } from '../services/api.js';
import DateDropdown from '../components/DateDropdown.jsx';

const SALARY_YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 5 - i);

const empty = {
  effectiveFrom: '', effectiveTo: '',
  basic: '', hra: '', conveyanceAllowance: '', medicalAllowance: '',
  specialAllowance: '', bonus: '', otherAllowances: '',
};

function Field({ label, id, value, onChange, type = 'number', required, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption text-ink">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="input-field"
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? 'any' : undefined}
      />
    </div>
  );
}

export default function SalaryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);
  const [form, setForm] = useState(empty);
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const empRes = await employees.getById(id);
      const e = empRes?.data || {};
      setEmp(e);

      if (e.user_id) {
        try {
          const salRes = await salaryStructures.getActiveByUser(e.user_id);
          const s = salRes?.data || salRes;
          if (s?.id) {
            setExistingId(s.id);
            setForm({
              effectiveFrom: s.effective_from ? s.effective_from.slice(0, 10) : '',
              effectiveTo: s.effective_to ? s.effective_to.slice(0, 10) : '',
              basic: s.basic ?? '',
              hra: s.hra ?? '',
              conveyanceAllowance: s.conveyance_allowance ?? '',
              medicalAllowance: s.medical_allowance ?? '',
              specialAllowance: s.special_allowance ?? '',
              bonus: s.bonus ?? '',
              otherAllowances: s.other_allowances ?? '',
            });
          }
        } catch {
          // no active salary — will create new
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toPayload = () => {
    const isNew = !existingId;
    const payload = {};
    if (isNew && emp?.user_id) payload.userId = emp.user_id;
    if (form.effectiveFrom) payload.effectiveFrom = form.effectiveFrom;
    if (form.effectiveTo) payload.effectiveTo = form.effectiveTo;
    // For new records: default empty to 0; for updates: only include non-empty values
    const numFields = ['basic', 'hra', 'conveyanceAllowance', 'medicalAllowance', 'specialAllowance', 'bonus', 'otherAllowances'];
    for (const f of numFields) {
      if (form[f] !== '') payload[f] = Number(form[f]);
      else if (isNew) payload[f] = 0;
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!existingId && !form.effectiveFrom) {
      setError('Effective From date is required.');
      return;
    }
    if (!form.basic || Number(form.basic) <= 0) {
      setError('Basic salary must be a positive number.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (existingId) {
        await salaryStructures.update(existingId, toPayload());
      } else {
        await salaryStructures.create(toPayload());
      }
      navigate(`/app/employees/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to save salary');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-content mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto">
      <Link
        to={`/app/employees/${id}`}
        className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">
            {existingId ? 'Edit Salary' : 'Set Salary'}
          </h1>
          <p className="text-body-sm text-muted mt-1">
            {emp ? `${emp.first_name} ${emp.last_name} · ${emp.designation || emp.department || ''}` : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden mb-6">
          {/* Effective Period */}
          <div className="px-6 py-4 bg-surface-soft/50 flex items-center gap-2 border-b border-hairline">
            <DollarSign size={16} className="text-muted" />
            <h3 className="text-title-sm text-ink">Effective Period</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="effectiveFrom" className="text-caption text-ink">
                Effective From <span className="text-error">*</span>
              </label>
              <DateDropdown
                id="effectiveFrom"
                value={form.effectiveFrom}
                onChange={(v) => setForm(prev => ({...prev, effectiveFrom: v}))}
                yearRange={SALARY_YEARS}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="effectiveTo" className="text-caption text-ink">
                Effective To
              </label>
              <DateDropdown
                id="effectiveTo"
                value={form.effectiveTo}
                onChange={(v) => setForm(prev => ({...prev, effectiveTo: v}))}
                yearRange={SALARY_YEARS}
              />
            </div>
          </div>

          {/* Earnings */}
          <div className="px-6 py-4 bg-surface-soft/50 flex items-center gap-2 border-y border-hairline">
            <DollarSign size={16} className="text-muted" />
            <h3 className="text-title-sm text-ink">Earnings (₹ / month)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Basic Salary" id="basic" value={form.basic} onChange={set('basic')} required placeholder="e.g. 50000" />
            <Field label="HRA" id="hra" value={form.hra} onChange={set('hra')} placeholder="e.g. 20000" />
            <Field label="Conveyance Allowance" id="conveyance" value={form.conveyanceAllowance} onChange={set('conveyanceAllowance')} placeholder="e.g. 1600" />
            <Field label="Medical Allowance" id="medical" value={form.medicalAllowance} onChange={set('medicalAllowance')} placeholder="e.g. 1250" />
            <Field label="Special Allowance" id="special" value={form.specialAllowance} onChange={set('specialAllowance')} placeholder="e.g. 5000" />
            <Field label="Bonus" id="bonus" value={form.bonus} onChange={set('bonus')} placeholder="e.g. 0" />
            <Field label="Other Allowances" id="other" value={form.otherAllowances} onChange={set('otherAllowances')} placeholder="e.g. 0" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to={`/app/employees/${id}`} className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
            <Save size={16} />
            {saving ? 'Saving...' : existingId ? 'Update Salary' : 'Set Salary'}
          </button>
        </div>
      </form>
    </div>
  );
}
