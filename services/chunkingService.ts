
import { Chunk, StrategyType, GeminiModel } from "../types";
import { chunkWithGemini, enrichChunk } from "./geminiService";
import { MODEL_PRICING } from "../constants";

interface ChunkingOptions {
  chunkSize: number; // tokens
  minChunkSize?: number; // tokens
  overlap: number; // tokens
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

/**
 * Heuristic token counter. 
 * Standard approximation: 1 token ≈ 4 characters or ~0.75 words.
 * We use a slightly more aggressive 1.3x word count for safety.
 */
const countTokens = (text: string): number => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.35);
};

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

const mergeSmallChunks = (chunks: string[], minTokens: number, separator = "\n"): string[] => {
  if (!minTokens || minTokens <= 0) return chunks;
  
  const merged: string[] = [];
  let buffer = "";

  for (const chunk of chunks) {
    if ((countTokens(buffer) + countTokens(chunk)) < minTokens) {
      buffer = buffer ? buffer + separator + chunk : chunk;
    } else {
      if (buffer) {
        merged.push(buffer);
        buffer = "";
      }
      if (countTokens(chunk) < minTokens) {
        buffer = chunk;
      } else {
        merged.push(chunk);
      }
    }
  }
  if (buffer) merged.push(buffer);
  
  // Final pass
  if (merged.length > 1 && countTokens(merged[merged.length - 1]) < minTokens) {
    const last = merged.pop()!;
    merged[merged.length - 1] += separator + last;
  }

  return merged;
};

// --- Strategies ---

