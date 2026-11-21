import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTradingStore } from '../paperTrading/store/useTradingStore';
import { supabase, isSupabaseConfigured } from '../paperTrading/lib/supabase';
import { ProtectedRoute } from '../paperTrading/components/auth/ProtectedRoute';
import DashboardLayout from '../paperTrading/layouts/DashboardLayout';

// Paper Trading Pages
import Dashboard from '../paperTrading/pages/Dashboard';
import MarketWatchPage from '../paperTrading/pages/MarketWatchPage';
import TerminalPage from '../paperTrading/pages/TerminalPage';
import DerivativesExplorerPage from '../paperTrading/pages/DerivativesExplorerPage';
import CommoditiesPage from '../paperTrading/pages/CommoditiesPage';
import PositionsPage from '../paperTrading/pages/PositionsPage';
import HoldingsPage from '../paperTrading/pages/HoldingsPage';
import OrdersPage from '../paperTrading/pages/OrdersPage';
import TradebookPage from '../paperTrading/pages/TradebookPage';
import PortfolioPage from '../paperTrading/pages/PortfolioPage';
import AnalyticsPage from '../paperTrading/pages/AnalyticsPage';
import SettingsPage from '../paperTrading/pages/SettingsPage';

// Preserved Legacy Pages
import Journal from '../paperTrading/pages/Journal';
import Calendar from '../paperTrading/pages/Calendar';
import Accounts from '../paperTrading/pages/Accounts';
import Screenshots from '../paperTrading/pages/Screenshots';

export const PaperTradingSection: React.FC = () => {
  const { init } = useTradingStore();
  const [isResetOpen, setIsResetOpen] = useState(false);

  useEffect(() => {
    let active = true;

    // Direct virtual paper trading session without landing page or login barrier
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_auth_logged_in', 'true');
      localStorage.setItem('aq_intro_seen', 'true');
      localStorage.setItem('cnrx_intro_seen', 'true');
    }

    if (!isSupabaseConfigured) {
      init();
      return;
    }

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        if (session?.user) {
          init(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        } else {
          init();
        }
      }).catch(() => {
        if (active) init();
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          init(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        } else {
          init();
        }
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {
      init();
    }
  }, [init]);

  return (
    <div className="w-full flex-1 flex flex-col">
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="watchlist" element={<MarketWatchPage />} />
          <Route path="terminal" element={<TerminalPage />} />
          <Route path="derivatives" element={<DerivativesExplorerPage />} />
          <Route path="commodities" element={<CommoditiesPage />} />
          <Route path="option-chain" element={<Navigate to="/dashboard/terminal" replace />} />
          <Route path="positions" element={<PositionsPage />} />
          <Route path="holdings" element={<HoldingsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="tradebook" element={<TradebookPage />} />
          <Route path="portfolio" element={<PortfolioPage onOpenReset={() => setIsResetOpen(true)} />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage onOpenReset={() => setIsResetOpen(true)} />} />
          <Route path="journal" element={<Journal />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="screenshots" element={<Screenshots />} />
        </Route>
        <Route path="/paper-trading" element={<Navigate to="/dashboard" replace />} />
        <Route path="/papertrading" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};
