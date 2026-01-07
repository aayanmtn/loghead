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
    if (coreProcess) {
        vscode.window.showWarningMessage("Loghead already running");
        return;
    }
    const coreBin = "/home/soman/soman-loghead/packages/core/dist/cli_main.js";
    // coreProcess = spawn("npx", ["-y", "@loghead/core", "start"], {
    //   shell: true,
    //   env: {
    //     ...process.env,
    //     LOGHEAD_ENV: "vscode",
    //   },
    // });
    console.log("Resolved core path:", coreBin);
    if (!fs.existsSync(coreBin)) {
        vscode.window.showErrorMessage(`Core binary not found:\n${coreBin}`);
        return;
    }
    if (coreProcess) {
        vscode.window.showWarningMessage("Loghead already running");
        return;
    }
    coreProcess = (0, child_process_1.spawn)("node", [coreBin, "start"], {
        shell: false,
        env: {
            ...process.env,
            LOGHEAD_ENV: "vscode",
        },
    });
    serverState_1.serverState.port = 4567;
    waitForServer()
        .then(fetchSystemToken)
        .then((token) => {
        serverState_1.serverState.mcpToken = token;
        serverState_1.serverState.running = true;
        onUpdate();
    })
        .catch((e) => vscode.window.showErrorMessage(String(e)));
    coreProcess.on("exit", () => {
        serverState_1.serverState.running = false;
        serverState_1.serverState.port = undefined;
        serverState_1.serverState.mcpToken = undefined;
        coreProcess = null;
        onUpdate();
    });
}
async function waitForServer() {
    for (let i = 0; i < 10; i++) {
        try {
            const res = await fetch("http://localhost:4567/api/projects");
            if (res.ok)
                return;
        }
        catch { }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error("Loghead failed to start");
}
async function fetchSystemToken() {
    const res = await fetch("http://localhost:4567/api/system/token");
    if (!res.ok)
        throw new Error("Failed to fetch MCP token");
    const data = (await res.json());
    return data.token;
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