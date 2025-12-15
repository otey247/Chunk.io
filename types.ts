export enum StrategyType {
  FixedSize = 'Fixed-Size Chunking',
  Recursive = 'Recursive Chunking',
  Document = 'Document-Based Chunking',
  Semantic = 'Semantic Chunking',
  Sentence = 'Sentence-Based Chunking',
  Paragraph = 'Paragraph-Based Chunking',
  Token = 'Token-Based Chunking',
  SlidingWindow = 'Sliding Window Chunking',
  ContentAware = 'Content-Aware Chunking',
  Metadata = 'Metadata-Driven Chunking',
  Linguistic = 'Linguistic Chunking',
  Hybrid = 'Hybrid/Adaptive Chunking',
  LLM = 'LLM-Based Chunking',
  Code = 'Code Splitter',
  Regex = 'Regex Splitter',
}

export enum GeminiModel {
  Flash = 'gemini-2.5-flash',
  Pro = 'gemini-3-pro-preview',
  Lite = 'gemini-flash-lite-latest',
}

export interface StrategyDefinition {
  id: string;
  name: StrategyType;
  description: string;
  bestFor: string[];
  worstFor: string[];
  complexity: 'Low' | 'Medium' | 'High';
  requiresAI: boolean;
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface Chunk {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  tokenCount: number;
  charCount: number;
  start?: number;
  end?: number;
  keywords?: string[];
  
  // Enrichment Data
  summary?: string;
  qaPairs?: QAPair[];
  labels?: string[];
  hallucinationScore?: number; // 0-10 (10 = stands alone perfectly)
  hallucinationReason?: string;
}

export interface ProcessingStats {
  totalChunks: number;
  avgSize: number;
  minSize: number;
  maxSize: number;
  processingTimeMs: number;
  tokenDistribution: { range: string; count: number }[];
  estimatedCost: number;
}