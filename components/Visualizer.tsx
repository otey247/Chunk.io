import React, { useState } from 'react';
import { Chunk, ProcessingStats } from '../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Copy, Hash, Clock, FileText, Activity, AlignLeft, Tag, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface VisualizerProps {
  chunks: Chunk[];
  stats: ProcessingStats | null;
  loading: boolean;
  onChunkClick?: (chunkId: string) => void;
}

export const Visualizer: React.FC<VisualizerProps> = ({ chunks, stats, loading, onChunkClick }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'heatmap'>('grid');
  
  const chartData = chunks.map((c, i) => ({
    name: i,
    size: c.charCount,
    tokens: c.tokenCount
  }));

  const distributionData = stats?.tokenDistribution || [];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-t-2 border-electric-indigo rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-electric-accent/50 rounded-full animate-spin reverse"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-mono text-sm">PROCESSING SEGMENTS...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-swiss-offwhite dark:bg-[#0f172a] overflow-hidden transition-colors duration-300">
      {/* Metrics Header */}
      <div className="h-auto border-b border-black/5 dark:border-white/10 p-6 flex flex-col xl:flex-row gap-6 shrink-0 bg-swiss-offwhite dark:bg-[#0f172a] z-10 shadow-sm dark:shadow-xl transition-colors duration-300">
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-swiss-charcoal dark:text-white font-display text-xl font-medium">Analysis Results</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time segmentation metrics</p>
            </div>
            <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-black/5 dark:border-white/5 shadow-sm">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-electric-indigo text-white shadow-lg' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('heatmap')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'heatmap' ? 'bg-electric-indigo text-white shadow-lg' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}>
                    <Activity className="w-4 h-4" />
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                   <Hash className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Chunks</span>
                </div>
                <div className="text-2xl font-display text-swiss-charcoal dark:text-white">{stats?.totalChunks || 0}</div>
             </div>
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                   <FileText className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Avg Size</span>
                </div>
                <div className="text-2xl font-display text-swiss-charcoal dark:text-white">{Math.round(stats?.avgSize || 0)} <span className="text-xs text-slate-500">chars</span></div>
             </div>
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                   <Clock className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Time</span>
                </div>
                <div className="text-2xl font-display text-swiss-charcoal dark:text-white">{stats?.processingTimeMs.toFixed(0) || 0}<span className="text-xs text-slate-500">ms</span></div>
             </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="flex gap-4 h-32 w-full xl:w-1/2">
            <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-lg p-2 border border-black/5 dark:border-white/5 relative shadow-sm">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 absolute top-2 left-2 z-10">Size Dist.</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }} 
                            itemStyle={{ color: '#818cf8' }}
                            cursor={{fill: 'rgba(99,102,241,0.1)'}}
                        />
                        <Bar dataKey="size" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-900/50 rounded-lg p-2 border border-black/5 dark:border-white/5 relative hidden sm:block shadow-sm">
                 <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 absolute top-2 left-2 z-10">Histogram</p>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                        <XAxis dataKey="range" hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }} 
                            cursor={{fill: 'rgba(99,102,241,0.1)'}}
                        />
                        <Bar dataKey="count" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Minimap */}
        <div className="w-12 border-r border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col items-center py-4 gap-1 overflow-y-auto scrollbar-none shrink-0 transition-colors duration-300">
           {chunks.map((c, i) => (
              <div 
                key={i} 
                className="w-4 rounded-sm transition-all hover:scale-110 cursor-pointer shadow-sm"
                style={{
                    height: `${Math.max(4, (c.charCount / (stats?.maxSize || 1)) * 40)}px`,
                    backgroundColor: `hsla(245, 80%, ${Math.max(30, 100 - (c.tokenCount / 2))}%, 0.8)`
                }}
                title={`Chunk ${i+1}: ${c.charCount} chars`}
                onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth' })}
              />
           ))}
        </div>

        {/* Chunk Grid */}
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
                                backgroundColor: `hsla(245, 80%, ${Math.max(20, 90 - (chunk.tokenCount / 5))}%, 1)`,
                                borderRadius: '2px'
                            }}
                            onClick={() => { setViewMode('grid'); setTimeout(() => document.getElementById(chunk.id)?.scrollIntoView({block: 'center'}), 100); }}
                        >
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                Chunk {idx+1}: {chunk.tokenCount} tokens
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
                {chunks.map((chunk, idx) => (
                    <div 
                    id={chunk.id}
                    key={chunk.id} 
                    className="group relative bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-5 hover:border-electric-indigo/50 transition-all duration-300 hover:shadow-[0_4px_20px_-2px_rgba(99,102,241,0.1)] flex flex-col"
                    >
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-electric-indigo bg-electric-indigo/10 px-2 py-0.5 rounded">
                            #{idx + 1}
                            </span>
                            {/* Tags from AI Labeling */}
                            {chunk.labels && chunk.labels.map(k => (
                                <span key={k} className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Tag className="w-2 h-2" /> {k}
                                </span>
                            ))}
                            {/* Legacy keywords if AI labels exist, maybe hide or show fewer */}
                            {!chunk.labels && chunk.keywords && chunk.keywords.slice(0, 2).map(k => (
                                <span key={k} className="text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Tag className="w-2 h-2" /> {k}
                                </span>
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {chunk.charCount} chars
                        </span>
                    </div>
                    
                    {/* Hallucination Score Badge */}
                    {chunk.hallucinationScore !== undefined && (
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

                    {/* AI Summary Section */}
                    {chunk.summary && (
                        <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 rounded border-l-2 border-electric-indigo">
                            <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3"/> Summary
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic">{chunk.summary}</p>
                        </div>
                    )}

                    {/* QA Section */}
                    {chunk.qaPairs && chunk.qaPairs.length > 0 && (
                        <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 rounded border-l-2 border-emerald-500">
                             <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3"/> Synthetic Q&A
                            </h4>
                            {chunk.qaPairs.map((qa, i) => (
                                <div key={i} className="text-xs">
                                    <p className="text-slate-800 dark:text-white font-medium mb-0.5">Q: {qa.question}</p>
                                    <p className="text-slate-500 dark:text-slate-400">A: {qa.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-slate-400 dark:text-slate-600">Token est: {chunk.tokenCount}</span>
                        <button className="text-slate-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-[10px]" onClick={() => navigator.clipboard.writeText(chunk.content)}>
                            <Copy className="w-3 h-3" /> COPY
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};