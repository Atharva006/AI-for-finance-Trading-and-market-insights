import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { SEO } from '../common/SEO';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      // Direct virtual paper trading session without landing page or login barrier
      if (typeof window !== 'undefined') {
        localStorage.setItem('tradeedge_auth_logged_in', 'true');
      }

      if (!isSupabaseConfigured) {
        if (active) setIsAuthenticated(true);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        // Even if supabase has no remote user, allow seamless virtual desk trading
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        if (active) {
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setIsAuthenticated(true);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, []);

  // Display clean institutional loading state while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] flex flex-col items-center justify-center text-[#111114] font-sans">
        <SEO noindex={true} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00225A] flex items-center justify-center p-2.5 shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/aida/ALJJyrDoYL4wVpXsoYtqmZkmWKJAcBOZgjR6a2u3D7pji-QCA1FXxyW_9ixEsJ_EqdIuHO3VuBvesBLo7yGqHV2rnx4bDVRyJydMU4uix9FmelUPL0wHTmmxuvG0o93CFcfmflbMIqzzl2nTZ59kuk6TnQQHRfFZxYglS5bz_oO3eHrmyLyPCEoju6CiVfP_EVZiFTGDu3oWTnesXXfL-Oyy6PZwXKIks9-rsoY_dLVzalD-vA"
              alt="Apex Quant"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00225A] font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#536CF0]" />
            <span>INITIALIZING VIRTUAL PAPER TRADING DESK...</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
