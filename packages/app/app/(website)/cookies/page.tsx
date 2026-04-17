import React from "react";
import { Terminal, Cookie, Settings, MousePointer, Info } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how Loghead uses cookies to improve your experience.',
};

export default function CookiePolicy() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-[#00FF94] selection:text-black">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,rgba(0,255,148,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-24 relative z-10">
        
        {/* Breadcrumb / Home Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#00FF94] transition-colors mb-8 group">
            <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Return to Home</span>
        </Link>

        <header className="mb-16 border-b border-zinc-800 pb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Cookie Policy
            </h1>
            <p className="text-zinc-500 text-lg">
              Last updated: <span className="text-zinc-400 font-mono">{new Date().toLocaleDateString()}</span>
            </p>
        </header>

        <article className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-zinc-400 prose-p:leading-relaxed prose-li:text-zinc-400 prose-strong:text-white prose-strong:font-semibold">
          <p className="text-xl text-zinc-300 leading-relaxed mb-12">
            This Cookie Policy explains what Cookies are and how Guidenco Inc ("we", "us", or "our") uses them. You should read this policy so you can understand what type of cookies we use, or the information we collect using Cookies and how that information is used.
          </p>

          <div className="space-y-12">
              
              <section>
                  <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-[#00FF94]">
                        <Info className="w-5 h-5" />
                      </div>
                      What are Cookies?
                  </h3>
                  <p>
                    Cookies are small files that are placed on your computer, mobile device or any other device by a website, containing the details of your browsing history on that website among its many uses.
                  </p>
              </section>

              <section>
                  <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-[#00FF94]">
                        <Cookie className="w-5 h-5" />
                      </div>
                      Types of Cookies We Use
                  </h3>
                  
                  <div className="grid gap-6">
                      {/* Essential Cookies */}
                      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 hover:border-[#00FF94]/30 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-zinc-800 rounded-lg text-white"><Settings className="w-4 h-4" /></div>
                              <h4 className="text-white font-bold m-0">Essential Cookies</h4>
                          </div>
                          <div className="flex gap-2 text-xs font-mono text-zinc-500 mb-3 uppercase">
                              <span className="px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700">Session</span>
                              <span className="px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700">First-Party</span>
                          </div>
                          <p className="text-sm m-0">
                              Essential to provide you with services available through the Website and to enable you to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts.
                          </p>
                      </div>

                      {/* Functionality Cookies */}
                      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 hover:border-blue-500/30 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-zinc-800 rounded-lg text-white"><MousePointer className="w-4 h-4" /></div>
                              <h4 className="text-white font-bold m-0">Functionality Cookies</h4>
                          </div>
                          <div className="flex gap-2 text-xs font-mono text-zinc-500 mb-3 uppercase">
                              <span className="px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700">Persistent</span>
                              <span className="px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700">First-Party</span>
                          </div>
                          <p className="text-sm m-0">
                              Allow us to remember choices you make when you use the Website, such as remembering your login details or language preference.
                          </p>
                      </div>
                  </div>
              </section>

              <section>
                  <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <Settings className="w-5 h-5" />
                      </div>
                      Managing Cookies
                  </h3>
                  <p>
                    If you prefer to avoid the use of Cookies on the Website, first you must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website.
                  </p>
                  <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 italic">
                    Note: If you do not accept our Cookies, you may experience some inconvenience in your use of the Website and some features may not function properly.
                  </div>
              </section>

              <section className="pt-8 border-t border-zinc-800">
                  <h4 className="text-white font-bold mb-2">Contact Us</h4>
                  <p>If you have any questions about this Cookie Policy, please contact us at <a href="mailto:support@loghead.ai" className="text-[#00FF94] hover:underline">support@loghead.ai</a>.</p>
              </section>
          </div>

        </article>
      </div>
    </main>
  );
}
