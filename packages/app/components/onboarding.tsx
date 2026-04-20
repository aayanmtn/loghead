"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plug,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Terminal,
  Box,
  Activity,
  ChevronRight,
  Zap,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectPlatform =
  | "auto"
  | "claudeCode"
  | "windsurf"
  | "cursor"
  | "claudeDesktop"
  | "vscode";

const STREAM_TYPES = [
  { id: "terminal", label: "Terminal" },
  { id: "docker", label: "Docker" },
  { id: "browser", label: "Browser" },
  { id: "opentelemetry", label: "OpenTelemetry" },
  { id: "aws", label: "AWS" },
];

const PLATFORMS: { id: ConnectPlatform; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "claudeCode", label: "Claude Code" },
  { id: "windsurf", label: "Windsurf" },
  { id: "cursor", label: "Cursor" },
  { id: "claudeDesktop", label: "Claude Desktop" },
  { id: "vscode", label: "VS Code" },
];

function normalizeApiBaseUrl(url: string): string {
  let n = (url || "").trim();
  if (n.endsWith("/")) n = n.slice(0, -1);
  if (n.endsWith("/sse")) n = n.slice(0, -4);
  if (n.endsWith("/api")) n = n.slice(0, -4);
  return n;
}

function getMcpJson(apiUrl: string, token: string): string {
  return `{\n  "mcpServers": {\n    "loghead": {\n      "command": "npx",\n      "args": ["-y", "@loghead/mcp"],\n      "env": {\n        "LOGHEAD_API_URL": "${apiUrl}",\n        "LOGHEAD_TOKEN": "${token}"\n      }\n    }\n  }\n}`;
}

function getAutoPrompt(apiUrl: string, token: string): string {
  return `Please add a new MCP server called "loghead" with these details:\n\n${getMcpJson(apiUrl, token)}\n\nAfter adding it, restart so the MCP server is available.`;
}

function getSnippet(
  platform: ConnectPlatform,
  apiUrl: string,
  token: string,
): { label: string; code: string } {
  const stdioConfig = (label: string) => ({
    label,
    code: getMcpJson(apiUrl, token),
  });

  switch (platform) {
    case "auto":
      return { label: "Prompt", code: getAutoPrompt(apiUrl, token) };
    case "claudeCode":
      return stdioConfig("~/.claude/claude_code_config.json");
    case "claudeDesktop":
      return stdioConfig("claude_desktop_config.json");
    case "cursor":
      return stdioConfig(".cursor/mcp.json");
    case "windsurf":
      return stdioConfig("mcp_config.json");
    case "vscode":
      return {
        label: ".vscode/mcp.json",
        code: `{\n  "servers": {\n    "loghead": {\n      "command": "npx",\n      "args": ["-y", "@loghead/mcp"],\n      "env": {\n        "LOGHEAD_API_URL": "${apiUrl}",\n        "LOGHEAD_TOKEN": "${token}"\n      }\n    }\n  }\n}`,
      };
  }
}

function getIngestorCommand(
  streamType: string,
  apiUrl: string,
  token: string,
): string {
  switch (streamType) {
    case "terminal":
      return `npx @loghead/terminal --base-url ${apiUrl} --token ${token}`;
    case "docker":
      return `npx @loghead/docker --base-url ${apiUrl} --token ${token} --container <container_name>`;
    case "browser":
      return `npm install @loghead/browser`;
    case "opentelemetry":
      return `Endpoint: ${apiUrl}/api/otlp/logs\nAuthorization: Bearer ${token}`;
    case "aws":
      return `LOGHEAD_API_URL=${apiUrl}\nLOGHEAD_STREAM_TOKEN=${token}`;
    default:
      return `curl -X POST ${apiUrl}/api/ingest \\\n  -H "Authorization: Bearer ${token}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"streamId":"<ID>","logs":["hello"]}'`;
  }
}

