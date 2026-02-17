import { LogheadDashboard } from "@loghead/ui";
import { Github } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
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

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/onvo-ai/loghead"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Loghead GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://loghead.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-md border border-zinc-700 px-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Try Loghead Cloud
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <LogheadDashboard />
      </main>
    </div>
  );
}

export default App;
