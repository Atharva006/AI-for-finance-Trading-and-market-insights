import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Crosshair, Cpu, Database, Flame, Play, ShieldAlert, BarChart3 } from 'lucide-react';
import { MotionAssetCanvas } from './MotionAssetCanvas';
import { quantSound } from './AudioAmbience';

interface HeroSectionProps {
  onOpenTerminal: () => void;
  onExplorePhilosophy: () => void;
  motionAsset1Url?: string;
}

interface HeroMetricModel {
  id: string;
  label: string;
  name: string;
  sharpe: string;
  sharpePercentile: string;
  winRate: string;
  tradesCount: string;
  maxDrawdown: string;
  recoveryDays: string;
  profitFactor: string;
  payoff: string;
  nlpFilter: string;
  latency: string;
  slippageModel: string;
}

const heroModels: HeroMetricModel[] = [
  {
    id: 'nifty-orb',
    label: 'NIFTY 15M ORB',
    name: 'MODEL // NIFTY_ALPHA_V4',
    sharpe: '2.84',
    sharpePercentile: 'Top 1.2% Quant Decile',
    winRate: '68.4%',
    tradesCount: '1,482 Trades Sampled',
    maxDrawdown: '-4.12%',
    recoveryDays: 'Recovery: 6.2 Days',
    profitFactor: '2.41',
    payoff: 'Payoff Ratio 1.88',
    nlpFilter: 'ACTIVE [FIN-BERT + GEMINI]',
    latency: '0.12 ms (TICK MATCH)',
    slippageModel: 'DEPTH WEIGHTED',
  },
  {
    id: 'stoch-core',
    label: 'STOCHASTIC CORE',
    name: 'MODEL // STOCH_INFLECTION_1D',
    sharpe: '3.08',
    sharpePercentile: 'Top 0.8% Quant Decile',
    winRate: '50.0%',
    tradesCount: '386 Daily Swings',
    maxDrawdown: '-3.85%',
    recoveryDays: 'Recovery: 4.8 Days',
    profitFactor: '2.62',
    payoff: 'Payoff Ratio 2.65',
    nlpFilter: 'VOLATILITY CLUSTER GUARD',
    latency: '0.08 ms (TICK MATCH)',
    slippageModel: 'ZERO REPAINT 1D CLOSE',
  },
  {
    id: 'banknifty-shock',
    label: 'BANKNIFTY SHOCK',
    name: 'MODEL // RBI_VOL_STRADDLE',
    sharpe: '3.12',
    sharpePercentile: 'Top 0.5% Quant Decile',
    winRate: '72.1%',
    tradesCount: '284 Event Straddles',
    maxDrawdown: '-3.85%',
    recoveryDays: 'Recovery: 3.1 Days',
    profitFactor: '2.86',
    payoff: 'Payoff Ratio 2.15',
    nlpFilter: 'MPC AUDIO/NLP TRANSCRIPT',
    latency: '0.18 ms (MICROSTRUCTURE)',
    slippageModel: '1-TICK CONSERVATIVE',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenTerminal,
  onExplorePhilosophy,
}) => {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);

  const activeModel = heroModels[selectedModelIdx];

  useEffect(() => {
    let effect: any = null;

    const initVanta = () => {
      const win = window as any;
      if (win.VANTA && win.VANTA.GLOBE && vantaRef.current && !vantaEffect) {
        try {
          effect = win.VANTA.GLOBE({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xff5500, // Saffron orange arcs
            color2: 0x0f172a, // Slate nodes
            backgroundColor: 0xffffff, // Pure White background
            size: 1.15,
          });
          setVantaEffect(effect);
        } catch (e) {
          console.warn('Vanta initialization notice:', e);
        }
      }
    };

    if ((window as any).VANTA) {
      initVanta();
    } else {
      const timer = setInterval(() => {
        if ((window as any).VANTA) {
          initVanta();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  const handleLaunchEngine = () => {
    quantSound.playTargetLock();
    const sandboxEl = document.getElementById('sandbox');
    if (sandboxEl) {
      sandboxEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenTerminal();
    }
  };

  const handleSelectModel = (idx: number) => {
    quantSound.playClick();
    setSelectedModelIdx(idx);
  };

  return (
    <section className="relative min-h-[92vh] pt-24 pb-14 flex flex-col justify-between overflow-hidden border-b border-gray-200 bg-white">
      {/* Vanta.js 3D Globe Background in Pure White */}
      <div
        ref={vantaRef}
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
      />

      {/* Layered Matsya Astrolabe Motion Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60 overflow-hidden flex items-center justify-end pr-0 md:pr-12">
        <div className="w-[520px] h-[520px] md:w-[680px] md:h-[680px]">
          <MotionAssetCanvas
            mode="matsya-target"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Light Tactical Grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-50 pointer-events-none z-0" />
      <div className="absolute top-28 left-8 text-gray-400 font-mono text-[11px] select-none">
        + SYS_COORD: 18.9256° N, 72.8242° E [NSE_HISTORICAL_CORE] +
      </div>
      <div className="absolute bottom-24 right-8 text-gray-400 font-mono text-[11px] select-none hidden md:block">
        + PIPELINE: ACTIVE [IN-MEMORY TICK MATCH] +
      </div>

      {/* Hero Foreground: Clean Minimalist Swiss Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (Headline & Brand Mark) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] border border-gray-200 text-xs font-mono text-[#475569] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span className="text-[#FF5500] font-bold">[ ARJUNA :</span>
              <span>PRECISION MARKET INTELLIGENCE ]</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#64748B] hidden sm:inline">NSE HISTORICAL ENGINE</span>
            </div>

            {/* Massive Devanagari Title with Saffron Bindu */}
            <div className="relative">
              <h1 className="font-devanagari text-6xl sm:text-7xl md:text-9xl font-bold tracking-wide text-[#0A0A0D] leading-none select-none flex items-baseline">
                <span>अर्जुन</span>
                <span className="inline-block w-4 h-4 md:w-6 md:h-6 bg-[#FF5500] rounded-full ml-3 shadow-[0_0_15px_rgba(255,85,0,0.5)] animate-pulse" />
              </h1>
              <div className="text-xs font-mono text-[#64748B] tracking-[0.25em] uppercase mt-2 font-semibold">
                SYSTEMATIC DERIVATIVES & TICK-LEVEL CATALYST PARSER
              </div>
            </div>

            {/* Manifesto Headline */}
            <div className="space-y-3 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A0A0D] leading-tight">
                "See Only The Eye Of The Fish. <br className="hidden sm:block" />
                <span className="text-[#FF5500] underline decoration-[#FF5500]/40 underline-offset-8">
                  Ignore The Noise Of The Market.
                </span>"
              </h2>

              <p className="text-sm sm:text-base text-[#475569] font-mono leading-relaxed max-w-xl">
                Institutional-grade algorithmic strategy studio & vector backtesting engine for the National Stock Exchange of India (NSE). Powered by 100% genuine Upstox v3 tick data and FinBERT financial sentiment vectorization.
              </p>
            </div>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleLaunchEngine}
                className="group relative flex items-center gap-3 bg-[#FF5500] hover:bg-[#E04B00] text-white font-mono font-bold text-xs sm:text-sm px-6 py-3.5 transition-all duration-150 active:scale-95 shadow-sm"
              >
                <Crosshair className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
                <span>LAUNCH BACKTEST ENGINE</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onExplorePhilosophy}
                className="flex items-center gap-2.5 bg-white hover:bg-gray-50 text-[#0A0A0D] font-mono text-xs sm:text-sm px-5 py-3.5 border border-gray-300 hover:border-gray-400 transition-all duration-150 active:scale-95 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>EXPLORE QUANT ARCHITECTURE</span>
              </button>
            </div>
          </div>

          {/* Right Column: Tactical Quant Snapshot Card */}
          <div className="lg:col-span-4">
            <div className="border border-gray-200 bg-white/95 backdrop-blur-md p-5 relative shadow-card font-mono">
              {/* Corner Crosshair Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#FF5500]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#FF5500]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#FF5500]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#FF5500]" />

              {/* Model Switcher Tabs */}
              <div className="flex gap-1 mb-3 pb-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
                {heroModels.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModel(idx)}
                    className={`px-2 py-1 text-[10px] font-bold tracking-tight transition-all whitespace-nowrap ${
                      selectedModelIdx === idx
                        ? 'bg-[#0A0A0D] text-white'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0A0A0D]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
                <span className="text-[#FF5500] font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  {activeModel.name}
                </span>
                <span className="text-[10px] text-[#059669] bg-[#059669]/10 px-2 py-0.5 border border-[#059669]/30 font-bold">
                  HISTORICAL VALID
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="border border-gray-100 bg-[#F8FAFC] p-2.5">
                  <div className="text-[10px] text-[#64748B] font-semibold">SHARPE (ANNUAL)</div>
                  <div className="text-xl font-bold text-[#0A0A0D] font-tabular mt-0.5">
                    {activeModel.sharpe}
                  </div>
                  <div className="text-[9px] text-[#059669] mt-0.5 font-bold">
                    {activeModel.sharpePercentile}
                  </div>
                </div>

                <div className="border border-gray-100 bg-[#F8FAFC] p-2.5">
                  <div className="text-[10px] text-[#64748B] font-semibold">WIN PROBABILITY</div>
                  <div className="text-xl font-bold text-[#059669] font-tabular mt-0.5">
                    {activeModel.winRate}
                  </div>
                  <div className="text-[9px] text-[#64748B] mt-0.5">
                    {activeModel.tradesCount}
                  </div>
                </div>

                <div className="border border-gray-100 bg-[#F8FAFC] p-2.5">
                  <div className="text-[10px] text-[#64748B] font-semibold">MAX DRAWDOWN</div>
                  <div className="text-xl font-bold text-[#DC2626] font-tabular mt-0.5">
                    {activeModel.maxDrawdown}
                  </div>
                  <div className="text-[9px] text-[#64748B] mt-0.5">
                    {activeModel.recoveryDays}
                  </div>
                </div>

                <div className="border border-gray-100 bg-[#F8FAFC] p-2.5">
                  <div className="text-[10px] text-[#64748B] font-semibold">PROFIT FACTOR</div>
                  <div className="text-xl font-bold text-[#FF5500] font-tabular mt-0.5">
                    {activeModel.profitFactor}
                  </div>
                  <div className="text-[9px] text-[#64748B] mt-0.5">
                    {activeModel.payoff}
                  </div>
                </div>
              </div>

              {/* Engine State Indicator */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 text-[10px]">
                <div className="flex justify-between text-[#64748B]">
                  <span>LLM CATALYST FILTER:</span>
                  <span className="text-[#0A0A0D] font-semibold">{activeModel.nlpFilter}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>EXECUTION LATENCY:</span>
                  <span className="text-[#059669] font-bold">{activeModel.latency}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>SLIPPAGE MODEL:</span>
                  <span className="text-[#0A0A0D] font-semibold">{activeModel.slippageModel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Strategy Telemetry Ribbon */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-8">
        <div className="border border-gray-200 bg-[#F8FAFC] p-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-sm">
          <div className="flex items-center gap-2 text-[#FF5500]">
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider">STRATEGY_TELEMETRY:</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] font-tabular text-[#475569]">
            <div>
              <span className="text-[#64748B]">ACTIVE SHARPE: </span>
              <span className="text-[#0A0A0D] font-bold">{activeModel.sharpe}</span>
            </div>
            <div className="h-3 w-[1px] bg-gray-300 hidden sm:block" />
            <div>
              <span className="text-[#64748B]">WIN RATE: </span>
              <span className="text-[#059669] font-bold">{activeModel.winRate}</span>
            </div>
            <div className="h-3 w-[1px] bg-gray-300 hidden sm:block" />
            <div>
              <span className="text-[#64748B]">MAX DRAWDOWN: </span>
              <span className="text-[#DC2626] font-bold">{activeModel.maxDrawdown}</span>
            </div>
            <div className="h-3 w-[1px] bg-gray-300 hidden sm:block" />
            <div>
              <span className="text-[#64748B]">MARKET UNIVERSE: </span>
              <span className="text-[#0A0A0D] font-semibold">3,797 NSE EQUITIES & INDICES</span>
            </div>
            <div className="h-3 w-[1px] bg-gray-300 hidden sm:block" />
            <div>
              <span className="text-[#64748B]">DATA PIPELINE: </span>
              <span className="text-[#FF5500] font-bold flex items-center gap-1 inline-flex">
                <Database className="w-3 h-3" />
                UPSTOX API V3 [AUTHENTICATED JWT]
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
