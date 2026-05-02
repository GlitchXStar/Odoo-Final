import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ChevronDown } from 'lucide-react';

const roles = [
  { value: 'employee', label: 'Employee' },
  { value: 'hr_officer', label: 'HR Officer' },
  { value: 'payroll_officer', label: 'Payroll Officer' },
  { value: 'admin', label: 'Administrator' },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

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
            Start managing your workforce today
          </h1>
          <p className="text-body-md text-on-dark-soft leading-relaxed">
            Create your account and get started with EmPay's smart HR management platform in minutes.
          </p>
          {/* Feature list */}
          <div className="flex flex-col gap-3 mt-2">
            {[
              'Role-based access control',
              'Automated payroll processing',
              'Smart attendance tracking',
              'Leave management workflow',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                </div>
                <span className="text-body-sm text-on-dark-soft">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-caption text-on-dark-soft">
          © {new Date().getFullYear()} EmPay. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="font-cal text-2xl text-ink tracking-tight lg:hidden mb-8 block">
            EmPay
          </Link>

          <div className="flex flex-col gap-2 mb-8">
            <h2 className="font-cal text-display-sm text-ink">Create account</h2>
            <p className="text-body-sm text-muted">
              Fill in your details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-name" className="text-caption text-ink">
                Full name
              </label>
              <input
                id="reg-name"
                type="text"
                value={formData.fullName}
                onChange={update('fullName')}
                placeholder="John Doe"
                className="input-field"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-caption text-ink">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={update('email')}
                placeholder="you@company.com"
                className="input-field"
                required
              />
            </div>

            {/* Role Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-role" className="text-caption text-ink">
                Role
              </label>
              <div className="relative">
                <select
                  id="reg-role"
                  value={formData.role}
                  onChange={update('role')}
                  className="input-field appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-caption text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={update('password')}
                  placeholder="Minimum 8 characters"
                  className="input-field pr-10"
                  required
                  minLength={8}
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-confirm" className="text-caption text-ink">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="Re-enter your password"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account
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

          {/* Login Link */}
          <p className="text-body-sm text-muted text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-ink font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
