import React from 'react';
import { Layers, Settings, Zap, Info, Box, Brain, DollarSign } from 'lucide-react';
import { STRATEGIES, MODEL_PRICING } from '../constants';
import { StrategyType, GeminiModel } from '../types';

interface SidebarProps {
  selectedStrategy: StrategyType;
  onSelectStrategy: (s: StrategyType) => void;
  chunkSize: number;
  setChunkSize: (n: number) => void;
  overlap: number;
  setOverlap: (n: number) => void;
  minChunkSize: number;
  setMinChunkSize: (n: number) => void;
  regexPattern: string;
  setRegexPattern: (s: string) => void;
  // New AI props
  selectedModel: GeminiModel;
  setSelectedModel: (m: GeminiModel) => void;
  customPrompt: string;
  setCustomPrompt: (s: string) => void;
  enrichment: {
    summarize: boolean;
    qa: boolean;
    label: boolean;
    hallucination: boolean;
  };
  setEnrichment: (e: any) => void;
  estimatedCost: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedStrategy,
  onSelectStrategy,
  chunkSize,
  setChunkSize,
  overlap,
  setOverlap,
  minChunkSize,
  setMinChunkSize,
  regexPattern,
  setRegexPattern,
  selectedModel,
  setSelectedModel,
  customPrompt,
  setCustomPrompt,
  enrichment,
  setEnrichment,
  estimatedCost
}) => {
  const currentStrategyInfo = STRATEGIES.find(s => s.name === selectedStrategy);
  const isAIStrategy = currentStrategyInfo?.requiresAI;

  const toggleEnrichment = (key: keyof typeof enrichment) => {
    setEnrichment({ ...enrichment, [key]: !enrichment[key] });
  };

  return (
    <div className="h-full flex flex-col border-r border-white/10 bg-[#0f172a] text-sm overflow-y-auto">
      <div className="p-6 border-b border-white/5">
        <h1 className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-2">
          <Box className="w-6 h-6 text-electric-indigo" />
          Chunk.io
        </h1>
        <p className="text-slate-400 mt-2 text-xs uppercase tracking-widest font-medium">RAG Architect</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Strategy Selector */}
        <div>
          <h2 className="text-slate-500 font-semibold mb-3 px-2 text-xs uppercase tracking-wider">Strategy</h2>
          <div className="space-y-1">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectStrategy(s.name)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                  selectedStrategy === s.name
                    ? 'bg-electric-indigo/10 text-electric-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)] border border-electric-indigo/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="font-medium truncate">{s.name.replace(' Chunking', '').replace(' Splitter', '')}</span>
                {s.requiresAI && (
                  <Zap className={`w-3 h-3 ${selectedStrategy === s.name ? 'text-electric-indigo' : 'text-slate-600 group-hover:text-slate-400'}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* AI Configuration Section */}
        <div>
          <h2 className="text-slate-500 font-semibold mb-3 px-2 text-xs uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-3 h-3" /> AI Configuration
          </h2>
          <div className="glass-panel rounded-xl p-4 space-y-5 border-electric-indigo/20">
            {/* Model Switcher */}
            <div>
              <label className="text-slate-300 font-medium text-xs mb-2 block">Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-xs text-white focus:border-electric-indigo outline-none"
              >
                <option value={GeminiModel.Flash}>Gemini 2.5 Flash (Fast)</option>
                <option value={GeminiModel.Lite}>Gemini Flash Lite (Cheapest)</option>
                <option value={GeminiModel.Pro}>Gemini 1.5 Pro (Best Quality)</option>
              </select>
            </div>

            {/* Prompt Playground (Only for AI Strategies) */}
            {isAIStrategy && (
               <div>
                  <label className="text-slate-300 font-medium text-xs mb-2 block">System Prompt</label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full h-24 bg-slate-900 border border-slate-700 rounded px-2 py-2 text-xs text-slate-300 font-mono focus:border-electric-indigo outline-none resize-none"
                    placeholder="Override the default chunking instructions..."
                  />
               </div>
            )}

            {/* Enrichment Toggles */}
            <div>
              <label className="text-slate-300 font-medium text-xs mb-3 block">Enrichment (Post-Process)</label>
              <div className="space-y-2">
                {[
                  { id: 'summarize', label: 'Summarization' },
                  { id: 'qa', label: 'Generate Q&A' },
                  { id: 'label', label: 'Auto-Labeling' },
                  { id: 'hallucination', label: 'Hallucination Check' },
                ].map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between group">
                    <span className="text-slate-400 text-xs group-hover:text-slate-200 transition-colors">{opt.label}</span>
                    <button
                      onClick={() => toggleEnrichment(opt.id as any)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${
                        enrichment[opt.id as keyof typeof enrichment] ? 'bg-electric-indigo' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                         enrichment[opt.id as keyof typeof enrichment] ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Estimator */}
            <div className="bg-slate-900 rounded p-2 flex items-center justify-between border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Est. Cost
                </span>
                <span className="text-emerald-400 font-mono text-xs">
                    ${estimatedCost.toFixed(5)}
                </span>
            </div>
          </div>
        </div>

        {/* Basic Configuration */}
        <div>
          <h2 className="text-slate-500 font-semibold mb-3 px-2 text-xs uppercase tracking-wider">Parameters</h2>
          <div className="glass-panel rounded-xl p-4 space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-slate-300 font-medium text-xs">Target Size</label>
                <span className="text-electric-indigo font-mono text-xs">{chunkSize}</span>
              </div>
              <input
                type="range"
                min="50"
                max="4000"
                step="50"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-indigo"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-slate-300 font-medium text-xs">Overlap</label>
                <span className="text-electric-indigo font-mono text-xs">{overlap}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={overlap}
                onChange={(e) => setOverlap(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-indigo"
              />
            </div>

            {selectedStrategy === StrategyType.Regex && (
               <div>
                  <label className="text-slate-300 font-medium text-xs mb-2 block">Regex Pattern</label>
                  <input 
                    type="text" 
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-electric-indigo font-mono focus:border-electric-indigo outline-none"
                  />
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};