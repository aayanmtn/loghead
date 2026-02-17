#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { dbService, authService, dbAdapter } from "./db/client.js";
import { startApiServer } from "./api/server.js";
import { migrate } from "@loghead/db";
import chalk from "chalk";

function isUnsupportedVectorIndexError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return msg.includes("invalid expression in CREATE INDEX") && msg.includes("libsql_vector_idx");
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .command(["start", "$0"], "Start API Server", {}, async (argv) => {
            // console.log("Ensuring database is initialized...");
            try {
                await migrate(dbAdapter, false); // Run migrations silently
            } catch (e) {
                if (isUnsupportedVectorIndexError(e)) {
                    console.warn(
                        "[Vector] Embedded DB does not support vector index expressions yet; continuing without vec_logs_idx.",
                    );
                } else {
                    throw e;
                }
            }

            const token = await authService.getOrCreateMcpToken();

            // Start API Server (this sets up express listen)
            await startApiServer(dbService, authService);

            // console.clear();
            console.log(chalk.bold.green(`
▌        ▌          ▌
▌  ▞▀▖▞▀▌▛▀▖▞▀▖▝▀▖▞▀▌
▌  ▌ ▌▚▄▌▌ ▌▛▀ ▞▀▌▌ ▌
▀▀▘▝▀ ▗▄▘▘ ▘▝▀▘▝▀▘▝▀▘                                
`));

            console.log(
                chalk.gray("--------------------------------------------------")
            );
            console.log(chalk.bold(" 🟢 Loghead is running"));
            console.log(
                chalk.gray("--------------------------------------------------")
            );
            console.log("");
            console.log(
                chalk.bold(" 🖥️  Dashboard : ") + chalk.cyan("http://localhost:4567")
            );
            console.log(
                chalk.bold(" 🔌 MCP Server: ") + chalk.cyan("http://localhost:4567/sse")
            );
            console.log("");
            console.log(chalk.bold(" 🔑 MCP Token : "));
            console.log(chalk.yellow(token));
            console.log("");
            console.log(
                chalk.gray("--------------------------------------------------")
            );
            console.log(chalk.gray(" Press Ctrl+C to stop"));
        })
        .command("projects <cmd> [name]", "Manage projects", (yargs) => {
            yargs
                .command("list", "List projects", {}, async () => {
                    const projects = await dbService.listProjects();
                    console.table(projects);
                })
                .command("add <name>", "Add project", {}, async (argv) => {
                    const p = await dbService.createProject(argv.name as string);
                    console.log(`Project created: ${p.id}`);
                })
                .command("delete <id>", "Delete project", {}, async (argv) => {
                    await dbService.deleteProject(argv.id as string);
                    console.log(`Project deleted: ${argv.id}`);
                });
        })
        .command("streams <cmd> [type] [name]", "Manage streams", (yargs) => {
            yargs
                .command(
                    "list",
                    "List streams",
                    {
                        project: { type: "string", demandOption: true },
                    },
                    async (argv) => {
                        const streams = await dbService.listStreams(argv.project);
                        console.table(streams);
                    }
                )
                .command(
                    "add <type> <name>",
                    "Add stream",
                    {
                        project: { type: "string", demandOption: true },
                        container: { type: "string" },
                    },
                    async (argv) => {
                        const config: Record<string, unknown> = {};
                        if (argv.type === "docker" && argv.container) {
                            config.container = argv.container;
                        }
                        const s = await dbService.createStream(
                            argv.project,
                            argv.type as string,
                            argv.name as string,
                            config
                        );
                        console.log(`Stream created: ${s.id}`);
                        console.log(`Token: ${s.token}`);
                    }
                )
                .command(
                    "token <streamId>",
                    "Get token for stream",
                    {},
                    async (argv) => {
                        const token = await authService.createStreamToken(argv.streamId as string);
                        console.log(`Token: ${token}`);
                    }
                )
                .command("delete <id>", "Delete stream", {}, async (argv) => {
                    await dbService.deleteStream(argv.id as string);
                    console.log(`Stream deleted: ${argv.id}`);
                });
        })
        .demandCommand(1)
        .strict()
        .help()
        .parse();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
