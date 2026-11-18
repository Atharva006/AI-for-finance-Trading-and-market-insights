import { StrategyBasket, BasketItem } from '../types/basket';
import { POPULAR_NSE_STOCKS } from './nseStocks';

const STORAGE_KEY = 'arjuna_saved_baskets_v4';
const LEGACY_BASKET_KEYS = ['arjuna_saved_baskets_v1', 'arjuna_saved_baskets_v2', 'arjuna_saved_baskets_v3'];

const getStock = (symbol: string) => {
  const found = POPULAR_NSE_STOCKS.find((s) => s.symbol === symbol);
  if (found) return found;
  return {
    symbol,
    name: symbol,
    instrument_key: `NSE_EQ|${symbol}`,
    yahoo_symbol: `${symbol}.NS`,
    isIndex: false,
    category: 'LARGE_CAP' as const,
  };
};

export const DEFAULT_PRESET_BASKETS: StrategyBasket[] = [
  {
    id: 'basket-kuber-navratna',
    name: 'Nifty Bluechip Wealth Basket',
    description: 'Institutional compounding basket combining benchmark market leaders across IT, Energy, and Private Banking with conservative 1% RPT.',
    initialCapital: 100000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        stock: getStock('RELIANCE'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-2',
        stock: getStock('TCS'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-3',
        stock: getStock('HDFCBANK'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-4',
        stock: getStock('INFY'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-5',
        stock: getStock('ICICIBANK'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
    ],
  },
  {
    id: 'basket-garuda-alpha-momentum',
    name: 'Multi-Asset Momentum Alpha Basket',
    description: 'High-velocity momentum basket designed for aggressive upside breakout across high beta NSE equities.',
    initialCapital: 100000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-g1',
        stock: getStock('TATAMOTORS'),
        strategyType: 'STOCHASTIC',
        timeframe: '1d',
        riskPerTradePct: 1.5,
        enabled: true,
      },
      {
        id: 'item-g2',
        stock: getStock('SBIN'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-g3',
        stock: getStock('BHARTIARTL'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-g4',
        stock: getStock('LT'),
        strategyType: 'STOCHASTIC',
        timeframe: '1d',
        riskPerTradePct: 1.2,
        enabled: true,
      },
    ],
  },
  {
    id: 'basket-dhanvantari-defensive',
    name: 'Defensive Low-Volatility Basket',
    description: 'Low-drawdown defensive portfolio targeting high ROCE, debt-free consumer staples and pharmaceutical giants.',
    initialCapital: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-d1',
        stock: getStock('ITC'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-d2',
        stock: getStock('TCS'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
      {
        id: 'item-d3',
        stock: getStock('HDFCBANK'),
        strategyType: 'PSAR_SMA100',
        timeframe: '1d',
        riskPerTradePct: 1.0,
        enabled: true,
      },
    ],
  },
];

export function getSavedBaskets(): StrategyBasket[] {
  try {
    // Purge legacy storage keys
    LEGACY_BASKET_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_) {}
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveBaskets(DEFAULT_PRESET_BASKETS);
      return DEFAULT_PRESET_BASKETS;
    }
    const parsed: StrategyBasket[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all items in baskets are genuine equities (strictly no indices or trend pullback indices)
      const sanitized = parsed
        .map((basket) => ({
          ...basket,
          items: basket.items
            .filter((item) => item.stock?.symbol !== 'NIFTY 50' && !item.stock?.isIndex && item.stock?.category !== 'INDEX')
            .map((item) => ({
              ...item,
              stock: getStock(item.stock?.symbol || 'RELIANCE'),
            })),
        }))
        .filter((b) => b.items.length > 0);

      if (sanitized.length > 0) {
        saveBaskets(sanitized);
        return sanitized;
      }
    }
    saveBaskets(DEFAULT_PRESET_BASKETS);
    return DEFAULT_PRESET_BASKETS;
  } catch (err) {
    console.error('Failed to parse saved baskets:', err);
    return DEFAULT_PRESET_BASKETS;
  }
}

export function saveBaskets(baskets: StrategyBasket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(baskets));
  } catch (err) {
    console.error('Failed to save baskets to localStorage:', err);
  }
}

export function saveBasket(basket: StrategyBasket): StrategyBasket[] {
  const current = getSavedBaskets();
  const index = current.findIndex((b) => b.id === basket.id);
  const updatedBasket = { ...basket, updatedAt: new Date().toISOString() };
  let updatedList: StrategyBasket[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = updatedBasket;
  } else {
    updatedList = [updatedBasket, ...current];
  }
  saveBaskets(updatedList);
  return updatedList;
}

export function deleteBasket(id: string): StrategyBasket[] {
  const current = getSavedBaskets();
  const updated = current.filter((b) => b.id !== id);
  saveBaskets(updated.length > 0 ? updated : DEFAULT_PRESET_BASKETS);
  return updated.length > 0 ? updated : DEFAULT_PRESET_BASKETS;
}

export function exportBasketAsJson(basket: StrategyBasket): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(basket, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${basket.name.replace(/\s+/g, '_')}_Basket.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBasketFromJson(jsonString: string): StrategyBasket {
  const parsed = JSON.parse(jsonString);
  if (!parsed.name || !Array.isArray(parsed.items)) {
    throw new Error('Invalid basket configuration JSON structure.');
  }
  const newBasket: StrategyBasket = {
    ...parsed,
    id: `basket-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveBasket(newBasket);
  return newBasket;
}
