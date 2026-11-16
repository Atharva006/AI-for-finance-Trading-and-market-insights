import React from 'react';
import { ShieldCheck, Crosshair, ExternalLink, GitBranch, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#030304] border-t border-white/10 pt-20 pb-12 overflow-hidden font-mono select-none">
      {/* Massive Background Watermark Typography: "अर्जुन // लक्ष्य" in subtle dark-orange outline */}
      <div className="absolute inset-x-0 bottom-10 flex justify-center items-center pointer-events-none opacity-5 overflow-hidden whitespace-nowrap">
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
        {/* Compliance Stamp Banner (Mandatory Hackathon Badge) */}
        <div className="border border-[#FF5500]/40 bg-[#FF5500]/[0.03] p-5 sm:p-6 mb-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#FF5500] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#FF5500] tracking-wider uppercase">
                  REGULATORY & HACKATHON COMPLIANCE DIRECTIVE
                </div>
                <p className="text-xs text-[#F8F9FA] leading-relaxed max-w-3xl">
                  Built for the AI for Finance Track. All backtests, trade signals, and market intelligence operate strictly on historical NSE data and simulated paper-trading environments. No real capital is deployed or broker API order-routing executed.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block text-[10px] text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 border border-[#00E676]/30 font-bold">
                NSE_PAPER_SANDBOX_V1
              </span>
            </div>
          </div>
        </div>

        {/* Footer Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10 text-xs">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-devanagari text-2xl font-bold text-[#FF5500]">
                अर्जुन
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[#F8F9FA] font-bold tracking-widest uppercase">
                ARJUNA QUANT LABS
              </span>
            </div>

            <p className="text-[#7E8490] leading-relaxed text-[11px] max-w-sm">
              The high-precision optical quant engine for Indian financial markets. Inspired by the Mahabharata's Matsya-Vedha: cutting through market chaos to isolate high-expectancy algorithmic edges.
            </p>

            <div className="flex items-center gap-3 text-[10px] text-[#7E8490]">
              <span>NSE HISTORICAL ARCHIVE</span>
              <span>•</span>
              <span>FinBERT NLP V2</span>
              <span>•</span>
              <span>NUMBA JIT ENGINE</span>
            </div>
          </div>

          {/* Quick Architecture Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[#FF5500] font-bold text-[11px] tracking-wider mb-2">
              QUANT ENGINE MODULES
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#A2A8B4]">
              <li className="hover:text-[#F8F9FA] transition-colors cursor-pointer">
                01 // तेल पात्र (OFI Noise Filter)
              </li>
              <li className="hover:text-[#F8F9FA] transition-colors cursor-pointer">
                02 // चक्र भेदन (Regime Breakouts)
              </li>
              <li className="hover:text-[#F8F9FA] transition-colors cursor-pointer">
                03 // शब्द वेध (Catalyst Embeddings)
              </li>
              <li className="hover:text-[#F8F9FA] transition-colors cursor-pointer">
                04 // Slippage & Depth Simulator
              </li>
            </ul>
          </div>

          {/* System Telemetry & Back to Top */}
          <div className="md:col-span-4 space-y-3 md:text-right">
            <div className="text-[#7E8490] text-[11px]">
              SYSTEM CLUSTER: <span className="text-[#00E676]">ONLINE</span>
            </div>
            <div className="text-[10px] text-[#7E8490]">
              SERVER TIME: <span className="text-[#F8F9FA] font-tabular">12:30:15 IST (SIMULATED)</span>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 border border-white/10 hover:border-[#FF5500] px-3 py-2 text-[#F8F9FA] hover:text-[#FF5500] transition-colors text-xs"
              >
                <span>RETURN TO FOCAL POINT</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Crosshairs */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#7E8490] gap-4">
          <div>
            © 2026 PROJECT ARJUNA (अर्जुन) // ARTHATON AI FOR FINANCE. STRICTLY QUANTITATIVE PAPER RESEARCH.
          </div>

          <div className="flex items-center gap-4 text-white/30">
            <span>+ 18.9256° N, 72.8242° E +</span>
            <span>BUILD 1.0.4-PROD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
