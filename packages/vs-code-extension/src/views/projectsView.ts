import * as vscode from "vscode";
import { ProjectNode, StreamNode, CreateStreamNode } from "./nodes";
import { serverState } from "../state/serverState";
import * as api from "../backend/api";

interface Project {
  id: string;
  name: string;
  streams: {
    id: string;
    name: string;
    type: string;
  }[];
}

export class ProjectsView implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private projects: Project[] = [];

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(item: vscode.TreeItem): vscode.TreeItem {
    return item;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    // 🔒 Not connected
    if (!serverState.connected) {
      const info = new vscode.TreeItem("Connect to Loghead");
      info.iconPath = new vscode.ThemeIcon(
        "cloud",
        new vscode.ThemeColor("charts.yellow"),
      );
      info.command = {
        command: "loghead.connect",
        title: "Connect to Loghead",
      };
      return [info];
    }

    // 🌳 Root → projects
    if (!element) {
      try {
        this.projects = (await api.fetchProjects()) as any[];
      } catch (e) {
        const err = new vscode.TreeItem("Failed to load projects");
        err.iconPath = new vscode.ThemeIcon("error");
        return [err];
      }

      if (this.projects.length === 0) {
        const empty = new vscode.TreeItem("No projects found");
        empty.iconPath = new vscode.ThemeIcon("info");
        return [empty];
      }

      return this.projects.map((p) => new ProjectNode(p.id, p.name));
    }

    // 📁 Project → streams

    if (element instanceof ProjectNode) {
      const project = this.projects.find((p) => p.id === element.id);

      if (!project) return [];

      const createStreamNode = new CreateStreamNode(project.id);
      const streamNodes = (project.streams || []).map(
        (s: any) => new StreamNode(s.id, s.name, s.type),
      );

      return [createStreamNode, ...streamNodes];
    }

    return [];
  }
}
