import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { auth } from '../services/api.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  const startCooldown = () => {
    setOtpCooldown(60);
    const timer = setInterval(() => {
      setOtpCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await auth.forgotPassword({ identifier });
      setMaskedEmail(res.email || '');
      setMessage(res.message || 'OTP sent to your registered email.');
      setStep(2);
      startCooldown();
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await auth.forgotPassword({ identifier });
      setMessage(res.message || 'OTP resent.');
      startCooldown();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await auth.resetPassword({ identifier, otp, newPassword });
      setSuccess(true);
      setMessage(res.message || 'Password reset successfully.');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-canvas flex">
        <div className="hidden lg:flex lg:w-[45%] bg-surface-dark flex-col justify-between p-12">
          <Link to="/" className="font-cal text-2xl text-on-dark tracking-tight">EmPay</Link>
          <div className="flex flex-col gap-6 max-w-md">
            <h1 className="font-cal text-display-lg text-on-dark">Password reset complete</h1>
            <p className="text-body-md text-on-dark-soft leading-relaxed">
              Your password has been updated. You can now sign in with your new credentials.
            </p>
          </div>
          <p className="text-caption text-on-dark-soft">© {new Date().getFullYear()} EmPay. All rights reserved.</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={28} className="text-success" />
            </div>
            <h2 className="font-cal text-display-sm text-ink mb-2">All set!</h2>
            <p className="text-body-sm text-muted mb-6">{message}</p>
            <Link to="/login" className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3">
              Sign in
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-surface-dark flex-col justify-between p-12">
        <Link to="/" className="font-cal text-2xl text-on-dark tracking-tight">EmPay</Link>
        <div className="flex flex-col gap-6 max-w-md">
          <h1 className="font-cal text-display-lg text-on-dark">
            {step === 1 ? 'Reset your password' : 'Enter verification code'}
          </h1>
          <p className="text-body-md text-on-dark-soft leading-relaxed">
            {step === 1
              ? 'Enter your email or login ID and we\'ll send you a verification code to reset your password.'
              : `We've sent a 6-digit code to ${maskedEmail}. Enter it below along with your new password.`
            }
          </p>
        </div>
        <p className="text-caption text-on-dark-soft">© {new Date().getFullYear()} EmPay. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-cal text-2xl text-ink tracking-tight lg:hidden mb-8 block">EmPay</Link>

          <Link to="/login" className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors mb-6">
            <ArrowLeft size={16} />
            Back to login
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-ink' : 'text-muted'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-caption font-medium ${step >= 1 ? 'bg-ink text-on-primary' : 'bg-surface-card text-muted'}`}>1</div>
              <span className="text-caption font-medium">Email</span>
            </div>
            <div className={`w-8 h-px ${step >= 2 ? 'bg-ink' : 'bg-hairline'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-ink' : 'text-muted'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-caption font-medium ${step >= 2 ? 'bg-ink text-on-primary' : 'bg-surface-card text-muted'}`}>2</div>
              <span className="text-caption font-medium">Reset</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <h2 className="font-cal text-display-sm text-ink">
              {step === 1 ? 'Forgot password?' : 'Set new password'}
            </h2>
            <p className="text-body-sm text-muted">
              {step === 1
                ? 'Enter your email or login ID to receive a verification code.'
                : `Enter the OTP sent to ${maskedEmail} and your new password.`
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
              {error}
            </div>
          )}

          {message && step === 2 && !error && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-body-sm text-success">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-email" className="text-caption text-ink">Email or Login ID</label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@company.com or EMP20260001"
                    className="input-field pl-10"
                    required
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !identifier}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send verification code
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="reset-otp" className="text-caption text-ink">Verification Code</label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || otpCooldown > 0}
                    className="text-caption text-muted hover:text-ink transition-colors disabled:opacity-50"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend code'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="reset-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="input-field pl-10 tracking-[0.3em] text-center font-medium"
                    required
                  />
                  <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-new-pw" className="text-caption text-ink">New Password</label>
                <div className="relative">
                  <input
                    id="reset-new-pw"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, upper, lower, digit, special"
                    className="input-field pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-confirm-pw" className="text-caption text-ink">Confirm Password</label>
                <div className="relative">
                  <input
                    id="reset-confirm-pw"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="input-field pl-10"
                    required
                    minLength={8}
                  />
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-caption text-error">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !otp || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Reset password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setMessage(''); setOtp(''); }}
                className="text-body-sm text-muted hover:text-ink transition-colors text-center"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
