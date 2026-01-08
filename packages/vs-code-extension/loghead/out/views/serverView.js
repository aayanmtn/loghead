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
exports.ServerView = void 0;
const vscode = __importStar(require("vscode"));
const serverState_1 = require("../state/serverState");
class ServerView {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(item) {
        return item;
    }
    getChildren() {
        if (!serverState_1.serverState.running) {
            return this.stoppedView();
        }
        return this.runningView();
    }
    stoppedView() {
        const status = new vscode.TreeItem("Status: Stopped");
        status.iconPath = new vscode.ThemeIcon("circle-filled", new vscode.ThemeColor("charts.red"));
        const start = new vscode.TreeItem("Start Loghead");
        start.iconPath = new vscode.ThemeIcon("play");
        start.command = {
            command: "loghead.start",
            title: "Start Loghead",
        };
        return [status, start];
    }
    runningView() {
        const status = new vscode.TreeItem("Status: Running");
        status.iconPath = new vscode.ThemeIcon("circle-filled", new vscode.ThemeColor("charts.green"));
        const stop = new vscode.TreeItem("Stop Loghead");
        stop.iconPath = new vscode.ThemeIcon("stop");
        stop.command = {
            command: "loghead.stop",
            title: "Stop Loghead",
        };
        const port = new vscode.TreeItem(`Port: ${serverState_1.serverState.port ?? "—"}`);
        port.iconPath = new vscode.ThemeIcon("globe");
        const copyToken = new vscode.TreeItem("Copy MCP Token");
        copyToken.iconPath = new vscode.ThemeIcon("key");
        copyToken.command = {
            command: "loghead.copyMcpToken",
            title: "Copy MCP Token",
        };
        const copyConfig = new vscode.TreeItem("Copy MCP Config");
        copyConfig.iconPath = new vscode.ThemeIcon("copy");
        copyConfig.command = {
            command: "loghead.copyMcpConfig",
            title: "Copy MCP Config",
        };
        return [status, stop, port, copyToken, copyConfig];
    }
}
exports.ServerView = ServerView;
//# sourceMappingURL=serverView.js.map