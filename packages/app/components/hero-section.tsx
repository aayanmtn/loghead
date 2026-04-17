"use client";

import { Button } from "@/components/ui/button";
import { DiscordIcon, ChromeIcon, VSCodeIcon } from "@/components/icons";
import { ArrowRight, Copy, Check, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { sendGAEvent } from "@/lib/analytics";

export function HeroSection() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [copied, setCopied] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const words = ["Terminal", "Cloud", "Server", "Browser", "Console"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const terminalLines = useMemo(() => [
    "$ npx @loghead/terminal",
    "✓ Loghead terminal ingestor installed",
    "$ loghead start",
    "🚀 Streaming logs to Loghead...",
    "📡 Connecting to AI...",
    "✅ Connected to Claude Desktop",
    "🔍 Monitoring logs in real-time...",
  ], []);

  // Copy to clipboard handler
  const handleCopy = () => {
    navigator.clipboard.writeText("npx @loghead/terminal");
    setCopied(true);
    sendGAEvent('copy_command', { command: 'npx @loghead/terminal', location: 'hero_section' });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (currentLineIndex >= terminalLines.length) return;

    const currentLine = terminalLines[currentLineIndex];
    
    if (currentChar <= currentLine.length) {
      const timer = setTimeout(() => {
        const newLines = [...displayedLines];
        newLines[currentLineIndex] = currentLine.slice(0, currentChar);
        setDisplayedLines(newLines);
        setCurrentChar(currentChar + 1);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      // Move to next line after a pause
      const timer = setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1);
        setCurrentChar(0);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentChar, currentLineIndex, displayedLines, terminalLines]);

  return (
    <section className="overflow-hidden relative pt-32 pb-20 bg-zinc-950 lg:pt-48 lg:pb-32">
      {/* Structural Grid Background - Firecrawl style */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-72" />
      
      {/* Animated Green Grid Pulse */}
      <div className="absolute inset-0 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)" }}>
        <motion.div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#00FF94_1px,transparent_1px),linear-gradient(to_bottom,#00FF94_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-36"
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
      
      <div className="container relative z-10 px-4 mx-auto text-center">
        
        {/* Announcement Pill */}
        <motion.a 
          href="https://github.com/onvo-ai/loghead"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => sendGAEvent('github_visit', { source: 'hero_pill' })}
          className="group mb-8 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-sm text-zinc-300 backdrop-blur-md shadow-[0_0_15px_-5px_rgba(0,255,148,0.1)] hover:shadow-[0_0_25px_-5px_rgba(0,255,148,0.3)] hover:border-[#00FF94]/30 hover:text-white transition-all duration-300 cursor-pointer"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#00FF94] mr-2 animate-pulse shadow-[0_0_10px_#00FF94]"></span>
          Loghead v0.1 is now available
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </motion.a>

        {/* Main Heading */}
        <motion.h1 
          className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-white sm:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Turn{" "}
          <span className="inline-flex relative">
            <span className="absolute -inset-x-4 -inset-y-2 bg-[#00FF94]/10 blur-xl -z-10" />
            <span className="absolute -top-1 -right-4 h-1 w-1 rounded-full bg-[#00FF94] animate-ping opacity-75 duration-1000" />
            <span className="absolute -bottom-2 -left-2 h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-pulse opacity-75" />
            
            <motion.span 
              className="inline-flex overflow-hidden relative justify-start align-top"
              layout
              transition={{ duration: 0.5, ease: "circOut" }}
            >
              <span className="invisible">{words[wordIndex]}</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={words[wordIndex]}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="absolute left-0 top-0 w-full text-left text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,255,148,0.4)]"
                >
                  {words[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </span>{" "}
          Logs into <br />
          <span className="relative inline-block bg-white text-black px-3 py-2 sm:px-6 sm:py-2 rounded-2xl transform -rotate-2 shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-default mt-2 sm:mt-4">LLM-Ready Context</span>
        </motion.h1>
        
        {/* Subheading */}
        <motion.p 
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Power your local AI apps with clean, real-time log data from any terminal or console. 
          <span className="font-medium text-zinc-200"> Open source</span>, <span className="font-medium text-zinc-200">local-first</span>, and <span className="font-medium text-zinc-200">secure</span>.
        </motion.p>

        {/* Command Bar / Action Area */}
        <motion.div 
          className="mx-auto mt-10 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="group flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1.5 pl-5 backdrop-blur transition-colors hover:border-[#00FF94]/30 hover:shadow-[0_0_20px_-10px_#00FF94]">
            <Terminal className="mr-3 w-4 h-4 text-zinc-500" />
            <span className="flex-1 font-mono text-sm text-left text-zinc-200">npx @loghead/terminal</span>
            <Button 
              size="sm"
              onClick={handleCopy}
              className="bg-[#00FF94] text-black hover:bg-[#00FF94]/90 font-medium h-9 px-4"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-2" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-2" /> Copy
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-6 justify-center mt-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#00FF94]"/> No API Key Required</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#00FF94]"/> Works with Claude</span>
          </div>

          {/* Extension Links */}
          <div className="flex gap-3 justify-center mt-8">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
              asChild
            >
              <a 
                href={process.env.NEXT_PUBLIC_CHROME_EXTENSION_URL || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGAEvent('chrome_extension_click', { location: 'hero_section' })}
              >
                <ChromeIcon className="w-4 h-4" />
                Chrome Extension
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
              asChild
            >
              <a 
                href={process.env.NEXT_PUBLIC_VSCODE_EXTENSION_URL || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGAEvent('vscode_extension_click', { location: 'hero_section' })}
              >
                <VSCodeIcon className="w-4 h-4" />
                VS Code Extension
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Wide Terminal Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 relative mx-auto max-w-5xl perspective-[2000px]"
        >
          {/* Glowing backdrop */}
          <div className="absolute -inset-4 bg-[#00FF94]/20 blur-3xl opacity-20 rounded-full" />
          
          <div className="relative rounded-xl border border-zinc-800 bg-[#09090b] shadow-2xl overflow-hidden transform rotate-x-12">
            {/* Terminal Header */}
            <div className="flex gap-4 items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 font-mono text-xs tracking-wide text-center text-zinc-500">
                loghead-server — node — 80x24
              </div>
              <div className="w-12" /> {/* Spacer for centering */}
            </div>

            {/* Terminal Content */}
            <div className="p-6 min-h-[400px] font-mono text-sm text-left overflow-hidden relative">
              <div className="relative z-10 space-y-2">
                {displayedLines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-[#00FF94] shrink-0">❯</span>
                    <span className="text-zinc-300">{line}</span>
                  </motion.div>
                ))}
                {currentLineIndex < terminalLines.length && (
                  <motion.span
                    className="inline-block w-2 h-5 bg-[#00FF94]"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}

                {/* Enhanced Visuals inside terminal */}
                {displayedLines.length >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4 mt-8"
                  >
                    <div className="p-4 rounded border border-zinc-800 bg-zinc-900/50">
                        <div className="mb-2 text-xs text-zinc-500">INCOMING LOGS</div>
                        <div className="space-y-1.5">
                            <div className="text-xs text-red-400 truncate">[ERROR] Auth failed: user_id=null</div>
                            <div className="text-xs truncate text-zinc-500">[INFO] Health check passed</div>
                            <div className="text-xs text-yellow-400 truncate">[WARN] DB latency high (200ms)</div>
                        </div>
                    </div>
                    <div className="rounded border border-[#00FF94]/20 bg-[#00FF94]/5 p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00FF94] animate-pulse" />
                        </div>
                        <div className="text-xs text-[#00FF94] mb-2">MCP CONTEXT</div>
                        <div className="space-y-1.5">
                            <div className="text-xs text-zinc-300">
                                <span className="text-[#00FF94]">→</span> Promoting Error to Context
                            </div>
                            <div className="text-xs text-zinc-300">
                                <span className="text-[#00FF94]">→</span> Ignoring Info logs
                            </div>
                            <div className="text-xs text-zinc-300">
                                <span className="text-[#00FF94]">→</span> Aggregating Warnings
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Matrix-like background effect inside terminal */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent,rgba(0,255,148,0.1))] z-0" />
            </div>
          </div>
        </motion.div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-24 relative mx-auto max-w-4xl"
        >
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">See Loghead in action</h2>
            <p className="text-zinc-400">Understand how the platform turns your logs into AI-ready context in seconds.</p>
          </div>
          
          <div className="relative aspect-video rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl overflow-hidden group">
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-[#00FF94]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <iframe
              className="w-full h-full"
              src={`${process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_URL || "https://www.youtube.com/embed/RKmlgE1mx1E"}?autoplay=1&mute=1&rel=0&loop=1&playlist=RKmlgE1mx1E`}
              title="Loghead Platform Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* Unmute/Mute Button */}
            <button
              onClick={() => {
                const iframe = document.querySelector('iframe[title="Loghead Platform Overview"]') as HTMLIFrameElement;
                if (iframe) {
                  const currentSrc = iframe.src;
                  if (videoMuted) {
                    iframe.src = currentSrc.replace('mute=1', 'mute=0');
                    setVideoMuted(false);
                  } else {
                    iframe.src = currentSrc.replace('mute=0', 'mute=1');
                    setVideoMuted(true);
                  }
                }
              }}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-white hover:border-[#00FF94]/50 hover:bg-zinc-800 transition-all backdrop-blur-sm"
            >
              {videoMuted ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  <span className="text-sm font-medium">Unmute</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span className="text-sm font-medium">Mute</span>
                </>
              )}
            </button>
          </div>
          
          {/* Decorative glow behind video */}
          <div className="absolute -inset-10 bg-[#00FF94]/10 blur-3xl opacity-20 -z-10 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
