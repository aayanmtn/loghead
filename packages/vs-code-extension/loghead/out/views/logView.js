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
exports.LogsView = void 0;
const vscode = __importStar(require("vscode"));
const serverState_1 = require("../state/serverState");
const api = __importStar(require("../backend/api"));
class LogsView {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    selectedProjectId = null;
    selectedStreamId = null;
    logs = [];
    infoItem(text) {
        const item = new vscode.TreeItem(text);
        item.iconPath = new vscode.ThemeIcon("info");
        return item;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(item) {
        return item;
    }
    // ✅ ADD THIS
    hasProject() {
        return this.selectedProjectId !== null;
    }
    // ✅ ADD THIS
    get projectId() {
        return this.selectedProjectId;
    }
    async getChildren(element) {
        if (!serverState_1.serverState.running) {
            return [new vscode.TreeItem("Loghead server not running")];
        }
        if (!serverState_1.serverState.port) {
            return [new vscode.TreeItem("Waiting for Loghead server...")];
        }
        // Root
        if (!element) {
            const items = [
                this.createActionItem("Select Project", "loghead.selectLogsProject"),
                this.createActionItem("Select Stream", "loghead.selectLogsStream"),
                new vscode.TreeItem("─────────────"),
            ];
            if (!this.selectedStreamId) {
                items.push(this.infoItem("No stream selected"));
                return items;
            }
            if (this.logs.length === 0) {
                items.push(this.infoItem("No logs found for this stream"));
                return items;
            }
            // Logs exist
            items.push(...this.logs.map((log) => {
                const item = new vscode.TreeItem(`${log.timestamp}  ${log.content}`, vscode.TreeItemCollapsibleState.None);
                item.iconPath = new vscode.ThemeIcon("output");
                return item;
            }));
            return items;
        }
        return [];
    }
    setProject(projectId) {
        this.selectedProjectId = projectId;
        this.selectedStreamId = null;
        this.logs = [];
        this.refresh();
    }
    setStream(streamId) {
        this.selectedStreamId = streamId;
        this.loadLogs();
    }
    async loadLogs() {
        if (!this.selectedStreamId)
            return;
        try {
            this.logs = (await api.fetchLogs(this.selectedStreamId));
            this.refresh();
        }
        catch (e) {
            vscode.window.showErrorMessage(String(e));
        }
    }
    createActionItem(label, command) {
        const item = new vscode.TreeItem(label);
        item.command = { command, title: label };
        item.iconPath = new vscode.ThemeIcon("list-selection");
        return item;
    }
}
exports.LogsView = LogsView;
//# sourceMappingURL=logView.js.map