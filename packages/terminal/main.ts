#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import readline from "readline";
import fs from "fs";
import path from "path";

async function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
}

async function runInit(tokenArg?: string) {
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
        console.error("Error: package.json not found in the current directory.");
        process.exit(1);
    }

    let token = tokenArg || process.env.LOGHEAD_TOKEN;
    if (!token) {
        token = await askQuestion("Enter your Loghead Stream Token: ");
    }

    if (!token) {
        console.error("Error: Token is required.");
        process.exit(1);
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        const scripts = packageJson.scripts || {};

        let startCommand = "<command-to-start-your-project>";
        if (scripts.dev) {
            startCommand = "npm run dev";
        } else if (scripts.start) {
            startCommand = "npm start";
        }

        packageJson.scripts = {
            ...scripts,
            "dev:log": `${startCommand} | npx @loghead/terminal --token ${token}`
        };

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`✅ Added "dev:log" script to package.json`);
        console.log(`Run it with: npm run dev:log`);

    } catch (e) {
        console.error("Error reading or writing package.json:", e);
        process.exit(1);
    }
}

async function runStream(tokenArg?: string, apiUrlArg?: string) {
    const token = tokenArg || process.env.LOGHEAD_TOKEN;
    if (!token) {
        console.error("Error: Missing token. Provide --token or set LOGHEAD_TOKEN env var.");
        process.exit(1);
    }

    const apiUrl = (apiUrlArg || "http://localhost:4567").replace(/\/$/, "");
    console.error(`[Loghead Terminal] Forwarding stdin to ${apiUrl}...`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    // Buffer logs to send in batches
    let batch: string[] = [];
    let timer: NodeJS.Timeout | null = null;

    const flush = async () => {
        if (batch.length === 0) return;
        const logsToSend = [...batch];
        batch = [];
        if (timer) clearTimeout(timer);
        timer = null;

        try {
            const parts = token!.split(".");
            if (parts.length !== 3) throw new Error("Invalid JWT token format");
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            const streamId = payload.sub;

            const res = await fetch(`${apiUrl}/api/ingest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    streamId,
                    logs: logsToSend
                })
            });

            if (!res.ok) {
                console.error(`[Loghead] Failed to send logs: ${res.status} ${await res.text()}`);
            }
        } catch (e) {
            console.error(`[Loghead] Error sending logs:`, e);
        }
    };

    rl.on('line', (line) => {
        if (!line.trim()) return;

        console.log(line); // Pass through

        batch.push(line);
        if (batch.length >= 10) {
            flush(); // Async but we don't await in event loop
        } else if (!timer) {
            timer = setTimeout(flush, 1000);
        }
    });

    rl.on('close', () => {
        flush();
    });
}

async function main() {
    await yargs(hideBin(process.argv))
        .command(
            "init",
            "Initialize Loghead in your project",
            (yargs: yargs.Argv) => {
                return yargs.option("token", { type: "string", description: "Stream token" });
            },
            async (argv: any) => {
                await runInit(argv.token as string);
            }
        )
        .command(
            "$0",
            "Start log streaming",
            (yargs: yargs.Argv) => {
                return yargs
                    .option("token", { type: "string", description: "Stream token" })
                    .option("api", { type: "string", default: "http://localhost:4567", description: "API URL" });
            },
            async (argv: any) => {
                await runStream(argv.token as string, argv.api as string);
            }
        )
        .help()
        .parse();
}

main();
