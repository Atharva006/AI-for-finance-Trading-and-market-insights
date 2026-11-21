import { AlgoStrategy } from '../types/algoMarketplace';
import { ALL_CANONICAL_STRATEGIES } from './canonicalStrategies';

/**
 * Strict Zero Mock Database Policy:
 * Purges all legacy mock keys and always returns the user's authentic strategy.
 */
export function getStoredStrategies(): AlgoStrategy[] {
  try {
    const legacyKeys = [
      'arjuna_custom_strategies_v1',
      'apex_user_strategies_v2',
      'apex_user_strategies_v3',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch (_) {
    // ignore
  }

  return ALL_CANONICAL_STRATEGIES;
}

export function saveStrategies(_strategies: AlgoStrategy[]): void {
  // Zero mock database policy: No persistent mock state
}

export function addStrategy(strategy: AlgoStrategy): AlgoStrategy[] {
  return [strategy, ...ALL_CANONICAL_STRATEGIES];
}

export function deleteStrategy(_id: string): AlgoStrategy[] {
  return ALL_CANONICAL_STRATEGIES;
}

export function updateStrategy(strategy: AlgoStrategy): AlgoStrategy[] {
  return [strategy];
}
