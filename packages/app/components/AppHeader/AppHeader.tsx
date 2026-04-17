"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { SettingsModal } from "@/components/SettingsModal";

interface AppHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00FF94]/10">
              <img
                src="https://www.loghead.dev/logo.svg"
                alt="Loghead logo"
                className="h-6 w-6 object-contain rotate-[30deg]"
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Loghead</div>
              <div className="text-xs text-zinc-500">Infra reasoning layer</div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right mr-1">
              <div className="text-xs text-zinc-500">Signed in as</div>
              <div className="max-w-[160px] truncate text-sm">{user?.name || user?.email}</div>
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg p-2 hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings size={16} className="text-zinc-400" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-full hover:ring-2 hover:ring-zinc-600 transition-all"
              title="Profile"
            >
              <img
                src={user?.image || `https://avatar.vercel.sh/${user?.id}`}
                className="h-8 w-8 rounded-full border border-zinc-800"
                alt="avatar"
              />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
      />
    </>
  );
}
