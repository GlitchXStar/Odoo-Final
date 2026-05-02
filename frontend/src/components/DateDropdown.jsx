import { ChevronDown } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

/**
 * DateDropdown — 3-select date picker (Day | Month | Year)
 * @param {string}   value    — YYYY-MM-DD string (or empty)
 * @param {function} onChange — called with the new YYYY-MM-DD string
 * @param {boolean}  required
 * @param {string}   id
 * @param {number[]} yearRange — optional custom array of years
 */
export default function DateDropdown({ value, onChange, required, id, yearRange }) {
  const years = yearRange || YEARS;

  const parts = value ? value.split('-') : ['', '', ''];
  const y = parts[0] || '';
  const m = parts[1] ? parseInt(parts[1]) : '';
  const d = parts[2] ? parseInt(parts[2]) : '';

  const rebuild = (newY, newM, newD) => {
    const yy = newY || y || new Date().getFullYear();
    const mm = newM || m || '01';
    const dd = newD || d || '01';
    return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Day */}
      <div className="relative flex-1">
        <select
          id={id ? `${id}-day` : undefined}
          value={d}
          onChange={(e) => onChange(rebuild(y, m, e.target.value))}
          className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer w-full"
          required={required}
        >
          <option value="" disabled>Day</option>
          {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>

      {/* Month */}
      <div className="relative flex-[2]">
        <select
          id={id ? `${id}-month` : undefined}
          value={m}
          onChange={(e) => onChange(rebuild(y, e.target.value, d))}
          className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer w-full"
          required={required}
        >
          <option value="" disabled>Month</option>
          {MONTHS.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>

      {/* Year */}
      <div className="relative flex-1">
        <select
          id={id ? `${id}-year` : undefined}
          value={y ? parseInt(y) : ''}
          onChange={(e) => onChange(rebuild(e.target.value, m, d))}
          className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer w-full"
          required={required}
        >
          <option value="" disabled>Year</option>
          {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>
    </div>
  );
}
