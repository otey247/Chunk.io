import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Visualizer } from './components/Visualizer';
import { StrategyType, Chunk, ProcessingStats } from './types';
import { INITIAL_TEXT, STRATEGIES } from './constants';
import { processText } from './services/chunkingService';
import { Edit3, Play } from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [strategy, setStrategy] = useState<StrategyType>(StrategyType.Recursive);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  
  // Settings
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [overlap, setOverlap] = useState<number>(50);
  const [minChunkSize, setMinChunkSize] = useState<number>(20);
  const [regexPattern, setRegexPattern] = useState<string>("\\n\\n");

  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runChunking = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const generatedChunks = await processText(text, {
        chunkSize,
        overlap,
        minChunkSize,
        strategy,
        regexPattern
      });

      setChunks(generatedChunks);
      
      const totalSize = generatedChunks.reduce((acc, c) => acc + c.charCount, 0);
      const sizes = generatedChunks.map(c => c.charCount);

      // Simple distribution calc
      const sizeMap = new Map<string, number>();
      generatedChunks.forEach(c => {
        const range = Math.floor(c.charCount / 100) * 100;
        const key = `${range}`;
        sizeMap.set(key, (sizeMap.get(key) || 0) + 1);
      });
      const tokenDistribution = Array.from(sizeMap.entries())
        .map(([range, count]) => ({ range, count }))
        .sort((a, b) => parseInt(a.range) - parseInt(b.range));

      setStats({
        totalChunks: generatedChunks.length,
        avgSize: generatedChunks.length ? totalSize / generatedChunks.length : 0,
        minSize: Math.min(...sizes),
        maxSize: Math.max(...sizes),
        processingTimeMs: performance.now() - startTime,
        tokenDistribution
      });
    } catch (err) {
      setError("Failed to process chunks. Please try a different strategy or text.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [text, chunkSize, overlap, strategy, minChunkSize, regexPattern]);

  // Debounce the runChunking for local strategies, manual trigger for AI
  useEffect(() => {
    const isAI = STRATEGIES.find(s => s.name === strategy)?.requiresAI;
    if (!isAI) {
      const timer = setTimeout(() => {
        runChunking();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [runChunking, strategy]);

  const handleRunAI = () => {
      runChunking();
  }

  const isAIStrategy = STRATEGIES.find(s => s.name === strategy)?.requiresAI;

  return (
    <div className="flex h-screen w-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <div className="w-80 shrink-0 z-20 shadow-2xl">
        <Sidebar 
          selectedStrategy={strategy} 
          onSelectStrategy={setStrategy}
          chunkSize={chunkSize}
          setChunkSize={setChunkSize}
          overlap={overlap}
          setOverlap={setOverlap}
          minChunkSize={minChunkSize}
          setMinChunkSize={setMinChunkSize}
          regexPattern={regexPattern}
          setRegexPattern={setRegexPattern}
        />
      </div>

      {/* Main Content Area - Split into Editor and Visualizer */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        
        {/* Editor Panel */}
        <div className="md:w-1/2 flex flex-col border-r border-white/10 relative">
           <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
           
           <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4 z-20">
                 <h2 className="text-white font-display text-lg flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-electric-indigo" /> Source Document
                 </h2>
                 {isAIStrategy && (
                    <button 
                        onClick={handleRunAI}
                        disabled={loading}
                        className="bg-electric-indigo hover:bg-electric-accent text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Thinking...' : 'Run Analysis'} <Play className="w-3 h-3 fill-current" />
                    </button>
                 )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full flex-1 bg-transparent border-none focus:ring-0 text-slate-300 leading-relaxed font-mono text-sm resize-none p-0 outline-none scrollbar-thin"
                placeholder="Paste your text here..."
                spellCheck={false}
              />
           </div>
           
           <div className="h-12 border-t border-white/5 bg-slate-900/50 flex items-center px-6 text-xs text-slate-500 justify-between">
              <span>{text.length} characters</span>
              <span>markdown supported</span>
           </div>
        </div>

        {/* Visualization Panel */}
        <div className="md:w-1/2 h-full relative">
            {error && (
                <div className="absolute top-6 left-6 right-6 z-50 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg text-sm backdrop-blur-md">
                    {error}
                </div>
            )}
           <Visualizer chunks={chunks} stats={stats} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default App;