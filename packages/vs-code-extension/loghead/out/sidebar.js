"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogheadSidebar = void 0;
class LogheadSidebar {
    extensionUri;
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    resolveWebviewView(view) {
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
exports.LogheadSidebar = LogheadSidebar;
//# sourceMappingURL=sidebar.js.map