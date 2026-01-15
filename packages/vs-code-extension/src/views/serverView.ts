import * as vscode from "vscode";
import { serverState } from "../state/serverState";

export class ServerView implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(item: vscode.TreeItem): vscode.TreeItem {
    return item;
  }

  getChildren(): vscode.TreeItem[] {
    if (!serverState.running) {
      return this.stoppedView();
    }
    return this.runningView();
  }

  private stoppedView(): vscode.TreeItem[] {
    const status = new vscode.TreeItem("Status: Stopped");
    status.iconPath = new vscode.ThemeIcon(
      "circle-filled",
      new vscode.ThemeColor("charts.red")
    );

    const start = new vscode.TreeItem("Start Loghead");
    start.iconPath = new vscode.ThemeIcon("play");
    start.command = {
      command: "loghead.start",
      title: "Start Loghead",
    };

    return [status, start];
  }

  private runningView(): vscode.TreeItem[] {
    const statusLabel = serverState.managed ? "Status: Running" : "Status: Running (External)";
    const status = new vscode.TreeItem(statusLabel);
    status.iconPath = new vscode.ThemeIcon(
      "circle-filled",
      new vscode.ThemeColor("charts.green")
    );

    const stopLabel = serverState.managed ? "Stop Loghead" : "Disconnect Loghead";
    const stop = new vscode.TreeItem(stopLabel);
    stop.iconPath = new vscode.ThemeIcon("stop");
    stop.command = {
      command: "loghead.stop",
      title: "Stop Loghead",
    };

    const port = new vscode.TreeItem(`Port: ${serverState.port ?? "—"}`);
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
