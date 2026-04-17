"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Menu, X } from "lucide-react";
import { DiscordIcon } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { sendGAEvent } from "@/lib/analytics";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How it Works" },
    { href: "/#pricing", label: "Pricing" },
    {
      href: "https://github.com/onvo-ai/loghead",
      label: "Docs",
      external: true,
    },
  ];

  return (
    <header className="fixed top-0 z-50 w-full h-16 border-b backdrop-blur-xl border-zinc-800/50 bg-zinc-950/80 supports-backdrop-filter:bg-zinc-950/50">
      <div className="container flex justify-between items-center px-4 mx-auto h-full sm:px-6 lg:px-8">
        {/* Left Section: Logo & Desktop Nav */}
        <div className="flex gap-8 items-center">
          <Link
            href="/"
            className="flex z-50 gap-0 items-center font-bold text-white transition-opacity hover:opacity-90"
            onClick={() => {
              setIsOpen(false);
              sendGAEvent("nav_click", {
                label: "Home",
                location: "site_header",
              });
            }}
          >
            <Image
              src="/logo.svg"
              alt="Loghead Logo"
              width={1024}
              height={765}
              className="w-auto h-10 md:h-14 rotate-30"
            />
            <span className="-ml-2 text-lg tracking-tight md:text-xl">
              Loghead
            </span>
          </Link>

          <nav className="hidden gap-6 items-center md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-[#00FF94]"
                onClick={() =>
                  sendGAEvent("nav_click", {
                    label: link.label,
                    location: "site_header",
                  })
                }
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Actions & Mobile Toggle */}
        <div className="flex gap-3 items-center md:gap-4">
          <Link
            href="/app"
            className="hidden px-4 py-2 text-sm font-medium text-white bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-lg transition-colors hover:bg-[#00FF94]/20 md:block"
            onClick={() => sendGAEvent("nav_click", { label: "Login", location: "site_header" })}
          >
            Log In
          </Link>

          {/* Discord - Desktop Only */}
          <Link
            href={
              process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ||
              "https://discord.gg/loghead"
            }
            className="hidden items-center justify-center p-2 text-sm font-medium rounded-lg border transition-colors md:flex text-zinc-400 hover:text-white bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord Support"
            onClick={() =>
              sendGAEvent("discord_visit", { location: "site_header" })
            }
          >
            <DiscordIcon className="w-5 h-5" />
          </Link>

          {/* GitHub - Always Visible (Primary) */}
          <Link
            href={
              process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
              "https://github.com/onvo-ai/loghead"
            }
            className="group relative inline-flex overflow-hidden rounded-lg p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(0,255,148,0.5)] shadow-[0_0_20px_-5px_rgba(0,255,148,0.2)]"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star on GitHub"
            onClick={() =>
              sendGAEvent("github_visit", { source: "site_header" })
            }
          >
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,#00FF94_85%,#00E5FF_100%)]" />
            <span className="inline-flex overflow-hidden relative justify-center items-center w-10 h-10 text-white rounded-lg backdrop-blur-3xl transition-colors duration-300 cursor-pointer bg-zinc-950 group-hover:text-zinc-950 md:w-11 md:h-11">
              <span className="absolute inset-0 bg-linear-to-r from-[#00FF94] via-[#00FFC4] to-[#00E5FF] transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100" />
              <Github className="relative z-10 w-5 h-5 transition-transform duration-500 group-hover:rotate-12" />
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="relative z-50 p-2 text-zinc-400 md:hidden hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex fixed right-0 left-0 top-16 flex-col px-6 pt-8 pb-6 bottom-auto rounded-b-[18px] border-t border-b border-zinc-800 z-1000 md:hidden backdrop-blur-[20px] bg-zinc-950/80"
            >
              <div>
                <nav className="flex flex-col gap-6 mb-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium text-zinc-200 hover:text-[#00FF94] transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        sendGAEvent("nav_click", {
                          label: link.label,
                          location: "site_header_mobile",
                        });
                      }}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col gap-4">
                  <Link
                    href="/app"
                    className="flex justify-center items-center px-5 py-3 text-base font-medium rounded-full border transition-colors border-[#00FF94]/20 bg-[#00FF94]/10 text-white hover:bg-[#00FF94]/20"
                    onClick={() => {
                      setIsOpen(false);
                      sendGAEvent("nav_click", {
                        label: "Login",
                        location: "site_header_mobile",
                      });
                    }}
                  >
                    Log In
                  </Link>

                  <Link
                    href={
                      process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ||
                      "https://discord.gg/loghead"
                    }
                    className="flex gap-2 justify-center items-center px-5 py-3 text-base font-medium rounded-full border transition-colors border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-900"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setIsOpen(false);
                      sendGAEvent("discord_visit", {
                        location: "site_header_mobile",
                      });
                    }}
                  >
                    <DiscordIcon className="w-5 h-5" />
                    <span>Discord</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
