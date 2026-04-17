"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Filter, Cloud, Globe, Server, Search, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const LOG_SOURCES = [
  {
    id: "terminal",
    name: "Terminal",
    icon: Terminal,
    color: "text-green-400",
    bg: "bg-zinc-950",
    logs: [
      "> yarn start:dev",
      "[WAIT] Compiling...",
      "[INFO] Server listening on :3000",
      "[WARN] Deprecated dependency found",
      "[INFO] HMR connected",
      "[DEBUG] User session initiated",
      "> docker-compose up -d",
      "[INFO] Container 'db' healthy"
    ]
  },
  {
    id: "cloud",
    name: "Cloud Console",
    icon: Cloud,
    color: "text-blue-400",
    bg: "bg-slate-950",
    logs: [
      "aws: ec2 start-instances i-03...",
      "azure: blob_storage_access_key rotated",
      "gcp: pubsub topic created",
      "k8s: pod/payment-service-x7f restart",
      "aws: s3 bucket policy updated",
      "terraform: apply complete (3 added)",
      "cloudwatch: alarm triggered: CPU > 80%"
    ]
  },
  {
    id: "browser",
    name: "Browser Console",
    icon: Globe,
    color: "text-yellow-400",
    bg: "bg-[#1a1a1a]",
    logs: [
      "Console was cleared",
      "[HMR] Waiting for update signal...",
      "XHR finished loading: GET '/api/user'",
      "Refused to load image: 404 Not Found",
      "React DevTools: Connected",
      "Download the React DevTools",
      "Navigated to http://localhost:3000/dashboard"
    ]
  },
  {
    id: "server",
    name: "Server Logs",
    icon: Server,
    color: "text-purple-400",
    bg: "bg-zinc-900",
    logs: [
      "POST /api/v1/auth/login 200 45ms",
      "GET /api/v1/user/profile 200 12ms",
      "GET /health 200 1ms",
      "POST /api/v1/analytics 201 8ms",
      "PUT /api/v1/settings 200 65ms",
      "GET /metrics 200 4ms",
      "DELETE /api/v1/session 204 15ms"
    ]
  }
];

