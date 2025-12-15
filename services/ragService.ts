
import { Chunk } from "../types";

// Math Helper: Cosine Similarity
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Math Helper: Simple Keyword Match (BM25 Approximation)
export const calculateKeywordScore = (query: string, content: string): number => {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const contentLower = content.toLowerCase();
  
  if (queryTerms.length === 0) return 0;
  
  let matches = 0;
  queryTerms.forEach(term => {
    // Simple frequency count
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    const count = (contentLower.match(regex) || []).length;
    if (count > 0) matches += 1 + Math.log(count); // Log dampening
  });
  
  // Normalize roughly 0-1 based on query length
  return Math.min(matches / queryTerms.length, 1);
};

export const rankChunks = (
  chunks: Chunk[], 
  queryEmbedding: number[], 
  query: string,
  alpha: number = 0.7, // 1 = Pure Vector, 0 = Pure Keyword
  rerank: boolean = false
): Chunk[] => {
  
  // Calculate scores
  const scoredChunks = chunks.map(chunk => {
    // Vector Score
    const vecScore = chunk.rag?.embedding 
      ? cosineSimilarity(queryEmbedding, chunk.rag.embedding) 
      : 0;

    // Keyword Score
    const kwScore = calculateKeywordScore(query, chunk.content);
    
    // Hybrid Score
    let finalScore = (vecScore * alpha) + (kwScore * (1 - alpha));
    
    // Reranker Simulation: 
    // In a real app, this calls a Cross-Encoder.
    // Here, we boost chunks that have exact phrase matches slightly, 
    // or penalize very short chunks to simulate "substance" check.
    if (rerank) {
      if (chunk.content.toLowerCase().includes(query.toLowerCase())) {
        finalScore += 0.1; 
      }
      if (chunk.content.length < 50) {
        finalScore -= 0.05;
      }
    }

    return {
      ...chunk,
      rag: {
        ...chunk.rag,
        cosineSimilarity: vecScore,
        keywordScore: kwScore,
        hybridScore: finalScore
      }
    };
  });

  // Sort
  scoredChunks.sort((a, b) => (b.rag?.hybridScore || 0) - (a.rag?.hybridScore || 0));

  // Assign Rank
  return scoredChunks.map((chunk, index) => ({
    ...chunk,
    rag: {
      ...chunk.rag,
      rank: index + 1
    }
  }));
};
