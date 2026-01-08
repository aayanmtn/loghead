#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const db_1 = require("./services/db");
const server_1 = require("./api/server");
const migrate_1 = require("./db/migrate");
// import { ensureInfrastructure } from "./utils/startup"; // Might need adjustment
const auth_1 = require("./services/auth");
const chalk_1 = __importDefault(require("chalk"));
const open_1 = __importDefault(require("open"));
const db = new db_1.DbService();
const auth = new auth_1.AuthService();
async function main() {
    const argv = await (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
        .command(["start", "$0"], "Start API Server", {}, async () => {
        // console.log("Ensuring database is initialized...");
        await (0, migrate_1.migrate)(false); // Run migrations silently
        const token = await auth.getOrCreateMcpToken();
        // Start API Server (this sets up express listen)
        await (0, server_1.startApiServer)(db);
        console.clear();
        console.log(chalk_1.default.bold.green(`
▌        ▌          ▌
▌  ▞▀▖▞▀▌▛▀▖▞▀▖▝▀▖▞▀▌
▌  ▌ ▌▚▄▌▌ ▌▛▀ ▞▀▌▌ ▌
▀▀▘▝▀ ▗▄▘▘ ▘▝▀▘▝▀▘▝▀▘                                
`));
        console.log(chalk_1.default.gray("--------------------------------------------------"));
        console.log(chalk_1.default.bold(" 🟢 Loghead is running"));
        console.log(chalk_1.default.gray("--------------------------------------------------"));
        console.log("");
        console.log(chalk_1.default.bold(" 🖥️  Dashboard : ") + chalk_1.default.cyan("http://localhost:4567"));
        console.log(chalk_1.default.bold(" 🔌 MCP Server: ") + chalk_1.default.cyan("http://localhost:4567/sse"));
        console.log("");
        console.log(chalk_1.default.bold(" 🔑 MCP Token : "));
        console.log(chalk_1.default.yellow(token));
        console.log("");
        console.log(chalk_1.default.gray("--------------------------------------------------"));
        console.log(chalk_1.default.gray(" Press Ctrl+C to stop"));
        (0, open_1.default)("http://localhost:4567");
    })
        .command("projects <cmd> [name]", "Manage projects", (yargs) => {
        yargs
            .command("list", "List projects", {}, () => {
            const projects = db.listProjects();
            console.table(projects);
        })
            .command("add <name>", "Add project", {}, (argv) => {
            const p = db.createProject(argv.name);
            console.log(`Project created: ${p.id}`);
        })
            .command("delete <id>", "Delete project", {}, (argv) => {
            db.deleteProject(argv.id);
            console.log(`Project deleted: ${argv.id}`);
        });
    })
        .command("streams <cmd> [type] [name]", "Manage streams", (yargs) => {
        yargs
            .command("list", "List streams", {
            project: { type: "string", demandOption: true }
        }, (argv) => {
            const streams = db.listStreams(argv.project);
            console.table(streams);
        })
            .command("add <type> <name>", "Add stream", {
            project: { type: "string", demandOption: true },
            container: { type: "string" }
        }, async (argv) => {
            const config = {};
            if (argv.type === "docker" && argv.container) {
                config.container = argv.container;
            }
            const s = await db.createStream(argv.project, argv.type, argv.name, config);
            console.log(`Stream created: ${s.id}`);
            console.log(`Token: ${s.token}`);
        })
            .command("token <streamId>", "Get token for stream", {}, async (argv) => {
            const token = await auth.createStreamToken(argv.streamId);
            console.log(`Token: ${token}`);
        })
            .command("delete <id>", "Delete stream", {}, (argv) => {
            db.deleteStream(argv.id);
            console.log(`Stream deleted: ${argv.id}`);
        });
    })
        .demandCommand(1)
        .strict()
        .help()
        .parse();
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
