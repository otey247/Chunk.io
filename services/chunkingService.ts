import { Chunk, StrategyType } from "../types";
import { chunkWithGemini } from "./geminiService";

interface ChunkingOptions {
  chunkSize: number; // chars
  overlap: number; // chars
  strategy: StrategyType;
}

// Deterministic Local Chunkers
const fixedSizeChunker = (text: string, size: number, overlap: number): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, Math.min(i + size, text.length)));
    i += (size - overlap);
  }
  return chunks;
};

const sentenceChunker = (text: string, maxSize: number): string[] => {
  // Simple regex for sentence splitting, respecting common abbreviations would be better but this is a demo
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
  return chunks;
};

const paragraphChunker = (text: string): string[] => {
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
};

const documentChunker = (text: string): string[] => {
  // Split by headers (# or ##)
  const parts = text.split(/(?=^#{1,3}\s)/m);
  return parts.filter(p => p.trim().length > 0);
};

const slidingWindowChunker = (text: string, windowSize: number, step: number): string[] => {
    // Word based sliding window for better visualization
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    // Convert chars to approx words for the logic
    const wSize = Math.floor(windowSize / 5); 
    const wStep = Math.floor(step / 5) || 1;

    for (let i = 0; i < words.length; i += wStep) {
        const slice = words.slice(i, i + wSize).join(' ');
        if(slice) chunks.push(slice);
        if(i + wSize >= words.length) break;
    }
    return chunks;
}

const contentAwareChunker = (text: string): string[] => {
    // Detect code blocks vs prose
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.filter(p => p.trim().length > 0);
}

export const processText = async (
  text: string, 
  options: ChunkingOptions
): Promise<Chunk[]> => {
  const start = performance.now();
  let rawChunks: string[] = [];

  try {
    // Route to Gemini for AI strategies
    if ([StrategyType.Semantic, StrategyType.Linguistic, StrategyType.LLM].includes(options.strategy)) {
      rawChunks = await chunkWithGemini(text, options.strategy);
    } else {
      // Local Logic
      switch (options.strategy) {
        case StrategyType.FixedSize:
          rawChunks = fixedSizeChunker(text, options.chunkSize, options.overlap);
          break;
        case StrategyType.Sentence:
          rawChunks = sentenceChunker(text, options.chunkSize);
          break;
        case StrategyType.Paragraph:
          rawChunks = paragraphChunker(text);
          break;
        case StrategyType.Recursive:
          // Simplified recursive: Split by para, if too big, split by sentence
          const paras = paragraphChunker(text);
          paras.forEach(p => {
            if (p.length > options.chunkSize) {
              rawChunks.push(...sentenceChunker(p, options.chunkSize));
            } else {
              rawChunks.push(p);
            }
          });
          break;
        case StrategyType.Document:
          rawChunks = documentChunker(text);
          break;
        case StrategyType.Token:
          // Approx 4 chars per token
          rawChunks = fixedSizeChunker(text, options.chunkSize * 4, options.overlap * 4);
          break;
        case StrategyType.SlidingWindow:
          rawChunks = slidingWindowChunker(text, options.chunkSize, options.overlap);
          break;
        case StrategyType.ContentAware:
            rawChunks = contentAwareChunker(text);
            break;
        case StrategyType.Hybrid:
            // Hybrid: Paragraphs, but if paragraph is tiny, merge with next
            const pChunks = paragraphChunker(text);
            let buf = "";
            pChunks.forEach(p => {
                if((buf.length + p.length) < options.chunkSize) {
                    buf += "\n\n" + p;
                } else {
                    if(buf) rawChunks.push(buf.trim());
                    buf = p;
                }
            });
            if(buf) rawChunks.push(buf.trim());
            break;
        default:
          rawChunks = [text];
      }
    }
  } catch (e) {
    console.error("Chunking failed, returning original", e);
    // Fallback if API fails or logic errors
    rawChunks = [text];
  }

  const end = performance.now();
  
  // Hydrate chunks with metadata
  return rawChunks.map((content, idx) => ({
    id: `chunk-${idx}-${Date.now()}`,
    content,
    charCount: content.length,
    tokenCount: Math.ceil(content.split(/\s+/).length * 1.3), // Rough est
  }));
};