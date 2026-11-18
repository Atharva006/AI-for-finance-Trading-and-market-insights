import React, { useState, useEffect } from 'react';
import { Layers, Activity, Radio } from 'lucide-react';

interface NewsItem {
  id: string;
  time: string;
  source: string;
  headline: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  impactTicker: string;
}

const initialNews: NewsItem[] = [
  {
    id: '1',
    time: '12:14:02',
    source: 'NSE REGULATORY',
    headline: 'Reliance Retail completes ₹8,400 Cr fundraise from global institutional investors.',
    sentiment: 'BULLISH',
    score: 0.86,
    impactTicker: 'RELIANCE',
  },
  {
    id: '2',
    time: '12:12:45',
    source: 'RBI NOTIFICATION',
    headline: 'RBI liquidity injection via variable rate repo auction clears ₹45,000 Cr at 6.50%.',
    sentiment: 'BULLISH',
    score: 0.72,
    impactTicker: 'BANKNIFTY',
  },
  {
    id: '3',
    time: '12:09:18',
    source: 'BLOOMBERG TERMINAL',
    headline: 'Crude oil Brent spikes +2.1% following Red Sea shipping transit re-routing advisory.',
    sentiment: 'BEARISH',
    score: -0.64,
    impactTicker: 'NIFTY 50',
  },
  {
    id: '4',
    time: '12:05:33',
    source: 'BSE ANNOUNCEMENT',
    headline: 'TCS wins $1.2B digital transformation multi-year deal with European banking consortium.',
    sentiment: 'BULLISH',
    score: 0.91,
    impactTicker: 'TCS',
  },
];

export const OrderBookTelemetry: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [bids, setBids] = useState([
    { price: 24180.50, qty: 1420, orders: 18 },
    { price: 24180.00, qty: 2850, orders: 34 },
    { price: 24179.50, qty: 4120, orders: 52 },
    { price: 24179.00, qty: 6890, orders: 81 },
    { price: 24178.50, qty: 9400, orders: 114 },
  ]);

  const [asks, setAsks] = useState([
    { price: 24181.00, qty: 1180, orders: 15 },
    { price: 24181.50, qty: 2450, orders: 29 },
    { price: 24182.00, qty: 3890, orders: 48 },
    { price: 24182.50, qty: 5720, orders: 74 },
    { price: 24183.00, qty: 8910, orders: 108 },
  ]);

  useEffect(() => {
    // Micro-jitter simulation for live order book dynamics
    const timer = setInterval(() => {
      setBids((prev) =>
        prev.map((b) => ({
          ...b,
          qty: Math.max(800, b.qty + Math.floor((Math.random() - 0.48) * 120)),
        }))
      );
      setAsks((prev) =>
        prev.map((a) => ({
          ...a,
          qty: Math.max(800, a.qty + Math.floor((Math.random() - 0.52) * 120)),
        }))
      );
    }, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
      {/* Left Column: Level 2 Depth Order Book */}
      <div className="lg:col-span-6 border border-gray-200 bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-[#0A0A0D] font-bold flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            NIFTY 50 DEPTH L2 [5-TIER SNAPSHOT]
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
            OFI: +1,240 (BUY PRESSURE)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Bids */}
          <div>
            <div className="text-[10px] text-emerald-700 font-bold pb-1.5 mb-2 border-b border-gray-100 flex justify-between">
              <span>BID QTY</span>
              <span>PRICE</span>
            </div>
            <div className="space-y-1.5 font-tabular">
              {bids.map((b, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 -z-0 rounded"
                    style={{ width: `${(b.qty / 10000) * 100}%` }}
                  />
                  <span className="text-gray-600 relative z-10 pl-1">{b.qty.toLocaleString()}</span>
                  <span className="text-emerald-700 font-bold relative z-10">{b.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks */}
          <div>
            <div className="text-[10px] text-rose-600 font-bold pb-1.5 mb-2 border-b border-gray-100 flex justify-between">
              <span>PRICE</span>
              <span>ASK QTY</span>
            </div>
            <div className="space-y-1.5 font-tabular">
              {asks.map((a, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] relative">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 -z-0 rounded"
                    style={{ width: `${(a.qty / 10000) * 100}%` }}
                  />
                  <span className="text-rose-600 font-bold relative z-10">{a.price.toFixed(2)}</span>
                  <span className="text-gray-600 relative z-10 pr-1">{a.qty.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Microstructure Status Strip */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
          <span>SPREAD: <strong className="text-black">₹0.50 (1 TICK)</strong></span>
          <span>IMBALANCE: <strong className="text-emerald-700">+14.2% BID</strong></span>
          <span>VOLUME: <strong className="text-emerald-700">38.2M SHARES</strong></span>
        </div>
      </div>

      {/* Right Column: Live NLP News Catalysts Feed */}
      <div className="lg:col-span-6 border border-gray-200 bg-white p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-[#0A0A0D] font-bold flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            REAL-TIME CORPORATE NLP CATALYST STREAM
          </span>
          <span className="text-[10px] text-gray-400">FIN-BERT V2</span>
        </div>

        <div className="space-y-2.5">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-[#F8FAFC] border border-gray-200 hover:border-gray-400 rounded-xl transition-all shadow-xs"
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                <span className="text-emerald-700 font-bold">{item.impactTicker}</span>
                <span>{item.source} · {item.time}</span>
              </div>
              <p className="text-[11px] text-[#0A0A0D] font-sans font-medium leading-snug">
                {item.headline}
              </p>
              <div className="flex items-center gap-2 mt-2 pt-1 border-t border-gray-100 text-[9px]">
                <span
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    item.sentiment === 'BULLISH'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.sentiment} ({(item.score * 100).toFixed(0)}%)
                </span>
                <span className="text-gray-400 font-sans">Directional shock anticipated in next 15-min candle</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
