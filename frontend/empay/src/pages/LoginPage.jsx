import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to backend API
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-surface-dark flex-col justify-between p-12">
        <Link to="/" className="font-cal text-2xl text-on-dark tracking-tight">
          EmPay
        </Link>
        <div className="flex flex-col gap-6 max-w-md">
          <h1 className="font-cal text-display-lg text-on-dark">
            Welcome back to your workspace
          </h1>
          <p className="text-body-md text-on-dark-soft leading-relaxed">
            Manage your workforce, track attendance, process payroll — all from one unified platform.
          </p>
          {/* Floating stat cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-surface-dark-elevated rounded-lg p-4 border border-white/10">
              <span className="text-caption text-on-dark-soft">Active Employees</span>
              <p className="text-title-lg text-on-dark mt-1">1,248</p>
            </div>
            <div className="bg-surface-dark-elevated rounded-lg p-4 border border-white/10">
              <span className="text-caption text-on-dark-soft">Payroll Processed</span>
              <p className="text-title-lg text-on-dark mt-1">₹4.2M</p>
            </div>
          </div>
        </div>
        <p className="text-caption text-on-dark-soft">
          © {new Date().getFullYear()} EmPay. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="font-cal text-2xl text-ink tracking-tight lg:hidden mb-8 block">
            EmPay
          </Link>

          <div className="flex flex-col gap-2 mb-8">
            <h2 className="font-cal text-display-sm text-ink">Sign in</h2>
            <p className="text-body-sm text-muted">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-caption text-ink">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input-field"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-caption text-ink">
                  Password
                </label>
                <a href="#" className="text-caption text-muted hover:text-ink transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-1"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-hairline" />
            <span className="text-caption text-muted">or</span>
            <div className="flex-1 h-px bg-hairline" />
          </div>

          {/* Register Link */}
          <p className="text-body-sm text-muted text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-ink font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
