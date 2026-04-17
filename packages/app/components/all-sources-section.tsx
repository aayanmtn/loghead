"use client";

import { motion } from "framer-motion";
import { Terminal, Globe, Server, Cloud, Bot, Database, ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const SOURCES = [
  {
    id: "local",
    name: "Local Env",
    icon: Terminal,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    position: "top-left",
    style: { top: '5%', left: '10%' },
    description: "Standard stdout/stderr from your dev machine."
  },
  {
    id: "browser",
    name: "Browser",
    icon: Globe,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    position: "bottom-left",
    style: { bottom: '20%', left: '0%' },
    description: "Console logs, network errors, and hydration warnings."
  },
  {
    id: "custom",
    name: "Custom Pipe",
    icon: Server,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    position: "top-right",
    style: { top: '20%', right: '0%' },
    description: "Any proprietary source piped to the MCP server."
  },
  {
    id: "cloud",
    name: "Cloud (Soon)",
    icon: Cloud,
    color: "text-blue-400",
    bg: "bg-blue-400/5",
    border: "border-blue-400/10",
    position: "bottom-right",
    style: { bottom: '5%', right: '10%' },
    description: "Direct connectors for AWS, Vercel, and Azure.",
    dimmed: true
  }
];

export function AllSourcesSection() {
  const [activeSource, setActiveSource] = useState<string | null>(null);

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden border-t border-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
                  Integrations
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
                The All-Source <br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Log Collector</span>
              </h2>
              
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Your LLM's ability to fix bugs is only as good as the context it receives. Loghead bridges gaps by becoming the single, secure conduit for all log data.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4 group">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-[#00FF94]/30 transition-colors">
                    <Server className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Custom Environments</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Flexible enough to pull logs from your custom servers or proprietary products via simple pipe streams.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-blue-400/30 transition-colors">
                    <Cloud className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                      The Cloud Blind Spot
                      <Link href="/request-new-log-connectors">
                        <span className="px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 text-[10px] font-mono uppercase hover:bg-blue-400/20 transition-colors cursor-pointer">Coming Soon</span>
                      </Link>
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Future connectors for AWS, Vercel, and Azure will enable diagnosis of live, remote architecture issues.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-[#00FF94]/30 transition-colors">
                    <Bot className="h-6 w-6 text-[#00FF94]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Context is King</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Feeding the LLM a unified stream containing local stdout, browser warnings, and remote errors simultaneously for one-shot fixes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Visual */}
          <div className="order-1 lg:order-2 relative h-[500px] flex items-center justify-center">
            
            {/* Connecting Lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(39, 39, 42, 0)" />
                  <stop offset="50%" stopColor="rgba(39, 39, 42, 1)" />
                  <stop offset="100%" stopColor="rgba(39, 39, 42, 0)" />
                </linearGradient>
              </defs>
              {/* Lines are drawn from center (50%, 50%) to corners approx (15%, 15%) etc */}
              <path d="M 50% 50% L 20% 15%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" className="opacity-20" />
              <path d="M 50% 50% L 85% 30%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" className="opacity-20" />
              <path d="M 50% 50% L 15% 70%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" className="opacity-20" />
              <path d="M 50% 50% L 80% 85%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" className="opacity-20" />
            </svg>

            {/* Central Hub (Loghead) */}
            <div className="relative z-20 w-32 h-32 rounded-full bg-zinc-950 border-2 border-[#00FF94]/20 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,148,0.1)]">
               <div className="absolute inset-0 rounded-full bg-[#00FF94]/5 animate-pulse" />
               <div className="text-center">
                 <div className="text-2xl font-bold text-white tracking-tighter">LOG<span className="text-[#00FF94]">HEAD</span></div>
                 <div className="text-[10px] text-zinc-500 font-mono mt-1">UNIFIED STREAM</div>
               </div>

               {/* Particle Emitters */}
               {SOURCES.map((source, i) => (
                 <motion.div
                   key={`particle-${source.id}`}
                   className="absolute w-2 h-2 rounded-full bg-[#00FF94]"
                   animate={{
                      x: source.position.includes('left') ? [-120, 0] : [120, 0],
                      y: source.position.includes('top') ? [-100, 0] : [100, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5]
                   }}
                   transition={{
                     duration: 2,
                     repeat: Infinity,
                     ease: "linear",
                     delay: i * 0.5
                   }}
                 />
               ))}
            </div>

            {/* Satellite Nodes */}
            {SOURCES.map((source) => (
              <motion.div
                key={source.id}
                className={`absolute z-20 p-4 rounded-xl border bg-zinc-950 cursor-pointer transition-all duration-300 ${
                  activeSource === source.id 
                    ? `${source.border} ${source.bg} scale-105 shadow-xl z-30` 
                    : `border-zinc-800 hover:border-zinc-700 ${source.dimmed ? 'opacity-50 grayscale' : ''}`
                }`}
                style={source.style}
                onHoverStart={() => setActiveSource(source.id)}
                onHoverEnd={() => setActiveSource(null)}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3">
                  <source.icon className={`w-5 h-5 ${source.color}`} />
                  <span className={`font-bold text-sm ${source.dimmed ? 'text-zinc-500' : 'text-white'}`}>{source.name}</span>
                </div>
                
                {/* Tooltip / Description on Hover */}
                <div className={`absolute top-full left-0 mt-2 w-48 p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-400 transition-all duration-200 ${
                  activeSource === source.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>
                  {source.description}
                  <div className="absolute -top-1.5 left-4 w-3 h-3 bg-zinc-900 border-t border-l border-zinc-800 rotate-45" />
                </div>
              </motion.div>
            ))}

          </div>

        </div>
      </div>
    </section>
  );
}
