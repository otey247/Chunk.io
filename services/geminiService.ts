import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StrategyType, GeminiModel, Chunk } from "../types";

// Helper to get client securely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const chunkWithGemini = async (
  text: string, 
  strategy: StrategyType,
  model: GeminiModel = GeminiModel.Flash,
  customPrompt?: string
): Promise<string[]> => {
  try {
    const client = getClient();
    
    let prompt = customPrompt || "";
    
    if (!prompt) {
      switch (strategy) {
        case StrategyType.Semantic:
          prompt = "Analyze the following text and split it into semantically coherent chunks based on topic shifts. Return a JSON array of strings, where each string is a chunk. Do not alter the text content.";
          break;
        case StrategyType.Linguistic:
          prompt = "Analyze the following text and split it based on linguistic features like clause boundaries and discourse markers to preserve grammatical completeness. Return a JSON array of strings.";
          break;
        case StrategyType.LLM:
          prompt = "You are an expert editor. Split the following text into the most logical, self-contained chunks for a RAG system. Ensure no important context is lost between splits. Return a JSON array of strings.";
          break;
        default:
          prompt = "Split the following text into logical chunks. Return a JSON array of strings.";
      }
    }

    const response = await client.models.generateContent({
      model: model,
      contents: `task: ${prompt}\n\ntext: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return [text]; // Fail safe

  } catch (error) {
    console.error("Gemini Chunking Error:", error);
    throw error;
  }
};

export const enrichChunk = async (
  chunk: Chunk,
  model: GeminiModel,
  options: { summarize: boolean; qa: boolean; label: boolean; hallucination: boolean }
): Promise<Chunk> => {
  const client = getClient();
  const enrichedChunk = { ...chunk };

  const promptParts = [];
  const responseSchema: Schema = { type: Type.OBJECT, properties: {} };

  if (options.summarize) {
    promptParts.push("- Generate a concise 1-sentence summary.");
    responseSchema.properties!['summary'] = { type: Type.STRING };
  }
  if (options.qa) {
    promptParts.push("- Generate 1 key Question/Answer pair based on this text.");
    responseSchema.properties!['qaPair'] = { 
      type: Type.OBJECT, 
      properties: { 
        question: { type: Type.STRING }, 
        answer: { type: Type.STRING } 
      } 
    };
  }
  if (options.label) {
    promptParts.push("- Identify 3 top-level categorical labels/tags.");
    responseSchema.properties!['labels'] = { type: Type.ARRAY, items: { type: Type.STRING } };
  }
  if (options.hallucination) {
    promptParts.push("- Rate (0-10) how well this chunk stands alone without context, and briefly explain why.");
    responseSchema.properties!['hallucinationScore'] = { type: Type.NUMBER };
    responseSchema.properties!['hallucinationReason'] = { type: Type.STRING };
  }

  if (promptParts.length === 0) return chunk;

  const prompt = `Analyze this text snippet:\n"${chunk.content}"\n\nTasks:\n${promptParts.join('\n')}`;

  try {
    const response = await client.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      if (options.summarize) enrichedChunk.summary = data.summary;
      if (options.qa) enrichedChunk.qaPairs = [data.qaPair];
      if (options.label) enrichedChunk.labels = data.labels;
      if (options.hallucination) {
        enrichedChunk.hallucinationScore = data.hallucinationScore;
        enrichedChunk.hallucinationReason = data.hallucinationReason;
      }
    }
  } catch (e) {
    console.warn(`Failed to enrich chunk ${chunk.id}`, e);
  }

  return enrichedChunk;
};