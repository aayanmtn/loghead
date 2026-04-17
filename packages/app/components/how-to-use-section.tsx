"use client";

import { motion } from "framer-motion";
import { Terminal, ArrowRight, Sparkles, Command, Copy, Check, Search, Download, FileCode2, GitGraph, Puzzle } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { sendGAEvent } from "@/lib/analytics";

export function HowToUseSection() {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx @loghead/terminal");
    setCopied(true);
    sendGAEvent('copy_command', { command: 'npx @loghead/terminal', location: 'how_to_use_section' });
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      icon: Command,
      title: "Open Extensions",
      description: "Navigate to the extensions tab in VS Code, Cursor, or Windsurf."
    },
    {
      icon: Search,
      title: 'Search "Loghead"',
      description: "Find the official Loghead extension in the marketplace."
    },
    {
      icon: Download,
      title: "Install & Connect",
      description: "Click install and you're ready to go. It just works."
    }
  ];

  return (
    <section className="overflow-hidden relative py-32 border-t bg-zinc-950 border-zinc-900">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)" }}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FF94_1px,transparent_1px),linear-gradient(to_bottom,#00FF94_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-10" />
      </div>

      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-24 max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
              Quick Start
            </span>
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Zero config. <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Infinite Context.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-zinc-400">
            Pipe your logs to Loghead and let your AI fix the rest.
          </p>
        </div>

        {/* 3D Workflow Visualization */}
        <div className="relative max-w-5xl mx-auto h-[600px] md:h-[500px] perspective-[2000px]">
          
          {/* Step 1: Install (Left Back) */}
          <motion.div 
            initial={{ opacity: 0, x: -50, y: 20, rotateY: 10 }}
            whileInView={{ opacity: 1, x: 0, y: 0, rotateY: 10 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="absolute top-0 left-0 md:left-[5%] w-full md:w-[45%] z-10"
          >
            {/* Label */}
            <div className="flex absolute left-0 -top-12 gap-3 items-center">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF5555] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,85,85,0.4)]">1</div>
               <span className="text-lg font-semibold text-white">Install the CLI</span>
            </div>
            
            {/* Card */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl p-4 md:p-6 transform transition-transform hover:scale-105 duration-300 hover:border-zinc-700 hover:shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]">
              <div className="flex gap-2 items-center pb-3 mb-4 border-b border-zinc-800">
                 <Terminal className="w-4 h-4 text-zinc-500" />
                 <span className="font-mono text-xs text-zinc-500">terminal</span>
              </div>
              <div className="space-y-2 font-mono text-sm">
                 <div className="flex justify-between items-center p-3 rounded-lg border bg-zinc-900/50 border-zinc-800/50">
                     <code className="text-zinc-300">npx @loghead/terminal</code>
                    <button onClick={handleCopy} className="transition-colors text-zinc-500 hover:text-white">
                      {copied ? <Check className="w-4 h-4 text-[#00FF94]" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 <div className="pt-2 pl-2 text-xs text-zinc-500">
                   ✓ Installed v1.0.2<br/>
                   ✓ Added to PATH
                 </div>
              </div>
            </div>
            
            {/* Hand-drawn Arrow (SVG) */}
            <svg className="hidden absolute -right-12 top-1/2 w-24 h-12 opacity-50 text-zinc-700 md:block" viewBox="0 0 100 50">
               <path d="M10,25 C30,10 70,10 90,25" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4 4" />
               <defs>
                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                   <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                 </marker>
               </defs>
            </svg>
          </motion.div>


          {/* Step 2: Pipe (Center) */}
          <motion.div 
             initial={{ opacity: 0, y: 40, scale: 0.9 }}
             whileInView={{ opacity: 1, y: 20, scale: 1 }}
             transition={{ duration: 0.6, delay: 0.3 }}
             viewport={{ once: true }}
             className="absolute top-[140px] md:top-[60px] left-0 md:left-[30%] w-full md:w-[40%] z-20"
          >
             {/* Label */}
            <div className="flex absolute -bottom-12 left-1/2 flex-row gap-2 items-center -translate-x-1/2 md:-bottom-12">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFBD2E] text-black font-bold text-sm shadow-[0_0_15px_rgba(255,189,46,0.4)]">2</div>
               <span className="text-lg font-semibold text-center text-white">Pipe your logs</span>
            </div>

             {/* Card */}
             <div className="bg-[#0c0c0e] border border-zinc-700 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] p-4 md:p-6 transform rotate-x-12 hover:rotate-0 transition-all duration-500">
                <div className="absolute -top-3 -right-3 bg-[#00FF94] text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                   LIVE STREAM
                </div>
                
                <div className="flex gap-2 items-center mb-4">
                   <div className="w-3 h-3 rounded-full animate-pulse bg-zinc-700" />
                   <span className="text-xs font-mono text-[#00FF94]">processing...</span>
                </div>

                <div className="space-y-3 font-mono text-sm">
                   <div className="text-zinc-400">$ npm start <span className="text-[#00FF94]">| npx @loghead/terminal</span></div>
                   
                   <div className="my-3 w-full h-px bg-zinc-800" />
                   
                   <div className="space-y-1.5">
                      <motion.div 
                        className="flex justify-between items-center p-2 rounded border bg-zinc-900/80 border-zinc-800"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-xs text-zinc-300">Error: Connection Refused</span>
                        <span className="text-[10px] text-[#00FF94] border border-[#00FF94]/30 px-1.5 py-0.5 rounded">Captured</span>
                      </motion.div>
                      <div className="flex justify-between items-center p-2 rounded border opacity-50 bg-zinc-900/30 border-zinc-800/50">
                        <span className="text-xs text-zinc-500">Info: Server started</span>
                        <span className="text-[10px] text-zinc-600 border border-zinc-700 px-1.5 py-0.5 rounded">Ignored</span>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>


          {/* Step 3: Context (Right Front) */}
          <motion.div 
             initial={{ opacity: 0, x: 50, y: 0, rotateY: -10 }}
             whileInView={{ opacity: 1, x: 0, y: -20, rotateY: -10 }}
             transition={{ duration: 0.6, delay: 0.5 }}
             viewport={{ once: true }}
             className="absolute top-[280px] md:top-0 right-0 md:right-[5%] w-full md:w-[45%] z-30"
          >
             {/* Label */}
             <div className="flex absolute right-0 -top-12 flex-row-reverse gap-3 items-center">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00FF94] text-black font-bold text-sm shadow-[0_0_15px_rgba(0,255,148,0.4)]">3</div>
               <span className="text-lg font-semibold text-white">Ask your AI</span>
            </div>

             {/* Card */}
             <div className="bg-[#18181b] border border-[#00FF94]/30 rounded-xl shadow-[0_0_40px_-10px_rgba(0,255,148,0.15)] p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#00FF94] to-[#00E5FF]" />
                
                <div className="flex gap-2 items-center pb-3 mb-4 border-b border-zinc-800">
                   <Sparkles className="w-4 h-4 text-[#00FF94]" />
                   <span className="text-xs font-medium text-zinc-300">Claude / Cursor / Windsurf</span>
                </div>

                <div className="space-y-3 text-sm">
                   <div className="p-3 rounded-lg rounded-tl-none border bg-zinc-800/50 border-zinc-700/50">
                      <p className="text-xs leading-relaxed text-zinc-300">
                         I see the error in your logs. The postgres connection is failing on port 5432.
                      </p>
                   </div>
                   
                   <div className="flex gap-2 items-center">
                      <div className="h-6 px-2 rounded bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94] text-[10px] flex items-center gap-1">
                        <Command className="w-3 h-3" />
                        <span>Fix it</span>
                      </div>
                      <div className="h-6 px-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] flex items-center">
                        Explain
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Hand-drawn Arrow connecting 2 to 3 (SVG) */}
            <svg className="hidden absolute bottom-8 -left-16 w-24 h-12 opacity-50 transform rotate-12 text-zinc-700 md:block" viewBox="0 0 100 50">
               <path d="M10,40 C40,40 60,10 90,10" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4 4" />
            </svg>

          </motion.div>

        </div>

        {/* Installation Section */}
        <div className="pt-2 mt-0 border-t border-zinc-900/50">
          <div className="grid gap-12 items-center lg:grid-cols-2 lg:gap-16">
            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/70 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)] p-6 md:p-8 space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-8">
              <div>
                <p className="text-lg leading-relaxed text-zinc-200">
                  Install the Loghead extension directly from your IDE marketplace. No complex setup or configuration files required.
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex gap-4 items-start p-4 rounded-xl border transition-all duration-500",
                      activeStep === index 
                        ? "bg-zinc-900/70 border-[#00FF94]/25" 
                        : "bg-zinc-900/50 border-zinc-800/70"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg transition-colors duration-500",
                      activeStep === index 
                        ? "text-[#00FF94] bg-[#00FF94]/10" 
                        : "bg-zinc-800 text-zinc-400"
                    )}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-medium text-white">{step.title}</h4>
                      <p className="text-sm text-zinc-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden relative rounded-2xl border shadow-2xl duration-700 delay-200 border-zinc-800 bg-zinc-900 animate-in fade-in slide-in-from-bottom-8 h-[300px] sm:h-[350px]">
              <div className="absolute inset-0 bg-[#1e1e1e] flex flex-col font-sans select-none">
                {/* Title Bar */}
                <div className="h-8 bg-[#2d2d2d] flex items-center px-3 gap-2 border-b border-[#1e1e1e]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="ml-4 text-[10px] text-zinc-500">Visual Studio Code</div>
                </div>

                <div className="flex overflow-hidden flex-1">
                  {/* Activity Bar */}
                  <div className="w-10 bg-[#252526] flex flex-col items-center py-3 gap-4 border-r border-[#1e1e1e]">
                    <FileCode2 className="w-5 h-5 text-zinc-600" />
                    <Search className="w-5 h-5 text-zinc-600" />
                    <GitGraph className="w-5 h-5 text-zinc-600" />
                    <div className="relative">
                      <Puzzle className="w-5 h-5 text-[#00FF94]" />
                      <div className="absolute -right-0.5 -top-0.5 w-2 h-2 bg-[#00FF94] rounded-full border-2 border-[#252526]"></div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="w-64 bg-[#252526] flex flex-col border-r border-[#1e1e1e]">
                    <div className="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Extensions</div>
                    <div className="px-3 pb-3">
                      <div className="bg-[#3c3c3c] rounded-sm p-1.5 flex items-center gap-2 border border-[#00FF94]/30">
                        <Search className="w-3 h-3 text-zinc-400" />
                        <motion.span 
                          className="text-xs text-zinc-300"
                          initial={{ width: 0 }}
                          animate={{ width: "auto" }}
                          transition={{ duration: 1, delay: 0.5, ease: "linear" }}
                        >
                          <span className="inline-block overflow-hidden whitespace-nowrap">Loghead</span>
                        </motion.span>
                        <motion.div
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: 3, repeatType: "reverse" }}
                          className="w-0.5 h-3 bg-[#00FF94]"
                        />
                      </div>
                    </div>

                    <div className="px-3 pt-2">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8, duration: 0.3 }}
                        className="bg-[#37373d] p-3 rounded-md flex gap-3 border border-[#00FF94]/20"
                      >
                        <div className="w-8 h-8 rounded bg-[#00FF94]/10 flex items-center justify-center shrink-0">
                          <Image 
                            src="/logo.svg" 
                            alt="Loghead" 
                            width={1024} 
                            height={765} 
                            className="w-auto h-5"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold truncate text-zinc-100">Loghead</span>
                            <span className="text-[9px] text-zinc-500">v1.0.2</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 truncate">AI-powered log analysis</span>
                          <div className="flex gap-2 mt-1">
                            <motion.button 
                              className="bg-[#00FF94] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm hover:bg-[#00e082] transition-colors"
                              animate={{ 
                                backgroundColor: ["#00FF94", "#333333"], 
                                color: ["#000000", "#ffffff"]
                              }}
                              transition={{ delay: 3.5, duration: 0.1, times: [0, 1] }}
                            >
                              <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ delay: 3.5, duration: 0.2 }}
                              >
                                Install
                              </motion.span>
                              <motion.span
                                className="flex absolute inset-0 justify-center items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 3.6, duration: 0 }}
                              >
                                Installed
                              </motion.span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Main Editor Area (blurred bg) */}
                  <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden flex flex-col p-4 opacity-50 grayscale-50">
                    <div className="space-y-2 font-mono text-xs">
                      <div className="text-zinc-500">// Welcome to Loghead</div>
                      <div className="flex gap-2">
                        <span className="text-[#c586c0]">import</span>
                        <span className="text-[#9cdcfe]">Loghead</span>
                        <span className="text-[#c586c0]">from</span>
                        <span className="text-[#ce9178]">'@loghead/terminal'</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#569cd6]">const</span>
                        <span className="text-[#4fc1ff]">logger</span>
                        <span className="text-[#d4d4d4]">=</span>
                        <span className="text-[#569cd6]">new</span>
                        <span className="text-[#4fc1ff]">Loghead</span>
                        <span className="text-[#d4d4d4]">(</span>
                        <span className="text-[#ce9178]">{`{ apiKey: process.env.KEY }`}</span>
                        <span className="text-[#d4d4d4]">)</span>
                      </div>
                    </div>
                  </div>

                  {/* Cursor Animation */}
                  <motion.div
                    className="absolute z-50 w-3 h-3 pointer-events-none"
                    initial={{ x: 100, y: 150, opacity: 0 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      x: [100, 80, 160, 160],
                      y: [150, 100, 140, 140]
                    }}
                    transition={{ 
                      duration: 4,
                      times: [0, 0.1, 0.8, 1],
                      delay: 0.2,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
