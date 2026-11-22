/**
 * Alltra Institutional User Activity & Telemetry Tracker
 * ------------------------------------------------------------------
 * Full-fidelity audit ledger tracking:
 * 1. User online sessions & real-time presence (login time, heartbeat, device, IP)
 * 2. Order executions: what users BUY and what they SELL (symbol, quantity, price, PnL, order type)
 * 3. Strategy backtests: what users TESTED (strategy, ticker, timeframe, CAGR, win rate, Sharpe)
 * 4. Comprehensive event stream synced to Supabase Cloud & local durable storage.
 */

import { AuthUserProfile, getStoredLocalUser } from './supabaseAuth';

export interface UserSessionRecord {
  id: string;
  userId: string;
  email: string;
  name?: string;
  role?: string;
  loginTime: string;
  lastHeartbeat: string;
  logoutTime?: string;
  isOnline: boolean;
  userAgent: string;
  platform: string;
  screenResolution: string;
}

export interface UserOrderRecord {
  id: string;
  userId: string;
  email: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'TP';
  quantity: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  module: 'BAR_REPLAY' | 'PAPER_TRADING' | 'ALGO_EXECUTION';
  timestamp: string;
}

export interface UserBacktestRecord {
  id: string;
  userId: string;
  email: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  initialBalance: number;
  finalBalance: number;
  netPnl: number;
  winRate: number;
  profitFactor?: number;
  maxDrawdown: number;
  totalTrades: number;
  timestamp: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  email: string;
  action: 'LOGIN' | 'LOGOUT' | 'BUY_ORDER' | 'SELL_ORDER' | 'CLOSE_POSITION' | 'BACKTEST_RUN' | 'STRATEGY_SELECT' | 'BAR_REPLAY_STEP';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export type UserSession = UserSessionRecord;
export type UserOrder = UserOrderRecord;

const STORAGE_KEY_SESSIONS = 'alltra_user_sessions_v1';
const STORAGE_KEY_ORDERS = 'alltra_user_orders_v1';
const STORAGE_KEY_BACKTESTS = 'alltra_user_backtests_v1';
const STORAGE_KEY_ACTIVITIES = 'alltra_user_activities_v1';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://prucyogtorkhldzjbzow.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Mikas1X03ROxjzI2QgwZBA_Rpgeci_g';

class UserActivityTrackerService {
  private activeSessionId: string | null = null;
  private heartbeatInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.handleBeforeUnload();
      });
    }
  }

  /**
   * 1. TRACK USER LOGIN & ONLINE STATUS
   */
  public trackLogin(user: AuthUserProfile): UserSessionRecord {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.activeSessionId = sessionId;

    const session: UserSessionRecord = {
      id: sessionId,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      isOnline: true,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
    };

    // Store in local ledger
    const sessions = this.getStoredSessions();
    sessions.unshift(session);
    this.saveSessions(sessions.slice(0, 100));

    // Log Activity
    this.logActivity({
      userId: user.id,
      email: user.email,
      action: 'LOGIN',
      description: `User ${user.email} (${user.role || 'trader'}) signed in to Alltra Institutional Desk.`,
      metadata: { sessionId, platform: session.platform },
    });

    // Start 45s heartbeat
    this.startHeartbeat(user.id);

    // Sync to Supabase cloud
    this.syncSessionToSupabase(session);

    return session;
  }

  /**
   * 2. TRACK USER LOGOUT
   */
  public trackLogout(user?: AuthUserProfile | null) {
    const currentUser = user || getStoredLocalUser();
    if (this.activeSessionId) {
      const sessions = this.getStoredSessions();
      const idx = sessions.findIndex((s) => s.id === this.activeSessionId);
      if (idx !== -1) {
        sessions[idx].logoutTime = new Date().toISOString();
        sessions[idx].isOnline = false;
        this.saveSessions(sessions);
      }
    }

    if (currentUser) {
      this.logActivity({
        userId: currentUser.id,
        email: currentUser.email,
        action: 'LOGOUT',
        description: `User ${currentUser.email} ended active session.`,
      });
    }

    this.stopHeartbeat();
    this.activeSessionId = null;
  }

  /**
   * 3. TRACK WHAT USERS BUY AND WHAT THEY SELL
   */
  public trackOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT' | 'SL' | 'TP';
    quantity: number;
    price: number;
    stopLoss?: number;
    takeProfit?: number;
    pnl?: number;
    status?: 'OPEN' | 'FILLED' | 'CANCELLED' | 'REJECTED';
    module?: 'BAR_REPLAY' | 'PAPER_TRADING' | 'ALGO_EXECUTION';
    userOverride?: AuthUserProfile | null;
  }): UserOrderRecord {
    const user = params.userOverride || getStoredLocalUser() || {
      id: 'guest_trader',
      email: 'guest@alltra.trade',
    };

    const orderRecord: UserOrderRecord = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      email: user.email,
      symbol: params.symbol,
      side: params.side,
      orderType: params.orderType,
      quantity: params.quantity,
      price: params.price,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      pnl: params.pnl || 0,
      status: params.status || 'FILLED',
      module: params.module || 'BAR_REPLAY',
      timestamp: new Date().toISOString(),
    };

    // Store in local ledger
    const orders = this.getStoredOrders();
    orders.unshift(orderRecord);
    this.saveOrders(orders.slice(0, 250));

    // Log Activity
    this.logActivity({
      userId: user.id,
      email: user.email,
      action: params.side === 'BUY' ? 'BUY_ORDER' : 'SELL_ORDER',
      description: `Executed ${params.side} ${params.quantity}x ${params.symbol} @ ₹${params.price.toFixed(2)} (${params.module || 'DESK'})`,
      metadata: { orderId: orderRecord.id, ...params },
    });

    // Cloud sync
    this.syncOrderToSupabase(orderRecord);

    return orderRecord;
  }

  /**
   * 4. TRACK WHAT USERS TESTED (Backtest runs & Bar Replay backtests)
   */
  public trackBacktest(params: {
    strategyId: string;
    strategyName: string;
    symbol: string;
    timeframe: string;
    initialBalance: number;
    finalBalance: number;
    netPnl: number;
    winRate: number;
    profitFactor?: number;
    maxDrawdown: number;
    totalTrades: number;
    userOverride?: AuthUserProfile | null;
  }): UserBacktestRecord {
    const user = params.userOverride || getStoredLocalUser() || {
      id: 'guest_trader',
      email: 'guest@alltra.trade',
    };

    const backtestRecord: UserBacktestRecord = {
      id: `bt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      email: user.email,
      strategyId: params.strategyId,
      strategyName: params.strategyName,
      symbol: params.symbol,
      timeframe: params.timeframe,
      initialBalance: params.initialBalance,
      finalBalance: params.finalBalance,
      netPnl: params.netPnl,
      winRate: params.winRate,
      profitFactor: params.profitFactor,
      maxDrawdown: params.maxDrawdown,
      totalTrades: params.totalTrades,
      timestamp: new Date().toISOString(),
    };

    const backtests = this.getStoredBacktests();
    backtests.unshift(backtestRecord);
    this.saveBacktests(backtests.slice(0, 100));

    this.logActivity({
      userId: user.id,
      email: user.email,
      action: 'BACKTEST_RUN',
      description: `Tested ${params.strategyName} on ${params.symbol} (${params.timeframe}) — Net PnL: ₹${params.netPnl.toLocaleString('en-IN')}, Win Rate: ${params.winRate.toFixed(1)}%`,
      metadata: { backtestId: backtestRecord.id, ...params },
    });

    this.syncBacktestToSupabase(backtestRecord);

    return backtestRecord;
  }

  /**
   * 5. GENERAL ACTIVITY LOGGING (Tip-to-bottom audit)
   */
  public logActivity(params: {
    userId: string;
    email: string;
    action: UserActivityLog['action'];
    description: string;
    metadata?: Record<string, any>;
  }): UserActivityLog {
    const log: UserActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      email: params.email,
      action: params.action,
      description: params.description,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
    };

    const activities = this.getStoredActivities();
    activities.unshift(log);
    this.saveActivities(activities.slice(0, 300));

    return log;
  }

  // ── Accessors for UI Audit Tables ──
  public getStoredSessions(): UserSessionRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getStoredOrders(): UserOrderRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getStoredBacktests(): UserBacktestRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BACKTESTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getStoredActivities(): UserActivityLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // ── Private helpers & Cloud Sync ──
  private saveSessions(data: UserSessionRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(data));
    } catch (_) {}
  }

  private saveOrders(data: UserOrderRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(data));
    } catch (_) {}
  }

  private saveBacktests(data: UserBacktestRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY_BACKTESTS, JSON.stringify(data));
    } catch (_) {}
  }

  private saveActivities(data: UserActivityLog[]) {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(data));
    } catch (_) {}
  }

  private startHeartbeat(userId: string) {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.activeSessionId) {
        const sessions = this.getStoredSessions();
        const idx = sessions.findIndex((s) => s.id === this.activeSessionId);
        if (idx !== -1) {
          sessions[idx].lastHeartbeat = new Date().toISOString();
          sessions[idx].isOnline = true;
          this.saveSessions(sessions);
        }
      }
    }, 45000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleBeforeUnload() {
    if (this.activeSessionId) {
      const sessions = this.getStoredSessions();
      const idx = sessions.findIndex((s) => s.id === this.activeSessionId);
      if (idx !== -1) {
        sessions[idx].logoutTime = new Date().toISOString();
        sessions[idx].isOnline = false;
        this.saveSessions(sessions);
      }
    }
  }

  // ── Supabase Cloud Sync (REST & User Metadata Sync) ──
  private async updateUserMetadataInSupabase(userId: string, metadataUpdates: Record<string, any>) {
    if (!SUPABASE_URL || !SUPABASE_KEY || !userId) return;
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_metadata: metadataUpdates,
        }),
      });
    } catch (e) {
      console.warn('[Supabase Sync] Admin metadata update notice:', e);
    }
  }

  private async syncSessionToSupabase(session: UserSessionRecord) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    // 1. Sync directly to user record metadata in Supabase
    this.updateUserMetadataInSupabase(session.userId, {
      last_online: session.lastHeartbeat,
      is_online: session.isOnline,
      user_agent: session.userAgent,
      platform: session.platform,
      last_login_time: session.loginTime,
    });

    // 2. Also try user_sessions table if migrated
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_sessions`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: session.id,
          user_id: session.userId,
          email: session.email,
          login_time: session.loginTime,
          last_heartbeat: session.lastHeartbeat,
          is_online: session.isOnline,
          user_agent: session.userAgent,
          platform: session.platform,
        }),
      });
    } catch (_) {}
  }

  private async syncOrderToSupabase(order: UserOrderRecord) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    // 1. Sync live executed trade count and last trade to user record in Supabase
    const allUserOrders = this.getStoredOrders().filter(o => o.userId === order.userId);
    this.updateUserMetadataInSupabase(order.userId, {
      total_orders_count: allUserOrders.length,
      last_order: {
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        timestamp: order.timestamp,
        module: order.module,
      },
    });

    // 2. Also try user_orders table if migrated
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_orders`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: order.id,
          user_id: order.userId,
          email: order.email,
          symbol: order.symbol,
          side: order.side,
          order_type: order.orderType,
          quantity: order.quantity,
          price: order.price,
          pnl: order.pnl,
          status: order.status,
          module: order.module,
          created_at: order.timestamp,
        }),
      });
    } catch (_) {}
  }

  private async syncBacktestToSupabase(bt: UserBacktestRecord) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    // 1. Sync last backtested strategy and metrics to user record in Supabase
    const allUserBacktests = this.getStoredBacktests().filter(b => b.userId === bt.userId);
    this.updateUserMetadataInSupabase(bt.userId, {
      total_backtests_count: allUserBacktests.length,
      last_tested_strategy: {
        strategy_name: bt.strategyName,
        symbol: bt.symbol,
        timeframe: bt.timeframe,
        win_rate: bt.winRate,
        net_pnl: bt.netPnl,
        total_trades: bt.totalTrades,
        timestamp: bt.timestamp,
      },
    });

    // 2. Also try user_backtests table if migrated
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_backtests`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: bt.id,
          user_id: bt.userId,
          email: bt.email,
          strategy_id: bt.strategyId,
          strategy_name: bt.strategyName,
          symbol: bt.symbol,
          timeframe: bt.timeframe,
          initial_balance: bt.initialBalance,
          final_balance: bt.finalBalance,
          net_pnl: bt.netPnl,
          win_rate: bt.winRate,
          max_drawdown: bt.maxDrawdown,
          total_trades: bt.totalTrades,
          created_at: bt.timestamp,
        }),
      });
    } catch (_) {}
  }

  public getSessions(): UserSessionRecord[] {
    return this.getStoredSessions();
  }

  public getOrders(): UserOrderRecord[] {
    return this.getStoredOrders();
  }

  public getBacktests(): UserBacktestRecord[] {
    return this.getStoredBacktests();
  }

  public getActivities(): UserActivityLog[] {
    return this.getStoredActivities();
  }
}

export const userActivityTracker = new UserActivityTrackerService();
