import * as vscode from "vscode";
import { serverState } from "../state/serverState";

export class ActionsView implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(item: vscode.TreeItem): vscode.TreeItem {
    return item;
  }

  getChildren(): vscode.TreeItem[] {
    // 🔒 Server not running → gated UI
    if (!serverState.running) {
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
