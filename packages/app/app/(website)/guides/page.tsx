import { getAllGuides } from "@/lib/guides";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Integration Guides | Loghead",
  description: "Learn how to connect Loghead with your favorite IDEs, shells, and cloud providers.",
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 pt-24">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,rgba(0,255,148,0.05),transparent_70%)] pointer-events-none" />
      
      <main className="container relative z-10 px-4 py-16 mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 rounded-full bg-[#00FF94]/10 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/20">
              Documentation
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Integration <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF]">Guides</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zinc-400">
            Step-by-step instructions to connect your logs to the AI-powered debugging workflow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-16">
          {guides.map((guide, index) => (
            <Link 
              key={guide.slug} 
              href={`/guides/${guide.slug}`}
              className="group relative flex flex-col p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-[#00FF94]/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mb-6">
                <div className="flex justify-center items-center w-12 h-12 rounded-xl border transition-transform duration-300 bg-zinc-900 border-zinc-800 group-hover:scale-110">
                  <Terminal className="w-6 h-6 text-[#00FF94]" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00FF94] transition-colors">
                {guide.title}
              </h3>
              
              <p className="flex-1 text-zinc-400 leading-relaxed line-clamp-3">
                {guide.description}
              </p>
              
              <div className="flex items-center mt-8 text-sm font-semibold transition-colors text-zinc-500 group-hover:text-white">
                View Guide
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
