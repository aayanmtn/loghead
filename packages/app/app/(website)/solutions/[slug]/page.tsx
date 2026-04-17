import { notFound } from "next/navigation";
import { getAllSolutions, getSolutionBySlug } from "@/lib/seo-pages";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Terminal } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const pages = await getAllSolutions();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSolutionBySlug(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
    },
  };
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const page = await getSolutionBySlug(slug);
  const allPages = await getAllSolutions();

  if (!page) {
    notFound();
  }

  // Filter out current page and pick up to 2 random others
  const relatedPages = allPages
    .filter((p) => p.slug !== slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  // Split content by double newlines to create sections for injection
  const sections = page.content.split(/\n\n+/);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,rgba(0,255,148,0.05),transparent_70%)] pointer-events-none" />
      
      <main className="container relative z-10 flex-1 px-4 py-24 mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-8">
            <Link href="/" className="text-sm text-zinc-500 hover:text-[#00FF94] flex items-center gap-2 font-mono">
                <Terminal className="w-4 h-4" />
                ~/solutions
            </Link>
        </div>

        {/* Hero Section */}
        <header className="mb-16">
            <h1 className="mb-6 text-4xl font-bold tracking-tight leading-tight text-white sm:text-5xl">
                {page.title}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed border-l-2 border-[#00FF94]/50 pl-6">
                {page.description}
            </p>
        </header>

        {/* Problem Section */}
        <section className="mb-16">
            <h2 className="flex gap-3 items-center mb-6 text-2xl font-bold text-white">
                <span className="text-red-400">#</span> {page.problemTitle}
            </h2>
            <div className="p-6 rounded-xl border bg-zinc-900/30 border-zinc-800/50 sm:p-8">
                <p className="text-lg leading-relaxed text-zinc-300">
                    {page.problemDescription}
                </p>
            </div>
        </section>

        {/* Traditional Solutions */}
        <section className="mb-16">
            <h2 className="flex gap-3 items-center mb-8 text-2xl font-bold text-white">
                <span className="text-yellow-400">#</span> Traditional Solutions
            </h2>
            
            <div className="space-y-12">
                {page.solutionSteps?.map((step, index) => (
                    <div key={index} className="relative pl-8 border-l border-zinc-800">
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700" />
                        <h3 className="mb-3 text-xl font-semibold text-zinc-200">
                            {step.title}
                        </h3>
                        <p className="mb-4 leading-relaxed text-zinc-400">
                            {step.description}
                        </p>
                        {step.code && (
                            <div className="bg-black/50 rounded-lg p-4 border border-zinc-800 font-mono text-sm text-[#00FF94] overflow-x-auto">
                                {step.code}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>

        {/* Long-form Guide */}
        <section className="mb-32">
            <div className="flex justify-between items-center pb-8 mb-12 border-b border-zinc-800">
                <div>
                    <h2 className="flex gap-3 items-center mb-2 text-3xl font-bold text-white">
                        <span className="text-[#00FF94]">#</span> In-depth Analysis
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Technical deep dive into logging patterns and debugging strategies.
                    </p>
                </div>
                <div className="hidden text-right sm:block">
                    <div className="text-sm font-medium text-zinc-300">Loghead Engineering</div>
                    <div className="mt-1 text-xs text-zinc-500">10 min read</div>
                </div>
            </div>
            
            <div className="max-w-none">
                <article className="max-w-none prose prose-invert prose-lg prose-zinc">
                    {sections.map((section, index) => (
                        <div key={index} className="mb-8">
                             {/* Render Markdown Content */}
                            <div className="text-lg leading-8 text-zinc-300">
                                {index === 0 ? (
                                     <div className="first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:text-[#00FF94] first-letter:mr-3 first-letter:mt-[-6px] first-letter:font-mono">
                                        <ReactMarkdown 
                                            components={{
                                                // Custom styling for markdown elements
                                                h1: ({node, ...props}) => <h1 className="mt-10 mb-6 text-3xl font-bold text-white" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="flex gap-2 items-center mt-10 mb-4 text-2xl font-bold text-white" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="mt-8 mb-3 text-xl font-semibold text-zinc-100" {...props} />,
                                                p: ({node, ...props}) => <p className="mb-6 leading-8 text-zinc-300" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-zinc-300 space-y-2 marker:text-[#00FF94]" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 text-zinc-300 space-y-2 marker:text-[#00FF94]" {...props} />,
                                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#00FF94] pl-4 py-1 my-6 bg-zinc-900/50 text-zinc-400 italic" {...props} />,
                                                code: ({node, className, ...props}) => {
                                                    const isInline = !String(className).includes('language-');
                                                    return isInline 
                                                        ? <code className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[#00FF94] font-mono text-sm" {...props} />
                                                        : <code className="block overflow-x-auto p-4 my-6 font-mono text-sm rounded-lg border bg-black/50 border-zinc-800 text-zinc-300" {...props} />
                                                },
                                                pre: ({node, ...props}) => <pre className="not-prose" {...props} />,
                                            }}
                                        >
                                            {section}
                                        </ReactMarkdown>
                                     </div>
                                ) : (
                                    <ReactMarkdown 
                                        components={{
                                            // Custom styling for markdown elements
                                            h1: ({node, ...props}) => <h1 className="mt-10 mb-6 text-3xl font-bold text-white" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="flex gap-2 items-center mt-10 mb-4 text-2xl font-bold text-white" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="mt-8 mb-3 text-xl font-semibold text-zinc-100" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-6 leading-8 text-zinc-300" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-zinc-300 space-y-2 marker:text-[#00FF94]" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 text-zinc-300 space-y-2 marker:text-[#00FF94]" {...props} />,
                                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#00FF94] pl-4 py-1 my-6 bg-zinc-900/50 text-zinc-400 italic" {...props} />,
                                            code: ({node, className, ...props}) => {
                                                const isInline = !String(className).includes('language-');
                                                return isInline 
                                                    ? <code className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[#00FF94] font-mono text-sm" {...props} />
                                                    : <code className="block overflow-x-auto p-4 my-6 font-mono text-sm rounded-lg border bg-black/50 border-zinc-800 text-zinc-300" {...props} />
                                            },
                                            pre: ({node, ...props}) => <pre className="not-prose" {...props} />,
                                        }}
                                    >
                                        {section}
                                    </ReactMarkdown>
                                )}
                            </div>

                            {/* Visual Break 1: Terminal Snippet (after 2nd paragraph) */}
                            {index === 1 && page.visuals?.terminal && (
                                <div className="overflow-hidden relative my-12 rounded-xl border shadow-2xl border-zinc-800 bg-zinc-950 group">
                                    <div className="absolute inset-0 bg-linear-to-r from-[#00FF94]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                        </div>
                                        <div className="ml-4 font-mono text-xs text-zinc-500">terminal — zsh</div>
                                    </div>
                                    <div className="p-6 space-y-2 font-mono text-sm">
                                        <div className="flex gap-2">
                                            <span className="text-[#00FF94]">➜</span>
                                            <span className="text-zinc-100">{page.visuals.terminal.command}</span>
                                        </div>
                                        <div className="pt-2 text-zinc-500">
                                            {page.visuals.terminal.output}
                                        </div>
                                        <div className="pl-4 mt-2 border-l-2 border-red-500/50 text-zinc-400">
                                            <span className="text-red-400">ERROR</span> {page.visuals.terminal.error}
                                            <div className="mt-1 text-xs text-zinc-600">
                                                Suggestion: {page.visuals.terminal.suggestion}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Visual Break 2: Concept Diagram (after 5th paragraph) */}
                            {index === 4 && page.visuals?.diagram && (
                                <div className="flex flex-col gap-8 justify-center items-center p-8 my-12 text-center rounded-xl border bg-zinc-900/30 border-zinc-800 sm:flex-row">
                                    <div className="p-4 rounded-lg border shadow-lg bg-zinc-950 border-zinc-800">
                                        <div className="mb-2 text-xs text-zinc-500">{page.visuals.diagram.startLabel}</div>
                                        <div className="mb-1 w-32 h-2 rounded bg-zinc-800" />
                                        <div className="mb-1 w-24 h-2 rounded bg-zinc-800" />
                                        <div className="w-28 h-2 rounded bg-zinc-800" />
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-zinc-600" />
                                    <div className="p-4 rounded-lg bg-zinc-950 border border-[#00FF94]/30 shadow-[0_0_30px_-10px_rgba(0,255,148,0.1)] relative">
                                        <div className="absolute -top-2 -right-2 bg-[#00FF94] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">AI</div>
                                        <div className="text-[#00FF94] text-xs mb-2">{page.visuals.diagram.middleLabel}</div>
                                        <div className="mb-1 w-32 h-2 rounded bg-zinc-800" />
                                        <div className="w-24 h-2 rounded bg-zinc-800" />
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-zinc-600" />
                                    <div className="p-4 rounded-lg border shadow-lg bg-zinc-950 border-zinc-800">
                                        <div className="mb-2 text-xs text-zinc-300">{page.visuals.diagram.endLabel}</div>
                                        <div className="text-xs text-zinc-500">{page.visuals.diagram.insight}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </article>
            </div>
        </section>

        {/* The Loghead Pitch (CTA) */}
        <section className="relative rounded-3xl overflow-hidden border border-[#00FF94]/20 bg-zinc-900/50 mb-32">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FF94_1px,transparent_1px),linear-gradient(to_bottom,#00FF94_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF94]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative p-8 sm:p-12">
                <div className="flex gap-3 items-center mb-6">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#00FF94]/50" />
                    <span className="text-[#00FF94] font-mono text-sm uppercase tracking-widest font-bold">The Modern Solution</span>
                    <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#00FF94]/50" />
                </div>

                <h2 className="mb-6 text-3xl font-bold text-center text-white sm:text-4xl">
                    Stop wrestling with your logs. <br/>
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] to-[#00E5FF]">Stream them into AI instead.</span>
                </h2>

                <p className="mx-auto mb-8 max-w-2xl text-lg text-center text-zinc-400">
                    Traditional debugging tools (grep, jq, tail) weren't built for the AI era. 
                    Loghead pipes your structured logs directly into LLMs like Claude or ChatGPT, 
                    giving you instant, context-aware analysis without the manual effort.
                </p>

                <div className="grid gap-4 mx-auto mb-10 max-w-2xl sm:grid-cols-2">
                    <div className="flex gap-3 items-center text-zinc-300">
                        <div className="w-6 h-6 rounded-full bg-[#00FF94]/10 flex items-center justify-center text-[#00FF94]">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Zero-config setup</span>
                    </div>
                    <div className="flex gap-3 items-center text-zinc-300">
                         <div className="w-6 h-6 rounded-full bg-[#00FF94]/10 flex items-center justify-center text-[#00FF94]">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Works with any terminal output</span>
                    </div>
                    <div className="flex gap-3 items-center text-zinc-300">
                         <div className="w-6 h-6 rounded-full bg-[#00FF94]/10 flex items-center justify-center text-[#00FF94]">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>AI-ready context formatting</span>
                    </div>
                    <div className="flex gap-3 items-center text-zinc-300">
                         <div className="w-6 h-6 rounded-full bg-[#00FF94]/10 flex items-center justify-center text-[#00FF94]">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Open Source & Local First</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button asChild className="bg-[#00FF94] text-black hover:bg-[#00FF94]/90 h-12 px-8 text-lg rounded-full font-bold">
                        <Link href="/">
                            Get Loghead Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* More Troubleshooting Guides (Read Next) */}
        {relatedPages.length > 0 && (
            <section>
                <h2 className="flex gap-3 items-center mb-8 text-2xl font-bold text-white">
                    <span className="text-zinc-700">#</span> More Troubleshooting Guides
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {relatedPages.map((relatedPage) => (
                        <Link 
                            key={relatedPage.slug} 
                            href={`/solutions/${relatedPage.slug}`}
                            className="group relative flex flex-col p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-[#00FF94]/30 transition-all duration-300"
                        >
                            <div className="mb-4">
                                <div className="flex justify-center items-center w-10 h-10 rounded-lg border transition-transform duration-300 bg-zinc-900 border-zinc-800 group-hover:scale-110">
                                    <Terminal className="w-5 h-5 text-[#00FF94]" />
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#00FF94] transition-colors">
                                {relatedPage.title}
                            </h3>
                            
                            <p className="flex-1 text-sm leading-relaxed text-zinc-400 line-clamp-2">
                                {relatedPage.description}
                            </p>
                            
                            <div className="flex items-center mt-6 text-sm font-medium transition-colors text-zinc-500 group-hover:text-white">
                                Read Guide
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        )}
      </main>
    </div>
  );
}
