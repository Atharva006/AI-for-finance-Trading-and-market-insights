import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Workflow,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  Sliders,
  Sparkles,
  Download,
  Upload,
  Database,
  Globe,
  Radio,
  Clock,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  Save,
  Maximize2,
  ChevronDown,
  Link2,
  Info,
  AlertTriangle,
  X,
  Code2,
  Eye,
  CheckCircle2,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Grid,
  Copy,
  Move,
  Crosshair,
} from 'lucide-react';
import { FlowNode, FlowConnection, FlowStrategyResult, FlowNodeType, FlowPort, FlowValidationError } from '../types/flow';
import { runVisualFlow, validateFlowPipeline } from '../services/flowEngine';
import { NODE_DOCUMENTATION_MAP } from '../services/flowDocs';
import { POPULAR_NSE_STOCKS } from '../services/nseStocks';
import { StockLogo } from './StockLogo';
import { EquityLineChart } from './EquityLineChart';
import { QuantRiskAlphaMatrix } from './QuantRiskAlphaMatrix';
import { QuantUnderwaterChart } from './QuantUnderwaterChart';
import { addStrategy as storeAddStrategy } from '../services/strategyStore';
import { AlgoStrategy } from '../types/algoMarketplace';
import { NaturalLanguagePromptBar } from './NaturalLanguagePromptBar';
import { StrategyDoctorModal } from './StrategyDoctorModal';
import { CompanyFilingAnalyzerModal } from './CompanyFilingAnalyzerModal';
import { NSE_FUNDAMENTAL_STOCKS } from '../services/marketPulseData';
import { FundamentalStockData } from '../types/marketPulse';
import { ParsedStrategyPrompt } from '../services/aiPromptParser';

// Initial Atharva PSAR + SMA100 Swing Wired Flow
const DEFAULT_NODES: FlowNode[] = [
  {
    id: 'node-feed',
    type: 'TRIGGER_FEED',
    title: 'NSE Market Feed',
    category: 'feed',
    x: 40,
    y: 120,
    config: { symbol: 'INFY', timeframe: '1d', initialCapital: 100000 },
    inputs: [],
    outputs: [{ id: 'out-candles', label: 'Candles', type: 'data' }],
    status: 'idle',
  },
  {
    id: 'node-psar',
    type: 'INDICATOR_PSAR',
    title: 'Parabolic SAR (Wilder)',
    category: 'indicator',
    x: 320,
    y: 40,
    config: { start: 0.01, step: 0.01, max: 0.10 },
    inputs: [{ id: 'in-candles', label: 'Candles', type: 'data' }],
    outputs: [{ id: 'out-psar', label: 'PSAR Points', type: 'data' }],
    status: 'idle',
  },
  {
    id: 'node-sma',
    type: 'INDICATOR_SMA',
    title: 'SMA 100 Trend',
    category: 'indicator',
    x: 320,
    y: 250,
    config: { length: 100 },
    inputs: [{ id: 'in-candles', label: 'Candles', type: 'data' }],
    outputs: [{ id: 'out-sma', label: 'SMA Baseline', type: 'data' }],
    status: 'idle',
  },
  {
    id: 'node-flip',
    type: 'LOGIC_CROSSOVER',
    title: 'PSAR Flip & Trend Filter',
    category: 'logic',
    x: 600,
    y: 120,
    config: { rule: 'PSAR Flip with SMA Slope' },
    inputs: [
      { id: 'in-psar', label: 'PSAR', type: 'data' },
      { id: 'in-sma', label: 'SMA', type: 'data' },
    ],
    outputs: [
      { id: 'out-buy-sig', label: 'Buy Signal', type: 'signal' },
      { id: 'out-sell-sig', label: 'Sell Signal', type: 'signal' },
    ],
    status: 'idle',
  },
  {
    id: 'node-rpt',
    type: 'RISK_RPT',
    title: '1% RPT Position Sizer',
    category: 'risk',
    x: 880,
    y: 50,
    config: { riskPerTradePct: 1.0, maxRiskPercent: 9.0 },
    inputs: [{ id: 'in-sig', label: 'Signal', type: 'signal' }],
    outputs: [{ id: 'out-orders', label: 'Sized Orders', type: 'order' }],
    status: 'idle',
  },
  {
    id: 'node-bracket',
    type: 'RISK_BRACKET',
    title: '1:2.0 RR SL/Target Bracket',
    category: 'risk',
    x: 880,
    y: 230,
    config: { slLookback: 2, rrRatio: 2.0 },
    inputs: [{ id: 'in-sig', label: 'Signal', type: 'signal' }],
    outputs: [{ id: 'out-bracket', label: 'Exit Rules', type: 'order' }],
    status: 'idle',
  },
  {
    id: 'node-telemetry',
    type: 'OUTPUT_TELEMETRY',
    title: 'Execution Telemetry & Logs',
    category: 'output',
    x: 1160,
    y: 130,
    config: {},
    inputs: [
      { id: 'in-orders', label: 'Orders', type: 'order' },
      { id: 'in-bracket', label: 'Exits', type: 'order' },
    ],
    outputs: [],
    status: 'idle',
  },
];

const DEFAULT_CONNECTIONS: FlowConnection[] = [
  { id: 'conn-1', fromNodeId: 'node-feed', fromPortId: 'out-candles', toNodeId: 'node-psar', toPortId: 'in-candles' },
  { id: 'conn-2', fromNodeId: 'node-feed', fromPortId: 'out-candles', toNodeId: 'node-sma', toPortId: 'in-candles' },
  { id: 'conn-3', fromNodeId: 'node-psar', fromPortId: 'out-psar', toNodeId: 'node-flip', toPortId: 'in-psar' },
  { id: 'conn-4', fromNodeId: 'node-sma', fromPortId: 'out-sma', toNodeId: 'node-flip', toPortId: 'in-sma' },
  { id: 'conn-5', fromNodeId: 'node-flip', fromPortId: 'out-buy-sig', toNodeId: 'node-rpt', toPortId: 'in-sig' },
  { id: 'conn-6', fromNodeId: 'node-flip', fromPortId: 'out-buy-sig', toNodeId: 'node-bracket', toPortId: 'in-sig' },
  { id: 'conn-7', fromNodeId: 'node-rpt', fromPortId: 'out-orders', toNodeId: 'node-telemetry', toPortId: 'in-orders' },
  { id: 'conn-8', fromNodeId: 'node-bracket', fromPortId: 'out-bracket', toNodeId: 'node-telemetry', toPortId: 'in-bracket' },
];

interface VisualFlowStudioProps {
  initialStockSymbol?: string;
}

