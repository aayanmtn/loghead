import * as vscode from "vscode";

export class ProjectNode extends vscode.TreeItem {
  constructor(public readonly id: string, public readonly name: string) {
    super(name, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = "project";
    this.iconPath = new vscode.ThemeIcon("repo");
  }
}

export class CreateStreamNode extends vscode.TreeItem {
  constructor(public readonly projectId: string) {
    super("Create Stream", vscode.TreeItemCollapsibleState.None);
    this.contextValue = "createStream";
    this.iconPath = new vscode.ThemeIcon("add");
    this.command = {
      command: "loghead.createStream",
      title: "Create Stream",
      arguments: [this],
    };
  }
}

export class StreamNode extends vscode.TreeItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string,
    public readonly token?: string
  ) {
    super(`${name} (${type})`, vscode.TreeItemCollapsibleState.None);
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
