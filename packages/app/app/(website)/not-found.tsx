"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Home, ArrowLeft, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [logs, setLogs] = useState<string[]>([
    "> Initiating search protocol...",
    "> Scanning /var/www/html...",
    "> Error: 404 Resource Not Found",
    "> Stack trace: User strayed too far from the heap.",
  ]);

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, "> Suggestion: Return to base."]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Glitchy 404 Text */}
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] to-[#00E5FF] mb-8 tracking-tighter select-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
          {isHovering ? "40?" : "404"}
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Null Pointer Exception
        </h2>
        <p className="text-zinc-400 mb-12 text-lg">
          The page you are looking for has been garbage collected.
        </p>

        {/* Interactive Terminal */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 max-w-lg mx-auto mb-12 text-left shadow-2xl backdrop-blur-xs">
          <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <div className="ml-auto text-xs text-zinc-600 flex items-center gap-2">
               <Terminal className="w-3 h-3" />
               <span>bash</span>
            </div>
          </div>
          <div className="space-y-2 text-sm font-mono">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${log.includes("Error") ? "text-red-400" : "text-[#00FF94]"}`}
              >
                {log}
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-[#00FF94] inline-block align-middle ml-1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild className="bg-[#00FF94] text-black hover:bg-[#00FF94]/90 font-bold">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              cd /home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            history.back()
          </Button>
        </div>
      </motion.div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 text-xs text-zinc-600 font-mono">
        Process exited with code 404
      </div>
    </div>
  );
}