export const VisualFlowStudio: React.FC<VisualFlowStudioProps> = ({ initialStockSymbol }) => {
  const [nodes, setNodes] = useState<FlowNode[]>(() => {
    if (initialStockSymbol) {
      return DEFAULT_NODES.map((n) =>
        n.type === 'TRIGGER_FEED' ? { ...n, config: { ...n.config, symbol: initialStockSymbol } } : n
      );
    }
    return DEFAULT_NODES;
  });
  const [connections, setConnections] = useState<FlowConnection[]>(DEFAULT_CONNECTIONS);
  const [activeConnectionStart, setActiveConnectionStart] = useState<{ nodeId: string; portId: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<FlowStrategyResult | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedFilingStock, setSelectedFilingStock] = useState<FundamentalStockData | null>(null);

  useEffect(() => {
    if (initialStockSymbol) {
      setNodes((prev) =>
        prev.map((n) =>
          n.type === 'TRIGGER_FEED' ? { ...n, config: { ...n.config, symbol: initialStockSymbol } } : n
        )
      );
      setToastMsg(`✓ Loaded ${initialStockSymbol} into Flow Trigger Node`);
    }
  }, [initialStockSymbol]);

  const handleApplyParsedPrompt = (parsed: ParsedStrategyPrompt) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.type === 'TRIGGER_FEED') {
          return {
            ...n,
            config: {
              ...n.config,
              symbol: parsed.symbol,
              timeframe: parsed.timeframe,
            },
          };
        }
        if (n.type === 'INDICATOR_PSAR' && parsed.params.psarStart !== undefined) {
          return {
            ...n,
            config: {
              ...n.config,
              start: parsed.params.psarStart,
              step: parsed.params.psarStep,
              max: parsed.params.psarMax,
            },
          };
        }
        if (n.type === 'INDICATOR_SMA' && parsed.params.smaLength !== undefined) {
          return {
            ...n,
            config: {
              ...n.config,
              length: parsed.params.smaLength,
            },
          };
        }
        if (n.type === 'RISK_RPT' && parsed.params.riskPerTradePct !== undefined) {
          return {
            ...n,
            config: {
              ...n.config,
              riskPerTradePct: parsed.params.riskPerTradePct,
            },
          };
        }
        return n;
      })
    );
    showToast(`✓ Applied AI Strategy to canvas: ${parsed.symbol} (${parsed.strategyType})`);
  };

  // Inspector & Validation Modals
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-psar');
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FlowValidationError[]>([]);

  // Quick Connect Tool Modal State
  const [isQuickConnectOpen, setIsQuickConnectOpen] = useState(false);
  const [quickFromNode, setQuickFromNode] = useState<string>(DEFAULT_NODES[0].id);
  const [quickToNode, setQuickToNode] = useState<string>(DEFAULT_NODES[1].id);

  // Step-by-Step Simulation Sequencer
  const [activeStepHalo, setActiveStepHalo] = useState<number | null>(null);

  // Smooth Canvas Dragging & Navigation State (n8n-grade)
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number } | null>(null);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Global window pointer listener for 60/120fps butter-smooth node dragging and canvas panning
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Track cursor position in canvas virtual coordinates for dynamic connecting wire
      const curCanvasX = (e.clientX - canvasRect.left - pan.x) / zoom;
      const curCanvasY = (e.clientY - canvasRect.top - pan.y) / zoom;
      setMouseCanvasPos({ x: curCanvasX, y: curCanvasY });

      // 1. Handle Node Dragging
      if (draggingNodeId) {
        const rawX = (e.clientX - canvasRect.left - pan.x) / zoom - dragOffsetRef.current.x;
        const rawY = (e.clientY - canvasRect.top - pan.y) / zoom - dragOffsetRef.current.y;
        const finalX = snapToGrid ? Math.round(rawX / 16) * 16 : rawX;
        const finalY = snapToGrid ? Math.round(rawY / 16) * 16 : rawY;

        setNodes((prev) =>
          prev.map((n) =>
            n.id === draggingNodeId
              ? {
                  ...n,
                  x: Math.max(10, Math.min(2600, finalX)),
                  y: Math.max(10, Math.min(1800, finalY)),
                }
              : n
          )
        );
      }

      // 2. Handle Canvas Panning
      if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
      }
    };

    const handleWindowMouseUp = () => {
      if (draggingNodeId) setDraggingNodeId(null);
      if (isPanning) setIsPanning(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingNodeId, isPanning, pan, zoom, snapToGrid]);

  // Compute live pipeline validation & topological sequence
  const pipelineStatus = useMemo(() => {
    return validateFlowPipeline(nodes, connections);
  }, [nodes, connections]);

  // Compute step number per node
  const nodeStepMap = useMemo(() => {
    const map: Record<string, number> = {};
    pipelineStatus.executionSequence.forEach((seq) => {
      map[seq.nodeId] = seq.step;
    });
    return map;
  }, [pipelineStatus.executionSequence]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedDoc = useMemo(() => {
    if (!selectedNode) return null;
    return NODE_DOCUMENTATION_MAP[selectedNode.type] || null;
  }, [selectedNode]);

  const upstreamNodes = useMemo(() => {
    if (!selectedNode) return [];
    return connections
      .filter((c) => c.toNodeId === selectedNode.id)
      .map((c) => {
        const src = nodes.find((n) => n.id === c.fromNodeId);
        return { ...c, srcTitle: src?.title || 'Unknown Source' };
      });
  }, [selectedNode, connections, nodes]);

  const downstreamNodes = useMemo(() => {
    if (!selectedNode) return [];
    return connections
      .filter((c) => c.fromNodeId === selectedNode.id)
      .map((c) => {
        const dst = nodes.find((n) => n.id === c.toNodeId);
        return { ...c, dstTitle: dst?.title || 'Unknown Target' };
      });
  }, [selectedNode, connections, nodes]);

  // Node Drag Handlers (Instant response without CSS transition lag)
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.closest('button, select, input, .no-drag')
    ) {
      return;
    }
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: (e.clientX - canvasRect.left - pan.x) / zoom - node.x,
      y: (e.clientY - canvasRect.top - pan.y) / zoom - node.y,
    };
    setDraggingNodeId(nodeId);
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (activeConnectionStart) {
      setActiveConnectionStart(null);
      showToast('Connection cancelled');
      return;
    }
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleWheelCanvas = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prev) => Math.max(0.5, Math.min(1.8, parseFloat((prev * zoomFactor).toFixed(2)))));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.75,
        y: prev.y - e.deltaY * 0.75,
      }));
    }
  };

  const handleFitView = () => {
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + 240));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + 200));

    const canvasWidth = canvasRef.current?.clientWidth || 900;
    const canvasHeight = canvasRef.current?.clientHeight || 640;

    const flowWidth = maxX - minX + 100;
    const flowHeight = maxY - minY + 100;

    const scale = Math.max(0.6, Math.min(1.2, Math.min(canvasWidth / flowWidth, canvasHeight / flowHeight)));
    const centerX = (canvasWidth - flowWidth * scale) / 2 - minX * scale;
    const centerY = (canvasHeight - flowHeight * scale) / 2 - minY * scale;

    setZoom(parseFloat(scale.toFixed(2)));
    setPan({ x: Math.round(centerX), y: Math.round(centerY) });
    showToast('✓ Fitted view to all nodes');
  };

  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleDuplicateNode = (nodeId: string) => {
    const orig = nodes.find((n) => n.id === nodeId);
    if (!orig) return;
    const newId = `node-${Date.now().toString(36)}`;
    const copy: FlowNode = {
      ...orig,
      id: newId,
      title: `${orig.title} (Copy)`,
      x: orig.x + 32,
      y: orig.y + 32,
    };
    setNodes((prev) => [...prev, copy]);
    setSelectedNodeId(newId);
    showToast(`✓ Duplicated ${orig.title}`);
  };

  // Port Connection Handlers
  const handlePortClick = (nodeId: string, portId: string, isOutput: boolean) => {
    if (isOutput) {
      setActiveConnectionStart({ nodeId, portId });
      showToast('Select an input port on another node to complete wire');
    } else {
      if (activeConnectionStart) {
        if (activeConnectionStart.nodeId === nodeId) {
          showToast('Cannot connect a node to itself');
          setActiveConnectionStart(null);
          return;
        }
        // Avoid duplicate wire
        const exists = connections.some(
          (c) =>
            c.fromNodeId === activeConnectionStart.nodeId &&
            c.fromPortId === activeConnectionStart.portId &&
            c.toNodeId === nodeId &&
            c.toPortId === portId
        );
        if (exists) {
          showToast('Connection wire already exists');
          setActiveConnectionStart(null);
          return;
        }

        const newConn: FlowConnection = {
          id: `conn-${Date.now()}`,
          fromNodeId: activeConnectionStart.nodeId,
          fromPortId: activeConnectionStart.portId,
          toNodeId: nodeId,
          toPortId: portId,
        };
        setConnections((prev) => [...prev, newConn]);
        setActiveConnectionStart(null);
        showToast('✓ Wire connected successfully!');
      }
    }
  };

  // Quick Wire Tool
  const handleQuickConnect = () => {
    if (quickFromNode === quickToNode) {
      showToast('Cannot connect a node to itself');
      return;
    }
    const source = nodes.find((n) => n.id === quickFromNode);
    const target = nodes.find((n) => n.id === quickToNode);
    if (!source || !target || source.outputs.length === 0 || target.inputs.length === 0) {
      showToast('Selected nodes have no compatible input/output ports');
      return;
    }

    const fromPort = source.outputs[0].id;
    const toPort = target.inputs[0].id;

    const exists = connections.some(
      (c) => c.fromNodeId === source.id && c.toNodeId === target.id
    );
    if (exists) {
      showToast('These nodes are already connected');
      return;
    }

    const newConn: FlowConnection = {
      id: `conn-${Date.now()}`,
      fromNodeId: source.id,
      fromPortId: fromPort,
      toNodeId: target.id,
      toPortId: toPort,
    };
    setConnections((prev) => [...prev, newConn]);
    setIsQuickConnectOpen(false);
    showToast(`✓ Connected ${source.title} ➔ ${target.title}`);
  };

  // Delete Connection Wire
  const handleDeleteConnection = (connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    showToast('Wire removed');
  };

  // Initialize Blank Workflow
  const handleInitBlankFlow = () => {
    const starterFeed: FlowNode = {
      id: 'node-feed',
      type: 'TRIGGER_FEED',
      title: 'NSE Market Feed',
      category: 'feed',
      x: 60,
      y: 180,
      config: { symbol: 'INFY', timeframe: '1d', initialCapital: 100000 },
      inputs: [],
      outputs: [{ id: 'out-candles', label: 'Candles', type: 'data' }],
      status: 'idle',
    };
    setNodes([starterFeed]);
    setConnections([]);
    setResult(null);
    setSelectedNodeId('node-feed');
    showToast('Canvas Initialized: Root feed ready. Wire downstream indicator nodes.');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ nodes, connections }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'NIFTY_EMA_ATR_V4.flow.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('✓ Exported flow to JSON!');
  };

  // Load Verified Atharva Strategy Template
  const handleLoadAtharvaTemplate = () => {
    setNodes(DEFAULT_NODES);
    setConnections(DEFAULT_CONNECTIONS);
    setResult(null);
    setSelectedNodeId('node-psar');
    showToast('✓ Loaded Verified Atharva PSAR + SMA100 + 1% RPT Template');
  };

  // Auto-Wire compatible nodes
  const handleAutoWireCompatibleNodes = () => {
    const newConns: FlowConnection[] = [...connections];
    const addConnIfMissing = (fromId: string, fromP: string, toId: string, toP: string) => {
      const exists = newConns.some(
        (c) => c.fromNodeId === fromId && c.toNodeId === toId && c.fromPortId === fromP && c.toPortId === toP
      );
      if (!exists) {
        newConns.push({
          id: `conn-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          fromNodeId: fromId,
          fromPortId: fromP,
          toNodeId: toId,
          toPortId: toP,
        });
      }
    };

    const feed = nodes.find((n) => n.category === 'feed');
    const indicators = nodes.filter((n) => n.category === 'indicator');
    if (feed && feed.outputs.length > 0) {
      indicators.forEach((ind) => {
        if (ind.inputs.length > 0) {
          addConnIfMissing(feed.id, feed.outputs[0].id, ind.id, ind.inputs[0].id);
        }
      });
    }

    const logicNodes = nodes.filter((n) => n.category === 'logic');
    logicNodes.forEach((lg) => {
      indicators.forEach((ind, iIdx) => {
        if (iIdx < lg.inputs.length && ind.outputs.length > 0) {
          addConnIfMissing(ind.id, ind.outputs[0].id, lg.id, lg.inputs[iIdx].id);
        }
      });
    });

    const riskNodes = nodes.filter((n) => n.category === 'risk');
    if (logicNodes.length > 0) {
      const primeLogic = logicNodes[0];
      riskNodes.forEach((rn) => {
        if (rn.inputs.length > 0 && primeLogic.outputs.length > 0) {
          addConnIfMissing(primeLogic.id, primeLogic.outputs[0].id, rn.id, rn.inputs[0].id);
        }
      });
    }

    const telemetry = nodes.find((n) => n.type === 'OUTPUT_TELEMETRY');
    if (telemetry) {
      riskNodes.forEach((rn, rIdx) => {
        if (rn.outputs.length > 0 && rIdx < telemetry.inputs.length) {
          addConnIfMissing(rn.id, rn.outputs[0].id, telemetry.id, telemetry.inputs[rIdx].id);
        }
      });
    }

    setConnections(newConns);
    setIsValidationModalOpen(false);
    showToast(`✓ Auto-wired ${newConns.length} pipeline connection wires`);
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) => prev.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Update Node Config
  const handleUpdateConfig = (nodeId: string, key: string, val: any) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, [key]: val } } : n))
    );
  };

  // Add Node from Palette
  const handleAddNodeFromPalette = (type: FlowNodeType) => {
    const id = `node-${Date.now()}`;
    const x = 300 + Math.random() * 200;
    const y = 150 + Math.random() * 200;

    let title = 'Indicator Node';
    let category: FlowNode['category'] = 'indicator';
    let inputs: FlowPort[] = [{ id: 'in', label: 'In', type: 'data' }];
    let outputs: FlowPort[] = [{ id: 'out', label: 'Out', type: 'data' }];
    let config: Record<string, any> = {};

    switch (type) {
      case 'TRIGGER_FEED':
        title = 'NSE Market Feed';
        category = 'feed';
        inputs = [];
        outputs = [{ id: 'out-candles', label: 'Candles', type: 'data' }];
        config = { symbol: 'RELIANCE', timeframe: '1d', initialCapital: 100000 };
        break;
      case 'INDICATOR_PSAR':
        title = 'Parabolic SAR (ta.sar)';
        category = 'indicator';
        inputs = [{ id: 'in-candles', label: 'Candles', type: 'data' }];
        outputs = [{ id: 'out-psar', label: 'PSAR', type: 'data' }];
        config = { start: 0.01, step: 0.01, max: 0.10 };
        break;
      case 'INDICATOR_SMA':
        title = 'SMA Moving Average';
        category = 'indicator';
        inputs = [{ id: 'in-candles', label: 'Candles', type: 'data' }];
        outputs = [{ id: 'out-sma', label: 'SMA', type: 'data' }];
        config = { length: 100 };
        break;
      case 'INDICATOR_EMA':
        title = 'EMA Moving Average';
        category = 'indicator';
        inputs = [{ id: 'in-candles', label: 'Candles', type: 'data' }];
        outputs = [{ id: 'out-ema', label: 'EMA', type: 'data' }];
        config = { length: 20 };
        break;
      case 'INDICATOR_RSI':
        title = 'RSI Momentum (14)';
        category = 'indicator';
        inputs = [{ id: 'in-candles', label: 'Candles', type: 'data' }];
        outputs = [{ id: 'out-rsi', label: 'RSI', type: 'data' }];
        config = { period: 14, overbought: 70, oversold: 30 };
        break;
      case 'INDICATOR_SUPERTREND':
        title = 'Supertrend ATR';
        category = 'indicator';
        inputs = [{ id: 'in-candles', label: 'Candles', type: 'data' }];
        outputs = [{ id: 'out-st', label: 'Trend', type: 'data' }];
        config = { period: 10, multiplier: 3.0 };
        break;
      case 'LOGIC_CROSSOVER':
        title = 'Crossover / Flip Filter';
        category = 'logic';
        inputs = [
          { id: 'in-1', label: 'Sig 1', type: 'data' },
          { id: 'in-2', label: 'Sig 2', type: 'data' },
        ];
        outputs = [
          { id: 'out-buy', label: 'Buy Trigger', type: 'signal' },
          { id: 'out-sell', label: 'Sell Trigger', type: 'signal' },
        ];
        config = { rule: 'Flip Condition' };
        break;
      case 'RISK_RPT':
        title = 'RPT Capital Sizer';
        category = 'risk';
        inputs = [{ id: 'in-sig', label: 'Signal', type: 'signal' }];
        outputs = [{ id: 'out-orders', label: 'Orders', type: 'order' }];
        config = { riskPerTradePct: 1.0, maxRiskPercent: 9.0 };
        break;
      case 'RISK_BRACKET':
        title = 'SL / Target Bracket';
        category = 'risk';
        inputs = [{ id: 'in-sig', label: 'Signal', type: 'signal' }];
        outputs = [{ id: 'out-bracket', label: 'Bracket', type: 'order' }];
        config = { slLookback: 2, rrRatio: 2.0 };
        break;
      case 'OUTPUT_TELEMETRY':
        title = 'Execution Telemetry';
        category = 'output';
        inputs = [{ id: 'in-data', label: 'Data', type: 'order' }];
        outputs = [];
        config = {};
        break;
      default:
        break;
    }

    const newNode: FlowNode = {
      id,
      type,
      title,
      category,
      x,
      y,
      config,
      inputs,
      outputs,
      status: 'idle',
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
    showToast(`Added ${title} node`);
  };

  // Preview Execution Sequence Step-by-Step
  const handlePreviewSequence = () => {
    if (!pipelineStatus.isValid) {
      setValidationErrors(pipelineStatus.errors);
      setIsValidationModalOpen(true);
      return;
    }
    const maxSteps = pipelineStatus.executionSequence.length;
    let current = 1;
    setActiveStepHalo(1);
    const interval = setInterval(() => {
      current++;
      if (current > maxSteps) {
        clearInterval(interval);
        setActiveStepHalo(null);
        showToast('✓ Sequence preview finished. Flow pipeline order verified.');
      } else {
        setActiveStepHalo(current);
      }
    }, 600);
  };

  // Run Flow Execution with Strict Pre-Validation
  const handleExecuteFlow = async () => {
    // 1. Strict DAG Validation Check
    if (!pipelineStatus.isValid) {
      setValidationErrors(pipelineStatus.errors);
      setIsValidationModalOpen(true);
      setResult(null);
      return;
    }

    setIsExecuting(true);
    setResult(null);
    try {
      const res = await runVisualFlow(nodes, connections);
      setResult(res);
      showToast(`✓ Flow executed with real data! Net Return: +${res.totalReturnPct}%`);
    } catch (err: any) {
      console.error('Flow execution error:', err);
      showToast(`Execution Error: ${err.message || 'Unknown'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Deploy Flow as Strategy to Marketplace
  const handleDeployToMarketplace = () => {
    if (!result) {
      showToast('Execute the flow first before deploying');
      return;
    }
    const newStrat: AlgoStrategy = {
      id: `algo-flow-${Date.now()}`,
      name: `Visual Flow · ${result.symbol} Swing (${result.winRate}% Win)`,
      tagline: `Interactive n8n Flow · 1% RPT · Sourced from Visual Algo Canvas`,
      category: 'Trend Following / Swing',
      style: 'Visual Node Flow Architecture',
      marginRequired: result.initialCapital,
      rollingReturn1m: Number((result.totalReturnPct * 0.25).toFixed(1)),
      return3m: Number((result.totalReturnPct * 0.5).toFixed(1)),
      return6m: Number((result.totalReturnPct * 0.75).toFixed(1)),
      return1y: result.totalReturnPct,
      winRate: result.winRate,
      maxDrawdown: result.maxDrawdownPct,
      isEarlyAccess: false,
      isPopular: true,
      capitalTier: 'under_100k',
      sparkline: [100, 105, 112, 108, 115, 122, 126, 124, 131, 138],
      description: `Wired Visual Flow strategy constructed in Visual Flow Canvas.\nAssets: ${result.symbol}\nNodes: ${nodes.length}\nInitial Capital: ₹${result.initialCapital}\nTotal Return: +${result.totalReturnPct}%`,
      promptRules: `Visual node flow rules generated from Visual Flow Canvas.`,
      targetSymbol: result.symbol,
      timeframe: result.timeframe,
      isCustom: true,
      isPublished: true,
      author: 'Visual Flow Designer',
      createdAt: new Date().toISOString(),
      defaultParams: {
        strategyType: 'PSAR_SMA100',
        initialCapital: result.initialCapital,
        riskPerTradePct: 1.0,
        stochKPeriod: 14,
        stochSmooth: 3,
        stochDPeriod: 3,
        stochOverbought: 80,
        stochOversold: 20,
        atrPeriod: 14,
        atrSlMultiplier: 1.2,
        atrTpMultiplier: 3.6,
        useTrailingStop: false,
        slippagePoints: 1.0,
        brokeragePerOrder: 20,
        positionMode: 'BOTH',
      },
    };
    storeAddStrategy(newStrat);
    showToast(`✓ Strategy "${newStrat.name}" deployed to Marketplace!`);
  };

  // Helper: calculate wire curves
  const getPortCoordinates = (nodeId: string, portId: string, isOutput: boolean) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const nodeWidth = 240;
    const headerHeight = 40;
    const portSpacing = 28;

    const ports = isOutput ? node.outputs : node.inputs;
    const portIndex = ports.findIndex((p) => p.id === portId);
    const yOffset = headerHeight + 20 + Math.max(0, portIndex) * portSpacing;

    return {
      x: isOutput ? node.x + nodeWidth : node.x,
      y: node.y + yOffset,
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A0A0D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700 flex items-center gap-3 text-xs font-mono animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const parsed = JSON.parse(event.target?.result as string);
              if (Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
                setNodes(parsed.nodes);
                setConnections(parsed.connections);
                showToast('✓ Flow configuration successfully imported!');
              }
            } catch (err) {
              showToast('Invalid Flow JSON format');
            }
          };
          reader.readAsText(file);
          e.target.value = '';
        }}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Natural Language Prompt-to-Strategy Copilot */}
      <NaturalLanguagePromptBar onApplyParsedStrategy={handleApplyParsedPrompt} />

      {/* 1. Flow Canvas Toolbar (Stitch Screen 6) */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm flex-wrap">
            <div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-text-muted">
              <span className="material-symbols-outlined text-secondary text-[18px]">account_tree</span>
              <span className="text-on-surface font-semibold">Visual Flow Studio</span>
              <span>/</span>
              <span className="text-bullish font-semibold">NIFTY_EMA_ATR_V4.flow</span>
            </div>
            <span
              className={`inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full font-mono-sm text-mono-sm font-semibold ${
                pipelineStatus.isValid
                  ? 'bg-bullish-tint text-bullish'
                  : 'bg-error-container text-error'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pipelineStatus.isValid ? 'bg-bullish' : 'bg-error'}`}></span>
              {pipelineStatus.isValid
                ? `COMPILED · ZERO ERRORS (${pipelineStatus.executionSequence.length} NODES)`
                : `PIPELINE INCOMPLETE (${pipelineStatus.errors.length} ERRORS)`}
            </span>
          </div>

          {/* Action Buttons (Stitch Screen 6) */}
          <div className="flex items-center gap-space-xs flex-wrap">
            <button
              onClick={handleLoadAtharvaTemplate}
              className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
              type="button"
              title="Load full 5-stage verified Atharva PSAR + SMA100 strategy"
            >
              <span className="material-symbols-outlined text-[16px]">folder_open</span>
              <span>Load Template</span>
            </button>

            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">data_object</span>
              <span>Export .json</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Import</span>
            </button>

            <button
              onClick={handleInitBlankFlow}
              className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Clear</span>
            </button>

            {result && (
              <button
                onClick={handleDeployToMarketplace}
                className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Deploy</span>
              </button>
            )}

            <button
              onClick={handleExecuteFlow}
              disabled={isExecuting}
              className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isExecuting ? 'refresh' : 'play_arrow'}
              </span>
              <span>{isExecuting ? 'Running...' : 'Run Flow Backtest'}</span>
            </button>
          </div>
        </div>

        {/* Quick Connect Dropdown Bar (When Open) */}
        {isQuickConnectOpen && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-900 font-mono flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-emerald-700" />
                Wire Connection Tool:
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <select
                  value={quickFromNode}
                  onChange={(e) => setQuickFromNode(e.target.value)}
                  className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 font-bold text-[#0A0A0D]"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({n.category})
                    </option>
                  ))}
                </select>
                <span className="text-emerald-700 font-bold">➔ Connects To:</span>
                <select
                  value={quickToNode}
                  onChange={(e) => setQuickToNode(e.target.value)}
                  className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 font-bold text-[#0A0A0D]"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({n.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickConnect}
                className="px-4 py-1.5 bg-[#0A0A0D] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 shadow-sm"
              >
                Add Wire Connection
              </button>
              <button
                onClick={() => setIsQuickConnectOpen(false)}
                className="p-1.5 text-gray-500 hover:text-black rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TOPOLOGICAL EXECUTION SEQUENCE PIPELINE BAR */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#0A0A0D] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Topological Execution Sequence Pipeline:
            </span>
            <span className="text-[11px] text-gray-400">
              Data strictly flows sequentially through verified stages
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {pipelineStatus.executionSequence.map((step, idx) => (
              <React.Fragment key={step.nodeId}>
                <div
                  onClick={() => setSelectedNodeId(step.nodeId)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all ${
                    activeStepHalo === step.step
                      ? 'bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-200 scale-105'
                      : selectedNodeId === step.nodeId
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-black'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      activeStepHalo === step.step
                        ? 'bg-white text-emerald-700'
                        : selectedNodeId === step.nodeId
                        ? 'bg-emerald-400 text-black'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {step.step}
                  </span>
                  <span>{step.title}</span>
                </div>
                {idx < pipelineStatus.executionSequence.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Quick Node Palettes */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 font-mono">
            + Palette:
          </span>
          <button
            onClick={() => handleAddNodeFromPalette('TRIGGER_FEED')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <Radio className="w-3 h-3 text-emerald-600" />
            <span>NSE Feed</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('INDICATOR_PSAR')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>PSAR (ta.sar)</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('INDICATOR_SMA')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            <span>SMA Trend</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('INDICATOR_EMA')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <Activity className="w-3 h-3 text-violet-600" />
            <span>EMA Moving Avg</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('INDICATOR_RSI')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <Activity className="w-3 h-3 text-cyan-600" />
            <span>RSI Momentum</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('INDICATOR_SUPERTREND')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Supertrend</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('LOGIC_CROSSOVER')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <Zap className="w-3 h-3 text-blue-600" />
            <span>Crossover Gate</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('RISK_RPT')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <Sliders className="w-3 h-3 text-emerald-600" />
            <span>1% RPT Sizer</span>
          </button>
          <button
            onClick={() => handleAddNodeFromPalette('RISK_BRACKET')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 shrink-0"
          >
            <Layers className="w-3 h-3 text-blue-600" />
            <span>SL / Target Bracket</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area: Canvas + Detailed Node Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Infinite Dotted Canvas with Butter-Smooth Panning & Zooming */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDownCanvas}
          onWheel={handleWheelCanvas}
          className={`lg:col-span-8 relative w-full h-[640px] bg-[#FAFAFC] rounded-2xl border border-gray-200 shadow-inner overflow-hidden select-none ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* Floating Canvas Controls Toolbar (n8n-style) */}
          <div className="absolute top-4 right-4 z-30 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl p-1 shadow-md flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setZoom((prev) => Math.min(1.8, parseFloat((prev + 0.1).toFixed(2))))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              title="Zoom In (Ctrl + Wheel Up)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(0.5, parseFloat((prev - 0.1).toFixed(2))))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              title="Zoom Out (Ctrl + Wheel Down)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 hover:bg-gray-100 rounded-lg text-[10px] font-bold text-gray-700 transition-colors"
              title="Reset Zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <div className="w-px h-3.5 bg-gray-200" />
            <button
              onClick={handleFitView}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors flex items-center gap-1 text-[10px] font-bold"
              title="Center and fit all nodes"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit</span>
            </button>
            <div className="w-px h-3.5 bg-gray-200" />
            <button
              onClick={() => {
                setSnapToGrid(!snapToGrid);
                showToast(snapToGrid ? 'Snap-to-Grid Disabled' : 'Snap-to-Grid Enabled (16px)');
              }}
              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                snapToGrid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Snap nodes to 16px grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Snap</span>
            </button>
          </div>

          {/* Active Wiring Helper Banner */}
          {activeConnectionStart && (
            <div className="absolute top-4 left-4 z-30 bg-[#0A0A0D] text-white px-3 py-1.5 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2 text-xs font-mono animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px]">Click any glowing input port to wire (Click background to cancel)</span>
              <button
                onClick={() => setActiveConnectionStart(null)}
                className="ml-2 px-1 rounded hover:bg-neutral-800 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Canvas Transform Stage (Pan & Zoom) */}
          <div
            className="absolute inset-0 origin-top-left canvas-background"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: '3200px',
              height: '2400px',
            }}
          >
            {/* SVG Connection Wires with Directional Markers */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
              <defs>
                <linearGradient id="wireGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <marker
                  id="wireArrow"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#3B82F6" />
                </marker>
              </defs>

              {connections.map((conn) => {
                const start = getPortCoordinates(conn.fromNodeId, conn.fromPortId, true);
                const end = getPortCoordinates(conn.toNodeId, conn.toPortId, false);
                const dx = Math.abs(end.x - start.x) * 0.5;
                const pathD = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

                return (
                  <g key={conn.id} className="cursor-pointer group pointer-events-auto">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      onClick={() => handleDeleteConnection(conn.id)}
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#wireGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      markerEnd="url(#wireArrow)"
                      className={isExecuting ? 'animate-pulse' : ''}
                    />
                    <circle
                      cx={(start.x + end.x) / 2}
                      cy={(start.y + end.y) / 2}
                      r="6"
                      fill="#0A0A0D"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      onClick={() => handleDeleteConnection(conn.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    />
                  </g>
                );
              })}

              {/* Live Interactive Wire Following Cursor */}
              {activeConnectionStart && mouseCanvasPos && (
                <g className="pointer-events-none">
                  {(() => {
                    const start = getPortCoordinates(
                      activeConnectionStart.nodeId,
                      activeConnectionStart.portId,
                      true
                    );
                    const end = mouseCanvasPos;
                    const dx = Math.abs(end.x - start.x) * 0.5;
                    const pathD = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
                    return (
                      <>
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          className="animate-pulse"
                        />
                        <circle cx={end.x} cy={end.y} r="5" fill="#10B981" />
                        <circle
                          cx={end.x}
                          cy={end.y}
                          r="10"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          className="animate-ping"
                        />
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

          {/* Nodes Layer */}
          {nodes.map((node) => {
            const isDragging = draggingNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const stepNum = nodeStepMap[node.id];
            const isStepActive = activeStepHalo === stepNum;
            const nodeStatus = pipelineStatus.nodeStatusMap[node.id];
            const isReady = nodeStatus ? nodeStatus.isReady : true;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onClick={() => setSelectedNodeId(node.id)}
                className={`absolute w-60 rounded-2xl bg-white border shadow-md transition-shadow transition-colors z-20 ${
                  isStepActive
                    ? 'ring-4 ring-emerald-400 border-emerald-500 shadow-2xl scale-[1.02]'
                    : isSelected
                    ? 'ring-2 ring-black border-black shadow-xl'
                    : isDragging
                    ? 'shadow-2xl ring-2 ring-emerald-500 cursor-grabbing'
                    : !isReady
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-gray-200 hover:border-gray-400 cursor-grab'
                }`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                }}
              >
                {/* Node Header with Step Badge */}
                <div className="px-3 py-2 border-b border-gray-100 bg-[#FAFAFC] rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    {stepNum ? (
                      <span className="w-4 h-4 rounded-full bg-[#0A0A0D] text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                        {stepNum}
                      </span>
                    ) : (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isReady ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                    )}
                    <span className="font-bold text-xs text-[#0A0A0D] tracking-tight truncate">{node.title}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateNode(node.id);
                      }}
                      className="text-gray-400 hover:text-black transition-colors p-1"
                      title="Duplicate Node (Copy)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                      className="text-gray-400 hover:text-black transition-colors p-1"
                      title="Inspect Node Documentation & Formulas"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete Node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Node Init Status Ribbon */}
                <div className="px-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        isReady
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                      {isReady ? 'INIT: READY' : 'INIT: PENDING'}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 uppercase font-semibold">{node.category}</span>
                  </div>

                  {!isReady && nodeStatus && nodeStatus.missingInputs.length > 0 && (
                    <div className="mt-1 p-1 rounded bg-rose-50/90 border border-rose-200 text-[9px] text-rose-800 font-mono flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                      <span className="truncate">Needs: {nodeStatus.missingInputs.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Node Body with Inline Controls */}
                <div className="p-3 space-y-2 text-xs font-mono">
                  {node.type === 'TRIGGER_FEED' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Symbol</span>
                        <div className="flex items-center gap-1.5">
                          <StockLogo symbol={node.config.symbol || 'INFY'} size="xs" />
                          <select
                            value={node.config.symbol || 'INFY'}
                            onChange={(e) => handleUpdateConfig(node.id, 'symbol', e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-xs font-bold"
                          >
                            {POPULAR_NSE_STOCKS.slice(0, 15).map((s) => (
                              <option key={s.symbol} value={s.symbol}>
                                {s.symbol}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {NSE_FUNDAMENTAL_STOCKS.some(
                        (s) => s.symbol === (node.config.symbol || 'INFY')
                      ) && (
                        <button
                          onClick={() => {
                            const found = NSE_FUNDAMENTAL_STOCKS.find(
                              (s) => s.symbol === (node.config.symbol || 'INFY')
                            );
                            if (found) setSelectedFilingStock(found);
                          }}
                          className="w-full mt-1.5 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>Check Filing & Concall AI</span>
                        </button>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Timeframe</span>
                        <select
                          value={node.config.timeframe || '1d'}
                          onChange={(e) => handleUpdateConfig(node.id, 'timeframe', e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-xs font-bold"
                        >
                          <option value="1d">1D (Daily)</option>
                          <option value="4h">4H (4 Hours)</option>
                          <option value="1h">1H (60m)</option>
                          <option value="15m">15M</option>
                          <option value="5m">5M</option>
                        </select>
                      </div>
                    </>
                  )}

                  {node.type === 'INDICATOR_PSAR' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Start AF</span>
                        <span className="font-bold text-black">{node.config.start || 0.01}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Step AF</span>
                        <span className="font-bold text-black">{node.config.step || 0.01}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Max AF</span>
                        <span className="font-bold text-black">{node.config.max || 0.10}</span>
                      </div>
                    </>
                  )}

                  {node.type === 'INDICATOR_SMA' && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Length</span>
                      <input
                        type="number"
                        value={node.config.length || 100}
                        onChange={(e) => handleUpdateConfig(node.id, 'length', parseInt(e.target.value) || 100)}
                        className="w-14 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-right font-bold"
                      />
                    </div>
                  )}

                  {node.type === 'RISK_RPT' && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">RPT Risk</span>
                      <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <input
                          type="number"
                          step="0.1"
                          value={node.config.riskPerTradePct || 1.0}
                          onChange={(e) => handleUpdateConfig(node.id, 'riskPerTradePct', parseFloat(e.target.value) || 1.0)}
                          className="w-10 bg-transparent text-right font-bold text-emerald-800"
                        />
                        <span className="text-emerald-700 font-bold">%</span>
                      </div>
                    </div>
                  )}

                  {node.type === 'RISK_BRACKET' && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">RR Ratio</span>
                      <span className="font-bold text-black">1 : {node.config.rrRatio || 2.0}</span>
                    </div>
                  )}
                </div>

                {/* Ports Container */}
                <div className="px-3 pb-3 flex items-center justify-between pt-1 border-t border-gray-100">
                  {/* Inputs on Left */}
                  <div className="space-y-1.5">
                    {node.inputs.map((port) => {
                      const isConnected = connections.some((c) => c.toNodeId === node.id && c.toPortId === port.id);
                      const isTargetCompatible = activeConnectionStart && activeConnectionStart.nodeId !== node.id;
                      return (
                        <div
                          key={port.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePortClick(node.id, port.id, false);
                          }}
                          className="flex items-center gap-1.5 cursor-pointer group p-1 -m-1"
                          title={`Input port: ${port.label} (${isConnected ? 'Connected ✓' : 'Click to wire'})`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full border border-white transition-all ${
                              isTargetCompatible
                                ? 'bg-emerald-500 ring-4 ring-emerald-300 animate-pulse scale-125'
                                : isConnected
                                ? 'bg-blue-600'
                                : 'bg-gray-300 group-hover:bg-blue-600'
                            }`}
                          />
                          <span className="text-[10px] font-mono text-gray-500 group-hover:text-black">
                            {port.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Outputs on Right */}
                  <div className="space-y-1.5 text-right ml-auto">
                    {node.outputs.map((port) => {
                      const isSelected = activeConnectionStart?.nodeId === node.id && activeConnectionStart.portId === port.id;
                      const isConnected = connections.some((c) => c.fromNodeId === node.id && c.fromPortId === port.id);
                      return (
                        <div
                          key={port.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePortClick(node.id, port.id, true);
                          }}
                          className="flex items-center justify-end gap-1.5 cursor-pointer group p-1 -m-1"
                          title={`Output port: ${port.label} (Click to drag wire)`}
                        >
                          <span className="text-[10px] font-mono text-gray-500 group-hover:text-black">
                            {port.label}
                          </span>
                          <div
                            className={`w-3 h-3 rounded-full border border-white transition-all ${
                              isSelected
                                ? 'bg-emerald-500 ring-4 ring-emerald-300 scale-125'
                                : isConnected
                                ? 'bg-emerald-600'
                                : 'bg-gray-400 group-hover:bg-emerald-500'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* DETAILED NODE INSPECTOR & EXPLANATION DRAWER */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4 font-mono text-xs max-h-[640px] overflow-y-auto">
          {selectedNode && selectedDoc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                      Node Inspector
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {selectedNode.category.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-[#0A0A0D] tracking-tight">{selectedDoc.title}</h3>
                </div>
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-black">
                  #{nodeStepMap[selectedNode.id] || '?'}
                </div>
              </div>

              {/* Technical Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Technical Summary</span>
                <p className="text-gray-600 text-xs font-sans leading-relaxed">{selectedDoc.summary}</p>
              </div>

              {/* Mathematical Theory & Equation */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Mathematical Formula</span>
                <p className="text-[11px] text-gray-800 leading-normal">{selectedDoc.mathExplanation}</p>
              </div>

              {/* Pine Script Equivalent */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                  <Code2 className="w-3 h-3 text-emerald-600" />
                  <span>Pine Script Equivalent</span>
                </div>
                <pre className="p-2.5 bg-[#0A0A0D] text-emerald-400 rounded-xl text-[11px] overflow-x-auto">
                  {selectedDoc.pineScriptEquiv}
                </pre>
              </div>

              {/* Required Input Ports Status */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Input Ports Wiring Status</span>
                {selectedDoc.inputs.length === 0 ? (
                  <span className="text-gray-400 text-[11px] block">No inputs required (Root Trigger Node).</span>
                ) : (
                  selectedDoc.inputs.map((inp) => {
                    const isConnected = connections.some(
                      (c) => c.toNodeId === selectedNode.id && c.toPortId === inp.portId
                    );
                    return (
                      <div
                        key={inp.portId}
                        className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                          isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div>
                          <span className="font-bold">{inp.label}</span>
                          <span className="text-[10px] opacity-75 ml-1.5">({inp.dataType})</span>
                        </div>
                        <span className="font-bold text-[10px]">{isConnected ? 'CONNECTED ✓' : 'DISCONNECTED ✕'}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Output Ports Emitted */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Output Ports Emitted</span>
                {selectedDoc.outputs.map((out) => (
                  <div key={out.portId} className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-black">{out.label}</span>
                      <span className="text-[10px] text-gray-500 ml-1.5">({out.dataType})</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Emitted</span>
                  </div>
                ))}
              </div>

              {/* Pipeline Topology Connections */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Pipeline Dependency Graph</span>
                <div className="space-y-1 font-mono text-[11px]">
                  <div>
                    <span className="font-bold text-black">Upstream Feeds: </span>
                    <span className="text-gray-700">
                      {upstreamNodes.length > 0
                        ? upstreamNodes.map((u) => u.srcTitle).join(', ')
                        : selectedNode.category === 'feed'
                        ? 'None (Root Data Source)'
                        : 'None (Disconnected ✕)'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-black">Downstream Consumers: </span>
                    <span className="text-gray-700">
                      {downstreamNodes.length > 0
                        ? downstreamNodes.map((d) => d.dstTitle).join(', ')
                        : selectedNode.category === 'output'
                        ? 'Terminal Output (Renders Equity Curve)'
                        : 'None (Unwired ✕)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
              <Info className="w-8 h-8 text-gray-300" />
              <p className="text-xs">Click any node on the canvas to inspect its mathematical theory, formulas, and inputs.</p>
            </div>
          )}
        </div>
      </div>

      {/* VALIDATION ERROR MODAL (Strict n8n DAG Enforcement) */}
      {isValidationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#0A0A0D]">Workflow Incomplete · Execution Blocked</h3>
              </div>
              <button
                onClick={() => setIsValidationModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 font-sans leading-relaxed">
              The execution engine strictly enforces complete pipeline validation. The workflow cannot run on incomplete or disconnected logic to prevent inaccurate results:
            </p>

            {/* Error List with Step Sequence Numbers & Remedies */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>
                      {idx + 1}. {err.nodeTitle || 'Workflow Rule'}
                    </span>
                    {err.stepNumber && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                        Step {err.stepNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-rose-800 text-[11px]">{err.message}</p>
                  <p className="text-emerald-800 text-[11px] font-bold">➔ Remedy: {err.remedy}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={handleAutoWireCompatibleNodes}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Wire Pipeline</span>
              </button>
              <button
                onClick={() => {
                  setIsValidationModalOpen(false);
                  setIsQuickConnectOpen(true);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Open Wire Tool
              </button>
              <button
                onClick={() => setIsValidationModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-xl text-xs font-bold"
              >
                Close & Edit Flow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Results & Terminal Logs Panel */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
              Flow Execution Telemetry
            </span>
            <button
              onClick={() => setIsDoctorModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Strategy Doctor (Monte Carlo Audit)</span>
            </button>
          </div>

          {/* Executive Performance Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">FLOW RETURN</span>
              <span className={`text-2xl font-bold font-mono mt-1 block ${result.totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.totalReturn >= 0 ? '+' : ''}{result.totalReturnPct}%
              </span>
              <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">
                ₹ {result.totalReturn.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">FLOW WIN RATE</span>
              <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">{result.winRate}%</span>
              <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">
                {result.winningTrades} / {result.totalTrades} Trades
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">PROFIT FACTOR</span>
              <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">{result.profitFactor}</span>
              <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">Gross Profit / Loss</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">MAX DRAWDOWN</span>
              <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">-{result.maxDrawdownPct}%</span>
              <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">Trailing Peak Lock</span>
            </div>
          </div>

          {/* Flow Cumulative Equity Curve Line Chart */}
          <EquityLineChart
            equityCurve={result.equityCurve}
            initialCapital={result.initialCapital}
            title={`Visual Flow Portfolio Equity Curve · ${result.symbol}`}
            subtitle={`Executed via strictly validated visual nodes on ${result.timeframe.toUpperCase()} timeframe with 1% RPT position sizing`}
            strokeColor="#16A34A"
            fillGradStart="#16A34A"
          />

          {/* Institutional Quantitative Risk & Alpha Matrix (QRAM) */}
          <QuantRiskAlphaMatrix
            trades={result.trades}
            initialCapital={result.initialCapital}
            symbol={result.symbol}
            strategyName="Visual Node Workflow"
          />

          {/* Quant High-Water Mark Underwater Drawdown Excursion Chart */}
          <QuantUnderwaterChart
            trades={result.trades}
            initialCapital={result.initialCapital}
          />

          {/* Real-Time Node Execution Logs Terminal */}
          <div className="bg-[#0A0A0D] text-white p-6 rounded-2xl shadow-xl border border-neutral-800 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-gray-200">Visual Flow Node Execution Logs Terminal</span>
              </div>
              <span className="text-[10px] text-gray-500">Node Orchestration Engine v2.0 · Strict DAG Order</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 text-xs pr-2">
              {result.logs.map((lg) => (
                <div key={lg.id} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-gray-500 shrink-0 text-[11px]">[{lg.time}]</span>
                  <span className="text-blue-400 font-bold shrink-0">[{lg.nodeTitle}]</span>
                  <span
                    className={
                      lg.level === 'success'
                        ? 'text-emerald-400'
                        : lg.level === 'trade'
                        ? 'text-emerald-300'
                        : lg.level === 'warn'
                        ? 'text-rose-400'
                        : 'text-gray-300'
                    }
                  >
                    {lg.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Strategy Doctor Modal */}
      <StrategyDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        trades={result?.trades || []}
        initialCapital={result?.initialCapital || 100000}
        symbol={result?.symbol || 'INFY'}
      />

      {/* AI Company Filing & Concall Analyzer Modal */}
      <CompanyFilingAnalyzerModal
        isOpen={!!selectedFilingStock}
        onClose={() => setSelectedFilingStock(null)}
        stock={selectedFilingStock}
      />
    </div>
  );
};
