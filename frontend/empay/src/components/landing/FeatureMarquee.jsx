import {
  CalendarCheck, Wallet, Palmtree, Shield,
  FileText, Users, BarChart3, Calculator
} from 'lucide-react';

const features = [
  { icon: CalendarCheck, label: 'Attendance Tracking' },
  { icon: Wallet, label: 'Payroll Processing' },
  { icon: Palmtree, label: 'Leave Management' },
  { icon: Shield, label: 'Role-Based Access' },
  { icon: FileText, label: 'Payslip Generation' },
  { icon: Users, label: 'Employee Directory' },
  { icon: BarChart3, label: 'Analytics & Reports' },
  { icon: Calculator, label: 'Salary Breakdown' },
];

export default function FeatureMarquee() {
  return (
    <section className="py-5 border-y border-hairline bg-canvas overflow-hidden">
      <div className="animate-marquee flex w-max">
        {/* Duplicate for seamless loop */}
        {[...features, ...features].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-6 shrink-0"
          >
            <feature.icon size={16} className="text-muted" />
            <span className="text-body-sm text-muted font-medium whitespace-nowrap">
              {feature.label}
            </span>
            {i < features.length * 2 - 1 && (
              <span className="text-hairline ml-4">·</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
