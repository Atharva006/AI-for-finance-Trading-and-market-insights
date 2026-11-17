import { Trade, EquityPoint } from './backtest';

export type FlowNodeCategory = 'feed' | 'indicator' | 'logic' | 'risk' | 'action' | 'output';

export type FlowNodeType =
  | 'TRIGGER_FEED'
  | 'INDICATOR_PSAR'
  | 'INDICATOR_SMA'
  | 'INDICATOR_EMA'
  | 'INDICATOR_RSI'
  | 'INDICATOR_MACD'
  | 'INDICATOR_SUPERTREND'
  | 'INDICATOR_STOCHASTIC'
  | 'INDICATOR_ATR'
  | 'LOGIC_CROSSOVER'
  | 'LOGIC_GATE'
  | 'RISK_RPT'
  | 'RISK_BRACKET'
  | 'ACTION_BUY'
  | 'ACTION_SELL'
  | 'OUTPUT_TELEMETRY';

export interface FlowPort {
  id: string;
  label: string;
  type: 'data' | 'signal' | 'boolean' | 'order';
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  title: string;
  category: FlowNodeCategory;
  x: number;
  y: number;
  config: Record<string, any>;
  inputs: FlowPort[];
  outputs: FlowPort[];
  status?: 'idle' | 'running' | 'success' | 'alert';
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

export interface FlowExecutionLog {
  id: string;
  time: string;
  nodeTitle: string;
  level: 'info' | 'success' | 'warn' | 'trade';
  message: string;
}

export interface FlowValidationError {
  nodeId?: string;
  nodeTitle?: string;
  type:
    | 'DISCONNECTED_INPUT'
    | 'DISCONNECTED_OUTPUT'
    | 'MISSING_FEED'
    | 'MISSING_INDICATOR'
    | 'MISSING_LOGIC'
    | 'MISSING_RISK'
    | 'BROKEN_CHAIN'
    | 'ORPHAN_NODE'
    | 'EMPTY_CANVAS';
  message: string;
  stepNumber?: number;
  remedy: string;
}

export interface NodeInitStatus {
  nodeId: string;
  isReady: boolean;
  missingInputs: string[];
  connectedInputs: string[];
}

export interface NodeDocumentation {
  title: string;
  category: FlowNodeCategory;
  summary: string;
  mathExplanation: string;
  pineScriptEquiv: string;
  inputs: { portId: string; label: string; dataType: string; required: boolean; description: string }[];
  outputs: { portId: string; label: string; dataType: string; description: string }[];
  parameters: { key: string; label: string; type: 'number' | 'string' | 'select'; description: string; defaultValue: any }[];
}

export interface FlowExecutionStep {
  step: number;
  title: string;
  nodeId: string;
  category: FlowNodeCategory;
  description: string;
  status: 'pending' | 'valid' | 'executing' | 'completed' | 'error';
}

export interface FlowStrategyResult {
  symbol: string;
  timeframe: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPct: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitFactor: number;
  maxDrawdownPct: number;
  equityCurve: EquityPoint[];
  trades: Trade[];
  logs: FlowExecutionLog[];
  validationPassed: boolean;
  executionSequence: FlowExecutionStep[];
}
