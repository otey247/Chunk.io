import { GoogleGenAI, Type } from "@google/genai";
import { StrategyType } from "../types";

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
  strategy: StrategyType
): Promise<string[]> => {
  try {
    const client = getClient();
    
    let prompt = "";
    
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
        // Fallback for others if routed here by mistake
        prompt = "Split the following text into logical chunks. Return a JSON array of strings.";
    }

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
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