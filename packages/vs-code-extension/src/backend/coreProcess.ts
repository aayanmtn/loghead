import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as vscode from "vscode";
import { serverState } from "../state/serverState";
import * as path from "path";
import * as fs from "fs";

let coreProcess: ChildProcessWithoutNullStreams | null = null;

async function checkServerRunning() {
  try {
    const res = await fetch("http://127.0.0.1:4567/api/projects");
    return res.ok;
  } catch {
    return false;
  }
}

export async function startCore(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel,
  onUpdate: () => void
) {
  if (coreProcess) {
    vscode.window.showWarningMessage("Loghead already running");
    return;
  }

  if (await checkServerRunning()) {
    outputChannel.appendLine("Loghead is already running externally. Connecting...");
    try {
      const token = await fetchSystemToken();
      serverState.mcpToken = token;
      serverState.running = true;
      serverState.managed = false;
      serverState.port = 4567;
      onUpdate();
      return;
    } catch (e) {
      vscode.window.showErrorMessage(`Failed to connect to external Loghead: ${e}`);
      return;
    }
  }

  outputChannel.appendLine("Starting Loghead Core...");

  // Ensure global storage path exists
  if (!fs.existsSync(context.globalStorageUri.fsPath)) {
    fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
  }

  const dbPath = path.join(context.globalStorageUri.fsPath, "loghead.db");
  outputChannel.appendLine(`Database path: ${dbPath}`);

  // coreProcess = spawn("node", [coreBin, "start"], {
  //   shell: false,
  //   env: {
  //     ...process.env,
  //     LOGHEAD_ENV: "vscode",
  //   },
  // });
  coreProcess = spawn("npx", ["-y", "@loghead/core", "start"], {
    shell: true,
    env: {
      ...process.env,
      LOGHEAD_ENV: "vscode",
      LOGHEAD_DB_PATH: dbPath,
    },
  });

  serverState.managed = true;

  coreProcess.stdout.on("data", (data) => {
    outputChannel.append(`${data}`);
  });

  coreProcess.stderr.on("data", (data) => {
    outputChannel.append(`${data}`);
  });

  coreProcess.on("error", (error) => {
    outputChannel.appendLine(`Failed to start Loghead Core: ${error.message}`);
    vscode.window.showErrorMessage(`Loghead Core failed to start: ${error.message}`);
  });

  serverState.port = 4567;

  waitForServer(outputChannel)
    .then(fetchSystemToken)
    .then((token) => {
      serverState.mcpToken = token;
      serverState.running = true;
      outputChannel.appendLine("Loghead Core started successfully.");
      onUpdate();
    })
    .catch((e) => {
      outputChannel.appendLine(`Error initializing Loghead Core: ${e}`);
      vscode.window.showErrorMessage(`Loghead Core initialization failed: ${e}. Check "Loghead Server" output for details.`);
      // Ensure we clean up if initialization failed
      stopCore(() => { });
    });

  coreProcess.on("exit", (code) => {
    outputChannel.appendLine(`Loghead Core exited with code ${code}`);
    serverState.running = false;
    serverState.port = undefined;
    serverState.mcpToken = undefined;
    coreProcess = null;
    onUpdate();
  });
}

async function waitForServer(outputChannel: vscode.OutputChannel) {
  outputChannel.appendLine("Waiting for server to be ready...");
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch("http://127.0.0.1:4567/api/projects");
      if (res.ok) return;
      outputChannel.appendLine(`Attempt ${i + 1}: Server not ready yet (status ${res.status})`);
    } catch (e) {
      outputChannel.appendLine(`Attempt ${i + 1}: Connection failed (${e})`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Loghead failed to start after multiple attempts");
}

async function fetchSystemToken(): Promise<string> {
  const res = await fetch("http://127.0.0.1:4567/api/system/token");
  if (!res.ok) throw new Error("Failed to fetch MCP token");
  const data = (await res.json()) as { token: string };
  return data.token;
}

export function stopCore(onUpdate: () => void) {
  if (!serverState.managed) {
    serverState.running = false;
    serverState.port = undefined;
    serverState.mcpToken = undefined;
    onUpdate();
    return;
  }

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
