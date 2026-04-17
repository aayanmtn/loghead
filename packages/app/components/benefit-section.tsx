"use client";

import { motion } from "framer-motion";
import { Zap, RefreshCw, Filter, Bot, Lock, Code2, BarChart3, Shield, ArrowRight, Webhook } from "lucide-react";
import { useState } from "react";

export function BenefitSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="overflow-hidden relative py-24 border-t bg-zinc-950 border-zinc-900">
      {/* Background decoration */}
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
              Why Loghead
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Clear Context. <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Faster Fixes.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Transform your debugging workflow with intelligent log processing that makes your AI more effective.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 mx-auto max-w-6xl md:grid-cols-3">
          
          {/* Card 1: Token Efficiency (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="md:col-span-2 group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-[#00FF94]/30 transition-colors"
          >
            <div className="p-8">
              <div className="flex gap-3 items-center mb-4">
                <div className="p-2 rounded-lg bg-[#00FF94]/10 text-[#00FF94]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Token Efficiency</h3>
              </div>
              <p className="mb-8 max-w-md text-sm text-zinc-400">
                Loghead filters noise and only sends relevant log blocks, maximizing the value of every token used by your LLM context window.
              </p>
              
              {/* Visual: Bar Chart */}
              <div className="relative h-32 w-full bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-4 flex items-end gap-8 group-hover:border-[#00FF94]/20 transition-colors">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex gap-4 justify-between items-end h-20">
                    <div className="relative w-full h-full rounded-t-md transition-opacity bg-zinc-800 group-hover:opacity-50">
                      <span className="absolute -top-6 left-1/2 text-xs -translate-x-1/2 text-zinc-500">Raw</span>
                    </div>
                    <div className="w-full bg-[#00FF94] rounded-t-md h-[15%] relative shadow-[0_0_20px_rgba(0,255,148,0.3)]">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#00FF94] font-bold">-90%</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-zinc-800" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Universal Format (Span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="md:col-span-1 group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-[#00FF94]/30 transition-colors"
          >
             <div className="flex flex-col p-8 h-full">
              <div className="flex gap-3 items-center mb-4">
                <div className="p-2 text-blue-500 rounded-lg bg-blue-500/10">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Unified Format</h3>
              </div>
              <p className="mb-6 text-sm text-zinc-400">
                Standardize logs from JSON, plaintext, and syslog into one format.
              </p>
              
              {/* Visual: Code Snippet */}
              <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800 p-3 font-mono text-[10px] text-zinc-500 overflow-hidden relative">
                 <div className="absolute inset-0 from-transparent via-transparent pointer-events-none bg-linear-to-b to-zinc-950/90" />
                 <div className="space-y-1 text-blue-300/80">
                   <div>{`{`}</div>
                   <div className="pl-2"><span className="text-zinc-500">"ts":</span> "2024-11-20...",</div>
                   <div className="pl-2"><span className="text-zinc-500">"level":</span> "ERROR",</div>
                   <div className="pl-2"><span className="text-zinc-500">"svc":</span> "auth-api",</div>
                   <div className="pl-2"><span className="text-zinc-500">"msg":</span> "Invalid token"</div>
                   <div>{`}`}</div>
                   <div className="mt-2 opacity-50">{`{`}</div>
                   <div className="pl-2 opacity-50"><span className="text-zinc-500">"ts":</span> "2024-11-20...",</div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Custom Filtering (Span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
            className="md:col-span-1 group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-[#00FF94]/30 transition-colors"
          >
            <div className="flex flex-col p-8 h-full">
               <div className="flex gap-3 items-center mb-4">
                <div className="p-2 text-purple-500 rounded-lg bg-purple-500/10">
                  <Filter className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Smart Filters</h3>
              </div>
              <p className="mb-6 text-sm text-zinc-400">
                Drop "200 OK" success logs and only keep what matters for debugging.
              </p>

              {/* Visual: Toggles */}
              <div className="mt-auto space-y-3">
                 <div className="flex justify-between items-center p-2 rounded border bg-zinc-950 border-zinc-800">
                    <span className="font-mono text-xs text-zinc-400">level == "INFO"</span>
                    <div className="relative w-8 h-4 rounded-full bg-zinc-800"><div className="absolute left-1 top-0.5 w-3 h-3 bg-zinc-600 rounded-full"/></div>
                 </div>
                 <div className="flex justify-between items-center p-2 rounded border bg-zinc-950 border-zinc-800">
                    <span className="font-mono text-xs text-zinc-200">level == "ERROR"</span>
                    <div className="w-8 h-4 rounded-full bg-[#00FF94]/20 relative"><div className="absolute right-1 top-0.5 w-3 h-3 bg-[#00FF94] rounded-full shadow-[0_0_10px_rgba(0,255,148,0.5)]"/></div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Webhooks (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            viewport={{ once: true }}
            className="md:col-span-2 group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-[#00FF94]/30 transition-colors"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity bg-linear-to-br from-zinc-900/0 via-zinc-900/0 to-purple-500/5 group-hover:opacity-100" />
            
            <div className="relative p-8">
              <div className="flex flex-col gap-6 justify-between sm:flex-row sm:items-center">
                <div className="max-w-sm">
                   <div className="flex gap-3 items-center mb-4">
                      <div className="p-2 text-pink-500 rounded-lg bg-pink-500/10">
                        <Webhook className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Real-time Webhooks</h3>
                      <span className="px-2 py-0.5 text-[10px] font-medium text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Connect Loghead to your existing tools. Automatically trigger workflows in Slack, PagerDuty, or custom endpoints when specific log patterns are detected.
                    </p>
                </div>

                {/* Visual: Webhook Action */}
                <div className="flex-1 min-w-[200px] bg-zinc-950 rounded-xl border border-zinc-800 p-4 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1),transparent_70%)]" />
                   <div className="relative z-10 w-full font-mono text-[10px] text-zinc-400">
                      <div className="flex gap-2 items-center mb-2 text-pink-400">
                        <span className="font-bold">POST</span> /api/webhooks/alert
                      </div>
                      <div className="p-2 space-y-1 rounded border bg-zinc-900/50 border-zinc-800">
                        <div>{`{`}</div>
                        <div className="pl-2"><span className="text-zinc-500">"event":</span> "error_threshold",</div>
                        <div className="pl-2"><span className="text-zinc-500">"count":</span> 15,</div>
                        <div className="pl-2"><span className="text-zinc-500">"service":</span> "payments"</div>
                        <div>{`}`}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-green-400 text-xs justify-end">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        200 OK
                      </div>
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
