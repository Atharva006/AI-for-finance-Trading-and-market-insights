import {
  FlowNode,
  FlowConnection,
  FlowStrategyResult,
  FlowExecutionLog,
  FlowValidationError,
  FlowExecutionStep,
  NodeInitStatus,
} from '../types/flow';
import { Candle, StrategyParams } from '../types/backtest';
import { fetchHistoricalDailyCandles } from './historicalData';
import { fetchUpstoxCandles } from './upstoxApi';
import { POPULAR_NSE_STOCKS } from './nseStocks';
import {
  calculatePSAR,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateSupertrend,
} from './indicators';
import { runBacktest } from './backtestEngine';

/**
 * Strict n8n-style DAG Pipeline Validator
 * Blocks execution if any required node, input port, or stage is missing or disconnected.
 * Produces comprehensive per-node initialization statuses and step sequence.
 */
export function validateFlowPipeline(
  nodes: FlowNode[],
  connections: FlowConnection[]
): {
  isValid: boolean;
  errors: FlowValidationError[];
  executionSequence: FlowExecutionStep[];
  nodeStatusMap: Record<string, NodeInitStatus>;
} {
  const errors: FlowValidationError[] = [];
  const sequence: FlowExecutionStep[] = [];
  const nodeStatusMap: Record<string, NodeInitStatus> = {};

  // Compute per-node input initialization status
  nodes.forEach((n) => {
    const isFeed = n.category === 'feed';
    if (isFeed) {
      const hasOut = connections.some((c) => c.fromNodeId === n.id);
      nodeStatusMap[n.id] = {
        nodeId: n.id,
        isReady: hasOut,
        missingInputs: hasOut ? [] : ['Outgoing Candle Feed'],
        connectedInputs: [],
      };
    } else {
      const missing: string[] = [];
      const connected: string[] = [];
      n.inputs.forEach((p) => {
        const isConn = connections.some((c) => c.toNodeId === n.id && c.toPortId === p.id);
        if (isConn) {
          connected.push(p.label);
        } else {
          missing.push(p.label);
        }
      });
      nodeStatusMap[n.id] = {
        nodeId: n.id,
        isReady: n.inputs.length > 0 ? missing.length === 0 : true,
        missingInputs: missing,
        connectedInputs: connected,
      };
    }
  });

  if (nodes.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          type: 'EMPTY_CANVAS',
          message: 'The canvas is currently uninitialized with no active nodes.',
          remedy: 'Click "Init Blank Pipeline" or load the "Atharva Strategy Template" to begin.',
          stepNumber: 0,
        },
      ],
      executionSequence: [],
      nodeStatusMap,
    };
  }

  // 1. Feed Node Check
  const feedNode = nodes.find((n) => n.type === 'TRIGGER_FEED');
  if (!feedNode) {
    errors.push({
      type: 'MISSING_FEED',
      message: 'No Market Data Feed node found on canvas.',
      remedy: 'Add an "NSE Market Feed" node to supply real daily/intraday candles.',
      stepNumber: 1,
    });
  } else {
    const feedOutConns = connections.filter((c) => c.fromNodeId === feedNode.id);
    if (feedOutConns.length === 0) {
      errors.push({
        nodeId: feedNode.id,
        nodeTitle: feedNode.title,
        type: 'DISCONNECTED_OUTPUT',
        message: 'The Market Feed node is disconnected from all downstream indicators.',
        remedy: 'Connect the "Candles" output of the Feed node to an Indicator node (e.g. PSAR or SMA).',
        stepNumber: 1,
      });
    } else {
      sequence.push({
        step: 1,
        title: feedNode.title,
        nodeId: feedNode.id,
        category: 'feed',
        description: `Streams historical ${feedNode.config?.timeframe?.toUpperCase() || '1D'} candles for ${feedNode.config?.symbol || 'INFY'}.`,
        status: 'valid',
      });
    }
  }

  // 2. Indicator Layer Check
  const indicatorNodes = nodes.filter((n) => n.category === 'indicator');
  if (indicatorNodes.length === 0) {
    errors.push({
      type: 'MISSING_INDICATOR',
      message: 'No technical indicator nodes found in the workflow.',
      remedy: 'Add at least one technical indicator (e.g. Parabolic SAR ta.sar, SMA 100, RSI, or Supertrend).',
      stepNumber: 2,
    });
  } else {
    for (const ind of indicatorNodes) {
      const inConns = connections.filter((c) => c.toNodeId === ind.id);
      if (inConns.length === 0) {
        errors.push({
          nodeId: ind.id,
          nodeTitle: ind.title,
          type: 'DISCONNECTED_INPUT',
          message: `${ind.title} has an unconnected input port.`,
          remedy: `Connect the "Candles" output of the Market Feed into ${ind.title}.`,
          stepNumber: 2,
        });
      } else {
        sequence.push({
          step: 2,
          title: ind.title,
          nodeId: ind.id,
          category: 'indicator',
          description: `Calculates technical parameters and trend baseline.`,
          status: 'valid',
        });
      }
    }
  }

  // 3. Logic & Trigger Layer Check
  const logicNodes = nodes.filter((n) => n.category === 'logic');
  if (logicNodes.length === 0) {
    errors.push({
      type: 'MISSING_LOGIC',
      message: 'No Logic Gate or Crossover Filter node found.',
      remedy: 'Add a "PSAR Flip & Trend Filter" or "Crossover Gate" to evaluate entry triggers against indicators.',
      stepNumber: 3,
    });
  } else {
    for (const lg of logicNodes) {
      const inConns = connections.filter((c) => c.toNodeId === lg.id);
      if (inConns.length === 0) {
        errors.push({
          nodeId: lg.id,
          nodeTitle: lg.title,
          type: 'DISCONNECTED_INPUT',
          message: `${lg.title} has no incoming indicator connections.`,
          remedy: `Connect indicator outputs (e.g. PSAR points and SMA baseline) into ${lg.title}'s inputs.`,
          stepNumber: 3,
        });
      } else {
        sequence.push({
          step: 3,
          title: lg.title,
          nodeId: lg.id,
          category: 'logic',
          description: `Evaluates conditional buy/sell triggers and filters false breakouts.`,
          status: 'valid',
        });
      }
    }
  }

  // 4. Risk Management Check
  const riskNodes = nodes.filter((n) => n.category === 'risk');
  if (riskNodes.length === 0) {
    errors.push({
      type: 'MISSING_RISK',
      message: 'No Risk Management or Position Sizer node found.',
      remedy: 'Add a "1% RPT Position Sizer" or "SL / Target Bracket" node to determine trade sizing.',
      stepNumber: 4,
    });
  } else {
    for (const rk of riskNodes) {
      const inConns = connections.filter((c) => c.toNodeId === rk.id);
      if (inConns.length === 0) {
        errors.push({
          nodeId: rk.id,
          nodeTitle: rk.title,
          type: 'DISCONNECTED_INPUT',
          message: `${rk.title} is not connected to a validated signal trigger.`,
          remedy: `Connect the output of your Logic Gate into ${rk.title}.`,
          stepNumber: 4,
        });
      } else {
        sequence.push({
          step: 4,
          title: rk.title,
          nodeId: rk.id,
          category: 'risk',
          description: `Applies 1% Risk Per Trade (RPT) sizing and SL / TP risk-to-reward brackets.`,
          status: 'valid',
        });
      }
    }
  }

  // 5. Output / Telemetry Check
  const telemetryNode = nodes.find((n) => n.type === 'OUTPUT_TELEMETRY');
  if (!telemetryNode) {
    errors.push({
      type: 'BROKEN_CHAIN',
      message: 'No Execution Telemetry & Logs node found.',
      remedy: 'Add an "Execution Telemetry & Logs" node to collect trade metrics and render the equity curve.',
      stepNumber: 5,
    });
  } else {
    const inConns = connections.filter((c) => c.toNodeId === telemetryNode.id);
    if (inConns.length === 0) {
      errors.push({
        nodeId: telemetryNode.id,
        nodeTitle: telemetryNode.title,
        type: 'DISCONNECTED_INPUT',
        message: 'Telemetry node is not wired to receive order execution events.',
        remedy: 'Connect the output of your Risk / Order nodes into Execution Telemetry.',
        stepNumber: 5,
      });
    } else {
      sequence.push({
        step: 5,
        title: telemetryNode.title,
        nodeId: telemetryNode.id,
        category: 'output',
        description: `Aggregates filled positions, calculates portfolio metrics, and builds the equity curve.`,
        status: 'valid',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    executionSequence: sequence,
    nodeStatusMap,
  };
}

/**
 * Executes a strictly validated visual flow.
 * Throws immediately if pipeline is incomplete or disconnected.
 */
export async function runVisualFlow(
  nodes: FlowNode[],
  connections: FlowConnection[],
  onProgress?: (msg: string) => void
): Promise<FlowStrategyResult> {
  // STRICT DAG VALIDATION FIRST - ZERO MOCK OR UNCONNECTED FALLBACK
  const validation = validateFlowPipeline(nodes, connections);
  if (!validation.isValid) {
    const formatted = validation.errors
      .map((e, idx) => `${idx + 1}. [${e.nodeTitle || 'Workflow'}] ${e.message}\n   ➔ Fix: ${e.remedy}`)
      .join('\n\n');
    throw new Error(`WORKFLOW VALIDATION FAILED\n\nIncomplete pipeline cannot be executed:\n\n${formatted}`);
  }

  const logs: FlowExecutionLog[] = [];
  const log = (nodeTitle: string, message: string, level: 'info' | 'success' | 'warn' | 'trade' = 'info') => {
    logs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      nodeTitle,
      level,
      message,
    });
  };

  log('System Orchestrator', 'DAG Validation Passed: Complete pipeline confirmed with 0 gaps.', 'success');

  // 1. Fetch real candles from Feed Node
  const feedNode = nodes.find((n) => n.type === 'TRIGGER_FEED')!;
  const symbol = feedNode.config?.symbol || 'INFY';
  const timeframe = feedNode.config?.timeframe || '1d';
  const capital = feedNode.config?.initialCapital || 100000;

  const stockObj =
    POPULAR_NSE_STOCKS.find((s) => s.symbol === symbol) || {
      symbol,
      name: symbol,
      instrument_key: `NSE_EQ|${symbol}`,
      yahoo_symbol: `${symbol}.NS`,
      isIndex: symbol.includes('NIFTY'),
      category: 'LARGE_CAP' as const,
    };

  log(feedNode.title, `Fetching real candles for ${symbol} on ${timeframe.toUpperCase()} timeframe...`, 'info');

  let candles: Candle[] = [];
  if (timeframe === '1d') {
    candles = await fetchHistoricalDailyCandles({
      stock: stockObj,
      provider: 'yahoo',
      range: 'max',
    });
  } else {
    candles = await fetchUpstoxCandles({
      instrumentKey: stockObj.instrument_key,
      timeframe,
    });
  }

  log(feedNode.title, `Loaded ${candles.length} authentic candles from historical feed. Zero synthetic data.`, 'success');

  // 2. Discover Active Indicators in the Flow
  const psarNode = nodes.find((n) => n.type === 'INDICATOR_PSAR');
  const smaNode = nodes.find((n) => n.type === 'INDICATOR_SMA');
  const rsiNode = nodes.find((n) => n.type === 'INDICATOR_RSI');
  const stNode = nodes.find((n) => n.type === 'INDICATOR_SUPERTREND');
  const rptNode = nodes.find((n) => n.type === 'RISK_RPT');
  const bracketNode = nodes.find((n) => n.type === 'RISK_BRACKET');

  const psarStart = psarNode?.config?.start ?? 0.01;
  const psarStep = psarNode?.config?.step ?? 0.01;
  const psarMax = psarNode?.config?.max ?? 0.10;
  const smaLength = smaNode?.config?.length ?? 100;
  const rptPct = rptNode?.config?.riskPerTradePct ?? 1.0;
  const rrRatio = bracketNode?.config?.rrRatio ?? 2.0;
  const slLookback = bracketNode?.config?.slLookback ?? 2;

  if (psarNode) {
    log(psarNode.title, `Executing Wilder's ta.sar (start: ${psarStart}, step: ${psarStep}, max: ${psarMax})...`, 'info');
    const psarVals = calculatePSAR(candles, psarStart, psarStep, psarMax);
    for (let i = 0; i < candles.length; i++) candles[i].psar = psarVals[i];
    log(psarNode.title, `Calculated Parabolic SAR curve across ${candles.length} bars.`, 'success');
  }

  if (smaNode) {
    log(smaNode.title, `Executing SMA (length: ${smaLength}) baseline calculation...`, 'info');
    const smaVals = calculateSMA(candles, smaLength);
    for (let i = 0; i < candles.length; i++) candles[i].sma100 = smaVals[i];
    log(smaNode.title, `Calculated 100-period Simple Moving Average slope.`, 'success');
  }

  if (rsiNode) {
    log(rsiNode.title, `Calculating 14-period RSI momentum series...`, 'info');
    calculateRSI(candles, rsiNode.config?.period || 14);
    log(rsiNode.title, `RSI momentum line computed.`, 'success');
  }

  if (stNode) {
    log(stNode.title, `Calculating Supertrend (10, 3.0) directional bands...`, 'info');
    calculateSupertrend(candles, 10, 3.0);
    log(stNode.title, `Supertrend bands mapped.`, 'success');
  }

  const params: StrategyParams = {
    strategyType: 'PSAR_SMA100',
    initialCapital: capital,
    riskPerTradePct: rptPct,
    tradeDir: 'Both',
    psarStart,
    psarStep,
    psarMax,
    smaLength,
    slLookback,
    rrRatio,
    maxRiskPercent: 9.0,
    stochKPeriod: 14,
    stochSmooth: 3,
    stochDPeriod: 3,
    stochOverbought: 80,
    stochOversold: 20,
    fixedSlPct: 1.2,
    fixedTpPct: 3.6,
    atrPeriod: 14,
    atrSlMultiplier: 1.2,
    atrTpMultiplier: 3.6,
    useTrailingStop: false,
    slippagePoints: 1.0,
    brokeragePerOrder: 20,
    positionMode: 'BOTH',
  };

  log('Logic Evaluator', `Evaluating dual-condition signals: PSAR Flip + SMA Trend Slope...`, 'info');
  const res = runBacktest(candles, params);

  // Emit trade execution logs
  for (let i = 0; i < Math.min(10, res.trades.length); i++) {
    const tr = res.trades[i];
    log(
      'Execution Engine',
      `${tr.type} @ ₹${tr.entryPrice.toFixed(2)} on ${tr.entryTime} -> ${tr.exitReason} @ ₹${tr.exitPrice.toFixed(2)} (PnL: ₹${tr.pnl})`,
      tr.pnl >= 0 ? 'trade' : 'warn'
    );
  }

  if (res.trades.length > 10) {
    log('Execution Engine', `...and ${res.trades.length - 10} additional verified trades executed.`, 'info');
  }

  log(
    'Output Telemetry',
    `Flow completed: ${res.metrics.totalTrades} Trades, Win Rate: ${res.metrics.winRate}%, Net Return: ${res.metrics.totalReturnPct}% (+₹${res.metrics.totalReturn})`,
    'success'
  );

  return {
    symbol,
    timeframe,
    initialCapital: capital,
    finalCapital: Number((capital + res.metrics.totalReturn).toFixed(2)),
    totalReturn: res.metrics.totalReturn,
    totalReturnPct: res.metrics.totalReturnPct,
    winRate: res.metrics.winRate,
    totalTrades: res.metrics.totalTrades,
    winningTrades: res.metrics.winningTrades,
    losingTrades: res.metrics.losingTrades,
    profitFactor: res.metrics.profitFactor,
    maxDrawdownPct: res.metrics.maxDrawdownPct,
    equityCurve: res.equityCurve,
    trades: res.trades,
    logs,
    validationPassed: true,
    executionSequence: validation.executionSequence,
  };
}
