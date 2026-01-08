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
exports.StreamNode = exports.ProjectNode = void 0;
const vscode = __importStar(require("vscode"));
class ProjectNode extends vscode.TreeItem {
    id;
    name;
    constructor(id, name) {
        super(name, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = id;
        this.name = name;
        this.contextValue = "project";
        this.iconPath = new vscode.ThemeIcon("repo");
    }
}
exports.ProjectNode = ProjectNode;
class StreamNode extends vscode.TreeItem {
    id;
    name;
    type;
    token;
    constructor(id, name, type, token) {
        super(`${name} (${type})`, vscode.TreeItemCollapsibleState.None);
        this.id = id;
        this.name = name;
        this.type = type;
        this.token = token;
        this.contextValue = "stream";
        this.description = type;
        this.iconPath = new vscode.ThemeIcon("symbol-event");
        // this.command = {
        //   command: "loghead.openLogs",
        //   title: "Open Logs",
        //   arguments: [this.id, this.name],
        // };
    }
}
exports.StreamNode = StreamNode;
//# sourceMappingURL=nodes.js.map