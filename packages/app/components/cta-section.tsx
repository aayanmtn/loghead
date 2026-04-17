"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { sendGAEvent } from "@/lib/analytics";

export function CTASection() {
  return (
    <section className="overflow-hidden relative py-32 border-t bg-zinc-950 border-zinc-900">
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
      
      <div className="container relative z-10 px-4 mx-auto">
        <div
          className="mx-auto max-w-4xl text-center duration-700 animate-in fade-in slide-in-from-bottom-8"
        >
          <div className="inline-flex justify-center items-center p-2 mb-8 rounded-full border backdrop-blur-sm bg-zinc-900/50 border-zinc-800">
            <Terminal className="w-4 h-4 text-[#00FF94] mr-2" />
            <span className="font-mono text-sm text-zinc-400">npx @loghead/terminal</span>
          </div>

          <h2 className="mb-8 text-5xl font-bold tracking-tight text-white md:text-7xl">
            Ready to debug <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">like it&apos;s 2025?</span>
          </h2>
          
          <p className="mx-auto mb-12 max-w-2xl text-xl text-zinc-400">
            Stop fighting with context windows. Give your AI the clean, structured logs it needs to actually help you.
          </p>

          <div className="flex flex-col gap-4 justify-center items-center sm:flex-row">
            <Button 
              size="lg" 
              className="bg-[#00FF94] text-black hover:bg-[#00FF94]/90 text-lg px-8 h-14 font-semibold rounded-full w-full sm:w-auto"
              asChild
            >
              <a 
                href="https://github.com/onvo-ai/loghead"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGAEvent('github_visit', { source: 'cta_section_get_started' })}
              >
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 w-full h-14 text-lg rounded-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white sm:w-auto"
              asChild
            >
              <a 
                href="https://github.com/onvo-ai/loghead"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendGAEvent('github_visit', { source: 'cta_section_docs' })}
              >
                Read Documentation
              </a>
            </Button>
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            Open Source • Local First • No Credit Card Required
          </p>
        </div>
      </div>
    </section>
  );
}

