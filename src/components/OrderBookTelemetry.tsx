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
    { price: 24181.00, qty: 1150, orders: 14 },
    { price: 24181.50, qty: 2400, orders: 28 },
    { price: 24182.00, qty: 3890, orders: 46 },
    { price: 24182.50, qty: 5740, orders: 67 },
    { price: 24183.00, qty: 8100, orders: 98 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBids((prev) =>
        prev.map((b) => ({
          ...b,
          qty: Math.max(800, b.qty + Math.floor((Math.random() - 0.48) * 150)),
        }))
      );
      setAsks((prev) =>
        prev.map((a) => ({
          ...a,
          qty: Math.max(700, a.qty + Math.floor((Math.random() - 0.48) * 150)),
        }))
      );
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-[#FBFBFC] border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-10 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500]">
              <Layers className="w-3.5 h-3.5" />
              <span>MICROSTRUCTURE TELEMETRY</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#64748B]">LIVE ORDER BOOK & CATALYST STREAM</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#0A0A0D] tracking-tight mt-1">
              Level 2 Depth & News Sentiment Core
            </h2>
          </div>

          <div className="text-xs font-mono text-[#64748B] flex items-center gap-3">
            <span>ENGINE LATENCY: <span className="text-[#059669] font-bold">118µs</span></span>
            <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-ping" />
            <span>NSE CO-LOCATION SIMULATOR</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left Column: Level 2 Depth Order Book */}
          <div className="lg:col-span-6 border border-gray-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-[#0A0A0D] font-bold flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
                NIFTY 50 DEPTH L2 [5-TIER SNAPSHOT]
              </span>
              <span className="text-[10px] text-[#059669] bg-[#059669]/10 px-2 py-0.5 border border-[#059669]/30 font-bold">
                OFI: +1,240 (BUY PRESSURE)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Bids */}
              <div>
                <div className="text-[10px] text-[#059669] font-bold pb-1.5 mb-2 border-b border-gray-100 flex justify-between">
                  <span>BID QTY</span>
                  <span>PRICE (₹)</span>
                </div>
                <div className="space-y-1.5 font-tabular">
                  {bids.map((b, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[11px] relative p-1 overflow-hidden"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#059669]/10 -z-0"
                        style={{ width: `${(b.qty / 10000) * 100}%` }}
                      />
                      <span className="text-[#0A0A0D] z-10 font-medium">{b.qty.toLocaleString()}</span>
                      <span className="text-[#059669] font-bold z-10">
                        {b.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asks */}
              <div>
                <div className="text-[10px] text-[#DC2626] font-bold pb-1.5 mb-2 border-b border-gray-100 flex justify-between">
                  <span>PRICE (₹)</span>
                  <span>ASK QTY</span>
                </div>
                <div className="space-y-1.5 font-tabular">
                  {asks.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[11px] relative p-1 overflow-hidden"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[#DC2626]/10 -z-0"
                        style={{ width: `${(a.qty / 10000) * 100}%` }}
                      />
                      <span className="text-[#DC2626] font-bold z-10">
                        {a.price.toFixed(2)}
                      </span>
                      <span className="text-[#0A0A0D] z-10 font-medium">{a.qty.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-[#64748B]">
              <span>SPREAD: <span className="text-[#0A0A0D] font-bold">₹0.50 (0.002%)</span></span>
              <span>MATCHED VOLUME: <span className="text-[#FF5500] font-bold">38.2M SHARES</span></span>
            </div>
          </div>

          {/* Right Column: Live News Catalyst Stream */}
          <div className="lg:col-span-6 border border-gray-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-[#0A0A0D] font-bold flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#FF5500] animate-pulse" />
                NLP CATALYST RADAR [FinBERT SCORES]
              </span>
              <span className="text-[10px] text-[#64748B] font-semibold">AUTO-VECTORIZED</span>
            </div>

            <div className="space-y-2.5 mt-4">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-gray-200 bg-[#F8FAFC] hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-1">
                    <span className="text-[#FF5500] font-bold">{item.impactTicker}</span>
                    <span className="flex items-center gap-2">
                      <span>{item.time} IST</span>
                      <span className="text-gray-300">|</span>
                      <span>{item.source}</span>
                    </span>
                  </div>

                  <p className="text-[#0A0A0D] text-[11px] leading-snug line-clamp-2 font-medium">
                    {item.headline}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-[#64748B]">SENTIMENT VECTOR:</span>
                    <span
                      className={`font-bold font-tabular flex items-center gap-1 ${
                        item.sentiment === 'BULLISH'
                          ? 'text-[#059669]'
                          : 'text-[#DC2626]'
                      }`}
                    >
                      {item.sentiment === 'BULLISH' ? '+' : ''}
                      {item.score.toFixed(2)} [{item.sentiment}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