function getIntegrationPrompt(streamType: string, apiUrl: string): string {
  const tokenPlaceholder = "<stream token from the stream you just created>";
  switch (streamType) {
    case "terminal":
      return `Please update this project's package.json scripts so logs are piped to Loghead during development. Look at the existing "dev" (or "start") script and create a "dev:log" variant that pipes its output to Loghead, like this:\n\n"scripts": {\n  "dev": "next dev",\n  "dev:log": "npm run dev | npx @loghead/terminal --base-url ${apiUrl} --token ${tokenPlaceholder}"\n}\n\nUse the stream token from the stream you just created. Then start the project using the "dev:log" script.`;
    case "docker":
      return `Please add a Loghead log watcher service to this project's docker-compose.yml:\n\n  loghead:\n    image: node:20-alpine\n    command: npx @loghead/docker --base-url ${apiUrl} --token ${tokenPlaceholder} --container <your_main_service>\n    depends_on:\n      - <your_main_service>\n\nUse the stream token from the stream you just created. Replace <your_main_service> with the actual service name.`;
    case "opentelemetry":
      return `Please configure OpenTelemetry in this project to export logs to Loghead.\n\nOTLP endpoint: ${apiUrl}/api/otlp/logs\nAuthorization: Bearer ${tokenPlaceholder}\n\nUse the stream token from the stream you just created. Set the exporter endpoint and auth header in the OTel SDK config.`;
    case "aws":
      return `Please configure this project to forward logs to Loghead. Set these environment variables:\n\nLOGHEAD_API_URL=${apiUrl}\nLOGHEAD_STREAM_TOKEN=${tokenPlaceholder}\n\nUse the stream token from the stream you just created. Then install and initialise @loghead/aws to forward CloudWatch logs.`;
    default:
      return `Please configure this project to send logs to Loghead.\n\nAPI URL: ${apiUrl}\nStream token: ${tokenPlaceholder}\n\nUse the stream token from the stream you just created.`;
  }
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      {label && (
        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
          {label}
        </div>
      )}
      <div className="relative group">
        <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-words overflow-x-auto">
          {code}
        </pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

function PromptPill({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-left transition-all group"
    >
      <span className="text-sm text-zinc-300 font-mono">
        &quot;{text}&quot;
      </span>
      <span className="shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  );
}

function ConfirmCard({
  checked,
  onClick,
  label,
  sublabel,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all",
        checked
          ? "bg-emerald-500/10 border-emerald-500/50"
          : "bg-zinc-800/20 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40",
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
          checked ? "bg-emerald-500" : "bg-zinc-800",
        )}
      >
        <Check
          className={cn("w-3 h-3", checked ? "text-black" : "text-zinc-600")}
        />
      </div>
      <div>
        <div
          className={cn(
            "text-sm font-medium transition-colors",
            checked ? "text-emerald-300" : "text-zinc-300",
          )}
        >
          {label}
        </div>
        {sublabel && (
          <div className="text-xs text-zinc-500 mt-0.5">{sublabel}</div>
        )}
      </div>
    </button>
  );
}

interface OnboardingProps {
  apiUrl: string;
  token: string;
  onDone: () => void;
  initialStep?: StepNum;
  initialStreamType?: string;
  initialStreamId?: string | null;
}

type StepNum = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { n: 1, label: "Connect MCP", icon: Plug },
  { n: 2, label: "Verify", icon: Activity },
  { n: 3, label: "Create Stream", icon: Box },
  { n: 4, label: "Integrate", icon: Zap },
  { n: 5, label: "Send Logs", icon: Terminal },
];

