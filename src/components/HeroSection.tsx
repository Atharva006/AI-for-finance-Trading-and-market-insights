import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Crosshair, Cpu, Database, Flame, Play } from 'lucide-react';
import { MotionAssetCanvas } from './MotionAssetCanvas';

interface HeroSectionProps {
  onOpenTerminal: () => void;
  onExplorePhilosophy: () => void;
  motionAsset1Url?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenTerminal,
  onExplorePhilosophy,
  motionAsset1Url,
}) => {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

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
            color: 0xff5500, // Saffron orange wireframe & arcs
            color2: 0xffffff, // Razor white secondary nodes
            backgroundColor: 0x050507, // Carbon obsidian
            size: 1.15,
          });
          setVantaEffect(effect);
        } catch (e) {
          console.warn('Vanta initialization notice:', e);
        }
      }
    };

    // Retry checking if Vanta & Three CDN have loaded
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

  return (
    <section className="relative min-h-screen pt-28 pb-16 flex flex-col justify-between overflow-hidden border-b border-white/10">
      {/* Vanta.js 3D Globe Background */}
      <div
        ref={vantaRef}
        className="absolute inset-0 z-0 opacity-70 pointer-events-none"
      />

      {/* Layered Matsya Astrolabe Motion Asset (Google Flow loop integration) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden flex items-center justify-end pr-0 md:pr-16">
        <div className="w-[520px] h-[520px] md:w-[700px] md:h-[700px]">
          <MotionAssetCanvas
            mode="matsya-target"
            videoSrc={motionAsset1Url}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Architectural Hairline Grid Overlay with Crosshairs */}
      <div className="absolute inset-0 bg-tactical-grid opacity-25 pointer-events-none z-0" />
      <div className="absolute top-28 left-8 text-white/20 font-mono text-xs select-none">
        + SYS_COORD: 18.9256° N, 72.8242° E [NSE_BKTEST_NODE] +
      </div>
      <div className="absolute bottom-24 right-8 text-white/20 font-mono text-xs select-none hidden md:block">
        + BUFFER_STATE: OK [IN-MEMORY TICK PIPELINE] +
      </div>

      {/* Hero Foreground: Asymmetric Swiss Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (Headline & Brand Mark) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0C0C10] border border-white/10 text-xs font-mono text-[#A2A8B4]">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span className="text-[#FF5500] font-bold">[ ARJUNA :</span>
              <span>PRECISION MARKET INTELLIGENCE ]</span>
              <span className="text-white/20">|</span>
              <span className="text-[#7E8490] hidden sm:inline">NSE HISTORICAL ENGINE</span>
            </div>

            {/* Massive Devanagari Title with Saffron Bindu */}
            <div className="relative">
              <h1 className="font-devanagari text-6xl sm:text-7xl md:text-9xl font-bold tracking-wide text-[#F8F9FA] leading-none select-none flex items-baseline">
                <span>अर्जुन</span>
                <span className="inline-block w-4 h-4 md:w-6 md:h-6 bg-[#FF5500] rounded-full ml-3 shadow-[0_0_20px_#FF5500] animate-pulse" />
              </h1>
              <div className="text-xs font-mono text-[#7E8490] tracking-[0.3em] uppercase mt-2">
                SYSTEMATIC DERIVATIVES & TICK-LEVEL CATALYST PARSER
              </div>
            </div>

            {/* Manifesto Headline */}
            <div className="space-y-3 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#F8F9FA] leading-tight">
                "See Only The Eye Of The Fish. <br className="hidden sm:block" />
                <span className="text-[#FF5500] underline decoration-[#FF5500]/30 underline-offset-8">
                  Ignore The Noise Of The Market.
                </span>"
              </h2>

              <p className="text-sm sm:text-base text-[#A2A8B4] font-mono leading-relaxed max-w-xl">
                Institutional-grade AI strategy backtesting on historical NSE tick data and real-time news sentiment mapping. Zero emotion. Pure systematic execution.
              </p>
            </div>

            {/* Dual CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenTerminal}
                className="group relative flex items-center gap-3 bg-[#FF5500] hover:bg-[#FF6A1A] text-black font-mono font-bold text-xs sm:text-sm px-6 py-3.5 transition-all duration-150 active:scale-95 border border-[#FF5500] shadow-[0_0_25px_rgba(255,85,0,0.35)]"
              >
                <Crosshair className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
                <span>LAUNCH BACKTEST ENGINE</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onExplorePhilosophy}
                className="flex items-center gap-2.5 bg-transparent hover:bg-white/[0.04] text-[#F8F9FA] font-mono text-xs sm:text-sm px-5 py-3.5 border border-white/20 hover:border-white/40 transition-all duration-150 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>EXPLORE MATSYA ARCHITECTURE</span>
              </button>
            </div>
          </div>

          {/* Right Column: Tactical Quant Snapshot Card */}
          <div className="lg:col-span-4">
            <div className="border border-white/10 bg-[#0C0C10]/80 backdrop-blur-md p-5 relative overflow-hidden font-mono">
              {/* Corner Crosshair Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#FF5500]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#FF5500]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#FF5500]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#FF5500]" />

              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="text-[#FF5500] font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  MODEL // NIFTY_ALPHA_V4
                </span>
                <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 border border-[#00E676]/30">
                  HISTORICAL_VALID
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="border border-white/5 bg-black/40 p-2.5">
                  <div className="text-[10px] text-[#7E8490]">SHARPE (ANNUAL)</div>
                  <div className="text-xl font-bold text-[#F8F9FA] font-tabular mt-0.5">
                    2.84
                  </div>
                  <div className="text-[9px] text-[#00E676] mt-0.5">Top 1.2% Quant Decile</div>
                </div>

                <div className="border border-white/5 bg-black/40 p-2.5">
                  <div className="text-[10px] text-[#7E8490]">WIN PROBABILITY</div>
                  <div className="text-xl font-bold text-[#00E676] font-tabular mt-0.5">
                    68.4%
                  </div>
                  <div className="text-[9px] text-[#7E8490] mt-0.5">1,482 Trades Sampled</div>
                </div>

                <div className="border border-white/5 bg-black/40 p-2.5">
                  <div className="text-[10px] text-[#7E8490]">MAX DRAWDOWN</div>
                  <div className="text-xl font-bold text-[#F8F9FA] font-tabular mt-0.5">
                    -4.12%
                  </div>
                  <div className="text-[9px] text-[#7E8490] mt-0.5">Recovery: 6.2 Days</div>
                </div>

                <div className="border border-white/5 bg-black/40 p-2.5">
                  <div className="text-[10px] text-[#7E8490]">PROFIT FACTOR</div>
                  <div className="text-xl font-bold text-[#FF8800] font-tabular mt-0.5">
                    2.41
                  </div>
                  <div className="text-[9px] text-[#7E8490] mt-0.5">Payoff Ratio 1.88</div>
                </div>
              </div>

              {/* Engine State Indicator */}
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-[10px]">
                <div className="flex justify-between text-[#7E8490]">
                  <span>LLM CATALYST FILTER:</span>
                  <span className="text-[#F8F9FA]">ACTIVE [FIN-BERT + GEMINI]</span>
                </div>
                <div className="flex justify-between text-[#7E8490]">
                  <span>EXECUTION LATENCY:</span>
                  <span className="text-[#00E676]">0.12 ms (TICK MATCH)</span>
                </div>
                <div className="flex justify-between text-[#7E8490]">
                  <span>SLIPPAGE MODEL:</span>
                  <span className="text-[#F8F9FA]">NSE ORDER-BOOK DEPTH WEIGHTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Strategy Telemetry Ribbon */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-8">
        <div className="border border-white/10 bg-[#0C0C10] p-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#FF5500]">
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider">STRATEGY_TELEMETRY:</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] font-tabular text-[#A2A8B4]">
            <div>
              <span className="text-[#7E8490]">SHARPE RATIO: </span>
              <span className="text-[#F8F9FA] font-bold">2.84</span>
            </div>
            <div className="h-3 w-[1px] bg-white/10 hidden sm:block" />
            <div>
              <span className="text-[#7E8490]">WIN RATE: </span>
              <span className="text-[#00E676] font-bold">68.4%</span>
            </div>
            <div className="h-3 w-[1px] bg-white/10 hidden sm:block" />
            <div>
              <span className="text-[#7E8490]">MAX DRAWDOWN: </span>
              <span className="text-[#FF1744] font-bold">-4.12%</span>
            </div>
            <div className="h-3 w-[1px] bg-white/10 hidden sm:block" />
            <div>
              <span className="text-[#7E8490]">DATA SOURCE: </span>
              <span className="text-[#FF8800] font-bold flex items-center gap-1 inline-flex">
                <Database className="w-3 h-3" />
                NSE HISTORICAL ARCHIVE (2018–2024)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
