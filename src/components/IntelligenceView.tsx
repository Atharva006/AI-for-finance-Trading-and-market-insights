import React, { useState, useEffect, useRef } from 'react';
import {
  intelligenceService,
  ChatMessage,
  INTELLIGENCE_PRESETS,
  IntelligencePreset,
} from '../services/intelligenceService';
import { Sparkles, ArrowUp, Plus, RefreshCw, Send, Compass, Shield, TrendingUp, HelpCircle } from 'lucide-react';
import { getStoredLocalUser } from '../services/supabaseAuth';

export const IntelligenceView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => intelligenceService.getMessages());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUser = getStoredLocalUser();
  const userName = currentUser?.name?.split(' ')[0] || 'Atharva';

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

  const handleNewChat = () => {
    intelligenceService.clearMessages();
    setMessages([]);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPills = [
    { label: 'Reasoning', prompt: 'Analyze how current Middle East tensions impact crude oil prices and Indian inflation.' },
    { label: 'Macro News', prompt: 'What are the key foreign affairs and central bank developments affecting NIFTY 50 this week?' },
    { label: 'Portfolio Risk', prompt: 'How should an equity portfolio manage drawdown during geopolitical escalation?' },
    { label: 'Market Regimes', prompt: 'Examine historical correlations between US Dollar index (DXY) and Indian IT/Banking sectors.' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans select-none min-h-[calc(100vh-5rem)] max-w-5xl mx-auto px-4 py-3">
      {/* ── Top Minimal Header Bar ── */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-xs font-semibold text-[#0F172A]">Alltra Intelligence 4o</span>
            <span className="text-[10px] text-[#94A3B8]">▾</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-medium hover:bg-[#1E293B] transition-colors shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Chat</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {userName.charAt(0)}
          </div>
        </div>
      </div>

      {/* ── Content Viewport ── */}
      {messages.length === 0 ? (
        // Minimalist Welcome State (Matching user reference UI: soft glowing pearl + centered prompt card)
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 max-w-2xl mx-auto w-full">
          {/* Soft Glowing Pearl / Orb */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#93C5FD] via-[#C4B5FD] to-[#E0E7FF] shadow-lg shadow-blue-200/50 flex items-center justify-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-xs" />
            </div>
          </div>

          {/* Clean Greeting */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-1">
            Good Morning, {userName}
          </h2>
          <p className="text-lg sm:text-xl font-medium text-[#475569] mb-8">
            How Can I <span className="text-[#2563EB] font-semibold">Assist You</span> Today?
          </p>

          {/* Centered Floating Prompt Card */}
          <div className="w-full bg-white rounded-2xl border border-[#CBD5E1] shadow-md p-4 flex flex-col gap-3 transition-all focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="✦ Initiate a query or send a command to the AI..."
              className="w-full resize-none text-xs sm:text-sm font-sans text-[#0F172A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
              {/* Quick Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleSendMessage('Perform deep reasoning on how current Middle East tensions impact crude oil prices and Indian inflation.')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] text-[11px] text-[#475569] hover:text-[#1E40AF] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#2563EB]" />
                  <span>Reasoning</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Create a quantitative market hedge strategy for high volatility regimes.')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] text-[11px] text-[#475569] hover:text-[#1E40AF] transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3 text-[#10B981]" />
                  <span>Create Strategy</span>
                </button>
                <button
                  onClick={() => handleSendMessage('Initiate deep research on historical correlation between US Dollar index (DXY) and Indian IT/Banking sectors.')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] text-[11px] text-[#475569] hover:text-[#1E40AF] transition-colors cursor-pointer"
                >
                  <Compass className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Deep Research</span>
                </button>
              </div>

              {/* Submit & Token Counter */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[10px] font-mono text-[#64748B]">
                  {inputText.length}
                </span>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputText.trim()}
                  className="w-8 h-8 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#CBD5E1] text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Active Chat Stream
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 py-2 px-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#2563EB] text-white font-medium rounded-tr-xs'
                      : 'bg-white border border-[#E2E8F0] text-[#0F172A] shadow-xs rounded-tl-xs whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    {userName.charAt(0)}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-xs text-[#64748B] flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span>Synthesizing market context...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Floating Input Card */}
          <div className="pt-3">
            <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm p-3 flex flex-col gap-2 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about live news, market patterns, crude oil, or NIFTY 50..."
                className="w-full resize-none text-xs sm:text-sm font-sans text-[#0F172A] placeholder:text-[#94A3B8] outline-none bg-transparent"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {quickPills.slice(0, 3).map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(pill.prompt)}
                      className="px-2 py-0.5 rounded-md bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[10px] text-[#64748B] hover:text-[#1E40AF] transition-colors cursor-pointer shrink-0"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputText.trim()}
                  className="w-7 h-7 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#CBD5E1] text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
