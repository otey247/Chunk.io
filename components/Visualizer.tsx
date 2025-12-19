
import React, { useState } from 'react';
import { Chunk, ProcessingStats } from '../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Copy, Hash, Clock, FileText, Activity, AlignLeft, Tag, HelpCircle, AlertTriangle, CheckCircle, Database, Trophy, Star, ChevronDown, ChevronUp, LayoutGrid, LayoutList, Columns, Network } from 'lucide-react';

interface VisualizerProps {
  chunks: Chunk[];
  stats: ProcessingStats | null;
  loading: boolean;
  ragMode: boolean;
  onRateChunk?: (chunkId: string, rating: number) => void;
  onInjectMetadata?: (chunkId: string) => void;
  comparisonChunks?: Chunk[];
}

export const Visualizer: React.FC<VisualizerProps> = ({ chunks, stats, loading, ragMode, onRateChunk, onInjectMetadata, comparisonChunks }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'heatmap' | 'hierarchy'>('grid');
  const [expandedEmbedding, setExpandedEmbedding] = useState<string | null>(null);
  
  const isDiffMode = !!comparisonChunks;
  const activeViewMode = isDiffMode && (viewMode === 'heatmap' || viewMode === 'hierarchy') ? 'grid' : viewMode;

  const getHeatmapColor = (chunk: Chunk) => {
    if (ragMode) {
      const score = chunk.rag?.hybridScore || 0;
      if (score === 0) return 'rgba(30, 41, 59, 0.5)';
      const alpha = Math.max(0.2, score);
      return `rgba(99, 102, 241, ${alpha})`;
    }
    // Color intensity based on token count relative to 1024
    return `hsla(245, 80%, ${Math.max(20, 90 - (chunk.tokenCount / 12))}%, 1)`;
  };

  const renderChunkCard = (chunk: Chunk, idx: number, isComparison = false) => {
    const rank = chunk.rag?.rank;
    const isTopRank = rank && rank <= 3;
    const isParent = chunk.type === 'parent';
    const isChild = chunk.type === 'child';
    
    return (
      <div 
        id={chunk.id}
        key={chunk.id} 
        className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-5 hover:border-electric-indigo/50 transition-all duration-300 hover:shadow-[0_4px_20px_-2px_rgba(99,102,241,0.1)] flex flex-col 
          ${isTopRank && ragMode ? 'border-electric-indigo shadow-md ring-1 ring-electric-indigo/20' : 'border-black/5 dark:border-white/5'}
          ${isParent ? 'border-l-4 border-l-amber-500' : ''}
          ${isComparison ? 'bg-slate-50 dark:bg-slate-950' : ''}
        `}
      >
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 flex-wrap">
                {ragMode ? (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${isTopRank ? 'bg-electric-indigo text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {isTopRank && <Trophy className="w-3 h-3"/>}
                        Rank #{rank || '-'}
                    </span>
                ) : (
                    <span className="text-[10px] font-mono text-electric-indigo bg-electric-indigo/10 px-2 py-0.5 rounded">
                        #{idx + 1}
                    </span>
                )}
                
                {isParent && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Parent</span>}
                {isChild && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase" title={`Parent: ${chunk.parentId}`}>Child</span>}

                {chunk.labels && chunk.labels.map(k => (
                    <span key={k} className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Tag className="w-2 h-2" /> {k}
                    </span>
                ))}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
            {chunk.tokenCount} tokens
            </span>
        </div>

        {ragMode && chunk.rag && (
              <div className="mb-3 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-slate-500">Score</span>
                      <span className="text-xs font-mono text-electric-indigo font-bold">{chunk.rag.hybridScore?.toFixed(4)}</span>
                  </div>
                  {onRateChunk && !isComparison && (
                    <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                            <button 
                              key={star} 
                              onClick={() => onRateChunk(chunk.id, star)}
                              className={`hover:scale-110 transition-transform ${chunk.userRelevance && chunk.userRelevance >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`}
                            >
                                <Star className="w-3 h-3 fill-current" />
                            </button>
                        ))}
                    </div>
                  )}
              </div>
        )}
        
        {chunk.hallucinationScore !== undefined && !ragMode && (
            <div className={`mb-3 flex items-start gap-2 text-[10px] p-2 rounded ${
                chunk.hallucinationScore > 7 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
            }`}>
                {chunk.hallucinationScore > 7 ? <CheckCircle className="w-3 h-3 mt-0.5"/> : <AlertTriangle className="w-3 h-3 mt-0.5"/>}
                <div>
                    <span className="font-bold">Independence Score: {chunk.hallucinationScore}/10</span>
                    <p className="opacity-80 mt-0.5 leading-tight">{chunk.hallucinationReason}</p>
                </div>
            </div>
        )}

        <div className="text-slate-600 dark:text-slate-300 text-sm font-light leading-relaxed whitespace-pre-wrap font-sans mb-4 grow font-mono text-[13px]">
            {chunk.content}
        </div>
        
        {ragMode && onInjectMetadata && !isComparison && (
              <div className="mb-2">
                  <button 
                    onClick={() => onInjectMetadata(chunk.id)}
                    className="text-[10px] text-slate-400 hover:text-electric-indigo flex items-center gap-1 transition-colors"
                  >
                      <Database className="w-3 h-3" /> {chunk.metadata ? 'Edit Metadata' : 'Inject Metadata'}
                  </button>
                  {chunk.metadata && (
                      <div className="mt-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded text-[9px] font-mono text-slate-500">
                          {JSON.stringify(chunk.metadata)}
                      </div>
                  )}
              </div>
        )}

        {ragMode && chunk.rag?.embedding && (
            <div className="mt-2 border-t border-black/5 dark:border-white/5 pt-2">
                  <button 
                    onClick={() => setExpandedEmbedding(expandedEmbedding === chunk.id ? null : chunk.id)}
                    className="flex items-center justify-between w-full text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                      <span>Vector Preview</span>
                      {expandedEmbedding === chunk.id ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                  </button>
                  {expandedEmbedding === chunk.id && (
                      <div className="mt-2 text-[9px] font-mono text-slate-500 break-all bg-slate-50 dark:bg-slate-800 p-2 rounded max-h-20 overflow-y-auto">
                          [{chunk.rag.embedding.slice(0, 10).map(n => n.toFixed(4)).join(', ')}... {chunk.rag.embedding.length} dims]
                      </div>
                  )}
            </div>
        )}

        {!ragMode && chunk.summary && (
            <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 rounded border-l-2 border-electric-indigo">
                <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3"/> Summary
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">{chunk.summary}</p>
            </div>
        )}

        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-slate-400 dark:text-slate-600">ID: {chunk.id.slice(0,8)}...</span>
            <button className="text-slate-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-[10px]" onClick={() => navigator.clipboard.writeText(chunk.content)}>
                <Copy className="w-3 h-3" /> COPY
            </button>
        </div>
      </div>
    );
  }

  const renderChunkList = (items: Chunk[], isComparison = false) => {
    if (viewMode === 'hierarchy' && !isComparison) {
       const parents = items.filter(c => c.type === 'parent');
       const orphans = items.filter(c => c.type !== 'parent' && c.type !== 'child');
       if (parents.length === 0) return renderChunkList(items, isComparison); 
       
       return (
         <div className="space-y-8">
            {parents.map((parent, pIdx) => {
                const children = items.filter(c => c.parentId === parent.id);
                return (
                   <div key={parent.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
                       <div className="mb-4">
                           <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Parent {pIdx + 1} ({parent.tokenCount} tokens)</span>
                           <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed line-clamp-3 hover:line-clamp-none cursor-pointer transition-all">{parent.content}</p>
                       </div>
                       <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                           {children.map((child, cIdx) => renderChunkCard(child, cIdx, isComparison))}
                       </div>
                   </div>
                )
            })}
            {orphans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {orphans.map((c, i) => renderChunkCard(c, i, isComparison))}
                </div>
            )}
         </div>
       )
    }

    const containerClasses = {
        grid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20",
        list: "flex flex-col gap-4 pb-20 max-w-3xl mx-auto",
        heatmap: "flex flex-wrap gap-1",
        hierarchy: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20"
    };
    
    return (
        <div className={containerClasses[activeViewMode]}>
            {items.map((chunk, idx) => renderChunkCard(chunk, idx, isComparison))}
        </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-t-2 border-electric-indigo rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-electric-accent/50 rounded-full animate-spin reverse"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-mono text-sm">CALCULATING TOKENS...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-swiss-offwhite dark:bg-[#0f172a] overflow-hidden transition-colors duration-300">
      <div className="h-auto border-b border-black/5 dark:border-white/10 p-6 flex flex-col xl:flex-row gap-6 shrink-0 bg-swiss-offwhite dark:bg-[#0f172a] z-10 shadow-sm dark:shadow-xl transition-colors duration-300">
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-swiss-charcoal dark:text-white font-display text-xl font-medium flex items-center gap-2">
                  {ragMode ? 'Retrieval Simulation' : 'Analysis Results'}
                  {isDiffMode && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Diff View</span>}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {ragMode ? 'Ranking based on current query settings' : 'Heuristic token-based segmentation'}
                </p>
            </div>
            
            <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-black/5 dark:border-white/5 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-electric-indigo text-white shadow-lg' : 'text-slate-500 hover:text-black dark:hover:text-white'}`} title="Grid">
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-electric-indigo text-white shadow-lg' : 'text-slate-500 hover:text-black dark:hover:text-white'}`} title="List">
                    <LayoutList className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('hierarchy')} className={`p-1.5 rounded-md transition-all ${viewMode === 'hierarchy' ? 'bg-electric-indigo text-white shadow-lg' : 'text-slate-500 hover:text-black dark:hover:text-white'}`} title="Hierarchy (Parent-Child)">
                    <Network className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('heatmap')} className={`p-1.5 rounded-md transition-all ${viewMode === 'heatmap' ? 'bg-electric-indigo text-white shadow-lg' : 'text-slate-500 hover:text-black dark:hover:text-white'}`} title="Heatmap">
                    <Activity className="w-4 h-4" />
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                   <Hash className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Chunks</span>
                </div>
                <div className="text-2xl font-display text-swiss-charcoal dark:text-white">
                  {stats?.totalChunks || 0}
                  {isDiffMode && <span className="text-xs text-slate-400 ml-2">vs {comparisonChunks?.length}</span>}
                </div>
             </div>
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                   <FileText className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Avg Size</span>
                </div>
                <div className="text-2xl font-display text-swiss-charcoal dark:text-white">{Math.round(stats?.avgSize || 0)} <span className="text-xs text-slate-500">tokens</span></div>
             </div>
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                   <Clock className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Time</span>
                </div>
                <div className="text-2xl font-display text-swiss-charcoal dark:text-white">{stats?.processingTimeMs.toFixed(0) || 0}<span className="text-xs text-slate-500">ms</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" id="visualizer-panel">
        <div className="w-12 border-r border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col items-center py-4 gap-1 overflow-y-auto scrollbar-none shrink-0 transition-colors duration-300">
        {chunks.map((c, i) => {
            const score = c.rag?.hybridScore || 0;
            const isNeedle = ragMode && score > 0.7;
            
            return (
            <div 
                key={i} 
                className={`w-4 rounded-sm transition-all hover:scale-110 cursor-pointer shadow-sm ${isNeedle ? 'ring-2 ring-emerald-400 z-10' : ''}`}
                style={{
                    height: `${Math.max(4, (c.tokenCount / (stats?.maxSize || 512)) * 40)}px`,
                    backgroundColor: ragMode 
                        ? (score > 0 ? `rgba(99, 102, 241, ${score})` : 'rgba(30, 41, 59, 0.1)')
                        : `hsla(245, 80%, ${Math.max(30, 100 - (c.tokenCount / 4))}%, 0.8)`
                }}
                title={ragMode ? `Rank ${c.rag?.rank} (Score: ${score.toFixed(3)})` : `Chunk ${i+1}: ${c.tokenCount} tokens`}
                onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth' })}
            />
        )})}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" id="chunk-container">
            {viewMode === 'heatmap' ? (
                <div className="flex flex-wrap gap-1">
                    {chunks.map((chunk, idx) => (
                        <div 
                            id={chunk.id}
                            key={chunk.id}
                            className="transition-all hover:scale-105 cursor-pointer relative group"
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: getHeatmapColor(chunk),
                                borderRadius: '2px'
                            }}
                            onClick={() => { setViewMode('grid'); setTimeout(() => document.getElementById(chunk.id)?.scrollIntoView({block: 'center'}), 100); }}
                        >
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                {ragMode ? `Score: ${chunk.rag?.hybridScore?.toFixed(3)}` : `Tokens: ${chunk.tokenCount}`}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                renderChunkList(chunks)
            )}
        </div>
      </div>
    </div>
  );
};
