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
exports.ActionsView = void 0;
const vscode = __importStar(require("vscode"));
const serverState_1 = require("../state/serverState");
class ActionsView {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(item) {
        return item;
    }
    getChildren() {
        // 🔒 Server not running → gated UI
        if (!serverState_1.serverState.running) {
            const start = new vscode.TreeItem("Start Loghead");
            start.iconPath = new vscode.ThemeIcon("play");
            start.command = {
                command: "loghead.start",
                title: "Start Loghead",
            };
            return [start];
        }
        const createProject = new vscode.TreeItem("Create Project");
        createProject.iconPath = new vscode.ThemeIcon("add");
        createProject.command = {
            command: "loghead.createProject",
            title: "Create Project",
        };
        const createStream = new vscode.TreeItem("Create Stream");
        createStream.iconPath = new vscode.ThemeIcon("add");
        createStream.command = {
            command: "loghead.createStream",
            title: "Create Stream",
        };
        const refresh = new vscode.TreeItem("Refresh");
        refresh.iconPath = new vscode.ThemeIcon("refresh");
        refresh.command = {
            command: "loghead.refresh",
            title: "Refresh",
        };
        return [createProject, createStream, refresh];
    }
}
exports.ActionsView = ActionsView;
//# sourceMappingURL=actionsView.js.map