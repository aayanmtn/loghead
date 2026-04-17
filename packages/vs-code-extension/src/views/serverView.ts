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
    if (serverState.connected) {
      return this.connectedView();
    }
    return this.disconnectedView();
  }

  private connectedView(): vscode.TreeItem[] {
    const status = new vscode.TreeItem("Status: Connected");
    status.iconPath = new vscode.ThemeIcon(
      "cloud",
      new vscode.ThemeColor("charts.green"),
    );

    const disconnect = new vscode.TreeItem("Disconnect");
    disconnect.iconPath = new vscode.ThemeIcon("plug");
    disconnect.command = {
      command: "loghead.disconnectCloud",
      title: "Disconnect",
    };

    const copyConfig = new vscode.TreeItem("Copy MCP Config");
    copyConfig.iconPath = new vscode.ThemeIcon("copy");
    copyConfig.command = {
      command: "loghead.copyMcpConfig",
      title: "Copy MCP Config",
    };

    const dashboard = new vscode.TreeItem("Open Dashboard");
    dashboard.iconPath = new vscode.ThemeIcon("link-external");
    dashboard.command = {
      command: "loghead.openDashboard",
      title: "Open Dashboard",
    };

    return [status, disconnect, copyConfig, dashboard];
  }

  private disconnectedView(): vscode.TreeItem[] {
    const status = new vscode.TreeItem("Status: Disconnected");
    status.iconPath = new vscode.ThemeIcon(
      "circle-filled",
      new vscode.ThemeColor("charts.red"),
    );

    const connect = new vscode.TreeItem("Connect to Loghead");
    connect.iconPath = new vscode.ThemeIcon("cloud");
    connect.command = {
      command: "loghead.connectCloud",
      title: "Connect to Loghead",
    };

    return [status, connect];
  }
}