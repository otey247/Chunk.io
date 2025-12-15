
import React, { useState } from 'react';
import { Play, Layers, Target, Settings, Database, Sparkles, RefreshCw, BarChart2 } from 'lucide-react';
import { Chunk } from '../types';

interface RagLabProps {
  query: string;
  setQuery: (q: string) => void;
  onRunRetrieval: () => void;
  onGenerateEmbeddings: () => void;
  loading: boolean;
  embeddingsGenerated: boolean;
  alpha: number;
  setAlpha: (n: number) => void;
  useHyDE: boolean;
  setUseHyDE: (b: boolean) => void;
  useReranker: boolean;
  setUseReranker: (b: boolean) => void;
  chunks: Chunk[];
}

export const RagLab: React.FC<RagLabProps> = ({
  query,
  setQuery,
  onRunRetrieval,
  onGenerateEmbeddings,
  loading,
  embeddingsGenerated,
  alpha,
  setAlpha,
  useHyDE,
  setUseHyDE,
  useReranker,
  setUseReranker,
  chunks
}) => {
  const totalTokens = chunks.reduce((acc, c) => acc + c.tokenCount, 0);
  const CONTEXT_WINDOWS = [
    { label: 'GPT-4 (8k)', size: 8192 },
    { label: 'Claude 3 (200k)', size: 200000 },
    { label: 'Gemini 1.5 (1M)', size: 1000000 },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] transition-colors duration-300 relative">
      <div className="p-6 border-b border-black/5 dark:border-white/5">
        <h2 className="text-xl font-display font-bold text-swiss-charcoal dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-electric-indigo" />
          RAG Laboratory
        </h2>
        <p className="text-sm text-slate-500 mt-1">Simulate retrieval, adjust weights, and analyze semantic density.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* 1. Embedding Status */}
        <section className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-black/5 dark:border-white/5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Database className="w-3 h-3" /> Vector Index
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${embeddingsGenerated ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {embeddingsGenerated ? 'INDEXED' : 'NOT INDEXED'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Generate embeddings for all {chunks.length} chunks to enable semantic search simulations.
          </p>
          <button 
            onClick={onGenerateEmbeddings}
            disabled={loading || embeddingsGenerated}
            className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              embeddingsGenerated 
                ? 'bg-emerald-500/10 text-emerald-600 cursor-default'
                : 'bg-electric-indigo text-white hover:bg-electric-accent shadow-lg shadow-indigo-500/20'
            }`}
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
            {loading ? 'Processing...' : embeddingsGenerated ? 'Embeddings Ready' : 'Generate Embeddings'}
          </button>
        </section>

        {/* 2. Retrieval Control */}
        <section className={`transition-opacity duration-300 ${!embeddingsGenerated ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
            <Settings className="w-3 h-3" /> Retrieval Config
          </h3>
          
          <div className="space-y-6">
            {/* Hybrid Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Hybrid Search Weight</span>
                <span className="text-xs font-mono text-electric-indigo">
                  {alpha === 1 ? 'Semantic Only' : alpha === 0 ? 'Keyword Only' : `${(alpha * 100).toFixed(0)}% Vector`}
                </span>
              </div>
              <div className="relative h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-electric-indigo rounded-full" 
                  style={{ width: `${alpha * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-electric-indigo rounded-full shadow-sm pointer-events-none transition-all"
                  style={{ left: `${alpha * 100}%`, transform: `translate(-50%, -50%)` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                <span>Keyword (BM25)</span>
                <span>Vector (Cosine)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setUseReranker(!useReranker)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  useReranker 
                  ? 'bg-electric-indigo/10 border-electric-indigo text-electric-indigo' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <div className="text-[10px] uppercase font-bold mb-1">Reranker Sim</div>
                <div className="text-xs">
                  {useReranker ? 'Active (Cross-Encoder)' : 'Disabled'}
                </div>
              </button>
              
              <button 
                onClick={() => setUseHyDE(!useHyDE)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  useHyDE 
                  ? 'bg-electric-indigo/10 border-electric-indigo text-electric-indigo' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <div className="text-[10px] uppercase font-bold mb-1">HyDE</div>
                <div className="text-xs">
                  {useHyDE ? 'Active' : 'Disabled'}
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Query Execution */}
        <section className={`transition-opacity duration-300 ${!embeddingsGenerated ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="relative">
             <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onRunRetrieval()}
                placeholder="Enter a test query..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-slate-800 dark:text-white focus:border-electric-indigo outline-none transition-colors"
             />
             <button 
                onClick={onRunRetrieval}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-electric-indigo text-white rounded-md hover:bg-electric-accent disabled:opacity-50 transition-colors"
             >
                <Play className="w-4 h-4 fill-current" />
             </button>
          </div>
        </section>

        {/* 4. Context Window Simulator */}
        <section>
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2">
            <BarChart2 className="w-3 h-3" /> Context Fit Simulator
          </h3>
          <div className="space-y-4">
             {CONTEXT_WINDOWS.map((cw) => {
                const percentage = Math.min(100, (totalTokens / cw.size) * 100);
                const isOver = totalTokens > cw.size;
                return (
                  <div key={cw.label}>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                      <span>{cw.label}</span>
                      <span className={isOver ? 'text-red-500' : 'text-emerald-500'}>
                        {percentage.toFixed(2)}% Used
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                    <div className="text-[9px] text-right text-slate-400 mt-0.5 font-mono">
                      {totalTokens.toLocaleString()} / {cw.size.toLocaleString()} tokens
                    </div>
                  </div>
                )
             })}
          </div>
        </section>

      </div>
    </div>
  );
};
