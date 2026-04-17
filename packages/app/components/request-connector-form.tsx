"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function RequestConnectorForm() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full max-w-5xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm relative min-h-[85vh]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
           <div className="flex flex-col items-center gap-4">
             <Loader2 className="h-8 w-8 text-[#00FF94] animate-spin" />
             <p className="text-zinc-500 text-sm animate-pulse">Loading form...</p>
           </div>
        </div>
      )}
      <iframe 
        src="https://onvoai.notion.site/ebd/2b86b94cd00a80f5bbe7c59aa10d54bb" 
        className={`w-full h-[800px] border-0 bg-zinc-950 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        allowFullScreen 
        scrolling="no"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
