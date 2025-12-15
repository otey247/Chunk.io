import { Chunk, StrategyType } from "../types";
import { chunkWithGemini } from "./geminiService";

interface ChunkingOptions {
  chunkSize: number; // chars
  minChunkSize?: number; // chars
  overlap: number; // chars
  strategy: StrategyType;
  regexPattern?: string;
  separators?: string[];
}

// --- Helper Functions ---

const extractKeywords = (text: string): string[] => {
  const stopwords = new Set(['the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'it', 'this', 'that', 'as', 'by', 'are', 'was']);
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const counts: Record<string, number> = {};
  
  words.forEach(w => {
    if (!stopwords.has(w)) counts[w] = (counts[w] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
};

const mergeSmallChunks = (chunks: string[], minSize: number, separator = "\n"): string[] => {
  if (!minSize || minSize <= 0) return chunks;
  
  const merged: string[] = [];
  let buffer = "";

  for (const chunk of chunks) {
    if ((buffer.length + chunk.length) < minSize) {
      buffer = buffer ? buffer + separator + chunk : chunk;
    } else {
      if (buffer) {
        merged.push(buffer);
        buffer = "";
      }
      if (chunk.length < minSize) {
        buffer = chunk;
      } else {
        merged.push(chunk);
      }
    }
  }
  if (buffer) merged.push(buffer);
  
  // Final pass: if last chunk is too small, merge with previous if possible
  if (merged.length > 1 && merged[merged.length - 1].length < minSize) {
    const last = merged.pop()!;
    merged[merged.length - 1] += separator + last;
  }

  return merged;
};

// --- Strategies ---

const recursiveChunker = (text: string, chunkSize: number, overlap: number, separators: string[] = ["\n\n", "\n", " ", ""]): string[] => {
  const finalChunks: string[] = [];
  let separator = separators[0];
  let nextSeparators = separators.slice(1);

  // If no separators left, hard split
  if (!separator) {
    let i = 0;
    while (i < text.length) {
      finalChunks.push(text.slice(i, Math.min(i + chunkSize, text.length)));
      i += (chunkSize - overlap);
    }
    return finalChunks;
  }

  const splits = text.split(separator);
  let buffer: string[] = [];
  let currentLen = 0;

  for (const split of splits) {
    const splitLen = split.length;
    
    // If a single split is too big, recurse on it
    if (splitLen > chunkSize) {
      if (buffer.length > 0) {
        finalChunks.push(buffer.join(separator));
        buffer = [];
        currentLen = 0;
      }
      const recursiveSplits = recursiveChunker(split, chunkSize, overlap, nextSeparators);
      finalChunks.push(...recursiveSplits);
    } else {
      // If adding this split exceeds chunk size, flush buffer
      if (currentLen + splitLen + (buffer.length > 0 ? separator.length : 0) > chunkSize) {
         finalChunks.push(buffer.join(separator));
         // Simplified overlap for recursive: just start new buffer
         buffer = [split];
         currentLen = splitLen;
      } else {
         buffer.push(split);
         currentLen += splitLen + (buffer.length > 1 ? separator.length : 0);
      }
    }
  }

  if (buffer.length > 0) {
    finalChunks.push(buffer.join(separator));
  }

  return finalChunks;
};

const regexChunker = (text: string, pattern: string): string[] => {
  try {
    const regex = new RegExp(pattern, 'g');
    const parts = text.split(regex);
    return parts.filter(p => p.trim().length > 0);
  } catch (e) {
    console.warn("Invalid Regex", e);
    return [text];
  }
};

const codeChunker = (text: string, chunkSize: number): string[] => {
  // Heuristic based code splitter
  // 1. Try to split by top-level class/function definitions
  // 2. Fallback to line based
  const codeSeparators = [
    /(?=^class\s+)|(?=^def\s+)|(?=^function\s+)|(?=^export\s+)/m as any,
    "\n\n", 
    "\n", 
    ""
  ];
  
  return recursiveChunker(text, chunkSize, 0, codeSeparators);
};

const sentenceChunker = (text: string, maxSize: number): string[] => {
  // Uses Intl.Segmenter for precise sentence boundaries
  const IntlAny = Intl as any;
  if (!IntlAny.Segmenter) {
    // Fallback
    return text.match(/[^.!?]+[.!?]+["']?|.+/g)?.map(t => t.trim()) || [text];
  }
  
  const segmenter = new IntlAny.Segmenter("en", { granularity: "sentence" });
  const segments = Array.from(segmenter.segment(text)) as { segment: string }[];
  
  const chunks: string[] = [];
  let currentChunk = "";

  for (const seg of segments) {
    const sentence = seg.segment;
    if ((currentChunk.length + sentence.length) > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
  return chunks;
};

const fixedSizeChunker = (text: string, size: number, overlap: number): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, Math.min(i + size, text.length)));
    i += (size - overlap);
  }
  return chunks;
};

const paragraphChunker = (text: string): string[] => {
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
};

const documentChunker = (text: string): string[] => {
  // Improved Markdown Header Splitter
  const parts = text.split(/(?=^#{1,6}\s)/m);
  return parts.filter(p => p.trim().length > 0);
};

const slidingWindowChunker = (text: string, windowSize: number, step: number): string[] => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
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
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.filter(p => p.trim().length > 0);
}

// --- Main Process ---

export const processText = async (
  text: string, 
  options: ChunkingOptions
): Promise<Chunk[]> => {
  const start = performance.now();
  let rawChunks: string[] = [];

  try {
    if ([StrategyType.Semantic, StrategyType.Linguistic, StrategyType.LLM].includes(options.strategy)) {
      rawChunks = await chunkWithGemini(text, options.strategy);
    } else {
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
          const seps = options.separators?.length ? options.separators : ["\n\n", "\n", " ", ""];
          rawChunks = recursiveChunker(text, options.chunkSize, options.overlap, seps);
          break;
        case StrategyType.Document:
          rawChunks = documentChunker(text);
          break;
        case StrategyType.Code:
          rawChunks = codeChunker(text, options.chunkSize);
          break;
        case StrategyType.Regex:
          rawChunks = regexChunker(text, options.regexPattern || "\n\n");
          break;
        case StrategyType.Token:
          rawChunks = fixedSizeChunker(text, options.chunkSize * 4, options.overlap * 4);
          break;
        case StrategyType.SlidingWindow:
          rawChunks = slidingWindowChunker(text, options.chunkSize, options.overlap);
          break;
        case StrategyType.ContentAware:
            rawChunks = contentAwareChunker(text);
            break;
        case StrategyType.Hybrid:
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

    // Apply Min Chunk Size Merging if applicable
    if (options.minChunkSize && options.minChunkSize > 0) {
      rawChunks = mergeSmallChunks(rawChunks, options.minChunkSize);
    }

  } catch (e) {
    console.error("Chunking failed, returning original", e);
    rawChunks = [text];
  }

  const end = performance.now();
  
  // Calculate distribution
  const sizeMap = new Map<string, number>();
  const rangeStep = 100;
  rawChunks.forEach(c => {
    const range = Math.floor(c.length / rangeStep) * rangeStep;
    const key = `${range}-${range + rangeStep}`;
    sizeMap.set(key, (sizeMap.get(key) || 0) + 1);
  });
  
  const tokenDistribution = Array.from(sizeMap.entries())
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => parseInt(a.range) - parseInt(b.range));

  return rawChunks.map((content, idx) => ({
    id: `chunk-${idx}-${Date.now()}`,
    content,
    charCount: content.length,
    tokenCount: Math.ceil(content.split(/\s+/).length * 1.3),
    keywords: extractKeywords(content)
  }));
};