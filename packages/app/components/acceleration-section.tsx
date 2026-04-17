"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Zap, Filter, FileJson, Shield, RefreshCw, Bug, Terminal } from "lucide-react";

function TerminalTyping({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className="font-mono text-xs whitespace-pre-wrap text-zinc-300">
      <span className="text-[#00FF94] mr-2">$</span>
      {displayedText}
      <span className="inline-block w-1.5 h-3 bg-[#00FF94] ml-1 animate-pulse"/>
    </div>
  );
}

const benefitsLeft = [
  {
    icon: Zap,
    title: "Instant Context",
    description: "Feed logs to AI instantly without manual copy-pasting or formatting.",
    terminalContent: "Streaming logs to context...\n[SUCCESS] 45KB received."
  },
  {
    icon: Filter,
    title: "Noise Reduction",
    description: "Automatically filter out spam and irrelevant logs to keep context clean.",
    terminalContent: "Filtered 128 irrelevant lines.\nContext window saved: 85%"
  },
  {
    icon: FileJson,
    title: "Structured Data",
    description: "Convert raw terminal output into JSON-ready format optimized for LLMs.",
    terminalContent: "Parsing raw output...\nJSON Object: { \"status\": \"error\" }"
  }
];

const benefitsRight = [
  {
    icon: Shield,
    title: "Local Security",
    description: "Zero data egress. Your sensitive logs never leave your machine.",
    terminalContent: "Egress blocked: 192.168.1.1\nProcessing strictly local."
  },
  {
    icon: RefreshCw,
    title: "Universal Sync",
    description: "Works seamlessly with VS Code, Cursor, Windsurf, and Claude Desktop.",
    terminalContent: "Connecting to VS Code...\nExtension active on port 3000."
  },
  {
    icon: Bug,
    title: "Debug Faster",
    description: "Catch errors in real-time with AI analysis of your structured log stream.",
    terminalContent: "Analysis: Root cause identified.\nSuggestion: Fix null pointer."
  }
];

export function AccelerationSection() {
  const [activeBenefit, setActiveBenefit] = useState<typeof benefitsLeft[0] | null>(null);

  return (
    <section className="overflow-hidden relative py-24 border-t bg-zinc-950 border-zinc-900">
      {/* Structural Grid Background - Firecrawl style */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-72" />
      
      {/* Animated Green Grid Pulse */}
      <div className="absolute inset-0 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)" }}>
        <motion.div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#00FF94_1px,transparent_1px),linear-gradient(to_bottom,#00FF94_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20"
          style={{
            maskImage: "linear-gradient(135deg, transparent 40%, black 50%, transparent 60%)",
            WebkitMaskImage: "linear-gradient(135deg, transparent 40%, black 50%, transparent 60%)",
            maskSize: "200% 200%",
            WebkitMaskSize: "200% 200%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat"
          }}
          initial={{ maskPosition: "0% 0%" }}
          animate={{ maskPosition: "100% 100%" }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
        
        {/* Header */}
        <div
          className="mx-auto mb-20 max-w-3xl text-center duration-700 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
              Benefits
            </span>
          </div>
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Making LLMs <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">10x Faster</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Empower your AI coding assistants with clean, structured, and real-time context directly from your terminal. Stop fighting with context windows.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-3">
          
          {/* Left Column */}
          <div className="space-y-6">
            {benefitsLeft.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-left-4 fill-mode-backwards backdrop-blur-md ${
                  activeBenefit?.title === benefit.title 
                    ? "bg-zinc-900/40 border-[#00FF94]/50 shadow-[0_0_20px_-10px_rgba(0,255,148,0.2)]" 
                    : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveBenefit(benefit)}
                onMouseLeave={() => setActiveBenefit(null)}
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-[#00FF94]">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Center Column (Visualization) */}
          <div 
            className="hidden lg:flex h-full min-h-[500px] rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md relative overflow-hidden flex-col items-center justify-center p-8 animate-in zoom-in duration-700"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#00FF94_1px,transparent_1px)] bg-size-[24px_24px] opacity-5" />
            
            {/* Central Node */}
            <div className="relative z-10 mb-12">
              <div className={`w-24 h-24 rounded-2xl bg-zinc-900 border flex items-center justify-center shadow-[0_0_50px_-10px_rgba(0,255,148,0.2)] relative transition-colors duration-300 ${activeBenefit ? "border-[#00FF94]" : "border-[#00FF94]/30"}`}>
                <div className="absolute -inset-4 border border-dashed border-zinc-700 rounded-3xl animate-[spin_10s_linear_infinite]" />
                
                {activeBenefit ? (
                  <activeBenefit.icon className="h-10 w-10 text-[#00FF94] transition-all duration-300" />
                ) : (
                  <Terminal className="h-10 w-10 text-[#00FF94] transition-all duration-300" />
                )}
              </div>
              <div className="absolute top-1/2 left-full w-24 h-px bg-linear-to-rrom-[#00FF94]/50 to-transparent" />
              <div className="absolute top-1/2 right-full w-24 h-px bg-linear-to-l from-[#00FF94]/50 to-transparent" />
              <div className="absolute left-1/2 bottom-full h-24 w-px-bg-linear-to-tom-[#00FF94]/50 to-transparent" />
              <div className="absolute left-1/2 top-full h-24 w-px bg-linear-to-b from-[#00FF94]/50 to-transparent" />
            </div>

            {/* Connecting Nodes (Abstract) */}
            <div className="absolute inset-0 z-0">
               {/* We can add some floating particles or nodes here if needed, but keeping it clean for now */}
            </div>

            <div className="relative z-10 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 max-w-xs w-full min-h-[100px] flex flex-col justify-center transition-all duration-300">
              {activeBenefit ? (
                <div className="w-full duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-zinc-800">
                    <span className="text-xs font-mono text-[#00FF94] font-bold uppercase tracking-wider">{activeBenefit.title}</span>
                    <activeBenefit.icon className="h-3 w-3 text-[#00FF94]" />
                  </div>
                  <TerminalTyping text={activeBenefit.terminalContent} />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs text-zinc-500">LIVE CONTEXT</span>
                    <span className="flex h-2 w-2 rounded-full bg-[#00FF94] animate-pulse" />
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full w-3/4" />
                  <div className="h-1.5 bg-zinc-800 rounded-full w-full" />
                  <div className="h-1.5 bg-zinc-800 rounded-full w-5/6" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {benefitsRight.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-right-4 fill-mode-backwards backdrop-blur-md ${
                  activeBenefit?.title === benefit.title 
                    ? "bg-zinc-900/40 border-[#00FF94]/50 shadow-[0_0_20px_-10px_rgba(0,255,148,0.2)]" 
                    : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveBenefit(benefit)}
                onMouseLeave={() => setActiveBenefit(null)}
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-[#00FF94]">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

