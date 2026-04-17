import { OllamaService } from "../ollama-service.js";

export const PREFERRED_EMBEDDING_MODEL = "qwen3-embedding:0.6b";

export async function generateEmbedding(
  service: OllamaService,
  text: string,
): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Ensure we use the model configured in the service or passed in
  // The service handles model logic internally for now.
  return service.generateEmbedding(text);
}
