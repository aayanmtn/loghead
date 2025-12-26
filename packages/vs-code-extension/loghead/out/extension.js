"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const serverView_1 = require("./views/serverView");
const serverState_1 = require("./state/serverState");
const projectsView_1 = require("./views/projectsView");
const actionsView_1 = require("./views/actionsView");
const logView_1 = require("./views/logView");
const coreProcess_1 = require("./backend/coreProcess");
const api = __importStar(require("./backend/api"));
function activate(context) {
    const serverView = new serverView_1.ServerView();
    const projectsView = new projectsView_1.ProjectsView();
    const actionsView = new actionsView_1.ActionsView();
    const logsView = new logView_1.LogsView();
    context.subscriptions.push(vscode.window.createTreeView("loghead.server", {
        treeDataProvider: serverView,
    }), vscode.window.createTreeView("loghead.projects", {
        treeDataProvider: projectsView,
    }), vscode.window.createTreeView("loghead.actions", {
        treeDataProvider: actionsView,
    }), vscode.window.createTreeView("loghead.logs", {
        treeDataProvider: logsView,
    }));
    context.subscriptions.push(vscode.commands.registerCommand("loghead.start", () => {
        //   serverState.running = true;
        //   serverState.port = 4567;
        //   serverState.mcpToken = "dummy-token-for-now";
        //   serverView.refresh();
        (0, coreProcess_1.startCore)(context, () => {
            serverView.refresh();
            projectsView.refresh();
            actionsView.refresh();
            logsView.refresh();
        });
    }), vscode.commands.registerCommand("loghead.stop", () => {
        //   serverState.running = false;
        //   serverState.port = undefined;
        //   serverState.mcpToken = undefined;
        //   serverView.refresh();
        (0, coreProcess_1.stopCore)(() => {
            serverView.refresh();
            logsView.refresh();
        });
    }), 
    // >> Command to copy MCP token
    vscode.commands.registerCommand("loghead.copyMcpToken", async () => {
        if (!serverState_1.serverState.mcpToken)
            return;
        await vscode.env.clipboard.writeText(serverState_1.serverState.mcpToken);
        vscode.window.showInformationMessage("MCP token copied");
    }), 
    // >> Command to copy MCP config
    vscode.commands.registerCommand("loghead.copyMcpConfig", async () => {
        if (!serverState_1.serverState.mcpToken)
            return;
        const config = {
            servers: {
                loghead: {
                    command: "npx",
                    args: ["-y", "@loghead/mcp"],
                    env: {
                        LOGHEAD_API_URL: `http://localhost:${serverState_1.serverState.port}`,
                        LOGHEAD_TOKEN: serverState_1.serverState.mcpToken,
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
        if (!name)
            return;
        try {
            await api.createProject(name);
            vscode.window.showInformationMessage(`Project "${name}" created`);
            projectsView.refresh();
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
        }
    }), 
    // >> Command to create a new stream
    vscode.commands.registerCommand("loghead.createStream", async () => {
        if (!serverState_1.serverState.running) {
            vscode.window.showErrorMessage("Loghead server is not running");
            return;
        }
        let projects = [];
        try {
            projects = (await api.fetchProjects());
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
            return;
        }
        // 🚫 No projects exist
        if (projects.length === 0) {
            const create = await vscode.window.showWarningMessage("No projects found. Create a project first?", "Create Project");
            if (create === "Create Project") {
                vscode.commands.executeCommand("loghead.createProject");
            }
            return;
        }
        // ✅ Ask user to choose project
        const projectPick = await vscode.window.showQuickPick(projects.map((p) => ({
            label: p.name,
            description: p.id,
        })), { placeHolder: "Select a project" });
        if (!projectPick)
            return;
        const streamName = await vscode.window.showInputBox({
            prompt: "Stream name",
        });
        if (!streamName)
            return;
        // Ask stream type
        const streamType = await vscode.window.showQuickPick(["terminal", "docker", "browser", "opentelemetry"], { placeHolder: "Select stream type" });
        if (!streamType)
            return;
        try {
            await api.createStream(projectPick.description, streamName, streamType);
            vscode.window.showInformationMessage(`Stream "${streamName}" created`);
            projectsView.refresh();
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
        }
    }), 
    // >> Command to copy stream token
    vscode.commands.registerCommand("loghead.copyStreamToken", async (node) => {
        if (!serverState_1.serverState.running) {
            vscode.window.showErrorMessage("Loghead is not running");
            return;
        }
        if (!node?.id)
            return;
        try {
            const token = await api.getStreamToken(node.id);
            await vscode.env.clipboard.writeText(token);
            vscode.window.showInformationMessage(`Stream token copied for ${node.name}`);
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
        }
    }), 
    // >> Command to copy stream ingest command
    vscode.commands.registerCommand("loghead.copyStreamIngest", async (node) => {
        if (!serverState_1.serverState.running) {
            vscode.window.showErrorMessage("Loghead is not running");
            return;
        }
        if (!node?.id)
            return;
        try {
            const token = await api.getStreamToken(node.id);
            const command = `"dev:log": "<APP_RUNNING_SCRIPT> | npx @loghead/terminal --token ${token}"`;
            await vscode.env.clipboard.writeText(command);
            vscode.window.showInformationMessage(`Stream ingest command copied for ${node.name}`);
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
        }
    }), 
    // >> Command to delete a stream
    vscode.commands.registerCommand("loghead.deleteStream", async (node) => {
        if (!serverState_1.serverState.running) {
            vscode.window.showErrorMessage("Loghead is not running");
            return;
        }
        if (!node?.id)
            return;
        const confirm = await vscode.window.showWarningMessage(`Delete stream "${node.name}"?`, { modal: true }, "Delete");
        if (confirm !== "Delete")
            return;
        try {
            await api.deleteStream(node.id);
            vscode.window.showInformationMessage(`Stream "${node.name}" deleted`);
            projectsView.refresh();
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
        }
    }), 
    // >> Command to delete a project
    vscode.commands.registerCommand("loghead.deleteProject", async (node) => {
        if (!serverState_1.serverState.running) {
            vscode.window.showErrorMessage("Loghead is not running");
            return;
        }
        if (!node?.id)
            return;
        const confirm = await vscode.window.showWarningMessage(`Delete project "${node.name}"?\nAll streams and logs will be removed.`, { modal: true }, "Delete");
        if (confirm !== "Delete")
            return;
        try {
            await api.deleteProject(node.id);
            vscode.window.showInformationMessage(`Project "${node.name}" deleted`);
            projectsView.refresh();
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
        }
    }), 
    // >> Command to select logs project
    vscode.commands.registerCommand("loghead.selectLogsProject", async () => {
        const projects = (await api.fetchProjects());
        if (!projects.length) {
            vscode.window.showInformationMessage("No projects found");
            return;
        }
        const pick = await vscode.window.showQuickPick(projects.map((p) => ({
            label: p.name,
            description: p.id,
        })), { placeHolder: "Select a project" });
        if (!pick)
            return;
        logsView.setProject(pick.description);
        logsView.refresh();
    }), 
    // >> Command to select logs stream
    vscode.commands.registerCommand("loghead.selectLogsStream", async () => {
        if (!logsView.hasProject()) {
            vscode.window.showWarningMessage("Select a project first");
            return;
        }
        const projects = (await api.fetchProjects());
        const project = projects.find((p) => p.id === logsView.projectId);
        if (!project?.streams?.length) {
            vscode.window.showInformationMessage("No streams found");
            return;
        }
        const pick = await vscode.window.showQuickPick(project.streams.map((s) => ({
            label: s.name,
            description: s.type,
            streamId: s.id,
        })), { placeHolder: "Select a stream" });
        if (!pick)
            return;
        logsView.setStream(pick.streamId);
    }), 
    // >> Command to refresh projects view
    vscode.commands.registerCommand("loghead.refresh", () => {
        projectsView.refresh();
    }));
}
//# sourceMappingURL=extension.js.map