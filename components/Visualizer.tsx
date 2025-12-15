import React from 'react';
import { Chunk, ProcessingStats } from '../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Copy, Hash, Clock, FileText } from 'lucide-react';

interface VisualizerProps {
  chunks: Chunk[];
  stats: ProcessingStats | null;
  loading: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ chunks, stats, loading }) => {
  const chartData = chunks.map((c, i) => ({
    name: i,
    size: c.charCount,
    tokens: c.tokenCount
  }));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-t-2 border-electric-indigo rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-electric-accent/50 rounded-full animate-spin reverse"></div>
        </div>
        <p className="text-slate-400 animate-pulse font-mono text-sm">PROCESSING SEGMENTS...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0f172a] overflow-hidden">
      {/* Metrics Header */}
      <div className="h-48 border-b border-white/10 p-6 flex gap-6 shrink-0">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-white font-display text-xl font-medium">Analysis Results</h2>
            <p className="text-slate-400 text-sm mt-1">Real-time segmentation metrics</p>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                   <Hash className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Chunks</span>
                </div>
                <div className="text-2xl font-display text-white">{stats?.totalChunks || 0}</div>
             </div>
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                   <FileText className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Avg Size</span>
                </div>
                <div className="text-2xl font-display text-white">{Math.round(stats?.avgSize || 0)} <span className="text-xs text-slate-500">chars</span></div>
             </div>
             <div className="glass-panel p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                   <Clock className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Time</span>
                </div>
                <div className="text-2xl font-display text-white">{stats?.processingTimeMs.toFixed(0) || 0}<span className="text-xs text-slate-500">ms</span></div>
             </div>
          </div>
        </div>
        
        {/* Micro Chart */}
        <div className="w-1/3 h-full hidden lg:block">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                    itemStyle={{ color: '#818cf8' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                 />
                 <Bar dataKey="size" fill="#6366f1" radius={[2, 2, 0, 0]} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Chunk Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
          {chunks.map((chunk, idx) => (
            <div 
              key={chunk.id} 
              className="group relative bg-slate-900 border border-white/5 rounded-xl p-5 hover:border-electric-indigo/50 transition-all duration-300 hover:shadow-[0_4px_20px_-2px_rgba(99,102,241,0.1)] flex flex-col"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-electric-indigo bg-electric-indigo/10 px-2 py-0.5 rounded">
                  ID: {idx + 1}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {chunk.charCount} chars
                </span>
              </div>
              
              <div className="text-slate-300 text-sm font-light leading-relaxed whitespace-pre-wrap font-sans mb-4 grow">
                {chunk.content}
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] text-slate-600">Token est: {chunk.tokenCount}</span>
                 <button className="text-slate-400 hover:text-white transition-colors" title="Copy Chunk">
                    <Copy className="w-3 h-3" onClick={() => navigator.clipboard.writeText(chunk.content)}/>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};