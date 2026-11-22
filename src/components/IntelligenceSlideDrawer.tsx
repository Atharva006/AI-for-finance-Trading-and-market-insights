import React, { useState, useEffect, useRef } from 'react';
import {
  intelligenceService,
  ChatMessage,
  INTELLIGENCE_PRESETS,
  IntelligencePreset,
} from '../services/intelligenceService';

interface IntelligenceSlideDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const IntelligenceSlideDrawer: React.FC<IntelligenceSlideDrawerProps> = ({
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => intelligenceService.getMessages());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages(intelligenceService.getMessages());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setIsLoading(true);

    try {
      await intelligenceService.sendMessage(text);
      setMessages(intelligenceService.getMessages());
    } catch (err: any) {
      console.error('Slide drawer intelligence error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: IntelligencePreset) => {
    handleSendMessage(preset.prompt);
  };

  return (
    <>
      {/* Floating Trigger Pill on bottom-right edge */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-[#021810] border border-[#10B981] text-[#10B981] font-mono text-xs font-extrabold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
          title="Open Intelligence Conversational Assistant"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="material-symbols-outlined text-[18px]">psychology</span>
          <span>INTELLIGENCE AI</span>
        </button>
      )}

      {/* Slide-in Drawer Container */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-surface-card border-l border-border-subtle shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-border-subtle bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#021810] border border-[#10B981]/50 flex items-center justify-center p-1.5 shadow-xs">
                <span className="material-symbols-outlined text-[#10B981] text-[18px]">
                  psychology
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-extrabold uppercase text-on-surface">
                    ALLTRA INTELLIGENCE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  Geopolitical &amp; Market Pattern Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  intelligenceService.clearMessages();
                  setMessages([]);
                }}
                className="p-1.5 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Reset Context"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-text-muted hover:text-bearish hover:bg-bearish-tint transition-colors cursor-pointer"
                title="Close drawer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#021810] border border-[#10B981]/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#10B981] text-2xl">chat</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-mono font-bold text-on-surface uppercase text-xs">
                    Live Conversational Intelligence
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed max-w-xs">
                    Chat directly about current war news (Iran-Israel, Red Sea), crude oil price shocks, and stock impacts on Reliance, ONGC, or NIFTY 50.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2 text-left">
                  <span className="text-[10px] font-mono text-text-muted uppercase font-bold block">
                    Quick Scenario Starters:
                  </span>
                  {INTELLIGENCE_PRESETS.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className="w-full p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle text-left transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[#10B981] text-sm shrink-0">
                        {p.icon}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-on-surface truncate">
                        {p.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col gap-1 ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl p-3 text-[11px] leading-relaxed max-w-[90%] select-text ${
                      m.role === 'user'
                        ? 'bg-primary text-on-primary font-medium rounded-tr-xs shadow-xs'
                        : 'bg-surface-container-low border border-border-subtle text-on-surface rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-border-subtle/50 font-mono text-[9px] text-[#10B981] font-bold uppercase">
                        <span className="w-1 h-1 rounded-full bg-bullish" />
                        <span>ALLTRA INTELLIGENCE</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap space-y-1.5">{m.content}</div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-container-low border border-border-subtle text-xs font-mono text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-bullish animate-ping" />
                <span>Reasoning on 120B LPU...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 border-t border-border-subtle bg-surface-container-low flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[10px]">
            {INTELLIGENCE_PRESETS.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className="px-2 py-0.5 rounded-full bg-surface-card border border-border-subtle text-text-secondary hover:text-on-surface whitespace-nowrap cursor-pointer shrink-0"
              >
                {p.title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 border-t border-border-subtle bg-surface-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about news, crude oil, ONGC, NIFTY..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-border-subtle focus:border-[#10B981] text-xs text-on-surface placeholder:text-text-muted outline-hidden"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 cursor-pointer transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
