import Link from "next/link";
import { getAllSolutions } from "@/lib/seo-pages";
import { Terminal, ArrowRight, BookOpen } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Troubleshooting Guides & Solutions',
  description: 'Explore our library of troubleshooting guides for common logging, debugging, and server issues.',
};

export default async function SolutionsIndexPage() {
  const seoPages = await getAllSolutions();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <main className="container relative z-10 flex-1 px-4 py-24 mx-auto">
        {/* Header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="inline-flex justify-center items-center p-2 mb-8 rounded-full border backdrop-blur-sm bg-zinc-900/50 border-zinc-800">
             <BookOpen className="w-4 h-4 text-[#00FF94] mr-2" />
             <span className="font-mono text-sm text-zinc-400">Knowledge Base</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Troubleshooting <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] to-[#00E5FF]">Hub</span>
          </h1>
          
          <p className="text-xl leading-relaxed text-zinc-400">
            Expert guides on debugging server errors, managing JSON logs, and optimizing your development workflow with AI.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 mx-auto max-w-7xl md:grid-cols-2 lg:grid-cols-3">
          {seoPages.map((page) => (
            <Link 
              key={page.slug} 
              href={`/solutions/${page.slug}`}
              className="group relative flex flex-col p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-[#00FF94]/30 transition-all duration-300"
            >
              <div className="mb-4">
                <div className="flex justify-center items-center w-10 h-10 rounded-lg border transition-transform duration-300 bg-zinc-900 border-zinc-800 group-hover:scale-110">
                  <Terminal className="w-5 h-5 text-[#00FF94]" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#00FF94] transition-colors">
                {page.title}
              </h2>
              
              <p className="flex-1 mb-6 text-sm leading-relaxed text-zinc-400">
                {page.description}
              </p>
              
              <div className="flex items-center mt-auto text-sm font-medium transition-colors text-zinc-500 group-hover:text-white">
                Read Guide
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
