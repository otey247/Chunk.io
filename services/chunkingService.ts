
import { Chunk, StrategyType, GeminiModel } from "../types";
import { chunkWithGemini, enrichChunk } from "./geminiService";
import { MODEL_PRICING } from "../constants";

interface ChunkingOptions {
  chunkSize: number; // chars
  minChunkSize?: number; // chars
  overlap: number; // chars
  strategy: StrategyType;
  regexPattern?: string;
  separators?: string[];
  
  // Parent-Child
  enableParentChild?: boolean;
  parentChunkSize?: number;

  // AI Config
  model: GeminiModel;
  customPrompt?: string;
  enrichment?: {
    summarize: boolean;
    qa: boolean;
    label: boolean;
    hallucination: boolean;
  };
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
  const codeSeparators = [
    /(?=^class\s+)|(?=^def\s+)|(?=^function\s+)|(?=^export\s+)/m as any,
    "\n\n", 
    "\n", 
    ""
  ];
  return recursiveChunker(text, chunkSize, 0, codeSeparators);
};

const sentenceChunker = (text: string, maxSize: number): string[] => {
  const IntlAny = Intl as any;
  if (!IntlAny.Segmenter) {
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
  const parts = text.split(/(?=^#{1,6}\s)/m);
  return parts.filter(p => p.trim().length > 0);
};

const slidingWindowChunker = (text: string, windowSize: number, step: number): string[] => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    const wStep = Math.floor(step / 5) || 1;
    const wSize = Math.floor(windowSize / 5); 

    for (let i = 0; i < words.length; i += wStep) {
        const slice = words.slice(i, i + wSize).join(' ');
        if(slice) chunks.push(slice);
        if(i + wSize >= words.length) break;
    }
    return chunks;
};

const contentAwareChunker = (text: string): string[] => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.filter(p => p.trim().length > 0);
};

const runStrategy = async (text: string, options: ChunkingOptions, isParent = false): Promise<string[]> => {
    const size = isParent ? (options.parentChunkSize || 1000) : options.chunkSize;
    // For parents, typically we don't want AI strategies unless explicitly asked, to save time. 
    // We'll fallback to recursive for parents if the main strategy is AI based to avoid double AI cost.
    const effectiveStrategy = (isParent && [StrategyType.Semantic, StrategyType.Linguistic, StrategyType.LLM].includes(options.strategy)) 
        ? StrategyType.Recursive 
        : options.strategy;

    if ([StrategyType.Semantic, StrategyType.Linguistic, StrategyType.LLM].includes(effectiveStrategy)) {
        return await chunkWithGemini(text, effectiveStrategy, options.model, options.customPrompt);
    } else {
        switch (effectiveStrategy) {
            case StrategyType.FixedSize: return fixedSizeChunker(text, size, options.overlap);
            case StrategyType.Sentence: return sentenceChunker(text, size);
            case StrategyType.Paragraph: return paragraphChunker(text);
            case StrategyType.Recursive:
                const seps = options.separators?.length ? options.separators : ["\n\n", "\n", " ", ""];
                return recursiveChunker(text, size, options.overlap, seps);
            case StrategyType.Document: return documentChunker(text);
            case StrategyType.Code: return codeChunker(text, size);
            case StrategyType.Regex: return regexChunker(text, options.regexPattern || "\n\n");
            case StrategyType.Token: return fixedSizeChunker(text, size * 4, options.overlap * 4);
            case StrategyType.SlidingWindow: return slidingWindowChunker(text, size, options.overlap);
            case StrategyType.ContentAware: return contentAwareChunker(text);
            case StrategyType.Hybrid:
                const pChunks = paragraphChunker(text);
                let buf = "";
                const result: string[] = [];
                pChunks.forEach(p => {
                    if((buf.length + p.length) < size) {
                        buf += "\n\n" + p;
                    } else {
                        if(buf) result.push(buf.trim());
                        buf = p;
                    }
                });
                if(buf) result.push(buf.trim());
                return result;
            default: return [text];
        }
    }
}

// --- Main Process ---

export const processText = async (
  text: string, 
  options: ChunkingOptions
): Promise<{ chunks: Chunk[], stats: any }> => {
  const start = performance.now();
  let allChunks: Chunk[] = [];

  try {
      if (options.enableParentChild) {
          // 1. Generate Parents
          const parentTexts = await runStrategy(text, options, true);
          
          // 2. Generate Children for each Parent
          for (let i = 0; i < parentTexts.length; i++) {
              const parentContent = parentTexts[i];
              const parentId = `parent-${i}-${Date.now()}`;
              
              // Add Parent Chunk
              allChunks.push({
                  id: parentId,
                  content: parentContent,
                  charCount: parentContent.length,
                  tokenCount: Math.ceil(parentContent.split(/\s+/).length * 1.3),
                  keywords: extractKeywords(parentContent),
                  type: 'parent'
              });

              // Generate Children
              const childTexts = await runStrategy(parentContent, options, false);
              const children: Chunk[] = childTexts.map((content, idx) => ({
                id: `child-${i}-${idx}-${Date.now()}`,
                content,
                charCount: content.length,
                tokenCount: Math.ceil(content.split(/\s+/).length * 1.3),
                keywords: extractKeywords(content),
                type: 'child',
                parentId: parentId
              }));
              allChunks.push(...children);
          }

      } else {
          // Standard Process
          const rawChunks = await runStrategy(text, options, false);
          
          // Post-process merging
          let mergedChunks = rawChunks;
          if (options.minChunkSize && options.minChunkSize > 0) {
            mergedChunks = mergeSmallChunks(rawChunks, options.minChunkSize);
          }

          allChunks = mergedChunks.map((content, idx) => ({
            id: `chunk-${idx}-${Date.now()}`,
            content,
            charCount: content.length,
            tokenCount: Math.ceil(content.split(/\s+/).length * 1.3),
            keywords: extractKeywords(content)
          }));
      }

  } catch (e) {
    console.error("Chunking failed, returning original", e);
    allChunks = [{
        id: `err-${Date.now()}`,
        content: text,
        charCount: text.length,
        tokenCount: Math.ceil(text.split(/\s+/).length * 1.3),
        keywords: []
    }];
  }

  // --- AI Enrichment (Parallel) ---
  const enrichmentEnabled = options.enrichment && (options.enrichment.summarize || options.enrichment.qa || options.enrichment.label || options.enrichment.hallucination);
  
  // Only enrich children or flat chunks, skip parents to save cost/time
  const chunksToEnrich = allChunks.filter(c => c.type !== 'parent');

  if (enrichmentEnabled) {
    const limit = 10;
    const toEnrich = chunksToEnrich.slice(0, limit);
    
    // We need to map back to the main array.
    const enrichedResults = await Promise.all(
        toEnrich.map(c => enrichChunk(c, options.model, options.enrichment!))
    );

    // Replace in main array
    allChunks = allChunks.map(c => {
        const found = enrichedResults.find(e => e.id === c.id);
        return found || c;
    });
  }

  const end = performance.now();
  
  // --- Stats Calculation ---
  // Stats should ideally focus on the "retrievable" units (Children or Standard chunks)
  const retrievalChunks = allChunks.filter(c => c.type !== 'parent');
  
  const totalSize = retrievalChunks.reduce((acc, c) => acc + c.charCount, 0);
  const sizes = retrievalChunks.map(c => c.charCount);
  const totalTokens = retrievalChunks.reduce((acc, c) => acc + c.tokenCount, 0);

  // Distribution
  const sizeMap = new Map<string, number>();
  const rangeStep = 100;
  retrievalChunks.forEach(c => {
    const range = Math.floor(c.charCount / rangeStep) * rangeStep;
    const key = `${range}-${range + rangeStep}`;
    sizeMap.set(key, (sizeMap.get(key) || 0) + 1);
  });
  
  const tokenDistribution = Array.from(sizeMap.entries())
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => parseInt(a.range) - parseInt(b.range));

  // Cost Estimation
  const pricing = MODEL_PRICING[options.model];
  const inputTokens = Math.ceil(text.length / 4) + (enrichmentEnabled ? retrievalChunks.length * 50 : 0);
  const outputTokens = totalTokens + (enrichmentEnabled ? retrievalChunks.length * 100 : 0);
  const estimatedCost = (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output);

  const stats = {
    totalChunks: retrievalChunks.length,
    avgSize: retrievalChunks.length ? totalSize / retrievalChunks.length : 0,
    minSize: Math.min(...sizes) || 0,
    maxSize: Math.max(...sizes) || 0,
    processingTimeMs: end - start,
    tokenDistribution,
    estimatedCost
  };

  return { chunks: allChunks, stats };
};
