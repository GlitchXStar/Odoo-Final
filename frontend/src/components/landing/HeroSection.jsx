import { ArrowRight, Users, Clock, DollarSign } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="section-container pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Text Content (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h1 className="font-cal text-display-xl text-ink max-w-xl text-balance">
            The smarter way to manage your workforce
          </h1>
          <p className="text-body-md text-muted max-w-md leading-relaxed">
            Streamline attendance, automate payroll, and empower your HR team — all from one platform.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              Get Started
              <ArrowRight size={16} />
            </a>
            <a href="#how-it-works" className="btn-secondary inline-flex items-center gap-2 px-8 py-3">
              Learn More
            </a>
          </div>
          <p className="text-caption text-muted-soft mt-1">No credit card required</p>
        </div>

        {/* Right: Dashboard Mockup (5 columns) */}
        <div className="lg:col-span-5">
          <div className="card-hero-mockup overflow-hidden">
            {/* Mockup Header */}
            <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-caption text-muted">Dashboard</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-surface-card" />
                <div className="w-3 h-3 rounded-full bg-surface-card" />
                <div className="w-3 h-3 rounded-full bg-surface-card" />
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Users size={16} className="text-brand-accent" />}
                label="Total Employees"
                value="1,248"
                trend="+12%"
              />
              <StatCard
                icon={<Clock size={16} className="text-success" />}
                label="Present Today"
                value="1,089"
                trend="87%"
              />
              <div className="col-span-2 p-4 border border-hairline rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-caption text-muted">Payroll Status</span>
                  <DollarSign size={14} className="text-muted" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-body-sm font-medium text-ink">Monthly Processing Completed</span>
                </div>
                {/* Mini chart visualization */}
                <div className="flex items-end gap-1 mt-3 h-8">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-ink/10 rounded-sm"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="p-4 border border-hairline rounded-lg flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-caption text-muted">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-title-lg text-ink">{value}</span>
        <span className="text-caption text-success mb-0.5">{trend}</span>
      </div>
    </div>
  );
}
