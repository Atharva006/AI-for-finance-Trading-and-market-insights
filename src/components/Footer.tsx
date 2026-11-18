import React from 'react';
import { ShieldCheck, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#FAFAFC] border-t border-gray-200 pt-16 pb-12 overflow-hidden font-mono select-none">
      {/* Background Watermark Typography: "अर्जुन // लक्ष्य" */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center items-center pointer-events-none opacity-5 overflow-hidden whitespace-nowrap">
        <span
          className="font-devanagari text-[16vw] font-bold text-transparent tracking-widest"
          style={{
            WebkitTextStroke: '2px #10B981',
          }}
        >
          अर्जुन // लक्ष्य
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Compliance Stamp Banner */}
        <div className="border border-emerald-500/30 bg-emerald-50/40 p-5 sm:p-6 mb-12 shadow-sm rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
                  REGULATORY & ARTHATON COMPLIANCE DIRECTIVE
                </div>
                <p className="text-xs text-[#0A0A0D] leading-relaxed max-w-3xl">
                  Built for the AI for Finance Track. All backtests, trade signals, and market intelligence operate strictly on historical NSE data and simulated paper-trading environments. No real capital is deployed.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block text-[10px] text-emerald-700 bg-white px-2.5 py-1 border border-emerald-300 rounded font-bold shadow-xs">
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
              <span className="font-devanagari text-2xl font-bold text-emerald-600">
                अर्जुन
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-[#0A0A0D] font-bold tracking-widest uppercase">
                APEX QUANT RESEARCH
              </span>
            </div>

            <p className="text-[#64748B] leading-relaxed text-[11px] max-w-sm">
              The high-precision quantitative execution engine for Indian financial markets: cutting through market noise to isolate high-expectancy algorithmic edges.
            </p>

            <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
              <span>NSE HISTORICAL ARCHIVE</span>
              <span>•</span>
              <span>SYSTEMATIC FACTOR MODELS</span>
              <span>•</span>
              <span>VECTORIZED JIT ENGINE</span>
            </div>
          </div>

          {/* Architecture Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-emerald-700 font-bold text-[11px] tracking-wider mb-2">
              QUANT ENGINE MODULES
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#475569]">
              <li className="hover:text-emerald-700 transition-colors cursor-pointer">
                // 01. Visual Flow Studio (n8n DAG Nodes)
              </li>
              <li className="hover:text-emerald-700 transition-colors cursor-pointer">
                // 02. Single & Multi-Asset Backtest Studio
              </li>
              <li className="hover:text-emerald-700 transition-colors cursor-pointer">
                // 03. Institutional Risk & Alpha Matrix (QRAM)
              </li>
              <li className="hover:text-emerald-700 transition-colors cursor-pointer">
                // 04. Modern Portfolio Theory (MPT) Basket Engine
              </li>
            </ul>
          </div>

          {/* Quick Specs */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-gray-800 font-bold text-[11px] tracking-wider">
              QUANT EXECUTION PARAMETERS
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-xl space-y-1.5 text-[10px] text-[#64748B]">
              <div className="flex justify-between">
                <span>BENCHMARK INDEX:</span>
                <span className="text-[#0A0A0D] font-bold">NIFTY 50 (^NSEI)</span>
              </div>
              <div className="flex justify-between">
                <span>RISK-FREE SOVEREIGN RATE:</span>
                <span className="text-emerald-600 font-bold">6.50% (Indian 10Y G-Sec)</span>
              </div>
              <div className="flex justify-between">
                <span>STATUTORY TAX FRICTION:</span>
                <span className="text-[#0A0A0D] font-bold">Section 111A STCG 20%</span>
              </div>
              <div className="flex justify-between">
                <span>EQUITY UNIVERSE:</span>
                <span className="text-emerald-600 font-bold">3,797 NSE Equities</span>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 border border-gray-300 hover:border-emerald-500 bg-white px-3 py-2 text-[#0A0A0D] hover:text-emerald-700 rounded-xl transition-colors text-xs shadow-xs"
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>RETURN TO APEX [TOP]</span>
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
          <div>
            © 2026 ARJUNA QUANT LABS. ALL QUANTITATIVE MODELS OPERATE IN-MEMORY FOR RESEARCH & DEMONSTRATION.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-black cursor-pointer">TERMS</span>
            <span>•</span>
            <span className="hover:text-black cursor-pointer">PRIVACY</span>
            <span>•</span>
            <span className="hover:text-black cursor-pointer">SEBI NOTICES</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
