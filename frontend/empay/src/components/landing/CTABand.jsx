import { ArrowRight } from 'lucide-react';

export default function CTABand() {
  return (
    <section className="bg-surface-card py-24">
      <div className="section-container text-center flex flex-col items-center gap-6">
        <h2 className="font-cal text-display-lg text-ink text-balance">
          Smarter, simpler HR management
        </h2>
        <p className="text-body-md text-muted max-w-md">
          Start managing your workforce today. Setup takes less than 5 minutes.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <a href="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            Get Started
            <ArrowRight size={16} />
          </a>
          <a href="#" className="btn-secondary inline-flex items-center gap-2 px-8 py-3">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
