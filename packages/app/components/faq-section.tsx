"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const faqs = [
  {
    question: "How does Loghead protect my data privacy?",
    answer: "Loghead is self-hostable and runs entirely on your local machine. Your data never leaves your environment unless you explicitly configure a cloud connector. We have zero access to your logs."
  },
  {
    question: "What is the benefit of using an MCP server?",
    answer: "The Model Context Protocol (MCP) normalizes logs from various sources (Docker, System, Apps) into a single, structured format that LLMs can easily digest, improving context quality and reducing hallucinations."
  },
  {
    question: "Why don't you offer automated fixing/analysis?",
    answer: "We believe in doing one thing well: delivering clean context. We provide the high-quality fuel (logs), so your existing AI tools (Cursor, Windsurf, Copilot) can do what they do best—fixing code."
  },
  {
    question: "Is the Community Edition limited?",
    answer: "No. The Community Edition is fully featured for local development. It includes unlimited local logs, all standard connectors, and will always be free and open source."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="overflow-hidden relative py-24 border-t bg-zinc-950 border-zinc-900" id="faq">
      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Side: Header */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                FAQs
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-zinc-400">
                Everything you need to know about Loghead. Can&apos;t find the answer you&apos;re looking for?
              </p>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white" asChild>
                <Link href="mailto:support@loghead.dev">Contact Support</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Side: Accordion */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`rounded-lg border transition-colors ${
                    openIndex === index ? "border-[#00FF94]/30 bg-zinc-900" : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="flex justify-between items-center p-6 w-full text-left"
                  >
                    <span className="font-medium text-zinc-200">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm leading-relaxed text-zinc-400">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
