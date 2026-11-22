import { AlgoStrategy } from '../types/algoMarketplace';
import { ALL_CANONICAL_STRATEGIES } from './canonicalStrategies';

const STRATEGY_STORAGE_KEY = 'arthatix_canonical_strategies_v5';

/**
 * Strict Zero Mock Database Policy:
 * Purges legacy mock keys and preserves authentic live user/canonical strategies with real persistence.
 */
export function getStoredStrategies(): AlgoStrategy[] {
  try {
    const legacyKeys = [
      'arjuna_custom_strategies_v1',
      'apex_user_strategies_v2',
      'apex_user_strategies_v3',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));

    const saved = localStorage.getItem(STRATEGY_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (_) {
    // ignore parsing errors and fallback to canonical
  }

  return ALL_CANONICAL_STRATEGIES;
}

export function saveStrategies(strategies: AlgoStrategy[]): void {
  try {
    localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(strategies));
  } catch (_) {
    // ignore
  }
}

export function addStrategy(strategy: AlgoStrategy): AlgoStrategy[] {
  const current = getStoredStrategies();
  const exists = current.some((s) => s.id === strategy.id);
  const updated = exists ? current : [strategy, ...current];
  saveStrategies(updated);
  return updated;
}

export function deleteStrategy(id: string): AlgoStrategy[] {
  const current = getStoredStrategies();
  const updated = current.filter((s) => s.id !== id);
  saveStrategies(updated);
  return updated;
}

export function updateStrategy(strategy: AlgoStrategy): AlgoStrategy[] {
  const current = getStoredStrategies();
  const exists = current.some((s) => s.id === strategy.id);
  const updated = exists
    ? current.map((s) => (s.id === strategy.id ? strategy : s))
    : [strategy, ...current];
  saveStrategies(updated);
  return updated;
}

