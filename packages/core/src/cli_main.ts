#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { DbService } from "./services/db";
import { startApiServer } from "./api/server";
import { migrate } from "./db/migrate";
// import { ensureInfrastructure } from "./utils/startup"; // Might need adjustment
import { AuthService } from "./services/auth";
import chalk from "chalk";
import open from "open";

const db = new DbService();
const auth = new AuthService();

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .command(["start", "$0"], "Start API Server", {}, async () => {
            // console.log("Ensuring database is initialized...");
            await migrate(false); // Run migrations silently

            const token = await auth.getOrCreateMcpToken();

            // Start API Server (this sets up express listen)
            await startApiServer(db);

            console.clear();
            console.log(chalk.bold.green(`
   __                 __                    __ 
  / /  ___  ___ ____ / /  ___ ___ ____  ___/ / 
 / /__/ _ \\/ _ \`/ _ \\/ _ \\/ -_) _ \`/ _ \\/ _  /  
/____/\\___/\\_, /_//_/_//_/\\__/\\_,_/\\___/\\_,_/   
          /___/                                 
`));

            console.log(chalk.gray("--------------------------------------------------"));
            console.log(chalk.bold(" 🟢 Loghead is running"));
            console.log(chalk.gray("--------------------------------------------------"));
            console.log("");
            console.log(chalk.bold(" 🖥️  Dashboard : ") + chalk.cyan("http://localhost:4567"));
            console.log(chalk.bold(" 🔌 MCP Server: ") + chalk.cyan("http://localhost:4567/sse"));
            console.log("");
            console.log(chalk.bold(" 🔑 MCP Token : "));
            console.log(chalk.yellow(token));
            console.log("");
            console.log(chalk.gray("--------------------------------------------------"));
            console.log(chalk.gray(" Press Ctrl+C to stop"));

            open("http://localhost:4567");
        })
        .command("projects <cmd> [name]", "Manage projects", (yargs) => {
            yargs
                .command("list", "List projects", {}, () => {
                    const projects = db.listProjects();
                    console.table(projects);
                })
                .command("add <name>", "Add project", {}, (argv) => {
                    const p = db.createProject(argv.name as string);
                    console.log(`Project created: ${p.id}`);
                })
                .command("delete <id>", "Delete project", {}, (argv) => {
                    db.deleteProject(argv.id as string);
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
                    const config: Record<string, unknown> = {};
                    if (argv.type === "docker" && argv.container) {
                        config.container = argv.container;
                    }
                    const s = await db.createStream(argv.project, argv.type as string, argv.name as string, config);
                    console.log(`Stream created: ${s.id}`);
                    console.log(`Token: ${s.token}`);
                })
                .command("token <streamId>", "Get token for stream", {}, async (argv) => {
                    const token = await auth.createStreamToken(argv.streamId as string);
                    console.log(`Token: ${token}`);
                })
                .command("delete <id>", "Delete stream", {}, (argv) => {
                    db.deleteStream(argv.id as string);
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
