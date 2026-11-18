import React, { useState, useEffect } from 'react';
import { SignInPage, Testimonial } from '@/components/ui/sign-in';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPasswordForEmail,
  getCurrentUser,
  signOutUser,
  AuthUserProfile,
  isSupabaseConfigured,
} from '../services/supabaseAuth';
import { ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Cpu, Database, Activity } from 'lucide-react';

interface AuthPageProps {
  onNavigateHome: () => void;
  onAuthSuccess?: (user: AuthUserProfile) => void;
}

const APEX_TESTIMONIALS: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Dr. Sarah Chen",
    handle: "@sarah_quant · CIO, Alpha Vector Capital",
    text: "Apex Quant's vectorized daily backtest engine and ORB models delivered exceptional execution clarity across our NSE equity book."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Marcus Johnson",
    handle: "@marcus_prop · Head of Derivatives",
    text: "Multi-factor alpha screener and deterministic PSAR execution transformed our institutional risk management workflow."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    name: "David Martinez",
    handle: "@david_hft · Senior Quantitative Strategist",
    text: "100% deterministic backtesting on authentic Yahoo & Upstox feeds make this the definitive terminal for Indian algorithmic markets."
  },
];

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigateHome, onAuthSuccess }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string || '').trim();
    const password = (formData.get('password') as string || '').trim();

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'signin') {
        const result = await signInWithEmail(email, password);
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setSuccessMsg('Successfully authenticated. Redirecting to workstation...');
          setTimeout(() => {
            onAuthSuccess?.(user);
            onNavigateHome();
          }, 600);
        }
      } else if (authMode === 'signup') {
        const result = await signUpWithEmail(email, password);
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            onAuthSuccess?.(user);
            onNavigateHome();
          }, 600);
        } else {
          setSuccessMsg('Confirmation email sent! Please check your inbox.');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setSuccessMsg('Google sign-in successful. Redirecting...');
        setTimeout(() => {
          onAuthSuccess?.(user);
          onNavigateHome();
        }, 500);
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setErrorMsg(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const email = prompt('Enter your registered email address for password reset:');
    if (!email) return;
    try {
      setLoading(true);
      await resetPasswordForEmail(email);
      setSuccessMsg(`Password reset link dispatched to ${email}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setSuccessMsg('Signed out successfully.');
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0D] flex flex-col relative">
      {/* Top Bar with Navigation & Brand */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-black hover:border-black transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Research Workstation</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0A0A0D] flex items-center justify-center text-white font-bold text-xs">
            AQ
          </div>
          <span className="font-bold text-sm tracking-tight text-[#0A0A0D]">apex quant</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isSupabaseConfigured ? 'Supabase Auth Online' : 'Local Auth Mode'}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 pt-16 flex flex-col justify-center">
        {currentUser ? (
          <div className="max-w-md mx-auto my-12 p-8 bg-white border border-gray-200 rounded-3xl shadow-card text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A0A0D]">Already Signed In</h2>
              <p className="text-sm text-gray-500 mt-1">Logged in as <span className="font-mono font-semibold text-black">{currentUser.email}</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Authentication Provider: {currentUser.provider || 'institutional'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-mono">
              <div>
                <span className="text-gray-400 block text-[10px]">ACCESS TIER</span>
                <span className="font-bold text-[#0A0A0D]">
                  {currentUser.role === 'admin' ? 'System Administrator (Root)' : 'Institutional Quant'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">ENGINE LATENCY</span>
                <span className="font-bold text-emerald-600">&lt; 14ms Sub-Tick</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    onAuthSuccess?.(currentUser);
                    window.location.pathname = '/admin';
                  }}
                  className="w-full py-3 bg-[#FF5500] hover:bg-[#E04B00] text-white font-medium rounded-xl text-sm transition-all shadow-sm"
                >
                  Open Admin Strategy Portal
                </button>
              )}
              <button
                onClick={onNavigateHome}
                className="w-full py-3 bg-[#0A0A0D] hover:bg-neutral-800 text-white font-medium rounded-xl text-sm transition-all"
              >
                Go to Backtest Studio & Strategies
              </button>
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-xl text-xs transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Status alerts */}
            {(errorMsg || successMsg) && (
              <div className="max-w-md mx-auto mt-4 px-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Admin Credentials Callout */}
            {authMode === 'signin' && (
              <div className="max-w-md mx-auto mt-4 px-4">
                <div className="p-3 bg-[#0A0A0D] text-white rounded-2xl flex items-center justify-between text-xs font-mono border border-gray-800 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-gray-300">Admin Login:</span>
                    <span className="text-[#FF5500] font-bold">admin</span> / <span className="text-[#FF5500] font-bold">admin</span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">Root Access</span>
                </div>
              </div>
            )}

            <SignInPage
              title={
                <div className="space-y-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
                    {authMode === 'signin' ? 'Institutional Access' : 'Create Quant Terminal Account'}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0D]">
                    {authMode === 'signin' ? 'Sign In to Apex Quant' : 'Join Apex Quant Terminal'}
                  </h1>
                </div>
              }
              description={
                authMode === 'signin'
                  ? "Access your live algorithmic strategies, historical Yahoo daily feeds, and custom AI strategy copilot."
                  : "Deploy professional systematic strategies with 100% deterministic backtest fidelity across Indian equities."
              }
              heroImageSrc="https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80"
              testimonials={APEX_TESTIMONIALS}
              onSignIn={handleSignIn}
              onGoogleSignIn={handleGoogleSignIn}
              onResetPassword={handleResetPassword}
              onCreateAccount={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Institutional Platform Badges & Trust Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit SSL Quant Auth
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Real Yahoo Daily Datasets
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              Deterministic Vector Sizing
            </span>
          </div>
          <div className="text-gray-400">
            Apex Quant Research Workstation · 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
