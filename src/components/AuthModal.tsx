import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lock, Mail, User, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { validateSignUpPayload, validateSignInPayload } from '../utils/auth';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'signin';
  onAuthenticated?: (user: UserProfile) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signup',
  onAuthenticated,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessUser(null);
      setForgotPasswordOpen(false);
      setResetSent(false);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'signup') {
      const validation = validateSignUpPayload({
        name: fullName,
        email,
        password,
        termsAccepted: agreeTerms,
      });
      if (!validation.isValid) {
        setErrorMsg(validation.error || 'Please fill in all required fields.');
        return;
      }
    } else {
      const validation = validateSignInPayload({ email, password });
      if (!validation.isValid) {
        setErrorMsg(validation.error || 'Please check your email and password.');
        return;
      }
    }

    setIsLoading(true);

    // Simulate realistic rapid authentication
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        name: mode === 'signup' ? fullName : (fullName || email.split('@')[0] || 'User'),
        email,
      };
      setSuccessUser(user);
      if (onAuthenticated) {
        onAuthenticated(user);
      }
    }, 700);
  };

  const handleSocialAuth = (provider: 'Google' | 'GitHub') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        name: provider === 'Google' ? 'Alex Rivera' : 'alex-rivera-tech',
        email: `alex.rivera@${provider.toLowerCase()}.com`,
      };
      setSuccessUser(user);
      if (onAuthenticated) {
        onAuthenticated(user);
      }
    }, 600);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address to receive reset instructions.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c061a] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all">
        {/* Glow orb behind modal */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Authenticated Success State */}
        {successUser ? (
          <div className="py-6 text-center space-y-4 relative z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white font-general tracking-tight">
                Welcome to Aura AI
              </h3>
              <p className="text-sm text-zinc-300 mt-1.5">
                Successfully signed in as <span className="font-semibold text-white">{successUser.name}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">{successUser.email}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 text-left flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                Your session is authenticated. You have unlocked instant 1-click PayPal checkout and priority agentic assistance.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full heroSecondary rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] cursor-pointer mt-2"
            >
              Continue to Aura
            </button>
          </div>
        ) : forgotPasswordOpen ? (
          /* Forgot Password View */
          <div className="space-y-5 relative z-10 animate-fade-in">
            <div className="text-left">
              <h3 id="auth-modal-title" className="text-2xl font-bold text-white font-general">
                Reset Password
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your account email and we'll send you instructions to reset your password.
              </p>
            </div>

            {resetSent ? (
              <div className="py-4 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-purple-400 mx-auto" />
                <p className="text-sm text-zinc-200">
                  Password reset link has been dispatched to <strong className="text-white">{email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setResetSent(false);
                    setMode('signin');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-400/80 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full heroSecondary rounded-xl py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Main Sign In / Sign Up Form */
          <div className="space-y-5 relative z-10">
            {/* Header branding */}
            <div className="text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium mb-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Aura Member Access</span>
              </div>
              <h2 id="auth-modal-title" className="text-2xl font-bold text-white font-general tracking-tight">
                {mode === 'signup' ? 'Create your Aura account' : 'Welcome back to Aura'}
              </h2>
              <p className="text-xs text-zinc-400">
                {mode === 'signup'
                  ? 'Join thousands shopping with autonomous AI agents.'
                  : 'Sign in to access your saved gadgets and order history.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-purple-600/80 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-purple-600/80 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign In / Log In
              </button>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-xs font-medium text-white transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('GitHub')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-xs font-medium text-white transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="w-full border-t border-white/10" />
              <span className="bg-[#0c061a] px-3 text-[11px] uppercase tracking-wider text-zinc-500 absolute">
                or continue with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-400/80 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-400/80 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-400/80 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' ? (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-[11px] text-zinc-400 leading-tight cursor-pointer">
                    I agree to Aura's Terms of Service and Privacy Policy.
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordOpen(true);
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit CTA with smooth hover transition */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 heroSecondary rounded-xl py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:border-purple-400/60 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{isLoading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In to Aura'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>

            {/* Footer toggle */}
            <div className="text-center pt-2 text-xs text-zinc-400 border-t border-white/5">
              {mode === 'signup' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline underline-offset-2 ml-1"
                  >
                    Sign In / Log In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline underline-offset-2 ml-1"
                  >
                    Sign Up
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
