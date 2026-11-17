import { AlgoStrategy } from '../types/algoMarketplace';
import { ALL_CANONICAL_STRATEGIES } from './canonicalStrategies';

const STORAGE_KEY = 'apex_user_strategies_v3';
const LEGACY_KEYS = ['arjuna_custom_strategies_v1', 'apex_user_strategies_v2'];

export function getStoredStrategies(): AlgoStrategy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check if user has custom strategies in v2
      let userCustom: AlgoStrategy[] = [];
      const v2Raw = localStorage.getItem('apex_user_strategies_v2');
      if (v2Raw) {
        try {
          const v2Parsed: AlgoStrategy[] = JSON.parse(v2Raw);
          userCustom = v2Parsed.filter((s) => s && s.isCustom);
        } catch {
          // ignore
        }
      }
      // Clean up legacy keys
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));

      const initial = [...userCustom, ...ALL_CANONICAL_STRATEGIES];
      saveStrategies(initial);
      return initial;
    }
    const parsed: AlgoStrategy[] = JSON.parse(raw);
    // Ensure all legacy mock strategies are excluded
    const filtered = parsed.filter(
      (s) =>
        s &&
        !s.id.startsWith('algo-gandiva') &&
        !s.id.startsWith('algo-matsya') &&
        !s.id.startsWith('algo-garuda') &&
        !s.id.startsWith('algo-vajra') &&
        !s.id.startsWith('algo-agni') &&
        !s.id.startsWith('algo-kuber') &&
        !s.id.startsWith('algo-dhanvantari') &&
        !s.id.startsWith('algo-sudarshana') &&
        !s.id.startsWith('algo-somaras')
    );

    // Ensure all 6 canonical PSAR strategies exist with latest authentic metrics
    const existingIds = new Set(filtered.map((f) => f.id));
    const missingCanonical = ALL_CANONICAL_STRATEGIES.filter((c) => !existingIds.has(c.id));
    if (missingCanonical.length > 0) {
      const merged = [...filtered, ...missingCanonical];
      saveStrategies(merged);
      return merged;
    }

    return filtered;
  } catch (e) {
    console.error('Failed to parse stored strategies:', e);
    return ALL_CANONICAL_STRATEGIES;
  }
}

export function saveStrategies(strategies: AlgoStrategy[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies));
  } catch (e) {
    console.error('Failed to save strategies to localStorage:', e);
  }
}

export function addStrategy(strategy: AlgoStrategy): AlgoStrategy[] {
  const existing = getStoredStrategies();
  // prepend newly created strategy
  const updated = [strategy, ...existing.filter((s) => s.id !== strategy.id)];
  saveStrategies(updated);
  return updated;
}

export function deleteStrategy(id: string): AlgoStrategy[] {
  const existing = getStoredStrategies();
  const updated = existing.filter((s) => s.id !== id);
  saveStrategies(updated);
  return updated;
}

export function updateStrategy(strategy: AlgoStrategy): AlgoStrategy[] {
  const existing = getStoredStrategies();
  const updated = existing.map((s) => (s.id === strategy.id ? strategy : s));
  saveStrategies(updated);
  return updated;
}
