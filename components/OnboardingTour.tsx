
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface Step {
  target: string;
  title: string;
  content: string;
  position: 'right' | 'left' | 'bottom' | 'top';
}

const TOUR_STEPS: Step[] = [
  { target: 'strategy-selector', title: 'Choose Strategy', content: 'Start by selecting a chunking strategy. "Recursive" is great for general text, while "Semantic" uses AI.', position: 'right' },
  { target: 'param-controls', title: 'Fine-tune', content: 'Adjust chunk size and overlap. These parameters heavily influence retrieval quality.', position: 'right' },
  { target: 'input-area', title: 'Input Content', content: 'Type, paste, or upload your document here. You can even dictate via voice.', position: 'left' },
  { target: 'run-btn', title: 'Process', content: 'Click here to run the chunking algorithm. For local strategies, it runs automatically!', position: 'bottom' },
  { target: 'visualizer-panel', title: 'Visualize', content: 'See your chunks here. Switch between Grid, List, and Heatmap views to analyze density.', position: 'left' },
  { target: 'rag-mode-toggle', title: 'RAG Lab', content: 'Switch to "RAG Lab" to simulate retrieval and test search relevance.', position: 'bottom' },
];

export const OnboardingTour: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep];
      const element = document.getElementById(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Small delay to ensure render
    setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, isOpen]);

  if (!isOpen || !coords) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto" />

      {/* Spotlight Hole */}
      <div 
        className="absolute transition-all duration-300 ease-in-out border-2 border-electric-indigo shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-lg"
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
        }}
      />

      {/* Tooltip */}
      <div 
        className="absolute pointer-events-auto transition-all duration-300"
        style={{
          top: step.position === 'bottom' ? coords.top + coords.height + 12 : 
               step.position === 'top' ? coords.top - 160 :
               coords.top,
          left: step.position === 'right' ? coords.left + coords.width + 12 : 
                step.position === 'left' ? coords.left - 320 :
                coords.left,
        }}
      >
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-2xl w-72 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold font-display text-lg text-slate-800 dark:text-white">{step.title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            {step.content}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">{currentStep + 1} / {TOUR_STEPS.length}</span>
            <div className="flex gap-2">
               <button 
                 disabled={currentStep === 0}
                 onClick={() => setCurrentStep(c => c - 1)}
                 className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
               >
                 <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
               </button>
               <button 
                 onClick={() => {
                    if (currentStep === TOUR_STEPS.length - 1) onClose();
                    else setCurrentStep(c => c + 1);
                 }}
                 className="px-3 py-1.5 bg-electric-indigo text-white rounded text-xs font-bold flex items-center gap-1 hover:bg-electric-accent"
               >
                 {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
