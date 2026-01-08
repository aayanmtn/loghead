import * as vscode from "vscode";

export class LogheadSidebar implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(view: vscode.WebviewView) {
    view.webview.options = { enableScripts: true };

    view.webview.html = `
      <html>
        <body style="font-family: sans-serif; padding: 10px">
          <h3>Loghead</h3>
          <button onclick="start()">▶ Start Loghead</button>
          <button onclick="stop()">■ Stop Loghead</button>

          <script>
            const vscode = acquireVsCodeApi();
            function start() {
              vscode.postMessage({ command: 'start' });
            }
            function stop() {
              vscode.postMessage({ command: 'stop' });
            }
          </script>
        </body>
      </html>
    `;
  }
}