export function AhaMomentSection() {
  const [step, setStep] = useState(0); // 0: Chaos, 1: Scanning, 2: Clarity
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev === 0) return 1; // Go to Scanning
        if (prev === 1) return 2; // Go to Clarity
        return 0; // Reset to Chaos
      });
    }, step === 0 ? 3000 : step === 1 ? 1000 : 3000); // Timings for each phase

    return () => clearInterval(interval);
  }, [step]);

  return (
    <section className="overflow-hidden relative py-24 border-t bg-zinc-950 border-zinc-900">
      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 gap-16 items-center lg:grid-cols-2">
          
          {/* Left: Text Content */}
          <div className="duration-700 animate-in fade-in slide-in-from-left-8">
            <div className="flex gap-2 items-center mb-6">
              <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
                Instant Clarity
              </span>
            </div>
            
            <h2 className="mb-6 text-3xl font-bold tracking-tight leading-tight text-white sm:text-5xl">
              From Noise to Signal <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">in Milliseconds.</span>
            </h2>
            
            <p className="mb-8 text-lg leading-relaxed text-zinc-400">
              Stop alt-tabbing between terminals, cloud consoles, and browser tools. Loghead ingests streams from every source and instantly isolates the root cause.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex justify-center items-center w-10 h-10 rounded-lg border shrink-0 bg-zinc-900 border-zinc-800">
                  <Filter className="h-5 w-5 text-[#00FF94]" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Unified Context</h3>
                  <p className="text-sm text-zinc-400">
                    Ingest logs from AWS, Vercel, your local terminal, and browser console simultaneously.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex justify-center items-center w-10 h-10 rounded-lg border shrink-0 bg-zinc-900 border-zinc-800">
                  <Zap className="h-5 w-5 text-[#00FF94]" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Smart Isolation</h3>
                  <p className="text-sm text-zinc-400">
                    Our AI agent correlates timestamps across sources to find the exact moment things went wrong.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual Asset */}
          <div className="relative mx-auto w-full max-w-lg duration-700 animate-in fade-in slide-in-from-right-8 perspective-1000">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-[#00FF94]/20 blur-3xl opacity-20 rounded-full pointer-events-none" />
            
            <div className="relative h-[450px] w-full flex items-center justify-center">
              
              {/* PHASE 1 & 2: CHAOS & SCANNING */}
              <AnimatePresence>
                {(step === 0 || step === 1) && (
                  <motion.div 
                    key="chaos-grid"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1, filter: step === 1 ? "blur(4px) brightness(0.5)" : "blur(0px) brightness(1)" }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.5 }}
                    className="grid absolute inset-0 grid-cols-2 gap-3 w-full h-full"
                  >
                    {LOG_SOURCES.map((source) => (
                      <div key={source.id} className={`rounded-xl border border-zinc-800 ${source.bg} overflow-hidden flex flex-col shadow-xl relative group`}>
                        {/* Source Header */}
                        <div className="flex gap-2 items-center px-3 py-2 border-b border-white/5 bg-white/5">
                          <source.icon className={`w-3 h-3 ${source.color}`} />
                          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{source.name}</span>
                        </div>
                        {/* Logs Content */}
                        <div className="p-3 font-mono text-[10px] text-zinc-500 space-y-2 opacity-70 overflow-hidden relative flex-1">
                           <div className="absolute top-0 right-3 left-3 animate-scroll-up">
                              {[...source.logs, ...source.logs, ...source.logs].map((log, i) => (
                                <div key={i} className="truncate mb-1.5">{log}</div>
                              ))}
                           </div>
                        </div>
                        {/* Scanning Effect Overlay */}
                        {step === 1 && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-[#00FF94]/5 z-10 flex items-center justify-center"
                          >
                             <div className="w-full h-[2px] bg-[#00FF94]/50 shadow-[0_0_15px_rgba(0,255,148,0.5)] absolute top-1/2 animate-scan" />
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* PHASE 1 OVERLAY: SEARCHING */}
                {step === 1 && (
                   <motion.div
                      key="scanning-icon"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className="flex absolute inset-0 z-20 justify-center items-center pointer-events-none"
                   >
                      <div className="h-20 w-20 bg-zinc-950 rounded-full border border-[#00FF94]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,148,0.2)]">
                        <Search className="h-8 w-8 text-[#00FF94] animate-pulse" />
                      </div>
                   </motion.div>
                )}

                {/* PHASE 2: CLARITY (RESULT) */}
                {step === 2 && (
                  <motion.div
                    key="result-card"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="flex absolute inset-0 z-30 justify-center items-center"
                  >
                    <div className="overflow-hidden w-full max-w-sm rounded-xl border shadow-2xl bg-zinc-900 border-zinc-800">
                      {/* Header */}
                      <div className="flex justify-between items-center px-4 py-3 border-b bg-red-500/10 border-red-500/20">
                        <div className="flex gap-2 items-center text-sm font-bold text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Root Cause Identified</span>
                        </div>
                        <span className="text-[10px] text-red-400/70 font-mono">Just now</span>
                      </div>
                      
                      {/* Body */}
                      <div className="p-5">
                         <motion.div 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.1 }}
                           className="mb-4"
                         >
                           <div className="flex gap-1 items-center mb-1 text-xs text-zinc-400">
                              <Server className="w-3 h-3" /> 
                              <span className="font-mono">api-service-prod</span>
                           </div>
                           <h3 className="p-3 font-mono text-sm font-medium text-white rounded border bg-zinc-950 border-zinc-800">
                             Error: PaymentGateway Connection Timeout (5000ms)
                           </h3>
                         </motion.div>
                         
                         <div className="space-y-3">
                           <motion.div 
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.3 }}
                             className="flex gap-3 items-start"
                           >
                              <div className="mt-0.5 w-4 h-4 rounded-full bg-[#00FF94]/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-[#00FF94]" />
                              </div>
                              <div className="text-xs text-zinc-400">
                                <span className="font-medium text-white">Correlated Event:</span> Database lock in <code className="text-zinc-300">transaction_manager.ts</code> blocked the heartbeat.
                              </div>
                           </motion.div>
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.6 }}
                             className="flex items-center gap-2 text-xs text-[#00FF94] cursor-pointer hover:underline mt-2"
                           >
                              <span>View Full Context Stream</span>
                              <ArrowRight className="w-3 h-3" />
                           </motion.div>
                         </div>
                      </div>
                      
                      {/* Footer / Sources */}
                      <div className="flex gap-2 items-center px-4 py-2 border-t bg-zinc-950/50 border-zinc-800">
                        <span className="text-[10px] text-zinc-500">Sources analyzed:</span>
                        <div className="flex -space-x-1">
                          <div className="flex z-30 justify-center items-center w-4 h-4 rounded-full border bg-zinc-800 border-zinc-700" title="Terminal"><Terminal className="w-2 h-2 text-zinc-400"/></div>
                          <div className="flex z-20 justify-center items-center w-4 h-4 rounded-full border bg-zinc-800 border-zinc-700" title="Cloud"><Cloud className="w-2 h-2 text-zinc-400"/></div>
                          <div className="flex z-10 justify-center items-center w-4 h-4 rounded-full border bg-zinc-800 border-zinc-700" title="Browser"><Globe className="w-2 h-2 text-zinc-400"/></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
