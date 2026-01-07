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
  if (coreProcess) {
    vscode.window.showWarningMessage("Loghead already running");
    return;
  }

  const coreBin = "/home/soman/soman-loghead/packages/core/dist/cli_main.js";
  // coreProcess = spawn("npx", ["-y", "@loghead/core", "start"], {
  //   shell: true,
  //   env: {
  //     ...process.env,
  //     LOGHEAD_ENV: "vscode",
  //   },
  // });
  console.log("Resolved core path:", coreBin);

  if (!fs.existsSync(coreBin)) {
    vscode.window.showErrorMessage(`Core binary not found:\n${coreBin}`);
    return;
  }

  if (coreProcess) {
    vscode.window.showWarningMessage("Loghead already running");
    return;
  }
  coreProcess = spawn("node", [coreBin, "start"], {
    shell: false,
    env: {
      ...process.env,
      LOGHEAD_ENV: "vscode",
    },
  });

  serverState.port = 4567;

  waitForServer()
    .then(fetchSystemToken)
    .then((token) => {
      serverState.mcpToken = token;
      serverState.running = true;
      onUpdate();
    })
    .catch((e) => vscode.window.showErrorMessage(String(e)));

  coreProcess.on("exit", () => {
    serverState.running = false;
    serverState.port = undefined;
    serverState.mcpToken = undefined;
    coreProcess = null;
    onUpdate();
  });
}

async function waitForServer() {
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch("http://localhost:4567/api/projects");
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Loghead failed to start");
}

async function fetchSystemToken(): Promise<string> {
  const res = await fetch("http://localhost:4567/api/system/token");
  if (!res.ok) throw new Error("Failed to fetch MCP token");
  const data = (await res.json()) as { token: string };
  return data.token;
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
