import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { auth } from '../services/api.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loginMode, setLoginMode] = useState('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await auth.login({ identifier, password });
      const authData = response.data || response;
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (otpCooldown > 0) return;
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await auth.requestOtp({ identifier });
      setOtpSent(true);
      setMessage(response.message || 'OTP sent to your registered email.');
      setOtpCooldown(60);
      const timer = setInterval(() => {
        setOtpCooldown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await auth.verifyOtp({ identifier, otp });
      const authData = response.data || response;
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
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

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-body-sm text-success">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-surface-card rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMode('password')}
              className={`px-3 py-2 rounded-md text-caption font-medium transition-all ${
                loginMode === 'password' ? 'bg-canvas text-ink shadow-soft' : 'text-muted hover:text-ink'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('otp')}
              className={`px-3 py-2 rounded-md text-caption font-medium transition-all ${
                loginMode === 'otp' ? 'bg-canvas text-ink shadow-soft' : 'text-muted hover:text-ink'
              }`}
            >
              OTP
            </button>
          </div>

          <form onSubmit={loginMode === 'password' ? handleSubmit : handleOtpSubmit} className="flex flex-col gap-5">
            {/* Email or Login ID */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-caption text-ink">
                Email or Login ID
              </label>
              <input
                id="login-email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@company.com or EMP20260001"
                className="input-field"
                required
              />
            </div>

            {loginMode === 'password' ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-caption text-ink">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('otp');
                      setError('');
                      setMessage('');
                    }}
                    className="text-caption text-muted hover:text-ink transition-colors"
                  >
                    Use OTP instead
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pr-10"
                    required={loginMode === 'password'}
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
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-otp" className="text-caption text-ink">
                    One-time password
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isLoading || !identifier || otpCooldown > 0}
                    className="text-caption text-muted hover:text-ink transition-colors disabled:opacity-50"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="input-field"
                  required={loginMode === 'otp'}
                />
              </div>
            )}

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
                  {loginMode === 'password' ? 'Sign in' : 'Verify OTP'}
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
