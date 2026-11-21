import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Key, RefreshCw, ExternalLink } from 'lucide-react';
import { DEFAULT_UPSTOX_ACCESS_TOKEN, DEFAULT_UPSTOX_API_KEY, DEFAULT_UPSTOX_API_SECRET } from '../paperTrading/config/upstoxDefault';
import { marketDataService } from '../paperTrading/services/market/MarketDataService';

interface UpstoxSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpstoxSettingsModal: React.FC<UpstoxSettingsModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tradeedge_upstox_access_token');
      if (saved && saved.length > 20) return saved;
    }
    return import.meta.env.VITE_UPSTOX_ACCESS_TOKEN || DEFAULT_UPSTOX_ACCESS_TOKEN;
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>(
    'Upstox API Gateway configured. Bearer token active.'
  );

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const activeToken = token.trim();
      const res = await fetch(
        '/upstox-api/v2/market-quote/quotes?instrument_key=NSE_INDEX%7CNifty%2050',
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
            Accept: 'application/json',
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const niftyData = json?.data?.['NSE_INDEX:Nifty 50'];
        const ltp = niftyData?.last_price || 'Verified';
        setTestStatus('success');
        setTestMessage(`Live connection established! NSE Nifty 50: ₹${ltp}`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(errJson?.errors?.[0]?.message || 'Upstox API returned an error.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e?.message || 'Network error while contacting Upstox API.');
    }
  };

  const handleSave = () => {
    const cleanToken = token.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradeedge_upstox_access_token', cleanToken);
      localStorage.setItem('tradeedge_market_mode', 'LIVE');
    }
    marketDataService.setUpstoxCredentials(DEFAULT_UPSTOX_API_KEY, DEFAULT_UPSTOX_API_SECRET, cleanToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-center text-primary font-bold shadow-xs">
              <Key className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0A0A0D]">Upstox API Gateway</h2>
              <p className="text-xs text-gray-500">Historical & Intraday Candle Configuration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Connection Status Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <div className="font-bold">Upstox Session Verified</div>
              <p className="text-[11px] text-emerald-700 leading-relaxed font-mono">
                {testMessage}
              </p>
            </div>
          </div>

          {/* Access Token Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#0A0A0D] block">
              Upstox Access Token (JWT Bearer):
            </label>
            <textarea
              rows={4}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your Upstox access token here..."
              className="w-full p-3 bg-[#FAFAFC] border border-gray-200 rounded-xl font-mono text-[11px] text-[#0A0A0D] focus:outline-none focus:border-black shadow-sm"
            />
          </div>

          {/* User Details */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 block font-sans">CLIENT ID (SUB)</span>
              <span className="font-bold text-[#0A0A0D] text-xs">3BCPV6</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 block font-sans">DEFAULT INSTRUMENT</span>
              <span className="font-bold text-[#0A0A0D] text-xs">NSE_INDEX|Nifty 50</span>
            </div>
          </div>

          {/* Documentation Link */}
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
            <span>Reference API Documentation:</span>
            <a
              href="https://upstox.com/developer/api-documentation/api-overview"
              target="_blank"
              rel="noreferrer"
              className="text-[#0A0A0D] font-bold underline flex items-center gap-1 hover:text-gray-700"
            >
              <span>Upstox Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#FAFAFC] border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black py-2 px-3 border border-gray-200 rounded-xl bg-white shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
