import { Shield, BarChart3, CalendarCheck, Wallet } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Role-based access control',
    description: 'Four distinct roles — Admin, HR Officer, Payroll Officer, Employee — each with precise permissions.',
  },
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    description: 'Track attendance trends, payroll expenses, leave distribution, and employee statistics at a glance.',
  },
  {
    icon: CalendarCheck,
    title: 'Smart leave management',
    description: 'Employees apply, managers approve, payroll auto-adjusts. Paid, sick, casual, and unpaid leave types.',
  },
  {
    icon: Wallet,
    title: 'Detailed salary breakdown',
    description: 'Basic salary, HRA, bonuses, allowances, PF, professional tax — every component transparent.',
  },
];

export default function Benefits() {
  return (
    <section id="features" className="bg-surface-card py-24 lg:py-32">
      <div className="section-container">
        {/* Section Header */}
        <div className="mb-16">
          <div className="inline-flex items-center px-4 py-1.5 bg-canvas rounded-pill text-caption text-muted mb-6">
            Benefits
          </div>
          <h2 className="font-cal text-display-lg text-ink max-w-xl text-balance">
            Discover our advanced features
          </h2>
          <p className="text-body-md text-muted mt-4 max-w-lg">
            Powerful tools designed for modern HR teams. Unlimited and free for small organizations.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-canvas p-8 rounded-lg border border-hairline hover:border-ink/20 transition-all duration-200 group"
            >
              <div className="mb-6 w-12 h-12 bg-surface-card rounded-lg flex items-center justify-center group-hover:bg-ink group-hover:text-on-primary transition-all duration-200">
                <benefit.icon size={22} />
              </div>
              <h4 className="text-title-md text-ink mb-2">{benefit.title}</h4>
              <p className="text-body-sm text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
