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
exports.startCore = startCore;
exports.stopCore = stopCore;
const child_process_1 = require("child_process");
const vscode = __importStar(require("vscode"));
const serverState_1 = require("../state/serverState");
const fs = __importStar(require("fs"));
let coreProcess = null;
function startCore(context, onUpdate) {
    //   const coreBin = path.join(
    //     context.extensionPath,
    //     "..",
    //     "..",
    //     "core",
    //     "dist",
    //     "cli_main.js"
    //   );
    const coreBin = "/home/soman/soman-loghead/packages/core/dist/cli_main.js";
    console.log("Resolved core path:", coreBin);
    if (!fs.existsSync(coreBin)) {
        vscode.window.showErrorMessage(`Core binary not found:\n${coreBin}`);
        return;
    }
    if (coreProcess) {
        vscode.window.showWarningMessage("Loghead already running");
        return;
    }
    // ! Spawn core process in headless mode(development only)
    coreProcess = (0, child_process_1.spawn)("node", [coreBin, "start", "--headless"], {
        shell: false,
        env: {
            ...process.env,
            LOGHEAD_ENV: "vscode",
        },
    });
    // ! Spawn core process in headless mode(using npx - production)
    // coreProcess = spawn("npx", ["-y", "@loghead/core", "start", "--headless"], {
    //   shell: true,
    //   env: {
    //     ...process.env,
    //     LOGHEAD_ENV: "vscode",
    //   },
    // });
    coreProcess.stdout.on("data", (data) => {
        console.log("[CORE STDOUT]", data.toString());
        const output = data.toString();
        // Parse PORT
        const portMatch = output.match(/PORT=(\d+)/);
        if (portMatch) {
            serverState_1.serverState.port = Number(portMatch[1]);
        }
        // Parse MCP token
        const tokenMatch = output.match(/MCP_TOKEN=(.+)/);
        if (tokenMatch) {
            serverState_1.serverState.mcpToken = tokenMatch[1].trim();
            serverState_1.serverState.running = true;
        }
        if (serverState_1.serverState.running) {
            onUpdate();
        }
    });
    coreProcess.stderr.on("data", (data) => {
        console.error("[Loghead Core]", data.toString());
    });
    coreProcess.on("exit", () => {
        serverState_1.serverState.running = false;
        serverState_1.serverState.port = undefined;
        serverState_1.serverState.mcpToken = undefined;
        coreProcess = null;
        onUpdate();
    });
}
function stopCore(onUpdate) {
    if (!coreProcess) {
        vscode.window.showWarningMessage("Loghead is not running");
        return;
    }
    coreProcess.kill();
    coreProcess = null;
    serverState_1.serverState.running = false;
    serverState_1.serverState.port = undefined;
    serverState_1.serverState.mcpToken = undefined;
    onUpdate();
}
//# sourceMappingURL=coreProcess.js.map