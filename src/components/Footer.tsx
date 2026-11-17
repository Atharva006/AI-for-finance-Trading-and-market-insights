import React from 'react';
import { ShieldCheck, ArrowUp, Sparkles, Terminal, Activity, Zap } from 'lucide-react';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import { quantSound } from './AudioAmbience';

interface FooterProps {
  onOpenTerminal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerminal }) => {
  const scrollToTop = () => {
    quantSound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunch = () => {
    quantSound.playTargetLock();
    if (onOpenTerminal) {
      onOpenTerminal();
    } else {
      const el = document.getElementById('sandbox');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#FAFAFC] border-t border-gray-200 pt-16 pb-12 overflow-hidden font-mono select-none">
      {/* Background Watermark Typography: "अर्जुन // लक्ष्य" */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center items-center pointer-events-none opacity-5 overflow-hidden whitespace-nowrap">
        <span
          className="font-devanagari text-[16vw] font-bold text-transparent tracking-widest"
          style={{
            WebkitTextStroke: '2px #FF5500',
          }}
        >
          अर्जुन // लक्ष्य
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ============================================================== */}
        {/* ARJUN IN HINDI (अर्जुन) STYLISH BOTTOM HERO & LIQUID METAL BUTTON */}
        {/* ============================================================== */}
        <div className="relative mb-16 p-8 sm:p-12 md:p-16 border-2 border-gray-200 bg-white shadow-card overflow-hidden">
          {/* Corner Crosshairs */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FF5500]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FF5500]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FF5500]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FF5500]" />

          {/* Background Grid Accent */}
          <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] border border-gray-200 text-xs font-mono text-[#475569] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span className="text-[#FF5500] font-bold">[ लक्ष्यभेदी क्वांट :</span>
              <span>MATSYA-VEDHA ENGINE ]</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#64748B]">ARJUN HIGH-PRECISION TERMINAL</span>
            </div>

            {/* STYLISH HINDI PAGE NAME: "अर्जुन" */}
            <div className="relative my-2">
              <h2 className="font-devanagari text-6xl sm:text-8xl md:text-9xl font-bold tracking-wider leading-none select-none flex items-center justify-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#0A0A0D] via-[#1E293B] to-[#FF5500] drop-shadow-sm">
                  अर्जुन
                </span>
                <span className="inline-block w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#FF5500] rounded-full ml-3 sm:ml-4 shadow-[0_0_25px_rgba(255,85,0,0.6)] animate-pulse" />
              </h2>
              <div className="text-xs sm:text-sm font-mono text-[#64748B] tracking-[0.3em] uppercase mt-3 font-semibold">
                // ARJUNA ALGORITHMIC TRADING & BACKTESTING ENGINE
              </div>
            </div>

            {/* Poetic Inscription */}
            <p className="max-w-2xl text-xs sm:text-sm text-[#475569] font-mono leading-relaxed">
              "What do you see, Arjuna?" — <span className="text-[#0A0A0D] font-bold">"I see only the eye of the fish."</span> Ingesting millions of NSE market ticks, filtering noise, and executing high-expectancy algorithmic models with zero lookahead bias.
            </p>

            {/* Interactive Liquid Metal Button Integration */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              <LiquidMetalButton
                label="Initialize अर्जुन"
                onClick={handleLaunch}
                viewMode="text"
              />
              <LiquidMetalButton
                onClick={handleLaunch}
                viewMode="icon"
              />
            </div>

            {/* Interactive Feature Readouts */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] sm:text-[11px] text-[#475569] font-tabular">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-gray-200">
                <Zap className="w-3 h-3 text-[#FF5500]" />
                0.12ms TICK MATCH
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-gray-200">
                <Activity className="w-3 h-3 text-[#059669]" />
                UPSTOX V3 DIRECT JWT
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-gray-200">
                <Sparkles className="w-3 h-3 text-[#FF5500]" />
                LIQUID METAL SHADER READY
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-gray-200">
                <ShieldCheck className="w-3 h-3 text-[#059669]" />
                ZERO SYNTHETIC DRIFT
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Stamp Banner */}
        <div className="border border-[#FF5500]/30 bg-[#FFF7ED] p-5 sm:p-6 mb-12 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#FF5500] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#FF5500] tracking-wider uppercase">
                  REGULATORY & HACKATHON COMPLIANCE DIRECTIVE
                </div>
                <p className="text-xs text-[#0A0A0D] leading-relaxed max-w-3xl">
                  Built for the AI for Finance Track. All backtests, trade signals, and market intelligence operate strictly on historical NSE data and simulated paper-trading environments. No real capital is deployed.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block text-[10px] text-[#059669] bg-white px-2.5 py-1 border border-[#059669]/30 font-bold shadow-sm">
                NSE_PAPER_SANDBOX_V1
              </span>
            </div>
          </div>
        </div>

        {/* Footer Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-gray-200 text-xs">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-devanagari text-2xl font-bold text-[#FF5500]">
                अर्जुन
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-[#0A0A0D] font-bold tracking-widest uppercase">
                ARJUNA QUANT LABS
              </span>
            </div>

            <p className="text-[#64748B] leading-relaxed text-[11px] max-w-sm">
              The high-precision optical quant engine for Indian financial markets. Inspired by the Mahabharata's Matsya-Vedha: cutting through market chaos to isolate high-expectancy algorithmic edges.
            </p>

            <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
              <span>NSE HISTORICAL ARCHIVE</span>
              <span>•</span>
              <span>FinBERT NLP V2</span>
              <span>•</span>
              <span>NUMBA JIT ENGINE</span>
            </div>
          </div>

          {/* Architecture Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[#FF5500] font-bold text-[11px] tracking-wider mb-2">
              QUANT ENGINE MODULES
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#475569]">
              <li className="hover:text-[#FF5500] transition-colors cursor-pointer">
                01 // तेल पात्र (OFI Noise Filter)
              </li>
              <li className="hover:text-[#FF5500] transition-colors cursor-pointer">
                02 // चक्र भेदन (Regime Breakouts)
              </li>
              <li className="hover:text-[#FF5500] transition-colors cursor-pointer">
                03 // शब्द वेध (Catalyst Embeddings)
              </li>
              <li className="hover:text-[#FF5500] transition-colors cursor-pointer">
                04 // Slippage & Depth Simulator
              </li>
            </ul>
          </div>

          {/* System Telemetry & Back to Top */}
          <div className="md:col-span-4 space-y-3 md:text-right">
            <div className="text-[#64748B] text-[11px]">
              SYSTEM CLUSTER: <span className="text-[#059669] font-bold">ONLINE</span>
            </div>
            <div className="text-[10px] text-[#64748B]">
              SERVER TIME: <span className="text-[#0A0A0D] font-tabular font-medium">13:45:00 IST (SIMULATED)</span>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-[#FF5500] bg-white px-3 py-2 text-[#0A0A0D] hover:text-[#FF5500] transition-colors text-xs shadow-sm"
              >
                <span>RETURN TO FOCAL POINT</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#64748B] gap-4">
          <div>
            © 2026 PROJECT ARJUNA (अर्जुन) // ARTHATON AI FOR FINANCE. STRICTLY QUANTITATIVE PAPER RESEARCH.
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span>+ 18.9256° N, 72.8242° E +</span>
            <span>BUILD 1.0.4-PROD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
