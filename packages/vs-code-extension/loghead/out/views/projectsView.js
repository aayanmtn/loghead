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
exports.ProjectsView = void 0;
const vscode = __importStar(require("vscode"));
const nodes_1 = require("./nodes");
const serverState_1 = require("../state/serverState");
const api = __importStar(require("../backend/api"));
class ProjectsView {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    projects = [];
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(item) {
        return item;
    }
    async getChildren(element) {
        // 🔒 Server not running
        if (!serverState_1.serverState.running) {
            const info = new vscode.TreeItem("Loghead server not running");
            info.iconPath = new vscode.ThemeIcon("warning", new vscode.ThemeColor("charts.yellow"));
            return [info];
        }
        // 🌳 Root → projects
        if (!element) {
            try {
                this.projects = (await api.fetchProjects());
            }
            catch (e) {
                const err = new vscode.TreeItem("Failed to load projects");
                err.iconPath = new vscode.ThemeIcon("error");
                return [err];
            }
            if (this.projects.length === 0) {
                const empty = new vscode.TreeItem("No projects found");
                empty.iconPath = new vscode.ThemeIcon("info");
                return [empty];
            }
            return this.projects.map((p) => new nodes_1.ProjectNode(p.id, p.name));
        }
        // 📁 Project → streams
        if (element instanceof nodes_1.ProjectNode) {
            const project = this.projects.find((p) => p.id === element.id);
            if (!project || !project.streams)
                return [];
            if (project.streams.length === 0) {
                const empty = new vscode.TreeItem("No streams found");
                empty.iconPath = new vscode.ThemeIcon("info");
                return [empty];
            }
            return project.streams.map((s) => new nodes_1.StreamNode(s.id, s.name, s.type));
        }
        return [];
    }
}
exports.ProjectsView = ProjectsView;
//# sourceMappingURL=projectsView.js.map