export declare class OllamaService {
    private client;
    private model;
    constructor(host?: string, model?: string);
    generateEmbedding(prompt: string): Promise<number[]>;
    ensureModel(): Promise<void>;
}
