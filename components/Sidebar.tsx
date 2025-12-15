import React from 'react';
import { Layers, Settings, Zap, Info, Box } from 'lucide-react';
import { STRATEGIES } from '../constants';
import { StrategyType } from '../types';

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
  setRegexPattern
}) => {
  const currentStrategyInfo = STRATEGIES.find(s => s.name === selectedStrategy);

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

        <div>
          <h2 className="text-slate-500 font-semibold mb-3 px-2 text-xs uppercase tracking-wider">Configuration</h2>
          <div className="glass-panel rounded-xl p-4 space-y-5">
            {/* Common Configs */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-slate-300 font-medium text-xs">Target Size (chars)</label>
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
                <label className="text-slate-300 font-medium text-xs">Overlap (chars)</label>
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
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-slate-300 font-medium text-xs">Min Chunk Size</label>
                <span className="text-electric-indigo font-mono text-xs">{minChunkSize}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={minChunkSize}
                onChange={(e) => setMinChunkSize(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-electric-indigo"
              />
              <p className="text-[10px] text-slate-500 mt-1">Merges small chunks with neighbors</p>
            </div>

            {/* Strategy Specific Configs */}
            {selectedStrategy === StrategyType.Regex && (
               <div>
                  <label className="text-slate-300 font-medium text-xs mb-2 block">Custom Regex Pattern</label>
                  <input 
                    type="text" 
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-electric-indigo font-mono focus:border-electric-indigo outline-none"
                    placeholder="\n\n"
                  />
               </div>
            )}
            
            {selectedStrategy === StrategyType.Recursive && (
               <div>
                  <label className="text-slate-300 font-medium text-xs mb-2 block">Separators (Auto)</label>
                  <div className="flex gap-1 flex-wrap">
                    {["\\n\\n", "\\n", "space"].map(sep => (
                        <span key={sep} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 font-mono border border-slate-700">{sep}</span>
                    ))}
                  </div>
               </div>
            )}
          </div>
        </div>

        {currentStrategyInfo && (
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
             <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                <h3 className="text-slate-200 font-semibold">About {currentStrategyInfo.name.split(' ')[0]}</h3>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed mb-3">
               {currentStrategyInfo.description}
             </p>
             <div className="space-y-2">
                <div>
                   <span className="text-[10px] text-emerald-400 font-bold uppercase">Best For</span>
                   <p className="text-xs text-slate-400">{currentStrategyInfo.bestFor.join(', ')}</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};