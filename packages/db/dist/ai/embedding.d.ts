import { OllamaService } from "../ollama-service.js";
export declare const PREFERRED_EMBEDDING_MODEL = "qwen3-embedding:0.6b";
export declare function generateEmbedding(service: OllamaService, text: string): Promise<number[]>;
