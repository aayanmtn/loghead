import * as vscode from "vscode";
import { serverState } from "../state/serverState";
import * as api from "../backend/api";

export class LogsView implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private selectedStreamId: string | null = null;
  public projectId: string | null = null;
  private logs: any[] = [];

  private infoItem(text: string) {
    const item = new vscode.TreeItem(text);
    item.iconPath = new vscode.ThemeIcon("info");
    return item;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(item: vscode.TreeItem) {
    return item;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!serverState.connected) {
      return [new vscode.TreeItem("Connect to Loghead to view logs")];
    }

    // Root
    if (!element) {
      const items: vscode.TreeItem[] = [
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
      items.push(
        ...this.logs.map((log: any) => {
          const item = new vscode.TreeItem(
            `${log.timestamp}  ${log.content}`,
            vscode.TreeItemCollapsibleState.None,
          );
          item.iconPath = new vscode.ThemeIcon("output");
          return item;
        }),
      );

      return items;
    }

    return [];
  }

  setStream(streamId: string) {
    this.selectedStreamId = streamId;
    this.loadLogs();
  }

  hasProject(): boolean {
    return !!this.projectId;
  }

  setProject(projectId: string) {
    this.projectId = projectId;
    this.selectedStreamId = null;
    this.logs = [];
    this.refresh();
  }

  async loadLogs() {
    if (!this.selectedStreamId) return;

    try {
      this.logs = (await api.fetchLogs(this.selectedStreamId)) as any[];
      this.refresh();
    } catch (e) {
      vscode.window.showErrorMessage(String(e));
    }
  }

  private createActionItem(label: string, command: string) {
    const item = new vscode.TreeItem(label);
    item.command = { command, title: label };
    item.iconPath = new vscode.ThemeIcon("list-selection");
    return item;
  }
}
