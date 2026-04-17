"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Users } from "lucide-react";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
  </svg>
);

export function CommunitySection() {
  return (
    <section className="py-12 bg-zinc-950 relative">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-1">
          {/* Subtle Gradient Border */}
          <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-zinc-800 via-transparent to-transparent pointer-events-none" />

          <div className="relative rounded-xl bg-zinc-950/80 backdrop-blur-sm p-8 md:p-12 text-center overflow-hidden">
            {/* Very Subtle Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-[#00FF94]/5 blur-[80px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative z-10 max-w-2xl mx-auto"
            >
              <div className="flex justify-center mb-6">
                <div className="flex items-center px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
                  <Users className="w-3 h-3 mr-2" />
                  <span>Community Driven</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-4">
                Built in public.{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">
                  Open source.
                </span>
              </h2>

              <p className="text-lg text-zinc-500 mb-8 leading-relaxed max-w-lg mx-auto">
                Join our growing community of developers. Discuss features,
                share plugins, and shape the future of Loghead.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  variant="outline"
                  className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 transition-all duration-300 h-10 px-6 text-sm font-medium rounded-lg group"
                  asChild
                >
                  <Link
                    href="https://discord.gg/loghead"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DiscordIcon className="w-4 h-4 mr-2 text-zinc-400 group-hover:text-[#5865F2] transition-colors" />
                    Join Discord
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-300 h-10 px-6 text-sm font-medium rounded-lg"
                  asChild
                >
                  <Link
                    href="https://github.com/onvo-ai/loghead"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-gtm-event="github_star"
                  >
                    <Github className="w-4 h-4 mr-2 text-zinc-400 group-hover:text-white transition-colors" />
                    Star on GitHub
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
