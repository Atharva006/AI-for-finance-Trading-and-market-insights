import React, { useState } from 'react';
import NexusLogin from '@/components/ui/nexus-3d-animated-login-futuristic-authentication-ui';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPasswordForEmail,
  AuthUserProfile,
  getStoredLocalUser,
} from '../services/supabaseAuth';
import { ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onNavigateHome: () => void;
  onAuthSuccess?: (user: AuthUserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigateHome, onAuthSuccess }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSubmit = async (credentials: { email: string; password: string; remember: boolean }) => {
    if (isSignUpMode) {
      const res = await signUpWithEmail(credentials.email, credentials.password);
      if (res?.user) {
        const u: AuthUserProfile = getStoredLocalUser() || {
          id: res.user.id,
          email: res.user.email || credentials.email,
          name: (res.user.email || credentials.email).split('@')[0],
          provider: 'email',
          role: 'quant',
        };
        onAuthSuccess?.(u);
      }
    } else {
      const res = await signInWithEmail(credentials.email, credentials.password);
      if (res?.user) {
        const u: AuthUserProfile = getStoredLocalUser() || {
          id: res.user.id,
          email: res.user.email || credentials.email,
          name: (res.user.email || credentials.email).split('@')[0],
          provider: 'email',
          role: 'quant',
        };
        onAuthSuccess?.(u);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        onAuthSuccess?.(res.user);
        // Direct fallback navigation to ensure instant transition out of /auth
        setTimeout(() => {
          if (window.location.pathname === '/auth') {
            window.location.href = '/market-overview';
          }
        }, 100);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleAdminQuickLogin = async () => {
    const res = await signInWithEmail('admin', 'admin');
    if (res?.user) {
      const u: AuthUserProfile = getStoredLocalUser() || {
        id: 'admin_master',
        email: 'admin@alltra.trade',
        name: 'Super Admin',
        provider: 'email',
        role: 'admin',
      };
      onAuthSuccess?.(u);
    }
  };

  const handleForgotPassword = async (email: string) => {
    await resetPasswordForEmail(email);
  };

  return (
    <div className="relative w-full min-h-screen bg-background">
      {/* Back to Platform Button */}
      <button
        onClick={onNavigateHome}
        className="absolute top-5 left-5 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card/80 hover:bg-surface-card text-on-surface border border-border-subtle shadow-md backdrop-blur-md text-xs font-mono font-semibold transition-all cursor-pointer active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Alltra</span>
      </button>

      <NexusLogin
        brandName="ALLTRA"
        title={isSignUpMode ? "Create Institutional Account" : "Institutional Access"}
        description={
          isSignUpMode
            ? "Register for high-frequency bar replay, quantitative strategies, and institutional execution."
            : "Sign in to access your quantitative workstation, bar replay, and algorithmic desks."
        }
        signInText={isSignUpMode ? "Create Alltra Account" : "Sign In to Terminal"}
        signupText={isSignUpMode ? "Already have an institutional account?" : "Don't have an institutional account?"}
        signupLinkText={isSignUpMode ? "Sign in instead" : "Sign Up"}
        googleButtonText="Continue with Google"
        githubButtonText=""
        accentColor="#10B981"
        showSocialLogin={true}
        showRememberMe={!isSignUpMode}
        showForgotPassword={!isSignUpMode}
        show3DScene={true}
        enableAnimations={true}
        enableMouseParallax={true}
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        onForgotPassword={handleForgotPassword}
        onSignup={() => setIsSignUpMode((prev) => !prev)}
      />
    </div>
  );
};

export default AuthPage;
