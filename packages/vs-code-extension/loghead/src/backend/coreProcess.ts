import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as vscode from "vscode";
import { serverState } from "../state/serverState";
import * as path from "path";
import * as fs from "fs";
let coreProcess: ChildProcessWithoutNullStreams | null = null;

export function startCore(
  context: vscode.ExtensionContext,
  onUpdate: () => void
) {
  //   const coreBin = path.join(
  //     context.extensionPath,
  //     "..",
  //     "..",
  //     "core",
  //     "dist",
  //     "cli_main.js"
  //   );
  const coreBin = "/home/soman/soman-loghead/packages/core/dist/cli_main.js";
  console.log("Resolved core path:", coreBin);

  if (!fs.existsSync(coreBin)) {
    vscode.window.showErrorMessage(`Core binary not found:\n${coreBin}`);
    return;
  }

  if (coreProcess) {
    vscode.window.showWarningMessage("Loghead already running");
    return;
  }

  coreProcess = spawn("node", [coreBin, "start", "--headless"], {
    shell: false,
    env: {
      ...process.env,
      LOGHEAD_ENV: "vscode",
    },
  });

  coreProcess.stdout.on("data", (data) => {
    console.log("[CORE STDOUT]", data.toString());
    const output = data.toString();

    // Parse PORT
    const portMatch = output.match(/PORT=(\d+)/);
    if (portMatch) {
      serverState.port = Number(portMatch[1]);
    }

    // Parse MCP token
    const tokenMatch = output.match(/MCP_TOKEN=(.+)/);
    if (tokenMatch) {
      serverState.mcpToken = tokenMatch[1].trim();
      serverState.running = true;
    }

    if (serverState.running) {
      onUpdate();
    }
  });

  coreProcess.stderr.on("data", (data) => {
    console.error("[Loghead Core]", data.toString());
  });

  coreProcess.on("exit", () => {
    serverState.running = false;
    serverState.port = undefined;
    serverState.mcpToken = undefined;
    coreProcess = null;
    onUpdate();
  });
}

export function stopCore(onUpdate: () => void) {
  if (!coreProcess) {
    vscode.window.showWarningMessage("Loghead is not running");
    return;
  }

  coreProcess.kill();
  coreProcess = null;

  serverState.running = false;
  serverState.port = undefined;
  serverState.mcpToken = undefined;

  onUpdate();
}
