#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { DbService } from "./services/db";
import { startApiServer } from "./api/server";
import { migrate } from "./db/migrate";
// import { ensureInfrastructure } from "./utils/startup"; // Might need adjustment
import { startTui } from "./ui/main";
import { AuthService } from "./services/auth";
import chalk from "chalk";

import fs from "fs";
import path from "path";

const db = new DbService();
const auth = new AuthService();

function updatePackageJson(token: string) {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath)) return;

    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.scripts && pkg.scripts["dev:log"]) {
            const currentScript = pkg.scripts["dev:log"];
            // Replace token regex: --token [current-token-chars]
            // We assume token is the last part or followed by space/flag
            const newScript = currentScript.replace(/--token\s+[\w\.\-]+/, `--token ${token}`);

            if (newScript !== currentScript) {
                pkg.scripts["dev:log"] = newScript;
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
                console.log(chalk.green(`Updated "dev:log" script in package.json with new token.`));
            }
        }
    } catch (e) {
        // Ignore errors, silent failure acceptable for convenience feature
    }
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .command(["start", "$0"], "Start API Server", {}, async () => {
            console.log("Ensuring database is initialized...");
            await migrate(false); // Run migrations silently

            const token = await auth.getOrCreateMcpToken();

            // Start API Server (this sets up express listen)
            await startApiServer(db);

            // Start TUI (this will clear screen and take over)
            await startTui(db, token);
            process.exit(0);
        })
        .command("projects <cmd> [name]", "Manage projects", (yargs: yargs.Argv) => {
            yargs
                .command("list", "List projects", {}, () => {
                    const projects = db.listProjects();
                    console.table(projects);
                })
                .command("add <name>", "Add project", {}, (argv: any) => {
                    const p = db.createProject(argv.name as string);
                    console.log(`Project created: ${p.id}`);
                })
                .command("delete <id>", "Delete project", {}, (argv: any) => {
                    db.deleteProject(argv.id as string);
                    console.log(`Project deleted: ${argv.id}`);
                });
        })
        .command("streams <cmd> [type] [name]", "Manage streams", (yargs: yargs.Argv) => {
            yargs
                .command("list", "List streams", {
                    project: { type: "string", demandOption: true }
                }, (argv: any) => {
                    const streams = db.listStreams(argv.project);
                    console.table(streams);
                })
                .command("add <type> <name>", "Add stream", {
                    project: { type: "string", demandOption: true },
                    container: { type: "string" }
                }, async (argv: any) => {
                    const config: Record<string, unknown> = {};
                    if (argv.type === "docker" && argv.container) {
                        config.container = argv.container;
                    }
                    const s = await db.createStream(argv.project, argv.type as string, argv.name as string, config);
                    console.log(`Stream created: ${s.id}`);
                    console.log(`Token: ${s.token}`);
                    updatePackageJson(s.token);
                })
                .command("token <streamId>", "Get token for stream", {}, async (argv: any) => {
                    const token = await auth.createStreamToken(argv.streamId as string);
                    console.log(`Token: ${token}`);
                    updatePackageJson(token);
                })
                .command("delete <id>", "Delete stream", {}, (argv: any) => {
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
