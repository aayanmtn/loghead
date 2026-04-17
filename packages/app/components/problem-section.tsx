"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, FileJson, Scan, MousePointer2 } from "lucide-react";
import { useState, useEffect } from "react";

export function ProblemSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  // Auto-play animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const hasFoundError = scanStep >= 2;

  return (
    <section className="overflow-hidden relative py-24 border-t bg-zinc-950 border-zinc-900">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-[0.05]" />
      
      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-4xl text-center"
        >
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
              The Problem
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Stop Copy-Pasting</span> Logs.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Don&apos;t waste time manually selecting and formatting errors. Loghead scans your stream and hands the context to your AI on a silver platter.
          </p>
        </motion.div>

        {/* Split View Visualization */}
        <div className="grid relative grid-cols-1 gap-8 items-center mx-auto max-w-6xl lg:grid-cols-11"
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* Left: The Problem (Terminal Chaos) */}
          <div className="relative lg:col-span-5 group">
             {/* Scanner Beam Effect */}
             <motion.div 
                className="absolute left-0 right-0 h-[2px] bg-[#00FF94] shadow-[0_0_20px_#00FF94] z-20 pointer-events-none"
                animate={{ top: ["5%", "95%", "5%"] }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                style={{ opacity: isHovered ? 0.8 : 0.2 }}
             />

             <div className="absolute -inset-0.5 bg-linear-to-br from-red-500/20 to-transparent rounded-xl opacity-30 blur-sm group-hover:opacity-50 transition-opacity" />
             <div className="relative rounded-xl border border-zinc-800 bg-[#0f0f11] overflow-hidden shadow-2xl">
                {/* Window Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b backdrop-blur border-zinc-800 bg-zinc-900/80">
                   <div className="flex gap-2 items-center">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full border bg-red-500/20 border-red-500/50" />
                        <div className="w-3 h-3 rounded-full border bg-yellow-500/20 border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full border bg-green-500/20 border-green-500/50" />
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono">
                      <Terminal className="w-3 h-3" />
                      <span>bash — 80x24</span>
                   </div>
                </div>
                {/* Code Content */}
                <div className="p-6 font-mono text-xs sm:text-sm text-zinc-400 space-y-3 h-[320px] overflow-hidden relative">
                   <div className="absolute inset-0 bg-linear-to-brom-transparent via-transparent to-[#0f0f11]/80 pointer-events-none z-10" />
                   
                   <div className="text-zinc-600"># tail -f /var/log/app.log</div>
                   <div className="text-zinc-500 font-mono text-[10px] opacity-50">...previous output...</div>
                   
                   <div className="opacity-60 transition-opacity hover:opacity-100">
                      <span className="text-blue-400">DEBUG:</span> Init module (auth_v2)
                   </div>
                   <div className="opacity-60 transition-opacity hover:opacity-100">
                      <span className="text-green-400">INFO:</span> Health check passed [200 OK]
                   </div>

                   {/* The Error Block */}
                   <div className={`relative transition-all duration-300 ${hasFoundError ? 'px-2 py-2 -mx-2 rounded border-l-2 border-red-500 bg-red-500/10' : ''}`}>
                      <div className="font-bold text-red-400">
                         Error: Connection refused at 127.0.0.1:5432
                      </div>
                      <div className="text-zinc-500 pl-4 text-[10px] leading-relaxed mt-1">
                         at pg.Client.connect (/app/node_modules/pg/lib/client.js:52)<br/>
                         at process.processTicksAndRejections (node:internal/process/task_queues:95)
                      </div>
                      
                      {/* Simulated Selection Cursor (The Old Way) */}
                      {!isHovered && !hasFoundError && (
                        <motion.div 
                          className="absolute bottom-2 right-10 pointer-events-none"
                          animate={{ x: [0, 10, 0], y: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <MousePointer2 className="w-4 h-4 text-white drop-shadow-md fill-black" />
                        </motion.div>
                      )}
                   </div>

                   <div className="opacity-60">
                      <span className="text-yellow-400">Warn:</span> Retrying connection (1/5)...
                   </div>
                   <div className="opacity-40 text-[10px]">
                      [2024-03-20 10:00:05] INFO: Worker thread spawned
                   </div>
                </div>
             </div>
             
             {/* Label */}
             <div className="absolute left-0 -top-8 text-xs font-bold tracking-widest uppercase text-zinc-500">
               Raw Terminal Stream
             </div>
          </div>

          {/* Center Processing Visualization */}
          <div className="hidden relative justify-center items-center h-full lg:flex lg:col-span-1">
             <div className="flex absolute inset-0 justify-center items-center">
                {/* Animated Beam */}
                <motion.div 
                  className="w-full h-[2px] bg-linear-to-rrom-red-500/50 via-[#00FF94] to-[#00FF94]/50"
                  animate={{ 
                    scaleX: hasFoundError ? 1 : 0,
                    opacity: hasFoundError ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                />
             </div>
             <div className={`relative z-10 rounded-full p-3 border transition-all duration-500 ${hasFoundError ? 'bg-[#00FF94] border-[#00FF94] scale-110' : 'bg-zinc-900 border-zinc-800'}`}>
                {hasFoundError ? (
                  <Scan className="w-5 h-5 text-black animate-spin-slow" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-zinc-500" />
                )}
             </div>
          </div>

          {/* Right: The Solution (Structured Context) */}
          <div className="relative lg:col-span-5 group">
             <div className="absolute -inset-0.5 bg-linear-to-bl from-[#00FF94]/20 to-transparent rounded-xl opacity-30 blur-sm group-hover:opacity-50 transition-opacity" />
             <div className="relative rounded-xl border border-[#00FF94]/20 bg-[#0f0f11] overflow-hidden shadow-2xl">
                {/* Window Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b backdrop-blur border-zinc-800 bg-zinc-900/80">
                   <div className="flex gap-2 items-center">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-[#00FF94] text-[10px] font-mono">
                      <FileJson className="w-3 h-3" />
                      <span>context.json</span>
                   </div>
                </div>
                {/* Code Content */}
                <div className="p-6 font-mono text-xs sm:text-sm text-zinc-300 h-[320px] overflow-hidden relative flex flex-col justify-center">
                   {hasFoundError ? (
                     <motion.div
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ duration: 0.3 }}
                     >
                       <div className="mb-2 text-zinc-500">{"// Clean, LLM-ready context"}</div>
                       <div className="text-[#00FF94]">{"{"}</div>
                       
                       <div className="pl-4">
                          <span className="text-purple-400">&quot;type&quot;:</span> <span className="text-yellow-200">&quot;database_error&quot;</span>,
                       </div>
                       
                       <div className="pl-4 bg-[#00FF94]/10 -mx-4 px-4 py-1 border-l-2 border-[#00FF94]">
                          <span className="text-purple-400">&quot;error&quot;:</span> <span className="text-yellow-200">&quot;Connection refused&quot;</span>,
                       </div>
                       
                       <div className="pl-4">
                          <span className="text-purple-400">&quot;context&quot;:</span> <span className="text-yellow-200">&quot;Postgres connection failed on port 5432&quot;</span>
                       </div>
                       
                       <div className="text-[#00FF94]">{"}"}</div>
                     </motion.div>
                   ) : (
                     <div className="flex flex-col justify-center items-center h-full text-zinc-600">
                       <Scan className="mb-2 w-8 h-8 opacity-50" />
                       <span className="text-xs">Listening for events...</span>
                     </div>
                   )}
                </div>
                
                {/* "AI Reading" indicator */}
                {hasFoundError && (
                  <motion.div 
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-2 py-1 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                     <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse" />
                     <span className="text-[10px] font-medium text-[#00FF94]">Live Stream</span>
                  </motion.div>
                )}
             </div>

             {/* Label */}
             <div className="absolute -top-8 left-0 text-xs font-bold text-[#00FF94] uppercase tracking-widest">
               Clean AI Context
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
