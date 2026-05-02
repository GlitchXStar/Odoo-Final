import {
  Users, CalendarDays, CalendarOff, Wallet,
  FileText, BarChart3, Settings, Shield
} from 'lucide-react';

const modules = [
  { icon: Users, label: 'Employee Directory' },
  { icon: CalendarDays, label: 'Attendance Logs' },
  { icon: CalendarOff, label: 'Time Off Management' },
  { icon: Wallet, label: 'Payroll Processing' },
  { icon: FileText, label: 'Payslip Generation' },
  { icon: BarChart3, label: 'Reports & Analytics' },
  { icon: Settings, label: 'Settings & Config' },
  { icon: Shield, label: 'Secure Authentication' },
];

export default function ModuleGrid() {
  return (
    <section id="modules" className="section-container py-24 lg:py-32">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-1.5 bg-surface-card rounded-pill text-caption text-muted mb-6">
          Everything you need
        </div>
        <h2 className="font-cal text-display-lg text-ink text-balance">
          Built for every HR workflow
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
        {modules.map((mod) => (
          <div
            key={mod.label}
            className="flex flex-col items-center gap-4 text-center group"
          >
            <div className="w-16 h-16 rounded-xl bg-surface-card flex items-center justify-center group-hover:bg-ink group-hover:text-on-primary transition-all duration-200">
              <mod.icon size={24} />
            </div>
            <h5 className="text-title-sm text-ink">{mod.label}</h5>
          </div>
        ))}
      </div>
    </section>
  );
}
