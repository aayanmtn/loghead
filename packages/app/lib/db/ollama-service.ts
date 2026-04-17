import OpenAI from "openai";

export class OllamaService {
  private client: OpenAI;
  private model: string;

  constructor(
    apiKey = process.env.OPENROUTER_API_KEY,
    model = process.env.OPENROUTER_MODEL || "openai/text-embedding-3-small",
    baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  ) {
    this.client = new OpenAI({ apiKey, baseURL, timeout: 3000 });
    this.model = model;
  }

  async generateEmbedding(prompt: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: prompt,
      });

      const embedding = response.data?.[0]?.embedding;
      if (!embedding) {
        throw new Error("No embedding returned from OpenRouter");
      }

      return embedding;
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      throw error;
    }
  }

  async ensureModel() {
    // OpenRouter models are remotely hosted; no local pull/check required.
  }
}
