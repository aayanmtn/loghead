"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Server, ArrowRight, Box, Lock, Cpu, Zap, Database, Terminal, Code2 } from "lucide-react";
import { useState, useEffect } from "react";

// Sources Data
const SOURCES = [
  { id: "docker", label: "Docker Containers", icon: Box, color: "text-blue-400" },
  { id: "system", label: "System Logs", icon: Server, color: "text-purple-400" },
  { id: "stdout", label: "App Stdout", icon: Terminal, color: "text-yellow-400" },
];

// Destinations Data
const DESTINATIONS = [
  { id: "vscode", label: "VS Code", icon: Code2 },
  { id: "claude", label: "Claude Desktop", icon: MessageSquareIcon },
  { id: "windsurf", label: "Windsurf", icon: Zap },
];

function MessageSquareIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function MechanismSection() {
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-cycle through sources if none selected
  useEffect(() => {
    if (activeSource) return;
    
    const interval = setInterval(() => {
      const currentIndex = Math.floor(Date.now() / 2000) % SOURCES.length;
      setActiveSource(SOURCES[currentIndex].id);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeSource]);

  return (
    <section className="overflow-hidden relative py-32 border-t bg-zinc-950 border-zinc-900" id="how-it-works">
      {/* Structural Grid Background - Firecrawl style */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-72" />
      
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-24 max-w-3xl text-center"
        >
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
              How It Works
            </span>
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            The <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Neural Bridge</span>
          </h2>
          <p className="text-lg leading-relaxed text-zinc-400">
            Loghead acts as the intelligent synapse between your raw infrastructure data and your AI coding assistants, processing context in real-time.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-6xl">
          
          {/* SVG Connection Layer (Desktop) */}
          <div className="hidden absolute inset-0 pointer-events-none lg:block -z-10">
            <svg className="visible w-full h-full" viewBox="0 0 1000 400" fill="none">
              <defs>
                <linearGradient id="gradient-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#27272a" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#00FF94" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#27272a" stopOpacity="0.5" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Left Connections (Sources -> Core) */}
              {SOURCES.map((source, i) => {
                const yStart = 60 + (i * 140); // 60, 200, 340
                const isActive = activeSource === source.id;
                
                return (
                  <g key={`path-left-${source.id}`}>
                    {/* Base Path */}
                    <path 
                      d={`M 250,${yStart} C 350,${yStart} 350,200 500,200`}
                      stroke="#27272a"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Active Flow Path */}
                    <motion.path 
                      d={`M 250,${yStart} C 350,${yStart} 350,200 500,200`}
                      stroke="#00FF94"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="10 200"
                      initial={{ strokeDashoffset: 0, opacity: 0 }}
                      animate={{ 
                        strokeDashoffset: isActive ? [0, -210] : 0,
                        opacity: isActive ? [0, 1, 0] : 0
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      filter="url(#glow)"
                    />
                  </g>
                );
              })}

              {/* Right Connections (Core -> Destinations) */}
              {DESTINATIONS.map((dest, i) => {
                const yEnd = 60 + (i * 140); // 60, 200, 340
                // Active if ANY source is active (simplified for "broadcasting" effect)
                const isActive = !!activeSource;

                return (
                  <g key={`path-right-${dest.id}`}>
                    {/* Base Path */}
                    <path 
                      d={`M 500,200 C 650,200 650,${yEnd} 750,${yEnd}`}
                      stroke="#27272a"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Active Flow Path */}
                    <motion.path 
                      d={`M 500,200 C 650,200 650,${yEnd} 750,${yEnd}`}
                      stroke="#00FF94"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="10 200"
                      initial={{ strokeDashoffset: 0, opacity: 0 }}
                      animate={{ 
                        strokeDashoffset: isActive ? [210, 0] : 0,
                        opacity: isActive ? [0, 1, 0] : 0
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }}
                      filter="url(#glow)"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-3">
            
            {/* Left Column: Sources */}
            <div className="space-y-8 flex flex-col justify-center h-[400px]">
              {SOURCES.map((source) => (
                <motion.div
                  key={source.id}
                  className={`relative cursor-pointer group`}
                  onHoverStart={() => setActiveSource(source.id)}
                  onHoverEnd={() => setActiveSource(null)}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className={`absolute inset-0 bg-linear-to-r from-[#00FF94]/20 to-transparent rounded-xl blur-xl transition-opacity duration-500 ${activeSource === source.id ? 'opacity-100' : 'opacity-0'}`} />
                  <div className={`relative flex items-center gap-4 p-5 rounded-xl border backdrop-blur-xl transition-all duration-300 ${
                    activeSource === source.id 
                      ? 'bg-zinc-900 border-[#00FF94]/50 shadow-[0_0_30px_-10px_rgba(0,255,148,0.2)]' 
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}>
                    <div className={`p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 ${activeSource === source.id ? 'text-[#00FF94] border-[#00FF94]/30' : 'text-zinc-400'}`}>
                      <source.icon className="w-5 h-5" />
                    </div>
                    <span className={`font-medium transition-colors ${activeSource === source.id ? 'text-white' : 'text-zinc-400'}`}>
                      {source.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Center Column: The Core */}
            <div className="relative flex items-center justify-center h-[400px]">
              {/* Pulsing Rings */}
              <div className="absolute w-[400px] h-[400px] opacity-20 pointer-events-none">
                <motion.div 
                  className="absolute inset-0 border border-[#00FF94] rounded-full"
                  animate={{ scale: [0.8, 1.2], opacity: [0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute inset-0 border border-[#00FF94] rounded-full"
                  animate={{ scale: [0.8, 1.2], opacity: [0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                />
              </div>

              {/* Core Card */}
              <motion.div 
                className="relative z-10 w-full max-w-[320px] aspect-square rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center p-8 shadow-2xl"
                whileHover={{ scale: 1.02 }}
              >
                {/* Internal Glow */}
                <div className="overflow-hidden absolute inset-0 rounded-3xl">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#00FF94]/10 blur-[60px]" />
                </div>

                <div className="flex relative z-20 flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(0,255,148,0.2)] relative group">
                    <div className="absolute inset-0 bg-[#00FF94]/20 blur-xl rounded-full animate-pulse" />
                    <Cpu className="w-10 h-10 text-[#00FF94] relative z-10" />
                  </div>
                  
                  <h3 className="mb-2 text-2xl font-bold text-white">Loghead Core</h3>
                  <div className="px-3 py-1 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94] text-[10px] font-mono tracking-widest uppercase mb-6">
                    MCP Server Protocol
                  </div>
                  
                  <div className="space-y-3 w-full">
                    <div className="flex justify-between items-center px-4 py-2 text-sm rounded-lg border text-zinc-400 bg-zinc-900/50 border-zinc-800/50">
                      <span className="flex gap-2 items-center"><Lock className="w-3 h-3" /> Privacy</span>
                      <span className="font-mono text-xs text-[#00FF94]">ON</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2 text-sm rounded-lg border text-zinc-400 bg-zinc-900/50 border-zinc-800/50">
                      <span className="flex gap-2 items-center"><Zap className="w-3 h-3" /> Latency</span>
                      <span className="text-[#00FF94] font-mono text-xs">&lt;50ms</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Destinations */}
            <div className="space-y-8 flex flex-col justify-center h-[400px]">
              {DESTINATIONS.map((dest) => (
                <motion.div
                  key={dest.id}
                  className="relative group"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: activeSource ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`relative flex items-center justify-between p-5 rounded-xl border backdrop-blur-xl bg-zinc-900/40 border-zinc-800 transition-all duration-500 ${
                    activeSource ? 'shadow-[0_0_20px_-5px_rgba(0,255,148,0.1)] border-zinc-700' : ''
                  }`}>
                    <div className="flex gap-4 items-center">
                      <span className="font-medium text-zinc-300">{dest.label}</span>
                    </div>
                    <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 transition-colors duration-300 ${activeSource ? 'text-[#00FF94] border-[#00FF94]/20' : 'text-zinc-500'}`}>
                      <dest.icon className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
