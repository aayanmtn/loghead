import React from "react";
import { Terminal, Shield, Scale, AlertTriangle, Gavel } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Terms of Service for using Loghead.',
};

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-zinc-500 text-lg">
              Last updated: <span className="text-zinc-400 font-mono">{new Date().toLocaleDateString()}</span>
            </p>
        </header>

        <article className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-zinc-400 prose-p:leading-relaxed prose-li:text-zinc-400 prose-strong:text-white prose-strong:font-semibold">
          <p className="text-xl text-zinc-300 leading-relaxed mb-12">
            Welcome to Loghead. These Terms of Service ("Terms") govern your use of the Loghead website and services (collectively, the "Service") operated by Guidenco Inc ("us", "we", or "our").
          </p>

          <div className="space-y-12">
              
              <section>
                  <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-[#00FF94]">
                        <Shield className="w-5 h-5" />
                      </div>
                      Accounts & Security
                  </h3>
                  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
                    <p className="mb-4">
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
                    </p>
                    <ul className="space-y-3 list-none pl-0">
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2.5 shrink-0" />
                            <span>You are responsible for safeguarding the password that you use to access the Service.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2.5 shrink-0" />
                            <span>You agree not to disclose your password to any third party.</span>
                        </li>
                    </ul>
                  </div>
              </section>

              <section>
                  <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-[#00FF94]">
                        <Scale className="w-5 h-5" />
                      </div>
                      Intellectual Property
                  </h3>
                  <p>
                    The Service and its original content, features and functionality are and will remain the exclusive property of Guidenco Inc and its licensors. The Service is protected by copyright, trademark, and other laws.
                  </p>
              </section>

              <section>
                  <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      Limitation of Liability
                  </h3>
                  <p>
                    In no event shall Guidenco Inc be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                  <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-lg text-sm text-red-200/80">
                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
                  </div>
              </section>

              <section>
                  <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400">
                        <Gavel className="w-5 h-5" />
                      </div>
                      Governing Law
                  </h3>
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                  </p>
              </section>

              <section className="pt-8 border-t border-zinc-800">
                  <h4 className="text-white font-bold mb-2">Contact Us</h4>
                  <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@loghead.ai" className="text-[#00FF94] hover:underline">support@loghead.ai</a>.</p>
              </section>
          </div>

        </article>
      </div>
    </main>
  );
}
