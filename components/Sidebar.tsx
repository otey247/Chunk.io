import React, { useState } from 'react';
import { Settings, Zap, Info, Box, Brain, DollarSign, ArrowRightLeft, GitFork, Download, HelpCircle } from 'lucide-react';
import { STRATEGIES } from '../constants';
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
  // Parent Child
  enableParentChild: boolean;
  setEnableParentChild: (b: boolean) => void;
  parentChunkSize: number;
  setParentChunkSize: (n: number) => void;
  // Comparison
  compareMode: boolean;
  toggleCompareMode: () => void;
  // Export
  onOpenExport: () => void;
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
  estimatedCost,
  enableParentChild,
  setEnableParentChild,
  parentChunkSize,
  setParentChunkSize,
  compareMode,
  toggleCompareMode,
  onOpenExport
}) => {
  const currentStrategyInfo = STRATEGIES.find(s => s.name === selectedStrategy);
  const isAIStrategy = currentStrategyInfo?.requiresAI;

  const [tooltip, setTooltip] = useState<{x: number, y: number, strategy: typeof STRATEGIES[0]} | null>(null);

  const toggleEnrichment = (key: keyof typeof enrichment) => {
    setEnrichment({ ...enrichment, [key]: !enrichment[key] });
  };

  return (
    <>
      <div className="h-full flex flex-col border-r border-black/5 dark:border-white/10 bg-swiss-offwhite dark:bg-[#0f172a] text-sm overflow-y-auto transition-colors duration-300 scrollbar-thin">
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <h1 className="font-display font-bold text-2xl tracking-tight text-swiss-charcoal dark:text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-electric-indigo" />
            Chunk.io
          </h1>
          <div className="flex justify-between items-center mt-2">
             <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-medium">RAG Architect</p>
             <button onClick={onOpenExport} className="text-slate-400 hover:text-electric-indigo transition-colors" title="Export">
               <Download className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          
          {/* Comparison Toggle */}
          <button 
            onClick={toggleCompareMode}
            className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${
              compareMode 
              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
              : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-electric-indigo/50'
            }`}
          >
            <ArrowRightLeft className="w-3 h-3" /> {compareMode ? 'Exit Diff View' : 'Compare Strategies'}
          </button>

          {/* Strategy Selector */}
          <div id="strategy-selector">
            <h2 className="text-slate-500 dark:text-slate-500 font-semibold mb-3 px-2 text-xs uppercase tracking-wider">Strategy</h2>
            <div className="space-y-1">
              {STRATEGIES.map((s) => (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => onSelectStrategy(s.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      selectedStrategy === s.name
                        ? 'bg-electric-indigo/10 text-electric-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)] border border-electric-indigo/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                       <span className="font-medium truncate">{s.name.replace(' Chunking', '').replace(' Splitter', '')}</span>
                       {s.requiresAI && (
                         <Zap className={`w-3 h-3 shrink-0 ${selectedStrategy === s.name ? 'text-electric-indigo' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'}`} />
                       )}
                    </div>
                  </button>
                  
                  {/* Tooltip Icon Trigger */}
                  <div 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 cursor-help hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors z-10"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.right + 12,
                        y: rect.top - 20,
                        strategy: s
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <HelpCircle className={`w-3.5 h-3.5 ${selectedStrategy === s.name ? 'text-electric-indigo' : 'text-slate-400'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Configuration */}
          <div id="param-controls">
            <h2 className="text-slate-500 font-semibold mb-3 px-2 text-xs uppercase tracking-wider">Parameters</h2>
            <div className="glass-panel rounded-xl p-4 space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-slate-600 dark:text-slate-300 font-medium text-xs">Target Size</label>
                  <span className="text-electric-indigo font-mono text-xs">{chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="4000"
                  step="50"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-indigo"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-slate-600 dark:text-slate-300 font-medium text-xs">Overlap</label>
                  <span className="text-electric-indigo font-mono text-xs">{overlap}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={overlap}
                  onChange={(e) => setOverlap(Number(e.target.value))}
                  className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-indigo"
                />
              </div>

              {selectedStrategy === StrategyType.Regex && (
                 <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-xs mb-2 block">Regex Pattern</label>
                    <input 
                      type="text" 
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-electric-indigo font-mono focus:border-electric-indigo outline-none transition-colors"
                    />
                 </div>
              )}
              
              {/* Parent-Child Indexing */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                     <GitFork className="w-3 h-3" /> Parent-Child
                   </span>
                   <button
                      onClick={() => setEnableParentChild(!enableParentChild)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${
                        enableParentChild ? 'bg-electric-indigo' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                         enableParentChild ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                </div>
                
                {enableParentChild && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between mb-2">
                          <label className="text-slate-600 dark:text-slate-300 font-medium text-xs">Parent Size</label>
                          <span className="text-electric-indigo font-mono text-xs">{parentChunkSize}</span>
                      </div>
                      <input
                          type="range"
                          min="500"
                          max="8000"
                          step="100"
                          value={parentChunkSize}
                          onChange={(e) => setParentChunkSize(Number(e.target.value))}
                          className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-indigo"
                      />
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                          Create large "Parent" chunks for context, then split them into smaller chunks for retrieval.
                      </p>
                    </div>
                )}
              </div>
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
                <label className="text-slate-600 dark:text-slate-300 font-medium text-xs mb-2 block">Model</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-2 text-xs text-slate-800 dark:text-white focus:border-electric-indigo outline-none transition-colors"
                >
                  <option value={GeminiModel.Flash}>Gemini 2.5 Flash (Fast)</option>
                  <option value={GeminiModel.Lite}>Gemini Flash Lite (Cheapest)</option>
                  <option value={GeminiModel.Pro}>Gemini 1.5 Pro (Best Quality)</option>
                </select>
              </div>

              {/* Prompt Playground (Only for AI Strategies) */}
              {isAIStrategy && (
                 <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-xs mb-2 block">System Prompt</label>
                    <textarea 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-2 text-xs text-slate-600 dark:text-slate-300 font-mono focus:border-electric-indigo outline-none resize-none transition-colors"
                      placeholder="Override the default chunking instructions..."
                    />
                 </div>
              )}

              {/* Enrichment Toggles */}
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium text-xs mb-3 block">Enrichment (Post-Process)</label>
                <div className="space-y-2">
                  {[
                    { id: 'summarize', label: 'Summarization' },
                    { id: 'qa', label: 'Generate Q&A' },
                    { id: 'label', label: 'Auto-Labeling' },
                    { id: 'hallucination', label: 'Hallucination Check' },
                  ].map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between group">
                      <span className="text-slate-500 dark:text-slate-400 text-xs group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">{opt.label}</span>
                      <button
                        onClick={() => toggleEnrichment(opt.id as any)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          enrichment[opt.id as keyof typeof enrichment] ? 'bg-electric-indigo' : 'bg-slate-300 dark:bg-slate-700'
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
              <div className="bg-white dark:bg-slate-900 rounded p-2 flex items-center justify-between border border-black/5 dark:border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Est. Cost
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      ${estimatedCost.toFixed(5)}
                  </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fixed Tooltip Portal */}
      {tooltip && (
        <div 
          className="fixed z-50 w-72 p-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: Math.min(window.innerWidth - 300, tooltip.x), // Prevent right overflow
            top: Math.min(window.innerHeight - 200, tooltip.y)  // Prevent bottom overflow
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-sm text-electric-indigo">{tooltip.strategy.name.replace(' Chunking', '').replace(' Splitter', '')}</span>
            {tooltip.strategy.requiresAI && <Zap className="w-3 h-3 text-amber-500" />}
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{tooltip.strategy.description}</p>
          
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Best For</span>
              <div className="flex flex-wrap gap-1">
                {tooltip.strategy.bestFor.map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-[10px]">{t}</span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Avoid For</span>
              <div className="flex flex-wrap gap-1">
                {tooltip.strategy.worstFor.slice(0, 2).map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
