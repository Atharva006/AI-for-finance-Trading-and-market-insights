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
    <div className="w-full bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs font-mono">
      <div className="flex flex-col md:flex-row md:items-center gap-space-sm">
        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">psychology</span>
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
          className="flex-1 bg-surface-container-low rounded-lg px-space-md py-space-sm font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:outline-none focus:bg-surface-card border border-border-subtle"
        />
        <button
          onClick={() => handleExecutePrompt(promptText)}
          disabled={isAiLoading}
          className="inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shrink-0 cursor-pointer shadow-xs disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isAiLoading ? 'refresh' : 'auto_awesome'}
          </span>
          <span>{isAiLoading ? 'Synthesizing...' : 'Compile Prompt'}</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 font-mono-sm text-mono-sm">
        <span className="text-[10px] text-text-muted uppercase font-bold shrink-0">Try Hypotheses:</span>
        {PRESET_AI_PROMPTS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPromptText(preset.prompt);
              handleExecutePrompt(preset.prompt);
            }}
            className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-[11px] text-on-surface font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
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
