// Simple in-memory & localStorage store for user watchlist, positions, and orders

const WATCHLIST_STORAGE_KEY = 'apex_user_watchlist_v2';
const POSITIONS_STORAGE_KEY = 'apex_user_positions_v2';
const ORDERS_STORAGE_KEY = 'apex_user_orders_v2';

export interface UserPosition {
  id: string;
  algoId: string;
  algoName: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  qty: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
  capitalDeployed: number;
  status: 'OPEN' | 'CLOSED';
  entryTime: string;
}

export interface UserOrder {
  id: string;
  algoId: string;
  algoName: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'LIMIT';
  price: number;
  qty: number;
  status: 'COMPLETE' | 'PENDING' | 'CANCELLED';
  timestamp: string;
}

const DEFAULT_POSITIONS: UserPosition[] = [];

const DEFAULT_ORDERS: UserOrder[] = [];

export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return ['algo-asia-london-ny-fvg'];
    return JSON.parse(raw);
  } catch {
    return ['algo-asia-london-ny-fvg'];
  }
}

export function toggleWatchlist(algoId: string): { isSaved: boolean; list: string[] } {
  const current = getWatchlist();
  const exists = current.includes(algoId);
  const updated = exists ? current.filter((id) => id !== algoId) : [...current, algoId];
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return { isSaved: !exists, list: updated };
}

export function isAlgoInWatchlist(algoId: string): boolean {
  return getWatchlist().includes(algoId);
}

export function getUserPositions(): UserPosition[] {
  try {
    const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_POSITIONS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_POSITIONS;
  }
}

export function getUserOrders(): UserOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return DEFAULT_ORDERS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ORDERS;
  }
}

export function deployAlgoPosition(algoId: string, algoName: string, capital: number, symbol: string): UserPosition {
  const positions = getUserPositions();
  const newPos: UserPosition = {
    id: `POS-${Math.floor(10000 + Math.random() * 90000)}`,
    algoId,
    algoName,
    symbol,
    type: 'BUY',
    qty: Math.max(1, Math.floor(capital / 2500)),
    avgPrice: 25400,
    currentPrice: 25448.85,
    pnl: 0,
    pnlPct: 0,
    capitalDeployed: capital,
    status: 'OPEN',
    entryTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
  };
  const updated = [newPos, ...positions];
  try {
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return newPos;
}