export function Onboarding({
  apiUrl,
  token,
  onDone,
  initialStep = 1,
  initialStreamType = "terminal",
  initialStreamId = null,
}: OnboardingProps) {
  const [step, setStep] = useState<StepNum>(initialStep);
  const [platform, setPlatform] = useState<ConnectPlatform>("auto");
  const [streamType, setStreamType] = useState(initialStreamType);
  const [promptCopied, setPromptCopied] = useState(false);

  // Step 1: user confirms they've added the config and restarted
  const [mcpConfirmed, setMcpConfirmed] = useState(false);

  // Step 2: connected / not_connected
  const [verifyResult, setVerifyResult] = useState<
    "connected" | "not_connected" | null
  >(null);

  // Step 4: user confirms they've integrated
  const [integrationConfirmed, setIntegrationConfirmed] = useState(false);

  // Step 3: polling for newly created project + stream
  const [projectFound, setProjectFound] = useState(false);
  const [checkingProject, setCheckingProject] = useState(false);
  const [detectedStreamId, setDetectedStreamId] = useState<string | null>(
    initialStreamId,
  );
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step !== 3) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    setCheckingProject(true);

    const check = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) return;
        const projects: { id: string }[] = await res.json();
        if (projects.length === 0) return;

        const streamRes = await fetch(
          `/api/streams?projectId=${projects[0].id}`,
        );
        if (!streamRes.ok) return;
        const streams: { id: string }[] = await streamRes.json();

        if (streams.length > 0) {
          setDetectedStreamId(streams[0].id);
          setProjectFound(true);
          setCheckingProject(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // silently retry
      }
    };

    check();
    pollRef.current = setInterval(check, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step]);

  // Step 5: polling for first log in the detected stream
  const [logsFound, setLogsFound] = useState(false);
  const [checkingLogs, setCheckingLogs] = useState(false);
  const logsPollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step !== 4 || !detectedStreamId) {
      if (logsPollRef.current) clearInterval(logsPollRef.current);
      return;
    }

    setCheckingLogs(true);

    const check = async () => {
      try {
        const res = await fetch(
          `/api/logs?streamId=${detectedStreamId}&limit=1`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLogsFound(true);
          setCheckingLogs(false);
          if (logsPollRef.current) clearInterval(logsPollRef.current);
        }
      } catch {
        // silently retry
      }
    };

    check();
    logsPollRef.current = setInterval(check, 3000);
    return () => {
      if (logsPollRef.current) clearInterval(logsPollRef.current);
    };
  }, [step, detectedStreamId]);

  const apiBaseUrl = normalizeApiBaseUrl(apiUrl);
  const snippet = getSnippet(
    platform,
    apiBaseUrl || "https://your-loghead-url.com",
    token || "<YOUR_TOKEN>",
  );
  const streamTypePrompt = `Create a project on Loghead for this project. Also create a ${streamType} stream under it`;
  const integrationPrompt = getIntegrationPrompt(streamType, apiBaseUrl);
  const ingestorCommand = getIngestorCommand(
    streamType,
    apiBaseUrl,
    token || "<STREAM_TOKEN>",
  );

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  // Derive footer visibility per step
  const showBack =
    (step === 2 && verifyResult !== null) ||
    step === 3 ||
    step === 4 ||
    step === 5;
  const showContinue =
    (step === 1 && mcpConfirmed) ||
    (step === 2 && verifyResult === "connected") ||
    (step === 3 && projectFound) ||
    (step === 4 && logsFound) ||
    step === 5;
  const showFooter = showBack || showContinue;

  const goBack = () => {
    if (step === 2) setVerifyResult(null);
    setStep((step - 1) as StepNum);
  };

  const goNext = () => {
    if (step < 5) setStep((step + 1) as StepNum);
    else onDone();
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl items-start gap-5">
      {/* Vertical stepper — outside the card */}
      <div className="flex flex-col items-center pt-6 shrink-0">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex flex-col items-center">
            <button
              onClick={() => s.n < step && setStep(s.n as StepNum)}
              disabled={s.n >= step}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all",
                s.n < step
                  ? "bg-emerald-500 text-black cursor-pointer hover:bg-emerald-400"
                  : s.n === step
                    ? "bg-zinc-800 text-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent"
                    : "bg-zinc-800/60 text-zinc-600",
              )}
            >
              {s.n < step ? <Check className="w-3.5 h-3.5" /> : s.n}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-px my-1 transition-colors",
                  s.n < step ? "h-8 bg-emerald-500" : "h-8 bg-zinc-800",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex-1 flex flex-col">
        {/* Content */}
        <div className="px-6 max-h-[65vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
          <div className="pt-5 pb-5 space-y-4">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plug className="w-4 h-4 text-emerald-400" />
                    Connect the MCP Server
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Choose your AI coding tool and paste the config to connect
                    Loghead via MCP.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        "relative overflow-hidden px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        p.id === "auto"
                          ? platform === "auto"
                            ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_24px_rgba(16,185,129,0.2)]"
                            : "border-emerald-500/60 bg-emerald-500/8 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:text-emerald-100"
                          : platform === p.id
                            ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_24px_rgba(16,185,129,0.2)]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
                      )}
                    >
                      {p.id === "auto" && (
                        <>
                          <span className="absolute inset-0 rounded-lg border border-emerald-400/50 animate-pulse" />
                          <span className="absolute inset-[1px] rounded-[7px] bg-emerald-400/5" />
                        </>
                      )}
                      <span className="relative z-10">{p.label}</span>
                    </button>
                  ))}
                </div>

                {platform === "auto" ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Paste this into your LLM
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(snippet.code);
                          setPromptCopied(true);
                          setTimeout(() => setPromptCopied(false), 2000);
                        }}
                        className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                      >
                        {promptCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />{" "}
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-emerald-300 whitespace-pre-wrap break-words">
                      {snippet.code}
                    </div>
                  </div>
                ) : (
                  <CodeBlock code={snippet.code} label={snippet.label} />
                )}

                <ConfirmCard
                  checked={mcpConfirmed}
                  onClick={() => setMcpConfirmed((v) => !v)}
                  label="I've added the config and restarted the app"
                  sublabel="Make sure to fully restart your AI tool after saving the file."
                />
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Verify the Connection
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Open your AI tool and ask it this — it should confirm
                    Loghead tools are available.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Paste this prompt
                    </span>
                    <button
                      onClick={() => copyPrompt("Is Loghead connected?")}
                      className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      {promptCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-emerald-300">
                    "Is Loghead connected?"
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    What did it say?
                  </p>

                  <button
                    onClick={() => setVerifyResult("connected")}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                      verifyResult === "connected"
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-zinc-800/20 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        verifyResult === "connected"
                          ? "bg-emerald-500"
                          : "bg-zinc-800",
                      )}
                    >
                      <Check
                        className={cn(
                          "w-3 h-3",
                          verifyResult === "connected"
                            ? "text-black"
                            : "text-zinc-600",
                        )}
                      />
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-sm font-medium transition-colors",
                          verifyResult === "connected"
                            ? "text-emerald-300"
                            : "text-zinc-300",
                        )}
                      >
                        Connected
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        The LLM mentions Loghead tools like{" "}
                        <code className="text-zinc-400">list_projects</code>,{" "}
                        <code className="text-zinc-400">query_logs</code>, etc.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setVerifyResult("not_connected")}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                      verifyResult === "not_connected"
                        ? "bg-red-500/10 border-red-500/40"
                        : "bg-zinc-800/20 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        verifyResult === "not_connected"
                          ? "bg-red-500/30"
                          : "bg-zinc-800",
                      )}
                    >
                      <Box
                        className={cn(
                          "w-3 h-3",
                          verifyResult === "not_connected"
                            ? "text-red-400"
                            : "text-zinc-600",
                        )}
                      />
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-sm font-medium transition-colors",
                          verifyResult === "not_connected"
                            ? "text-red-400"
                            : "text-zinc-400",
                        )}
                      >
                        Not connected
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Go back, double-check your config file, and restart the
                        tool.
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-emerald-400" />
                    Create a Project & Stream
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Pick a stream type, then copy the prompt and paste it into
                    your AI tool — it will set everything up.
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Stream type
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STREAM_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setStreamType(t.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          streamType === t.id
                            ? "bg-emerald-600/20 border-emerald-500/60 text-emerald-300"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Copy this prompt
                    </span>
                    <button
                      onClick={() => copyPrompt(streamTypePrompt)}
                      className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      {promptCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-emerald-300">
                    "{streamTypePrompt}"
                  </div>
                </div>

                {/* Auto-detection status card */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-lg border transition-all",
                    projectFound
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-zinc-800/20 border-zinc-800",
                  )}
                >
                  {projectFound ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  ) : (
                    <Loader2 className="w-5 h-5 text-zinc-500 shrink-0 animate-spin" />
                  )}
                  <div>
                    <div
                      className={cn(
                        "text-sm font-medium",
                        projectFound ? "text-emerald-300" : "text-zinc-400",
                      )}
                    >
                      {projectFound
                        ? "Project and stream detected"
                        : "Waiting for project and stream…"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {projectFound
                        ? "Loghead found your new project. You're good to go."
                        : "Checking every few seconds — paste the prompt above into your AI tool."}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 4 ── */}
            {step === 4 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Integrate with your project
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {streamType === "browser"
                      ? "Install the Loghead Chrome extension to capture browser logs."
                      : "Ask your AI tool to wire Loghead into this project's start script."}
                  </p>
                </div>

                {streamType === "browser" ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-zinc-300">
                      Download and install the{" "}
                      <span className="text-emerald-400 font-medium">
                        Loghead Chrome Extension
                      </span>{" "}
                      to capture browser console logs and network requests.
                    </p>
                    <a
                      href="https://chrome.google.com/webstore/detail/loghead"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Install Chrome Extension
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Paste this into your LLM
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(integrationPrompt);
                          setPromptCopied(true);
                          setTimeout(() => setPromptCopied(false), 2000);
                        }}
                        className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                      >
                        {promptCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />{" "}
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-emerald-300 whitespace-pre-wrap break-words">
                      {integrationPrompt}
                    </div>
                  </div>
                )}

                {/* Logs polling status */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-lg border transition-all",
                    logsFound
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-zinc-800/20 border-zinc-800",
                  )}
                >
                  {logsFound ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  ) : (
                    <Loader2 className="w-5 h-5 text-zinc-500 shrink-0 animate-spin" />
                  )}
                  <div>
                    <div
                      className={cn(
                        "text-sm font-medium",
                        logsFound ? "text-emerald-300" : "text-zinc-400",
                      )}
                    >
                      {logsFound
                        ? "Logs are flowing"
                        : "Waiting for first log…"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {logsFound
                        ? "Loghead is receiving logs from your project."
                        : "Checking every few seconds — make sure your project is running."}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 5 ── */}
            {step === 5 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400" />
                    You&apos;re all set
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Logs are flowing into Loghead. Use these prompts to start
                    querying them with your AI tool.
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Try these prompts in your AI tool
                  </div>
                  <div className="space-y-2">
                    {[
                      "Can you read the last 5 logs from Loghead?",
                      "Summarize the recent logs from Loghead and flag any errors.",
                      "Are there any warnings or exceptions in the Loghead logs?",
                    ].map((prompt) => (
                      <PromptPill key={prompt} text={prompt} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer nav — only rendered when there's something to show */}
        {showFooter && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            {showBack ? (
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {showContinue &&
              (step < 5 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onDone}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Go to Dashboard
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