const recursiveChunker = (text: string, maxTokens: number, overlapTokens: number, separators: string[] = ["\n\n", "\n", " ", ""]): string[] => {
  const finalChunks: string[] = [];
  let separator = separators[0];
  let nextSeparators = separators.slice(1);

  // If no separators left, hard split by words to respect tokens
  if (separator === undefined) {
    const words = text.split(/\s+/);
    let i = 0;
    while (i < words.length) {
      // Find how many words fit into maxTokens
      let currentWords: string[] = [];
      let currentTokens = 0;
      let j = i;
      while (j < words.length && currentTokens < maxTokens) {
        const wordTokens = countTokens(words[j] + " ");
        if (currentTokens + wordTokens > maxTokens && currentWords.length > 0) break;
        currentWords.push(words[j]);
        currentTokens += wordTokens;
        j++;
      }
      finalChunks.push(currentWords.join(" "));
      // Advance by (used words - overlap words)
      // Heuristic for overlap words: overlapTokens / 1.35
      const overlapWords = Math.floor(overlapTokens / 1.35);
      i += Math.max(1, (currentWords.length - overlapWords));
    }
    return finalChunks;
  }

  const splits = text.split(separator);
  let buffer: string[] = [];
  let currentTokens = 0;

  for (const split of splits) {
    const splitTokens = countTokens(split);
    
    if (splitTokens > maxTokens) {
      if (buffer.length > 0) {
        finalChunks.push(buffer.join(separator));
        buffer = [];
        currentTokens = 0;
      }
      const recursiveSplits = recursiveChunker(split, maxTokens, overlapTokens, nextSeparators);
      finalChunks.push(...recursiveSplits);
    } else {
      if (currentTokens + splitTokens + (buffer.length > 0 ? countTokens(separator) : 0) > maxTokens) {
         if (buffer.length > 0) finalChunks.push(buffer.join(separator));
         
         // Start new buffer with overlap from previous if possible
         // For simplicity in this heuristic version, we just start fresh
         buffer = [split];
         currentTokens = splitTokens;
      } else {
         buffer.push(split);
         currentTokens += splitTokens + (buffer.length > 1 ? countTokens(separator) : 0);
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

const codeChunker = (text: string, maxTokens: number): string[] => {
  const codeSeparators = [
    /(?=^class\s+)|(?=^def\s+)|(?=^function\s+)|(?=^export\s+)/m as any,
    "\n\n", 
    "\n", 
    ""
  ];
  return recursiveChunker(text, maxTokens, 0, codeSeparators);
};

const sentenceChunker = (text: string, maxTokens: number): string[] => {
  const IntlAny = Intl as any;
  let segments: { segment: string }[] = [];
  
  if (!IntlAny.Segmenter) {
    segments = (text.match(/[^.!?]+[.!?]+["']?|.+/g) || []).map(s => ({ segment: s }));
  } else {
    const segmenter = new IntlAny.Segmenter("en", { granularity: "sentence" });
    segments = Array.from(segmenter.segment(text)) as { segment: string }[];
  }
  
  const chunks: string[] = [];
  let currentChunk = "";
  let currentTokens = 0;

  for (const seg of segments) {
    const sentence = seg.segment;
    const sentenceTokens = countTokens(sentence);
    if ((currentTokens + sentenceTokens) > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
      currentTokens = sentenceTokens;
    } else {
      currentChunk += sentence;
      currentTokens += sentenceTokens;
    }
  }
  if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
  return chunks;
};

const fixedSizeTokenChunker = (text: string, maxTokens: number, overlapTokens: number): string[] => {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  
  const overlapWords = Math.floor(overlapTokens / 1.35);

  while (i < words.length) {
    let currentWords: string[] = [];
    let currentTokens = 0;
    let j = i;
    while (j < words.length && currentTokens < maxTokens) {
      const t = countTokens(words[j] + " ");
      if (currentTokens + t > maxTokens && currentWords.length > 0) break;
      currentWords.push(words[j]);
      currentTokens += t;
      j++;
    }
    chunks.push(currentWords.join(" "));
    i += Math.max(1, (currentWords.length - overlapWords));
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

const slidingWindowChunker = (text: string, windowTokens: number, stepTokens: number): string[] => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    // Convert token limits to word approximations for the window
    const windowWords = Math.floor(windowTokens / 1.35);
    const stepWords = Math.floor(stepTokens / 1.35) || 1;

    for (let i = 0; i < words.length; i += stepWords) {
        const slice = words.slice(i, i + windowWords).join(' ');
        if(slice) chunks.push(slice);
        if(i + windowWords >= words.length) break;
    }
    return chunks;
};

const contentAwareChunker = (text: string): string[] => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.filter(p => p.trim().length > 0);
};

const runStrategy = async (text: string, options: ChunkingOptions, isParent = false): Promise<string[]> => {
    const tokensLimit = isParent ? (options.parentChunkSize || 1000) : options.chunkSize;
    const effectiveStrategy = (isParent && [StrategyType.Semantic, StrategyType.Linguistic, StrategyType.LLM].includes(options.strategy)) 
        ? StrategyType.Recursive 
        : options.strategy;

    if ([StrategyType.Semantic, StrategyType.Linguistic, StrategyType.LLM].includes(effectiveStrategy)) {
        return await chunkWithGemini(text, effectiveStrategy, options.model, options.customPrompt);
    } else {
        switch (effectiveStrategy) {
            case StrategyType.FixedSize: return fixedSizeTokenChunker(text, tokensLimit, options.overlap);
            case StrategyType.Sentence: return sentenceChunker(text, tokensLimit);
            case StrategyType.Paragraph: return paragraphChunker(text);
            case StrategyType.Recursive:
                const seps = options.separators?.length ? options.separators : ["\n\n", "\n", " ", ""];
                return recursiveChunker(text, tokensLimit, options.overlap, seps);
            case StrategyType.Document: return documentChunker(text);
            case StrategyType.Code: return codeChunker(text, tokensLimit);
            case StrategyType.Regex: return regexChunker(text, options.regexPattern || "\n\n");
            case StrategyType.Token: return fixedSizeTokenChunker(text, tokensLimit, options.overlap);
            case StrategyType.SlidingWindow: return slidingWindowChunker(text, tokensLimit, options.overlap);
            case StrategyType.ContentAware: return contentAwareChunker(text);
            case StrategyType.Hybrid:
                const pChunks = paragraphChunker(text);
                let buf = "";
                let bufTokens = 0;
                const result: string[] = [];
                pChunks.forEach(p => {
                    const pTokens = countTokens(p);
                    if((bufTokens + pTokens) < tokensLimit) {
                        buf += "\n\n" + p;
                        bufTokens += pTokens;
                    } else {
                        if(buf) result.push(buf.trim());
                        buf = p;
                        bufTokens = pTokens;
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
                  tokenCount: countTokens(parentContent),
                  keywords: extractKeywords(parentContent),
                  type: 'parent'
              });

              // Generate Children
              const childTexts = await runStrategy(parentContent, options, false);
              const children: Chunk[] = childTexts.map((content, idx) => ({
                id: `child-${i}-${idx}-${Date.now()}`,
                content,
                charCount: content.length,
                tokenCount: countTokens(content),
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
            tokenCount: countTokens(content),
            keywords: extractKeywords(content)
          }));
      }

  } catch (e) {
    console.error("Chunking failed, returning original", e);
    allChunks = [{
        id: `err-${Date.now()}`,
        content: text,
        charCount: text.length,
        tokenCount: countTokens(text),
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
  const retrievalChunks = allChunks.filter(c => c.type !== 'parent');
  
  const totalTokens = retrievalChunks.reduce((acc, c) => acc + c.tokenCount, 0);
  const tokenCounts = retrievalChunks.map(c => c.tokenCount);

  // Distribution (based on tokens)
  const sizeMap = new Map<string, number>();
  const rangeStep = 50;
  retrievalChunks.forEach(c => {
    const range = Math.floor(c.tokenCount / rangeStep) * rangeStep;
    const key = `${range}-${range + rangeStep}`;
    sizeMap.set(key, (sizeMap.get(key) || 0) + 1);
  });
  
  const tokenDistribution = Array.from(sizeMap.entries())
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => parseInt(a.range) - parseInt(b.range));

  // Cost Estimation
  const pricing = MODEL_PRICING[options.model];
  const inputTokens = countTokens(text) + (enrichmentEnabled ? retrievalChunks.length * 50 : 0);
  const outputTokens = totalTokens + (enrichmentEnabled ? retrievalChunks.length * 100 : 0);
  const estimatedCost = (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output);

  const stats = {
    totalChunks: retrievalChunks.length,
    avgSize: retrievalChunks.length ? totalTokens / retrievalChunks.length : 0,
    minSize: Math.min(...tokenCounts) || 0,
    maxSize: Math.max(...tokenCounts) || 0,
    processingTimeMs: end - start,
    tokenDistribution,
    estimatedCost
  };

  return { chunks: allChunks, stats };
};
