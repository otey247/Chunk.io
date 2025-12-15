
import React, { useState } from 'react';
import { Download, Code, FileJson, FileText, X, Check } from 'lucide-react';
import { Chunk, StrategyType } from '../types';

interface ExportMenuProps {
  chunks: Chunk[];
  strategy: StrategyType;
  chunkSize: number;
  overlap: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ chunks, strategy, chunkSize, overlap, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getLangChainPython = () => {
    return `from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=${chunkSize},
    chunk_overlap=${overlap},
    length_function=len,
)
docs = text_splitter.create_documents([text])`;
  };

  const getLangChainJS = () => {
    return `import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: ${chunkSize},
  chunkOverlap: ${overlap},
});

const docs = await splitter.createDocuments([text]);`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const data = JSON.stringify(chunks, null, 2);
    downloadFile(data, 'chunks.json', 'application/json');
  };

  const handleDownloadCSV = () => {
    const headers = "id,content,charCount,tokenCount,keywords\n";
    const rows = chunks.map(c => 
      `"${c.id}","${c.content.replace(/"/g, '""')}","${c.charCount}","${c.tokenCount}","${(c.keywords || []).join(';')}"`
    ).join("\n");
    downloadFile(headers + rows, 'chunks.csv', 'text/csv');
  };

  const handleDownloadMarkdown = () => {
    const md = chunks.map((c, i) => `### Chunk ${i+1} (${c.charCount} chars)\n\n${c.content}\n\n---\n`).join("\n");
    downloadFile(md, 'chunks.md', 'text/markdown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-electric-indigo" /> Export Data & Config
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Data Export */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Download Data</h3>
            <div className="space-y-3">
              <button onClick={handleDownloadJSON} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-electric-indigo/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <FileJson className="w-4 h-4 text-emerald-500" /> JSON Format
                </span>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-electric-indigo" />
              </button>
              <button onClick={handleDownloadCSV} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-electric-indigo/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-blue-500" /> CSV Format
                </span>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-electric-indigo" />
              </button>
              <button onClick={handleDownloadMarkdown} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-electric-indigo/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Code className="w-4 h-4 text-amber-500" /> Markdown
                </span>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-electric-indigo" />
              </button>
            </div>
          </div>

          {/* Code Snippets */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Configuration Code</h3>
            <div className="space-y-4">
              <div className="relative group">
                <p className="text-[10px] text-slate-400 mb-1">LangChain (Python)</p>
                <pre className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-[10px] font-mono overflow-x-auto text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  {getLangChainPython()}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(getLangChainPython())}
                  className="absolute top-6 right-2 p-1 bg-white dark:bg-slate-800 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CopyIcon />
                </button>
              </div>
              <div className="relative group">
                <p className="text-[10px] text-slate-400 mb-1">LangChain (JavaScript)</p>
                <pre className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-[10px] font-mono overflow-x-auto text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  {getLangChainJS()}
                </pre>
                <button 
                   onClick={() => navigator.clipboard.writeText(getLangChainJS())}
                   className="absolute top-6 right-2 p-1 bg-white dark:bg-slate-800 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CopyIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
