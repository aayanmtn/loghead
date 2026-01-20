import * as vscode from "vscode";
import { ServerView } from "./views/serverView";
import { serverState } from "./state/serverState";
import { ProjectsView } from "./views/projectsView";
import { LogsView } from "./views/logView";
import { startCore, stopCore } from "./backend/coreProcess";
import * as api from "./backend/api";

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("Loghead Server");
  outputChannel.show(true);

  try {
    outputChannel.appendLine("Activating Loghead extension...");

    const serverView = new ServerView();
    const projectsView = new ProjectsView();
    const logsView = new LogsView();

    context.subscriptions.push(
      outputChannel,
      vscode.window.createTreeView("loghead.server", {
        treeDataProvider: serverView,
      }),
      vscode.window.createTreeView("loghead.projects", {
        treeDataProvider: projectsView,
      }),
      vscode.window.createTreeView("loghead.logs", {
        treeDataProvider: logsView,
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("loghead.start", () => {
        outputChannel.appendLine("Command: loghead.start triggered");
        startCore(context, outputChannel, () => {
          serverView.refresh();
          projectsView.refresh();
          logsView.refresh();
        });
      }),

      vscode.commands.registerCommand("loghead.stop", () => {
        //   serverState.running = false;
        //   serverState.port = undefined;
        //   serverState.mcpToken = undefined;
        //   serverView.refresh();

        stopCore(() => {
          serverView.refresh();
          logsView.refresh();
        });
      }),
      // >> Command to copy MCP token
      vscode.commands.registerCommand("loghead.copyMcpToken", async () => {
        if (!serverState.mcpToken) return;
        await vscode.env.clipboard.writeText(serverState.mcpToken);
        vscode.window.showInformationMessage("MCP token copied");
      }),

      // >> Command to copy MCP config
      vscode.commands.registerCommand("loghead.copyMcpConfig", async () => {
        if (!serverState.mcpToken) return;

        const config = {
          servers: {
            loghead: {
              command: "npx",
              args: ["-y", "@loghead/mcp"],
              env: {
                LOGHEAD_API_URL: `http://localhost:${serverState.port}`,
                LOGHEAD_TOKEN: serverState.mcpToken,
              },
            },
          },
        };

        await vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));

        vscode.window.showInformationMessage("MCP config copied");
      }),

      // >> Command to open logs for a stream
      vscode.commands.registerCommand("loghead.openLogs", (id, name) => {
        vscode.window.showInformationMessage(`Open logs for ${name}`);
      }),

      // >> Command to create a new project
      vscode.commands.registerCommand("loghead.createProject", async () => {
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
        if (!serverState.running) {
          vscode.window.showErrorMessage("Loghead server is not running");
          return;
        }

        let projects: any[] = [];
        try {
          projects = (await api.fetchProjects()) as any[];
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
          return;
        }

        // 🚫 No projects exist
        if (projects.length === 0) {
          const create = await vscode.window.showWarningMessage(
            "No projects found. Create a project first?",
            "Create Project"
          );

          if (create === "Create Project") {
            vscode.commands.executeCommand("loghead.createProject");
          }
          return;
        }

        // ✅ Ask user to choose project
        const projectPick = await vscode.window.showQuickPick(
          projects.map((p: any) => ({
            label: p.name,
            description: p.id,
          })),
          { placeHolder: "Select a project" }
        );

        if (!projectPick) return;

        const streamName = await vscode.window.showInputBox({
          prompt: "Stream name",
        });
        if (!streamName) return;

        // Ask stream type
        const streamType = await vscode.window.showQuickPick(
          ["terminal", "docker", "browser", "opentelemetry"],
          { placeHolder: "Select stream type" }
        );
        if (!streamType) return;

        try {
          await api.createStream(
            projectPick.description!,
            streamName,
            streamType
          );

          vscode.window.showInformationMessage(`Stream "${streamName}" created`);

          projectsView.refresh();
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
        }
      }),

      // >> Command to copy stream token
      vscode.commands.registerCommand("loghead.copyStreamToken", async (node) => {
        if (!serverState.running) {
          vscode.window.showErrorMessage("Loghead is not running");
          return;
        }

        if (!node?.id) return;

        try {
          const token = await api.getStreamToken(node.id);
          await vscode.env.clipboard.writeText(token);

          vscode.window.showInformationMessage(
            `Stream token copied for ${node.name}`
          );
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
        }
      }),

      // >> Command to copy stream ingest command
      vscode.commands.registerCommand(
        "loghead.copyStreamIngest",
        async (node) => {
          if (!serverState.running) {
            vscode.window.showErrorMessage("Loghead is not running");
            return;
          }
          if (!node?.id) return;
          try {
            const token = await api.getStreamToken(node.id);
            const command = `"dev:log": "<APP_RUNNING_SCRIPT> | npx @loghead/terminal --token ${token}"`;
            await vscode.env.clipboard.writeText(command);

            vscode.window.showInformationMessage(
              `Stream ingest command copied for ${node.name}`
            );
          } catch (e) {
            vscode.window.showErrorMessage(String(e));
          }
        }
      ),

      // >> Command to delete a stream
      vscode.commands.registerCommand("loghead.deleteStream", async (node) => {
        if (!serverState.running) {
          vscode.window.showErrorMessage("Loghead is not running");
          return;
        }

        if (!node?.id) return;

        const confirm = await vscode.window.showWarningMessage(
          `Delete stream "${node.name}"?`,
          { modal: true },
          "Delete"
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
        if (!serverState.running) {
          vscode.window.showErrorMessage("Loghead is not running");
          return;
        }

        if (!node?.id) return;

        const confirm = await vscode.window.showWarningMessage(
          `Delete project "${node.name}"?\nAll streams and logs will be removed.`,
          { modal: true },
          "Delete"
        );
        if (confirm !== "Delete") return;

        try {
          await api.deleteProject(node.id);
          vscode.window.showInformationMessage(`Project "${node.name}" deleted`);
          projectsView.refresh();
        } catch (e) {
          vscode.window.showErrorMessage(String(e));
        }
      }),

      // >> Command to select logs project
      vscode.commands.registerCommand("loghead.selectLogsProject", async () => {
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
          { placeHolder: "Select a project" }
        );

        if (!pick) return;

        logsView.setProject(pick.description!);
        logsView.refresh();
      }),

      // >> Command to select logs stream
      vscode.commands.registerCommand("loghead.selectLogsStream", async () => {
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
            description: `${p.name} • ${s.type}`,
            projectId: p.id,
            streamId: s.id,
          }))
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
      })
    );

    outputChannel.appendLine("Loghead extension activated successfully.");
  } catch (e) {
    outputChannel.appendLine(`Error activating Loghead extension: ${e}`);
    vscode.window.showErrorMessage(`Loghead extension activation failed: ${e}`);
  }
}
