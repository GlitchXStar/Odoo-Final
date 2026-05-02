import { ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="h-16 w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-hairline">
      <div className="flex items-center justify-between px-6 lg:px-8 w-full max-w-content mx-auto h-full">
        {/* Logo */}
        <a href="/" className="font-cal text-xl tracking-tight text-ink">
          EmPay
        </a>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-nav text-muted hover:text-ink transition-colors duration-150">
            Features
          </a>
          <a href="#how-it-works" className="text-nav text-muted hover:text-ink transition-colors duration-150">
            How it works
          </a>
          <a href="#modules" className="text-nav text-muted hover:text-ink transition-colors duration-150">
            Modules
          </a>
        </div>

        {/* Right Cluster */}
        <div className="flex items-center gap-4">
          <a href="/login" className="btn-text hidden sm:inline-flex">
            Sign in
          </a>
          <a
            href="/register"
            className="btn-primary inline-flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </nav>
  );
}
