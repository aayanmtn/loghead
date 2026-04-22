import { notFound } from "next/navigation";
import { getAllGuides, getGuideBySlug } from "@/lib/guides";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const pages = await getAllGuides();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGuideBySlug(slug);
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

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const page = await getGuideBySlug(slug);
  const allPages = await getAllGuides();

  if (!page) {
    notFound();
  }

  // Filter out current page and pick up to 2 others
  const relatedPages = allPages
    .filter((p) => p.slug !== slug)
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
            <Link href="/guides" className="text-sm text-zinc-500 hover:text-[#00FF94] flex items-center gap-2 font-mono">
                <Terminal className="w-4 h-4" />
                ~/guides
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

        {/* Integration Steps */}
        <section className="mb-16">
            <h2 className="flex gap-3 items-center mb-8 text-2xl font-bold text-white">
                <span className="text-yellow-400">#</span> Step-by-Step Setup
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
                        {step.image && (
                            <div className="my-6">
                                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                                    <Image 
                                        src={step.image} 
                                        alt={step.caption || step.title} 
                                        width={1200} 
                                        height={675} 
                                        className="w-full h-auto"
                                    />
                                </div>
                                {step.caption && (
                                    <p className="mt-2 text-xs text-center text-zinc-500 italic">
                                        {step.caption}
                                    </p>
                                )}
                            </div>
                        )}
                        {step.code && (
                            <div className="bg-black/50 rounded-lg p-4 border border-zinc-800 font-mono text-sm text-[#00FF94] overflow-x-auto group relative">
                                <div className="absolute top-2 right-2 text-[10px] text-zinc-600 font-mono">CODE</div>
                                {step.code}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>

        {/* Detailed Guide Content */}
        <section className="mb-32">
            <div className="max-w-none">
                <article className="max-w-none prose prose-invert prose-lg prose-zinc">
                    {sections.map((section, index) => (
                        <div key={index} className="mb-8">
                            <div className="text-lg leading-8 text-zinc-300">
                                <ReactMarkdown 
                                    components={{
                                        h1: ({...props}) => <h1 className="mt-10 mb-6 text-3xl font-bold text-white" {...props} />,
                                        h2: ({...props}) => <h2 className="flex gap-2 items-center mt-10 mb-4 text-2xl font-bold text-white" {...props} />,
                                        h3: ({...props}) => <h3 className="mt-8 mb-3 text-xl font-semibold text-zinc-100" {...props} />,
                                        p: ({...props}) => <p className="mb-6 leading-8 text-zinc-300" {...props} />,
                                        ul: ({...props}) => <ul className="list-disc pl-6 mb-6 text-zinc-300 space-y-2 marker:text-[#00FF94]" {...props} />,
                                        ol: ({...props}) => <ol className="list-decimal pl-6 mb-6 text-zinc-300 space-y-2 marker:text-[#00FF94]" {...props} />,
                                        li: ({...props}) => <li className="pl-1" {...props} />,
                                        blockquote: ({...props}) => <blockquote className="border-l-4 border-[#00FF94] pl-4 py-1 my-6 bg-zinc-900/50 text-zinc-400 italic" {...props} />,
                                        code: ({className, ...props}) => {
                                            const isInline = !String(className).includes('language-');
                                            return isInline 
                                                ? <code className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[#00FF94] font-mono text-sm" {...props} />
                                                : <code className="block overflow-x-auto p-4 my-6 font-mono text-sm rounded-lg border bg-black/50 border-zinc-800 text-zinc-300" {...props} />
                                        },
                                        pre: ({...props}) => <pre className="not-prose" {...props} />,
                                    }}
                                >
                                    {section}
                                </ReactMarkdown>
                            </div>

                            {/* Terminal Visual Visual Break */}
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
                                                AI Insight: {page.visuals.terminal.suggestion}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </article>
            </div>
        </section>

        {/* CTA Section */}
        <section className="relative rounded-3xl overflow-hidden border border-[#00FF94]/20 bg-zinc-900/50 mb-32">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FF94_1px,transparent_1px),linear-gradient(to_bottom,#00FF94_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF94]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative p-8 sm:p-12 text-center">
                <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                    Ready to modernize <br/>
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00FF94] to-[#00E5FF]">your logging workflow?</span>
                </h2>
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

        {/* Read Next Section */}
        {relatedPages.length > 0 && (
            <section>
                <h2 className="flex gap-3 items-center mb-8 text-2xl font-bold text-white">
                    <span className="text-zinc-700">#</span> Other Integrations
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {relatedPages.map((relatedPage) => (
                        <Link 
                            key={relatedPage.slug} 
                            href={`/guides/${relatedPage.slug}`}
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
                        </Link>
                    ))}
                </div>
            </section>
        )}
      </main>
    </div>
  );
}
