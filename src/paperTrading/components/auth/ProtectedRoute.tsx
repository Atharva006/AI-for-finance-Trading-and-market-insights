import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getStoredLocalUser } from '../../../services/supabaseAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getStoredLocalUser();
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      window.location.href = '/auth';
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
          <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
          <span>Verifying institutional session...</span>
        </div>
      </div>
    );
  }

  return children;
};
