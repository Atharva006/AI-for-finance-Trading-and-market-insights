import React, { useState, useEffect, useRef } from 'react';
import {
  intelligenceService,
  ChatMessage,
  INTELLIGENCE_PRESETS,
  IntelligencePreset,
} from '../services/intelligenceService';

export const IntelligenceView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => intelligenceService.getMessages());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setIsLoading(true);

    try {
      await intelligenceService.sendMessage(text);
      setMessages(intelligenceService.getMessages());
    } catch (err: any) {
      console.error('Intelligence message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: IntelligencePreset) => {
    handleSendMessage(preset.prompt);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversation history with ALLTRA Intelligence?')) {
      intelligenceService.clearMessages();
      setMessages([]);
    }
  };

  const categories = ['All', 'Geopolitics', 'Stocks & NIFTY', 'Macro & Commodities', 'Portfolio Risk'];
  const filteredPresets =
    selectedCategory === 'All'
      ? INTELLIGENCE_PRESETS
      : INTELLIGENCE_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="w-full flex-1 flex flex-col bg-background text-on-background font-sans select-none overflow-hidden max-w-7xl mx-auto py-2">
      {/* ── TOP INTELLIGENCE BANNER & TELEMETRY ── */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 sm:p-6 mb-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#021810] border border-[#10B981]/50 flex items-center justify-center p-2 shadow-sm shadow-[#10B981]/20 shrink-0">
            <span className="material-symbols-outlined text-[#10B981] text-2xl animate-pulse">
              psychology
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base sm:text-lg font-extrabold uppercase text-on-surface tracking-wider">
                ALLTRA INTELLIGENCE
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-bullish-tint text-bullish font-mono text-[10px] font-bold border border-bullish/30">
                120B LPU ACTIVE
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 max-w-2xl">
              Conversational Geopolitical, Foreign Affairs &amp; Quantitative Market Intelligence. Analyzes historical patterns, crisis transmission, and probability corridors across NIFTY 50 and global assets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-muted hover:text-on-surface border border-border-subtle transition-colors cursor-pointer"
            title="Clear context window and conversation history"
          >
            <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
            <span>Reset Context</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-border-subtle flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bullish animate-ping" />
            <span className="text-[11px] font-bold text-on-surface">MEM: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ── MAIN INTERACTIVE CHAT VIEWPORT ── */}
      <div className="flex-1 bg-surface-card border border-border-subtle rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-4 max-w-3xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-[#021810] border border-[#10B981]/40 flex items-center justify-center p-3 shadow-md shadow-[#10B981]/25">
                <span className="material-symbols-outlined text-[#10B981] text-3xl">hub</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold font-mono text-on-surface uppercase tracking-wide">
                  Direct Geopolitical &amp; Market Intelligence Conversation
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xl mx-auto">
                  Ask anything about ongoing foreign affairs (e.g. Iran-Israel tensions, Red Sea shipping routes, US tariffs), macroeconomic shifts (crude oil shocks, interest rate cycles, FII/DII liquidity), or Indian stock patterns (ONGC vs Asian Paints, BEL defense capex, NIFTY 50 supports).
                </p>
              </div>

              {/* Preset Intelligence Categories */}
              <div className="w-full pt-2">
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-text-muted hover:text-on-surface border border-border-subtle'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  {filteredPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle hover:border-[#10B981]/40 transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#10B981] text-lg">
                            {preset.icon}
                          </span>
                          <span className="font-mono text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                            {preset.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-card border border-border-subtle text-text-muted">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                        {preset.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-4xl ${
                  msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#021810] border border-[#10B981]/50 flex items-center justify-center p-1.5 shrink-0 shadow-xs mt-1">
                    <span className="material-symbols-outlined text-[#10B981] text-[16px]">
                      psychology
                    </span>
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed max-w-2xl select-text ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary font-medium rounded-tr-xs shadow-xs'
                      : 'bg-surface-container-low border border-border-subtle text-on-surface rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2 mb-2 font-mono text-[10px] text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-bullish" />
                        <span className="font-bold text-[#10B981]">ALLTRA INTELLIGENCE</span>
                      </div>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1 uppercase font-mono">
                    U
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 max-w-2xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-[#021810] border border-[#10B981]/50 flex items-center justify-center p-1.5 shrink-0 shadow-xs mt-1">
                <span className="material-symbols-outlined text-[#10B981] text-[16px] animate-spin">
                  sync
                </span>
              </div>
              <div className="rounded-2xl p-4 bg-surface-container-low border border-border-subtle text-on-surface rounded-tl-xs shadow-2xs text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bullish animate-ping" />
                <span className="text-text-secondary">Synthesizing geopolitical &amp; market intelligence on 120B LPU...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-container-low flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-[11px]">
          <span className="text-text-muted shrink-0 text-[10px] uppercase font-bold">Quick Prompts:</span>
          {INTELLIGENCE_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-full bg-surface-card hover:bg-surface-container text-text-secondary hover:text-on-surface border border-border-subtle whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-surface-card border-t border-border-subtle">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about live news, Iran-Israel war impact, crude oil, NIFTY 50 support levels..."
                disabled={isLoading}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-surface-container-low border border-border-subtle focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-xs font-sans text-on-surface placeholder:text-text-muted outline-hidden transition-all"
              />
              <span className="absolute right-3 material-symbols-outlined text-text-muted text-[18px]">
                chat
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-40 cursor-pointer active:scale-95 shrink-0"
            >
              <span>SEND</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span>Powered by ALLTRA LPU Reasoning Engine</span>
            <span>Historical pattern analysis · Zero reckless gambling tips · Epistemic humility</span>
          </div>
        </div>
      </div>
    </div>
  );
};
