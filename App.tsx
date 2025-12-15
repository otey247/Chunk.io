
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Visualizer } from './components/Visualizer';
import { RagLab } from './components/RagLab';
import { ExportMenu } from './components/ExportMenu';
import { OnboardingTour } from './components/OnboardingTour';
import { StrategyType, Chunk, ProcessingStats, GeminiModel } from './types';
import { INITIAL_TEXT, STRATEGIES } from './constants';
import { processText } from './services/chunkingService';
import { parseFile, transcribeAudio } from './services/documentLoader';
import { getEmbeddings, generateHyDE } from './services/geminiService';
import { rankChunks } from './services/ragService';
import { Edit3, Play, FileUp, Link, Mic, Sun, Moon, X, Youtube, Type, Beaker, LayoutGrid, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [strategy, setStrategy] = useState<StrategyType>(StrategyType.Recursive);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  
  // App Mode
  const [mode, setMode] = useState<'architect' | 'lab'>('architect');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile Drawer
  const [showTour, setShowTour] = useState(false);
  const [showExport, setShowExport] = useState(false);

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
  const [enableParentChild, setEnableParentChild] = useState(false);
  const [parentChunkSize, setParentChunkSize] = useState(1500);

  // AI Settings
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.Flash);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [enrichment, setEnrichment] = useState({
    summarize: false,
    qa: false,
    label: false,
    hallucination: false,
  });

  // RAG Settings
  const [ragQuery, setRagQuery] = useState("");
  const [embeddingsGenerated, setEmbeddingsGenerated] = useState(false);
  const [ragAlpha, setRagAlpha] = useState(0.7);
  const [useHyDE, setUseHyDE] = useState(false);
  const [useReranker, setUseReranker] = useState(false);

  // Diff Mode
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonChunks, setComparisonChunks] = useState<Chunk[] | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    // Check first visit for tour
    if (!localStorage.getItem('chunk_io_visited')) {
        setTimeout(() => setShowTour(true), 1000);
        localStorage.setItem('chunk_io_visited', 'true');
    }
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Mobile Sidebar
  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth < 768) setIsSidebarOpen(false);
          else setIsSidebarOpen(true);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  const runChunking = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEmbeddingsGenerated(false); // Reset embeddings on new chunking
    
    try {
      const { chunks: generatedChunks, stats: generatedStats } = await processText(text, {
        chunkSize,
        overlap,
        minChunkSize,
        strategy,
        regexPattern,
        model: selectedModel,
        customPrompt,
        enrichment,
        enableParentChild,
        parentChunkSize
      });

      setChunks(generatedChunks);
      setStats(generatedStats);

    } catch (err) {
      setError("Failed to process chunks. Please try a different strategy or check your API Key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [text, chunkSize, overlap, strategy, minChunkSize, regexPattern, selectedModel, customPrompt, enrichment, enableParentChild, parentChunkSize]);

  // Debounce the runChunking for local strategies
  useEffect(() => {
    const isAI = STRATEGIES.find(s => s.name === strategy)?.requiresAI;
    const hasEnrichment = Object.values(enrichment).some(v => v);
    
    // Don't auto-run if in Lab mode to prevent overwriting results
    if (mode === 'architect' && !isAI && !hasEnrichment && text.length > 0) {
      const timer = setTimeout(() => {
        runChunking();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [runChunking, strategy, enrichment, text, mode]);

  const handleRunAI = () => {
      runChunking();
  }

  const handleToggleCompare = () => {
    if (!compareMode) {
        // Start Comparison: Snapshot current as baseline
        setComparisonChunks([...chunks]);
        setCompareMode(true);
    } else {
        // Exit Comparison
        setComparisonChunks(undefined);
        setCompareMode(false);
    }
  }

  // --- RAG Functions ---
  
  const handleGenerateEmbeddings = async () => {
    if (chunks.length === 0) return;
    setLoading(true);
    try {
      // Filter out parents from embedding if parent-child is on? 
      // Usually only children are embedded for retrieval.
      const toEmbed = chunks.filter(c => c.type !== 'parent');
      const texts = toEmbed.map(c => c.content);
      const embeddings = await getEmbeddings(texts);
      
      const updatedChunks = chunks.map(c => {
         if (c.type === 'parent') return c; // Skip parents
         const index = toEmbed.findIndex(embedC => embedC.id === c.id);
         if (index === -1) return c;
         return {
            ...c,
            rag: { ...c.rag, embedding: embeddings[index] }
         };
      });
      
      setChunks(updatedChunks);
      setEmbeddingsGenerated(true);
    } catch (e) {
      setError("Failed to generate embeddings. Check API quota.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunRetrieval = async () => {
    if (!ragQuery.trim()) return;
    setLoading(true);
    try {
      let finalQuery = ragQuery;
      
      // HyDE Step
      if (useHyDE) {
        finalQuery = await generateHyDE(ragQuery);
        console.log("HyDE Generated:", finalQuery);
      }

      // Embed Query
      const [queryEmbedding] = await getEmbeddings([finalQuery]);
      
      if (!queryEmbedding) throw new Error("Failed to embed query");

      // Rank (Only retrieval chunks, i.e., non-parents)
      const retrievalChunks = chunks.filter(c => c.type !== 'parent');
      const parents = chunks.filter(c => c.type === 'parent');
      
      const rankedChildren = rankChunks(retrievalChunks, queryEmbedding, ragQuery, ragAlpha, useReranker);
      
      // Combine back
      setChunks([...parents, ...rankedChildren]);
      
    } catch (e) {
      setError("Retrieval failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRateChunk = (id: string, rating: number) => {
    setChunks(prev => prev.map(c => c.id === id ? { ...c, userRelevance: rating } : c));
  };

  const handleInjectMetadata = (id: string) => {
    const randomMetadata = {
      source: "document_v1.pdf",
      author: "AI Architect",
      date: new Date().toISOString().split('T')[0],
      section_id: Math.floor(Math.random() * 100)
    };
    setChunks(prev => prev.map(c => c.id === id ? { ...c, metadata: randomMetadata } : c));
  };
  
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
           if (isFinal) return prev + " " + transcript;
           return prev;
        });
      });
    }
  };

  const handleUrlFetch = () => {
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
      
      {/* Tour & Export Overlays */}
      <OnboardingTour isOpen={showTour} onClose={() => setShowTour(false)} />
      <ExportMenu 
        isOpen={showExport} 
        onClose={() => setShowExport(false)}
        chunks={chunks}
        strategy={strategy}
        chunkSize={chunkSize}
        overlap={overlap}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth < 768 && (
          <div className="fixed inset-0 bg-black/50 z-20" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Left Sidebar */}
      <div className={`fixed md:relative inset-y-0 left-0 w-80 shrink-0 z-30 shadow-2xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
          enableParentChild={enableParentChild}
          setEnableParentChild={setEnableParentChild}
          parentChunkSize={parentChunkSize}
          setParentChunkSize={setParentChunkSize}
          compareMode={compareMode}
          toggleCompareMode={handleToggleCompare}
          onOpenExport={() => setShowExport(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0 h-full relative">
        
        {/* Editor / Lab Panel (Left Half) */}
        <div className={`md:w-1/2 flex flex-col border-r border-black/5 dark:border-white/10 relative bg-white dark:bg-[#0f172a] transition-colors duration-300 ${compareMode ? 'hidden md:flex' : ''}`}>
           
           {/* Top Bar: Mode Switcher & Tools */}
           <div className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#0f172a] z-20 shrink-0">
              
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 -ml-2 text-slate-500">
                    <Menu className="w-5 h-5" />
                  </button>
                  {/* Mode Toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1">
                      <button id="architect-mode" onClick={() => setMode('architect')} className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${mode === 'architect' ? 'bg-white dark:bg-slate-700 shadow text-electric-indigo' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                          <LayoutGrid className="w-4 h-4" /> Architect
                      </button>
                      <button id="rag-mode-toggle" onClick={() => setMode('lab')} className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${mode === 'lab' ? 'bg-white dark:bg-slate-700 shadow text-electric-indigo' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                          <Beaker className="w-4 h-4" /> RAG Lab
                      </button>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                 >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                 </button>
                 
                 {/* Run Button (Only in Architect Mode) */}
                 {mode === 'architect' && showManualRun && (
                    <button 
                        id="run-btn"
                        onClick={handleRunAI}
                        disabled={loading}
                        className="bg-electric-indigo hover:bg-electric-accent text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Working...' : 'Run AI'} <Play className="w-3 h-3 fill-current" />
                    </button>
                 )}
              </div>
           </div>
           
           {/* Input Area (Architect) or RAG Lab (Lab) */}
           <div className="flex-1 flex flex-col relative overflow-hidden" id="input-area">
              
              {mode === 'lab' ? (
                <RagLab 
                    query={ragQuery}
                    setQuery={setRagQuery}
                    onRunRetrieval={handleRunRetrieval}
                    onGenerateEmbeddings={handleGenerateEmbeddings}
                    loading={loading}
                    embeddingsGenerated={embeddingsGenerated}
                    alpha={ragAlpha}
                    setAlpha={setRagAlpha}
                    useHyDE={useHyDE}
                    setUseHyDE={setUseHyDE}
                    useReranker={useReranker}
                    setUseReranker={setUseReranker}
                    chunks={chunks}
                />
              ) : (
                <>
                  {/* Tool Bar for Architect Mode */}
                  <div className="px-6 py-3 border-b border-black/5 dark:border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                      <button onClick={() => setInputMode('text')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${inputMode === 'text' ? 'bg-electric-indigo/10 text-electric-indigo' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>
                          <Type className="w-3 h-3" /> Text
                      </button>
                      <button onClick={() => setInputMode('file')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${inputMode === 'file' ? 'bg-electric-indigo/10 text-electric-indigo' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>
                          <FileUp className="w-3 h-3" /> File
                      </button>
                      <button onClick={() => setInputMode('url')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${inputMode === 'url' ? 'bg-electric-indigo/10 text-electric-indigo' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>
                          <Link className="w-3 h-3" /> URL
                      </button>
                      <button onClick={() => setInputMode('audio')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${inputMode === 'audio' ? 'bg-electric-indigo/10 text-electric-indigo' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>
                          <Mic className="w-3 h-3" /> Speech
                      </button>
                  </div>

                  {/* Specialized Input UIs */}
                  {inputMode === 'file' && (
                      <div className="absolute inset-0 bg-white/95 dark:bg-[#0f172a]/95 z-10 flex flex-col items-center justify-center backdrop-blur-sm p-8 text-center">
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
                      <div className="bg-slate-50 dark:bg-slate-900 border-b border-black/5 dark:border-white/5 p-4 flex gap-2 items-center absolute top-[53px] w-full z-10">
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
                      <div className="bg-slate-50 dark:bg-slate-900 border-b border-black/5 dark:border-white/5 p-4 flex gap-4 items-center justify-between absolute top-[53px] w-full z-10">
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
                        className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-sm resize-none p-6 outline-none scrollbar-thin pt-4"
                        placeholder="Content will appear here..."
                        spellCheck={false}
                    />
                  </div>
                  
                  <div className="h-12 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center px-6 text-xs text-slate-400 dark:text-slate-500 justify-between shrink-0">
                      <span>{text.length} characters</span>
                      <span>markdown supported</span>
                  </div>
                </>
              )}
           </div>
        </div>

        {/* Visualization Panel (Right Half) */}
        <div className={`h-full relative ${compareMode ? 'w-full' : 'md:w-1/2'}`}>
            {error && (
                <div className="absolute top-6 left-6 right-6 z-50 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-200 p-4 rounded-lg text-sm backdrop-blur-md shadow-lg">
                    {error}
                    <button onClick={() => setError(null)} className="absolute top-2 right-2 p-1"><X className="w-3 h-3"/></button>
                </div>
            )}
           <Visualizer 
              chunks={chunks} 
              stats={stats} 
              loading={loading} 
              ragMode={mode === 'lab'} 
              onRateChunk={handleRateChunk}
              onInjectMetadata={handleInjectMetadata}
              comparisonChunks={comparisonChunks}
           />
        </div>
      </div>
    </div>
  );
};

export default App;
