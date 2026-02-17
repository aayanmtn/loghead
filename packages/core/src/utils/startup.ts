import chalk from "chalk";
import { OllamaService, migrate } from "@loghead/db";
import { dbAdapter } from "../db/client.js";

function isUnsupportedVectorIndexError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return msg.includes("invalid expression in CREATE INDEX") && msg.includes("libsql_vector_idx");
}

export async function ensureInfrastructure() {
    console.log(chalk.bold.blue("\n🚀Performing system preflight checks..."));

    // 1. Check Local Ollama
    await checkStep("Checking local Ollama...", async () => {
        try {
            // Node.js fetch needs global fetch or polyfill in Node 18+. 
            // Assuming Node 18+ which has fetch.
            const response = await fetch("http://localhost:11434/api/tags");
            if (!response.ok) throw new Error("Ollama is not running");
        } catch {
            throw new Error("Ollama is not accessible at http://localhost:11434. Please install and run Ollama.");
        }
    });

    // 2. Check Database & Migrations (LibSQL)
    await checkStep("Initializing database...", async () => {
        try {
            await migrate(dbAdapter, false);
        } catch (e) {
            if (isUnsupportedVectorIndexError(e)) {
                console.log(
                    chalk.yellow(
                        "\n   ➤ Embedded DB does not support vector index expressions yet; continuing without vec_logs_idx.",
                    ),
                );
                return;
            }
            console.log(chalk.yellow("\n   ➤ Migration failed..."));
            throw e;
        }
    });

    // 3. Check Ollama Model
    await checkStep("Checking embedding model (qwen3-embedding)...", async () => {
        const ollama = new OllamaService();
        await ollama.ensureModel();
    });

    console.log(`${chalk.green("✔")} System preflight checks complete`);
}

async function checkStep(name: string, action: () => Promise<void>) {
    // Print pending state
    process.stdout.write(`${chalk.cyan("○")} ${name}`);

    try {
        await action();
        // Clear line and print success
        process.stdout.write(`\r${chalk.green("✔")} ${name}      \n`);
    } catch (e) {
        process.stdout.write(`\r${chalk.red("✖")} ${name}\n`);
        console.error(chalk.red(`   Error: ${e instanceof Error ? e.message : e}`));
        process.exit(1);
    }
}
