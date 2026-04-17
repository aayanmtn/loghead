"use client";

import { Code, Globe, Server, Box, Terminal, Database, Cloud } from "lucide-react";
import Link from "next/link";
import { sendGAEvent } from "@/lib/analytics";

const connectors = [
  { name: "VS Code", icon: Code, type: "IDE", status: "Available" },
  { name: "Cursor", icon: Terminal, type: "IDE", status: "Available" },
  { name: "Windsurf", icon: Code, type: "IDE", status: "Available" },
  { name: "Docker", icon: Box, type: "Source", status: "Available" },
  { name: "System Logs", icon: Server, type: "Source", status: "Available" },
  { name: "Chrome Console", icon: Globe, type: "Browser", status: "Available" },
  { name: "Postgres", icon: Database, type: "Database", status: "Coming Soon" },
  { name: "AWS CloudWatch", icon: Cloud, type: "Cloud", status: "Coming Soon" },
  { name: "Vercel Logs", icon: Globe, type: "Cloud", status: "Coming Soon" },
];

export function FeatureSection() {
  return (
    <section className="py-24 border-t bg-zinc-950 border-zinc-900" id="features">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center duration-700 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
              Ecosystem
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Connects With <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Your Stack</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">
            Loghead works where you work. Zero config required for most local environments.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {connectors.map((connector, index) => {
            const isComingSoon = connector.status === 'Coming Soon';
            const Wrapper: any = isComingSoon ? Link : 'div';
            const props = isComingSoon ? { 
              href: '/request-new-log-connectors',
              onClick: () => sendGAEvent('request_connector_click', { connector_name: connector.name })
            } : {};

            return (
              <Wrapper
                key={connector.name}
                className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-[#00FF94]/30 transition-all duration-300 cursor-default animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards ${isComingSoon ? 'cursor-pointer hover:border-blue-400/30' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
                {...props}
              >
                <div className={`mb-4 p-3 rounded-lg ${connector.status === 'Available' ? 'bg-zinc-800 text-zinc-200 group-hover:bg-[#00FF94]/10 group-hover:text-[#00FF94]' : 'bg-zinc-800/50 text-zinc-600'} transition-colors`}>
                  <connector.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-sm font-medium ${connector.status === 'Available' ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600'} transition-colors`}>
                  {connector.name}
                </h3>
                
                {/* Status Badge for Coming Soon */}
                {connector.status === 'Coming Soon' && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700 group-hover:bg-blue-400/10 group-hover:text-blue-400 group-hover:border-blue-400/20 transition-colors">
                    Soon
                  </span>
                )}
              </Wrapper>
            );
          })}
          
          {/* "More" Card */}
           <Link
              href="/request-new-log-connectors"
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-[#00FF94]/30 bg-[#00FF94]/5 hover:border-[#00FF94]/60 hover:bg-[#00FF94]/10 transition-colors cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: "500ms" }}
              onClick={() => sendGAEvent('request_connector_click', { connector_name: 'More' })}
            >
              <span className="text-sm text-[#00FF94]/70 font-medium group-hover:text-[#00FF94] transition-colors">Request More +</span>
            </Link>
        </div>
      </div>
    </section>
  );
}

