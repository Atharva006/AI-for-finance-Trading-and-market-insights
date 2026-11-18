import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, Bot, Check, Activity, Zap } from 'lucide-react';
import {
  PRESET_AI_PROMPTS,
  ParsedStrategyPrompt,
} from '../services/aiPromptParser';
import { groqGenerateStrategy } from '../services/groqApi';

interface NaturalLanguagePromptBarProps {
  onApplyParsedStrategy: (parsed: ParsedStrategyPrompt) => void;
  placeholder?: string;
}

export const NaturalLanguagePromptBar: React.FC<NaturalLanguagePromptBarProps> = ({
  onApplyParsedStrategy,
  placeholder = 'Describe your strategy in plain English (e.g. "Conservative INFY PSAR swing with 1% RPT and 100 SMA")...',
}) => {
  const [promptText, setPromptText] = useState('');
  const [lastParsed, setLastParsed] = useState<ParsedStrategyPrompt | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleExecutePrompt = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsAiLoading(true);
    try {
      const parsed = await groqGenerateStrategy(textToParse);
      setLastParsed(parsed);
      onApplyParsedStrategy(parsed);
    } catch (err) {
      console.error('AI strategy generation error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0A0A0D] flex items-center justify-center text-emerald-400 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-[#0A0A0D] tracking-tight">
            Quant AI Strategy Copilot
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Institutional Strategy Engine
          </span>
        </div>
      </div>

      {/* Input bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={promptText}
          disabled={isAiLoading}
          onChange={(e) => setPromptText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleExecutePrompt(promptText);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-3.5 pr-32 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-[#0A0A0D] disabled:opacity-60"
        />
        <button
          onClick={() => handleExecutePrompt(promptText)}
          disabled={isAiLoading}
          className="absolute right-1.5 px-3 py-1.5 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-60"
        >
          {isAiLoading ? (
            <>
              <Activity className="w-3 h-3 animate-spin text-emerald-400" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Synthesize Strategy</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <span className="text-[10px] text-gray-400 uppercase font-bold shrink-0">Try Prompts:</span>
        {PRESET_AI_PROMPTS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPromptText(preset.prompt);
              handleExecutePrompt(preset.prompt);
            }}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] text-gray-700 font-bold shrink-0 transition-colors flex items-center gap-1"
          >
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Prominent Strategy Engine Confirmation Banner */}
      {lastParsed && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-transparent border border-emerald-300 text-emerald-950 text-xs space-y-2 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                ✓ Added to Strategy Engine
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-800 shadow-xs">
              ⚡ Custom AI: {lastParsed.symbol} {lastParsed.strategyType === 'PSAR_SMA100' ? 'PSAR Trend' : lastParsed.strategyType === 'OPENING_RANGE' ? 'ORB 5M' : 'Stochastic ATR'}
            </span>
          </div>

          <div className="text-[11px] font-sans text-gray-700 leading-relaxed">
            <strong>Configured Rules:</strong> {lastParsed.explanation}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-emerald-800">
            <div className="flex items-center gap-1.5 font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Auto-selected in &quot;Active Quantitative Strategy&quot; dropdown below &amp; running on live {lastParsed.symbol} chart.</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
              Saved to System Registry
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
