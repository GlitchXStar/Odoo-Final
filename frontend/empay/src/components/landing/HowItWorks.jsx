import { UserPlus, CalendarCheck, Receipt } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Manage your team',
    description: 'Add employees, assign roles, set up departments. Your entire workforce in one directory.',
    icon: UserPlus,
    mockup: (
      <div className="mt-4 bg-surface-card rounded-lg p-4 border border-hairline">
        <div className="space-y-2">
          {['Sarah Johnson', 'Mike Chen', 'Priya Patel'].map((name, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-canvas rounded-md">
              <div className="w-7 h-7 rounded-full bg-surface-strong flex items-center justify-center text-caption text-muted">
                {name.charAt(0)}
              </div>
              <div className="flex-1">
                <span className="text-caption font-medium text-ink">{name}</span>
              </div>
              <span className="badge badge-present text-[11px]">Active</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Track attendance',
    description: 'Employees check in/out daily. Automatic logs, status tracking, monthly summaries.',
    icon: CalendarCheck,
    mockup: (
      <div className="mt-4 bg-surface-card rounded-lg p-4 border border-hairline">
        <div className="space-y-2">
          {[
            { name: 'Sarah J.', status: 'Present', time: '09:02 AM', badge: 'badge-present' },
            { name: 'Mike C.', status: 'Half Day', time: '09:15 AM', badge: 'badge-halfday' },
            { name: 'Priya P.', status: 'Absent', time: '—', badge: 'badge-absent' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-canvas rounded-md">
              <span className="text-caption font-medium text-ink">{row.name}</span>
              <span className="text-caption text-muted">{row.time}</span>
              <span className={`badge ${row.badge} text-[11px]`}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Process payroll',
    description: 'Connected to attendance + leave. Auto-calculate salaries, generate payslips instantly.',
    icon: Receipt,
    mockup: (
      <div className="mt-4 bg-surface-card rounded-lg p-4 border border-hairline">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-caption text-muted">Basic Salary</span>
            <span className="text-caption font-medium text-ink">₹45,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption text-muted">HRA</span>
            <span className="text-caption font-medium text-ink">₹18,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption text-muted">Deductions</span>
            <span className="text-caption font-medium text-error">-₹5,400</span>
          </div>
          <div className="border-t border-hairline pt-2 flex justify-between">
            <span className="text-caption font-semibold text-ink">Net Pay</span>
            <span className="text-caption font-bold text-ink">₹57,600</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-container py-24 lg:py-32">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-1.5 bg-surface-card rounded-pill text-caption text-muted mb-6">
          How it works
        </div>
        <h2 className="font-cal text-display-lg text-ink text-balance">
          Effortless HR management in three steps
        </h2>
        <p className="text-body-md text-muted mt-4 max-w-lg mx-auto">
          From onboarding to payroll, EmPay handles the heavy lifting so you can focus on your people.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col gap-4">
            {/* Step Number */}
            <div className="w-12 h-12 bg-ink text-on-primary flex items-center justify-center rounded-lg text-title-md font-bold">
              {step.number}
            </div>
            <h3 className="font-cal text-display-sm text-ink">{step.title}</h3>
            <p className="text-body-sm text-muted">{step.description}</p>
            {/* Product UI Fragment */}
            {step.mockup}
          </div>
        ))}
      </div>
    </section>
  );
}
