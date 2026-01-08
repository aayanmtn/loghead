import * as vscode from "vscode";
import { serverState } from "../state/serverState";
import * as api from "../backend/api";

export class LogsView implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private selectedProjectId: string | null = null;
  private selectedStreamId: string | null = null;
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

  // ✅ ADD THIS
  hasProject(): boolean {
    return this.selectedProjectId !== null;
  }

  // ✅ ADD THIS
  get projectId(): string | null {
    return this.selectedProjectId;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!serverState.running) {
      return [new vscode.TreeItem("Loghead server not running")];
    }
    if (!serverState.port) {
      return [new vscode.TreeItem("Waiting for Loghead server...")];
    }

    // Root
    if (!element) {
      const items: vscode.TreeItem[] = [
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
      items.push(
        ...this.logs.map((log: any) => {
          const item = new vscode.TreeItem(
            `${log.timestamp}  ${log.content}`,
            vscode.TreeItemCollapsibleState.None
          );
          item.iconPath = new vscode.ThemeIcon("output");
          return item;
        })
      );

      return items;
    }

    return [];
  }

  setProject(projectId: string) {
    this.selectedProjectId = projectId;
    this.selectedStreamId = null;
    this.logs = [];
    this.refresh();
  }
  setStream(streamId: string) {
    this.selectedStreamId = streamId;
    this.loadLogs();
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
