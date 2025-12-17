#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function askQuestion(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
}
async function runInit(tokenArg) {
    const packageJsonPath = path_1.default.resolve(process.cwd(), "package.json");
    if (!fs_1.default.existsSync(packageJsonPath)) {
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
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf-8"));
        const scripts = packageJson.scripts || {};
        let startCommand = "<command-to-start-your-project>";
        if (scripts.dev) {
            startCommand = "npm run dev";
        }
        else if (scripts.start) {
            startCommand = "npm start";
        }
        packageJson.scripts = {
            ...scripts,
            "dev:log": `${startCommand} | npx @loghead/terminal --token ${token}`
        };
        fs_1.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`✅ Added "dev:log" script to package.json`);
        console.log(`Run it with: npm run dev:log`);
    }
    catch (e) {
        console.error("Error reading or writing package.json:", e);
        process.exit(1);
    }
}
async function runStream(tokenArg, apiUrlArg) {
    const token = tokenArg || process.env.LOGHEAD_TOKEN;
    if (!token) {
        console.error("Error: Missing token. Provide --token or set LOGHEAD_TOKEN env var.");
        process.exit(1);
    }
    const apiUrl = (apiUrlArg || "http://localhost:4567").replace(/\/$/, "");
    console.error(`[Loghead Terminal] Forwarding stdin to ${apiUrl}...`);
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    // Buffer logs to send in batches
    let batch = [];
    let timer = null;
    const flush = async () => {
        if (batch.length === 0)
            return;
        const logsToSend = [...batch];
        batch = [];
        if (timer)
            clearTimeout(timer);
        timer = null;
        try {
            const parts = token.split(".");
            if (parts.length !== 3)
                throw new Error("Invalid JWT token format");
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
        }
        catch (e) {
            console.error(`[Loghead] Error sending logs:`, e);
        }
    };
    rl.on('line', (line) => {
        if (!line.trim())
            return;
        console.log(line); // Pass through
        batch.push(line);
        if (batch.length >= 10) {
            flush(); // Async but we don't await in event loop
        }
        else if (!timer) {
            timer = setTimeout(flush, 1000);
        }
    });
    rl.on('close', () => {
        flush();
    });
}
async function main() {
    await (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
        .command("init", "Initialize Loghead in your project", (yargs) => {
        return yargs.option("token", { type: "string", description: "Stream token" });
    }, async (argv) => {
        await runInit(argv.token);
    })
        .command("$0", "Start log streaming", (yargs) => {
        return yargs
            .option("token", { type: "string", description: "Stream token" })
            .option("api", { type: "string", default: "http://localhost:4567", description: "API URL" });
    }, async (argv) => {
        await runStream(argv.token, argv.api);
    })
        .help()
        .parse();
}
main();
