"use client";

import { motion } from "framer-motion";
import { X, Copy, ExternalLink, CheckCircle2, Terminal, Sparkles, ArrowRight } from "lucide-react";

export function FlowStateSection() {
  return (
    <section className="py-24 bg-zinc-950 relative border-t border-zinc-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto"
          >
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
                Developer Experience
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Context Switching Is Dead. <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Long Live the Flow State.</span>
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400"
          >
            Vibe coding demands deep focus. Stop manually copying errors. Let your AI see the problem before you do.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: THE PAIN (Chaotic Desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 overflow-hidden transition-all duration-500 hover:bg-zinc-900/50 hover:border-red-500/20"
          >
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <X className="w-6 h-6 text-red-500/50 group-hover:text-red-500" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 text-zinc-500">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <span className="text-xs font-mono uppercase tracking-wider">The Old Way</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-300 mb-2 group-hover:text-white transition-colors">The Context Switch</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8 group-hover:text-zinc-400 transition-colors">
                  The "Alt-Tab" Dance. Manually stitching together context from three different windows just to ask a question.
                  <br/>
                  <span className="italic text-red-400/70 group-hover:text-red-400 transition-colors mt-2 block">Mental stack overflow.</span>
                </p>
              </div>

              {/* Visual of chaos/manual work: SCATTERED DESKTOP */}
              <div className="relative h-64 mt-4">
                 {/* Messy Connection Lines */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30" viewBox="0 0 400 250">
                    <path d="M 80,60 Q 150,40 220,80 T 320,180" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 300,160 Q 200,200 100,150" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
                 </svg>

                 {/* 1. Terminal (Error) - Tilted Left */}
                 <motion.div 
                    className="absolute top-0 left-0 w-40 bg-[#09090b] border border-zinc-800 rounded-lg shadow-2xl p-3 z-10 transform -rotate-3"
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                 >
                    <div className="flex gap-1.5 mb-2 opacity-50">
                       <div className="w-2 h-2 rounded-full bg-red-500" />
                       <div className="w-2 h-2 rounded-full bg-yellow-500" />
                       <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-1 font-mono text-[8px] text-zinc-500">
                       <div className="text-red-400">Error: ReferenceError</div>
                       <div>at /app/utils.ts:42</div>
                       <div className="bg-red-500/10 text-red-400 px-1 rounded">Process exited (1)</div>
                    </div>
                 </motion.div>

                 {/* 2. Browser (StackOverflow) - Tilted Right */}
                 <motion.div 
                    className="absolute top-8 right-0 w-44 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 z-20 transform rotate-2"
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                 >
                    <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-1">
                       <ExternalLink className="w-3 h-3 text-zinc-500" />
                       <div className="h-1.5 w-20 bg-zinc-800 rounded-full" />
                    </div>
                    <div className="space-y-1.5">
                       <div className="h-2 w-full bg-zinc-800 rounded" />
                       <div className="h-2 w-3/4 bg-zinc-800 rounded" />
                       <div className="h-2 w-5/6 bg-zinc-800 rounded" />
                    </div>
                 </motion.div>

                 {/* 3. LLM Chat - Centered Bottom */}
                 <motion.div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 bg-zinc-950 border border-zinc-600 rounded-lg shadow-2xl p-3 z-30"
                    whileHover={{ scale: 1.05, zIndex: 40 }}
                 >
                    <div className="flex gap-2 mb-2 text-[10px] text-zinc-400">
                       <Terminal className="w-3 h-3" />
                       <span>Claude Desktop</span>
                    </div>
                    <div className="bg-zinc-900 rounded p-2 text-[8px] text-zinc-500 font-mono mb-2 border border-zinc-800 border-dashed">
                       Paste error here...
                    </div>
                    <div className="h-2 w-8 bg-blue-500 rounded-full opacity-50" />
                 </motion.div>

                 {/* Frantic Mouse Cursor */}
                 <motion.div
                    className="absolute z-50 pointer-events-none"
                    animate={{ 
                       x: [60, 260, 180, 60], 
                       y: [40, 60, 180, 40] 
                    }}
                    transition={{ 
                       duration: 3, 
                       repeat: Infinity,
                       ease: "easeInOut",
                       times: [0, 0.4, 0.7, 1]
                    }}
                 >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-md">
                       <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="currentColor" />
                    </svg>
                 </motion.div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: THE SOLUTION (Neon Green) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-[#00FF94]/30 bg-zinc-900/80 p-8 overflow-hidden shadow-[0_0_30px_-10px_rgba(0,255,148,0.1)]"
          >
            {/* Background Grid & Glow */}
            <div 
              className="absolute inset-0 bg-[linear-gradient(rgba(0,255,148,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,148,0.03)_1px,transparent_1px)]" 
              style={{ backgroundSize: "20px 20px" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,148,0.1),transparent_60%)]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-[#00FF94]">
                <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider">The Loghead Way</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Zero-Friction Injection</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Logs are piped directly into your LLM's context window the instant they occur. 
                You never leave the code. The fix appears as if by magic.
              </p>

              {/* Animated Pipeline Visualization */}
              <div className="relative h-64 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                  {/* Code Editor Header Look */}
                  <div className="h-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-3 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono ml-2">cursor-ai-bridge — 80x24</div>
                  </div>

                  <div className="flex-1 relative flex items-center justify-between px-4 sm:px-8">
                      {/* 1. Source Log */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg">
                              <Terminal className="w-6 h-6 text-zinc-300" />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-800">stderr</span>
                      </div>

                      {/* Connection Line 1 */}
                      <div className="flex-1 h-[2px] bg-zinc-800 mx-2 relative overflow-hidden">
                          <motion.div 
                            className="absolute inset-0 bg-[#00FF94]"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                      </div>

                      {/* 2. Loghead Pipe */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-full bg-[#00FF94]/5 border border-[#00FF94]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,148,0.15)] backdrop-blur-sm">
                              <Sparkles className="w-8 h-8 text-[#00FF94]" />
                          </div>
                          <span className="text-[10px] text-[#00FF94] font-mono font-bold tracking-wide uppercase">Loghead Pipe</span>
                      </div>

                      {/* Connection Line 2 */}
                      <div className="flex-1 h-[2px] bg-zinc-800 mx-2 relative overflow-hidden">
                          <motion.div 
                            className="absolute inset-0 bg-[#00FF94]"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }}
                          />
                      </div>

                      {/* 3. IDE Suggestion */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                          <motion.div 
                            className="w-36 h-24 rounded-xl bg-zinc-900 border border-[#00FF94]/40 flex flex-col p-3 relative shadow-xl"
                            initial={{ scale: 0.98, opacity: 0.8 }}
                            animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.8, 1, 0.8], boxShadow: ["0 0 0 rgba(0,255,148,0)", "0 0 20px rgba(0,255,148,0.1)", "0 0 0 rgba(0,255,148,0)"] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                              <div className="flex gap-2 mb-2">
                                <div className="w-8 h-8 rounded bg-[#00FF94]/10 flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-[#00FF94]" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="w-full h-2 bg-zinc-800 rounded" />
                                  <div className="w-2/3 h-2 bg-zinc-800 rounded" />
                                </div>
                              </div>
                              <div className="mt-auto flex items-center gap-1.5 text-[10px] text-[#00FF94] bg-[#00FF94]/5 px-2 py-1.5 rounded border border-[#00FF94]/10">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="font-medium">Fix Applied</span>
                              </div>
                          </motion.div>
                      </div>
                  </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
