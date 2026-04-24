import * as vscode from "vscode";
import { ServerView } from "./views/serverView";
import {
  serverState,
  LOGHEAD_APP_URL,
  LOGHEAD_API_URL,
} from "./state/serverState";
import { ProjectsView } from "./views/projectsView";
import { LogsView } from "./views/logView";
import * as api from "./backend/api";

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("Loghead");
  outputChannel.show(true);

  try {
    outputChannel.appendLine("Activating Loghead extension...");

    const serverView = new ServerView();
    const projectsView = new ProjectsView();
    const logsView = new LogsView();

    // >> Restore State
    context.secrets.get("logheadToken").then((token) => {
      if (token) {
        serverState.cloudToken = token;
        serverState.mcpToken = token;
        serverState.connected = true;
        serverView.refresh();
        projectsView.refresh();
        logsView.refresh();
      }
    });

    context.subscriptions.push(
      vscode.window.registerUriHandler({
        handleUri: async (uri: vscode.Uri) => {
          if (uri.path === "/auth") {
            const query = new URLSearchParams(uri.query);
            const token = query.get("token");
            if (token) {
              await context.secrets.store("logheadToken", token);
              serverState.cloudToken = token;
              serverState.mcpToken = token;
              serverState.connected = true;

              // Fetch connection info
              try {
                const res = await fetch(`${LOGHEAD_API_URL}/api/connection`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                  const data = (await res.json()) as {
                    token?: string;
                    mcpUrl?: string;
                  };
                  if (data.token) {
                    serverState.mcpToken = data.token;
                  }
                }
              } catch (e) {
                outputChannel.appendLine(
                  `Failed to fetch connection info: ${e}`,
                );
              }

              vscode.window.showInformationMessage("Connected to Loghead!");
              serverView.refresh();
              projectsView.refresh();
              logsView.refresh();
            }
          }
        },
      }),
      outputChannel,
      vscode.window.createTreeView("loghead.server", {
        treeDataProvider: serverView,
      }),
      vscode.window.createTreeView("loghead.projects", {
        treeDataProvider: projectsView,
      }),
      vscode.window.createTreeView("loghead.logs", {
        treeDataProvider: logsView,
      }),
    );

    context.subscriptions.push(
      // >> Command: Open Dashboard
      vscode.commands.registerCommand("loghead.openDashboard", () => {
        vscode.env.openExternal(vscode.Uri.parse(LOGHEAD_APP_URL));
      }),

      // >> Command: Connect to Loghead
      vscode.commands.registerCommand("loghead.connect", async () => {
        const uri = vscode.Uri.parse(
          `${LOGHEAD_APP_URL}/extension-auth?callback=${vscode.env.uriScheme}://onvoai.loghead/auth`,
        );
        vscode.env.openExternal(uri);
      }),

      // >> Command: Disconnect
      vscode.commands.registerCommand("loghead.disconnect", async () => {
        await context.secrets.delete("logheadToken");
        serverState.cloudToken = undefined;
        serverState.mcpToken = undefined;
        serverState.connected = false;

        serverView.refresh();
        projectsView.refresh();
        logsView.refresh();
        vscode.window.showInformationMessage("Disconnected from Loghead");
      }),

      // >> Command to copy MCP token
      vscode.commands.registerCommand("loghead.copyMcpToken", async () => {
        if (!serverState.mcpToken) return;
        await vscode.env.clipboard.writeText(serverState.mcpToken);
        vscode.window.showInformationMessage("MCP token copied");
      }),

      // >> Command to copy MCP config
      vscode.commands.registerCommand("loghead.copyMcpConfig", async () => {
        if (!serverState.mcpToken) {
          vscode.window.showWarningMessage("Connect to Loghead first");
          return;
        }

        const config = {
          servers: {
            loghead: {
              command: "npx",
              args: ["-y", "@loghead/mcp"],
              env: {
                LOGHEAD_API_URL: LOGHEAD_API_URL,
                LOGHEAD_TOKEN: serverState.mcpToken,
              },
            },
          },
        };

        await vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
        vscode.window.showInformationMessage("MCP config copied");
      }),

      // >> Command to create a new project
      vscode.commands.registerCommand("loghead.createProject", async () => {
        if (!serverState.connected) {
          vscode.window.showErrorMessage("Connect to Loghead first");
          return;
        }

        const name = await vscode.window.showInputBox({
          prompt: "Project name",
        });

        if (!name) return;

        try {
          await api.createProject(name);
          vscode.window.showInformationMessage(`Project "${name}" created`);
          projectsView.refresh();
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
        }
      }),

      // >> Command to create a new stream
      vscode.commands.registerCommand("loghead.createStream", async () => {
        if (!serverState.connected) {
          vscode.window.showErrorMessage("Connect to Loghead first");
          return;
        }

        let projects: any[] = [];
        try {
          projects = (await api.fetchProjects()) as any[];
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
          return;
        }

        if (projects.length === 0) {
          const create = await vscode.window.showWarningMessage(
            "No projects found. Create a project first?",
            "Create Project",
          );

          if (create === "Create Project") {
            vscode.commands.executeCommand("loghead.createProject");
          }
          return;
        }

        const projectPick = await vscode.window.showQuickPick(
          projects.map((p: any) => ({
            label: p.name,
            description: p.id,
          })),
          { placeHolder: "Select a project" },
        );

        if (!projectPick) return;

        const streamName = await vscode.window.showInputBox({
          prompt: "Stream name",
        });
        if (!streamName) return;

        const streamType = await vscode.window.showQuickPick(
          ["terminal", "docker", "browser", "opentelemetry", "aws"],
          { placeHolder: "Select stream type" },
        );
        if (!streamType) return;

        try {
          await api.createStream(
            projectPick.description!,
            streamName,
            streamType,
          );

          vscode.window.showInformationMessage(
            `Stream "${streamName}" created`,
          );

          projectsView.refresh();
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
        }
      }),

      // >> Command to copy stream token
      vscode.commands.registerCommand(
        "loghead.copyStreamToken",
        async (node) => {
          if (!serverState.connected) {
            vscode.window.showErrorMessage("Connect to Loghead first");
            return;
          }

          if (!node?.id) return;

          try {
            const token = await api.getStreamToken(node.id);
            await vscode.env.clipboard.writeText(token);

            vscode.window.showInformationMessage(
              `Stream token copied for ${node.name}`,
            );
          } catch (e) {
            vscode.window.showErrorMessage(String(e));
          }
        },
      ),

      // >> Command to copy stream ingest command
      vscode.commands.registerCommand(
        "loghead.copyStreamIngest",
        async (node) => {
          if (!serverState.connected) {
            vscode.window.showErrorMessage("Connect to Loghead first");
            return;
          }
          if (!node?.id) return;
          try {
            const token = await api.getStreamToken(node.id);
            const command = `npx @loghead/terminal --base-url ${LOGHEAD_API_URL} --token ${token}`;
            await vscode.env.clipboard.writeText(command);

            vscode.window.showInformationMessage(
              `Stream ingest command copied for ${node.name}`,
            );
          } catch (e) {
            vscode.window.showErrorMessage(String(e));
          }
        },
      ),

      // >> Command to delete a stream
      vscode.commands.registerCommand("loghead.deleteStream", async (node) => {
        if (!serverState.connected) {
          vscode.window.showErrorMessage("Connect to Loghead first");
          return;
        }

        if (!node?.id) return;

        const confirm = await vscode.window.showWarningMessage(
          `Delete stream "${node.name}"?`,
          { modal: true },
          "Delete",
        );
        if (confirm !== "Delete") return;

        try {
          await api.deleteStream(node.id);
          vscode.window.showInformationMessage(`Stream "${node.name}" deleted`);
          projectsView.refresh();
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
        }
      }),

      // >> Command to delete a project
      vscode.commands.registerCommand("loghead.deleteProject", async (node) => {
        if (!serverState.connected) {
          vscode.window.showErrorMessage("Connect to Loghead first");
          return;
        }

        if (!node?.id) return;

        const confirm = await vscode.window.showWarningMessage(
          `Delete project "${node.name}"?\nAll streams and logs will be removed.`,
          { modal: true },
          "Delete",
        );
        if (confirm !== "Delete") return;

        try {
          await api.deleteProject(node.id);
          vscode.window.showInformationMessage(
            `Project "${node.name}" deleted`,
          );
          projectsView.refresh();
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
        }
      }),

      // >> Command to select logs project
      vscode.commands.registerCommand("loghead.selectLogsProject", async () => {
        if (!serverState.connected) {
          vscode.window.showErrorMessage("Connect to Loghead first");
          return;
        }

        const projects = (await api.fetchProjects()) as any[];
        if (!projects.length) {
          vscode.window.showInformationMessage("No projects found");
          return;
        }

        const pick = await vscode.window.showQuickPick(
          projects.map((p: any) => ({
            label: p.name,
            description: p.id,
          })),
          { placeHolder: "Select a project" },
        );

        if (!pick) return;

        logsView.setProject(pick.description!);
        logsView.refresh();
      }),

      // >> Command to select logs stream
      vscode.commands.registerCommand("loghead.selectLogsStream", async () => {
        if (!serverState.connected) {
          vscode.window.showErrorMessage("Connect to Loghead first");
          return;
        }

        let projects: any[] = [];
        try {
          projects = (await api.fetchProjects()) as any[];
        } catch (e) {
          vscode.window.showErrorMessage(`Failed to fetch projects: ${e}`);
          return;
        }

        const allStreams = projects.flatMap((p: any) =>
          (p.streams || []).map((s: any) => ({
            label: s.name,
            description: `${p.name} \u2022 ${s.type}`,
            projectId: p.id,
            streamId: s.id,
          })),
        );

        if (!allStreams.length) {
          vscode.window.showInformationMessage("No streams found");
          return;
        }

        const pick = await vscode.window.showQuickPick(allStreams, {
          placeHolder: "Select a stream",
        });

        if (!pick) return;

        logsView.projectId = pick.projectId;
        logsView.setStream(pick.streamId);
      }),

      // >> Command to refresh projects view
      vscode.commands.registerCommand("loghead.refresh", () => {
        projectsView.refresh();
      }),

      // >> Command to refresh logs view
      vscode.commands.registerCommand("loghead.refreshLogs", () => {
        logsView.loadLogs();
      }),
    );

    outputChannel.appendLine("Loghead extension activated successfully.");
  } catch (e) {
    outputChannel.appendLine(`Error activating Loghead extension: ${e}`);
    vscode.window.showErrorMessage(`Loghead extension activation failed: ${e}`);
  }
}
