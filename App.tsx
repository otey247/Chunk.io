import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Visualizer } from './components/Visualizer';
import { StrategyType, Chunk, ProcessingStats, GeminiModel } from './types';
import { INITIAL_TEXT, STRATEGIES } from './constants';
import { processText } from './services/chunkingService';
import { parseFile, transcribeAudio } from './services/documentLoader';
import { Edit3, Play, FileUp, Link, Mic, Sun, Moon, X, Youtube, Type } from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [strategy, setStrategy] = useState<StrategyType>(StrategyType.Recursive);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  
  // Input Modes
  const [inputMode, setInputMode] = useState<'text' | 'file' | 'url' | 'audio'>('text');
  const [urlInput, setUrlInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Settings
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [overlap, setOverlap] = useState<number>(50);
  const [minChunkSize, setMinChunkSize] = useState<number>(20);
  const [regexPattern, setRegexPattern] = useState<string>("\\n\\n");

  // AI Settings
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.Flash);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [enrichment, setEnrichment] = useState({
    summarize: false,
    qa: false,
    label: false,
    hallucination: false,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<any>(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const runChunking = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { chunks: generatedChunks, stats: generatedStats } = await processText(text, {
        chunkSize,
        overlap,
        minChunkSize,
        strategy,
        regexPattern,
        model: selectedModel,
        customPrompt,
        enrichment
      });

      setChunks(generatedChunks);
      setStats(generatedStats);

    } catch (err) {
      setError("Failed to process chunks. Please try a different strategy or check your API Key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [text, chunkSize, overlap, strategy, minChunkSize, regexPattern, selectedModel, customPrompt, enrichment]);

  // Debounce the runChunking for local strategies
  useEffect(() => {
    const isAI = STRATEGIES.find(s => s.name === strategy)?.requiresAI;
    const hasEnrichment = Object.values(enrichment).some(v => v);
    
    if (!isAI && !hasEnrichment && text.length > 0) {
      const timer = setTimeout(() => {
        runChunking();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [runChunking, strategy, enrichment, text]);

  const handleRunAI = () => {
      runChunking();
  }
  
  // --- Ingestion Handlers ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const extractedText = await parseFile(file);
      setText(extractedText);
      setError(null);
    } catch (err: any) {
      setError(`Failed to parse file: ${err.message}`);
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      audioRef.current?.stop();
      setIsRecording(false);
    } else {
      const transcriber = transcribeAudio();
      if (!transcriber.isSupported) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }
      
      setIsRecording(true);
      setText(""); // Clear text on new recording
      audioRef.current = transcriber;
      
      transcriber.start((transcript, isFinal) => {
        setText(prev => {
           // Simple append logic: if fresh start, replace. 
           // If streaming, replace last part or append. 
           // For simplicity in this demo, we just append final parts.
           if (isFinal) return prev + " " + transcript;
           return prev;
        });
      });
    }
  };

  const handleUrlFetch = () => {
    // Mock URL fetch for demo purposes as we don't have a backend proxy
    // In a real app, this would call a serverless function
    setLoading(true);
    setTimeout(() => {
        if (urlInput.includes("youtube")) {
             setText(`# Video Transcript: ${urlInput}\n\n[00:00] Welcome to this tutorial on RAG systems.\n[00:05] Today we will discuss chunking strategies.\n[00:10] Chunking is essential for retrieval accuracy.\n\n(Note: Real YouTube transcription requires a backend service. This is a simulation.)`);
        } else {
             setText(`# Content from ${urlInput}\n\nThis is a simulated fetch of the webpage content.\nIn a production environment, this would use a headless browser or proxy to scrape the HTML and extract the main text content.\n\n## Key Concepts\n- Scraping\n- Parsing\n- Cleaning`);
        }
        setLoading(false);
    }, 1000);
  };

  const isAIStrategy = STRATEGIES.find(s => s.name === strategy)?.requiresAI;
  const hasEnrichment = Object.values(enrichment).some(v => v);
  const showManualRun = isAIStrategy || hasEnrichment;

  return (
    <div className="flex h-screen w-screen bg-swiss-offwhite dark:bg-[#0f172a] text-swiss-charcoal dark:text-slate-200 overflow-hidden font-sans transition-colors duration-300">
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
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          enrichment={enrichment}
          setEnrichment={setEnrichment}
          estimatedCost={stats?.estimatedCost || 0}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        
        {/* Editor Panel */}
        <div className="md:w-1/2 flex flex-col border-r border-black/5 dark:border-white/10 relative bg-white dark:bg-[#0f172a] transition-colors duration-300">
           
           {/* Top Bar: Source Selector & Theme Toggle */}
           <div className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#0f172a] z-20">
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1">
                  <button onClick={() => setInputMode('text')} className={`p-1.5 rounded-md transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-700 shadow text-electric-indigo' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Direct Text">
                      <Type className="w-4 h-4" />
                  </button>
                  <button onClick={() => setInputMode('file')} className={`p-1.5 rounded-md transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-700 shadow text-electric-indigo' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Upload File">
                      <FileUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => setInputMode('url')} className={`p-1.5 rounded-md transition-all ${inputMode === 'url' ? 'bg-white dark:bg-slate-700 shadow text-electric-indigo' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="URL / YouTube">
                      <Link className="w-4 h-4" />
                  </button>
                  <button onClick={() => setInputMode('audio')} className={`p-1.5 rounded-md transition-all ${inputMode === 'audio' ? 'bg-white dark:bg-slate-700 shadow text-electric-indigo' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Microphone">
                      <Mic className="w-4 h-4" />
                  </button>
              </div>

              <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                 >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                 </button>
                 {showManualRun && (
                    <button 
                        onClick={handleRunAI}
                        disabled={loading}
                        className="bg-electric-indigo hover:bg-electric-accent text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Working...' : 'Run AI'} <Play className="w-3 h-3 fill-current" />
                    </button>
                 )}
              </div>
           </div>
           
           {/* Input Area */}
           <div className="flex-1 flex flex-col relative overflow-hidden">
              {/* Specialized Input UIs */}
              {inputMode === 'file' && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-[#0f172a]/90 z-10 flex flex-col items-center justify-center backdrop-blur-sm p-8 text-center">
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center gap-4 hover:border-electric-indigo transition-colors w-full max-w-md">
                          <div className="w-16 h-16 bg-electric-indigo/10 rounded-full flex items-center justify-center mb-2">
                             <FileUp className="w-8 h-8 text-electric-indigo" />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-slate-700 dark:text-white">Drop your document</h3>
                              <p className="text-sm text-slate-500 mt-1">PDF, DOCX, CSV, MD, TXT supported</p>
                          </div>
                          <label className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">
                              Browse Files
                              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt,.md,.csv,.json" />
                          </label>
                      </div>
                      <button onClick={() => setInputMode('text')} className="mt-8 text-slate-400 text-sm hover:text-slate-600 dark:hover:text-slate-200">Cancel</button>
                  </div>
              )}

              {inputMode === 'url' && (
                  <div className="bg-slate-50 dark:bg-slate-900 border-b border-black/5 dark:border-white/5 p-4 flex gap-2 items-center">
                       <Link className="w-4 h-4 text-slate-400" />
                       <input 
                          type="text" 
                          placeholder="Paste URL or YouTube Link..." 
                          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-white placeholder:text-slate-400"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUrlFetch()}
                       />
                       <button onClick={handleUrlFetch} className="text-xs font-bold text-electric-indigo uppercase">Fetch</button>
                  </div>
              )}

              {inputMode === 'audio' && (
                  <div className="bg-slate-50 dark:bg-slate-900 border-b border-black/5 dark:border-white/5 p-4 flex gap-4 items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                             {isRecording ? 'Listening... (Speak now)' : 'Click record to start'}
                          </span>
                       </div>
                       <button 
                          onClick={toggleRecording} 
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isRecording ? 'bg-red-500 text-white' : 'bg-electric-indigo text-white'}`}
                        >
                          {isRecording ? 'Stop' : 'Record'}
                       </button>
                  </div>
              )}

              <div className="flex-1 relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-sm resize-none p-6 outline-none scrollbar-thin"
                    placeholder="Content will appear here..."
                    spellCheck={false}
                />
              </div>
           </div>
           
           <div className="h-12 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center px-6 text-xs text-slate-400 dark:text-slate-500 justify-between">
              <span>{text.length} characters</span>
              <span>markdown supported</span>
           </div>
        </div>

        {/* Visualization Panel */}
        <div className="md:w-1/2 h-full relative">
            {error && (
                <div className="absolute top-6 left-6 right-6 z-50 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-200 p-4 rounded-lg text-sm backdrop-blur-md shadow-lg">
                    {error}
                    <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1"><X className="w-3 h-3"/></button>
                </div>
            )}
           <Visualizer chunks={chunks} stats={stats} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default App;