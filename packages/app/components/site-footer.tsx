"use client";

import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/icons";
import { sendGAEvent } from "@/lib/analytics";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="container px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4">
          <div className="col-span-2">
            <div className="flex gap-0 items-center">
              <Image
                src="/logo.svg"
                alt="Loghead Logo"
                width={1024}
                height={765}
                className="w-auto h-14 rotate-30"
              />
              <span className="-ml-2 text-xl font-bold text-white">
                Loghead
              </span>
            </div>
            <p className="mt-4 text-sm text-zinc-400">
              The most intuitive logging solution for modern development teams.
              Debug faster, understand more, and ship with confidence.
            </p>
            <div className="flex mt-6 space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white"
                asChild
              >
                <Link
                  href={
                    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
                    "https://github.com/onvo-ai/loghead"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    sendGAEvent("github_visit", { source: "site_footer" })
                  }
                >
                  <Github className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white"
                asChild
              >
                <Link
                  href={
                    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ||
                    "https://discord.gg/loghead"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    sendGAEvent("discord_visit", { location: "site_footer" })
                  }
                >
                  <DiscordIcon className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() =>
                    sendGAEvent("nav_click", {
                      label: "Features",
                      location: "site_footer",
                    })
                  }
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() =>
                    sendGAEvent("nav_click", {
                      label: "Pricing",
                      location: "site_footer",
                    })
                  }
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href={
                    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
                    "https://github.com/onvo-ai/loghead"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() =>
                    sendGAEvent("nav_click", {
                      label: "Documentation",
                      location: "site_footer",
                    })
                  }
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions"
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() =>
                    sendGAEvent("nav_click", {
                      label: "Solutions",
                      location: "site_footer",
                    })
                  }
                >
                  Solutions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() =>
                    sendGAEvent("nav_click", {
                      label: "Privacy",
                      location: "site_footer",
                    })
                  }
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() =>
                    sendGAEvent("nav_click", {
                      label: "Terms",
                      location: "site_footer",
                    })
                  }
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-zinc-400 hover:text-white"
                  onClick={() =>
                    sendGAEvent("nav_click", {
                      label: "Cookie Policy",
                      location: "site_footer",
                    })
                  }
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-12 border-t border-zinc-800">
          <p className="text-sm text-center text-zinc-400">
            &copy; {new Date().getFullYear()} Loghead. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
