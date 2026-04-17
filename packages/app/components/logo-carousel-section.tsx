"use client";

import { motion } from "framer-motion";

const companies = [
  { 
    name: "Nexiny", 
    // Infinity Loop with Arrow
    path: "M8 4C3.5 4 1 7 1 10s2.5 6 7 6 6-3 8-5 3.5-5 8-5 7 3 7 6-2.5 6-7 6h-3v2h3c6 0 9-4 9-8s-3-8-9-8-6 3-8 5-3.5 5-8 5-7-3-7-6 2.5-6 7-6h3V4H8zm5 11l3 3-3 3v-6z",
    viewBox: "0 0 32 32"
  },
  { 
    name: "Qesor", 
    // Shield with Star
    path: "M12 2L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-3zm0 6l2.5 6h-5L12 8z",
    viewBox: "0 0 24 24"
  },
  { 
    name: "VoiceVR", 
    // VR Headset / Head
    path: "M12 2a9 9 0 0 0-9 9v7c0 1.7 1.3 3 3 3h3v-8H5v-2c0-3.9 3.1-7 7-7s7 3.1 7 7v2h-4v8h4v-7a9 9 0 0 0-9-9z M3 11h18v2H3z",
    viewBox: "0 0 24 24"
  },
  { 
    name: "Minutely", 
    // Clock
    path: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm1-13h-2v6l5.2 3.2 1-1.7-4.2-2.5z",
    viewBox: "0 0 24 24"
  },
  { 
    name: "Faroe", 
    // Wave Circle
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15c-2.6 0-4.8-1.8-5.4-4.2.5-.2 1-.3 1.6-.3 2.8 0 5 2.2 5 5v-.5zm5.8-2c-.6 1.3-1.8 2.3-3.3 2.8V13c2.8 0 5 2.2 5 5-.2-.1-.4-.1-.7-.1z",
    viewBox: "0 0 24 24"
  },
  { 
    name: "Novelon", 
    // Book Bulb
    path: "M12 6c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4s-4-1.8-4-4v-6c0-2.2 1.8-4 4-4zm0-4C9.5 2 7.3 3.2 6 5v12c1.3-1.8 3.5-3 6-3s4.7 1.2 6 3V5c-1.3-1.8-3.5-3-6-3z M10 20h4v2h-4z",
    viewBox: "0 0 24 24"
  },
  {
    name: "Eduser",
    // Grad Cap
    path: "M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z",
    viewBox: "0 0 24 24"
  },
  {
    name: "Kore",
    // Eye
    path: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
    viewBox: "0 0 24 24"
  }
];

// Duplicate companies to ensure smooth infinite scroll (many times)
const allCompanies = [...companies, ...companies, ...companies, ...companies, ...companies, ...companies];

export function LogoCarouselSection() {
  return (
    <section className="overflow-hidden relative py-12 bg-zinc-950 border-y border-zinc-900">
      <div className="container px-4 mx-auto mb-8">
        <p className="text-center text-xs font-medium text-zinc-500 uppercase tracking-[0.2em]">
          Trusted by developers at
        </p>
      </div>
      
      <div className="flex overflow-hidden relative group">
        <div className="absolute top-0 bottom-0 left-0 z-10 w-32 to-transparent bg-linear-to-r from-zinc-950" />
        <div className="absolute top-0 right-0 bottom-0 z-10 w-32 to-transparent bg-linear-to-l from-zinc-950" />
        
        <motion.div
          className="flex gap-20 items-center px-10"
          animate={{ x: "-50%" }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{ width: "max-content" }}
        >
          {allCompanies.map((company, i) => (
            <div key={`${company.name}-${i}`} className="flex gap-3 items-center opacity-40 grayscale transition-all duration-300 cursor-default hover:opacity-100 hover:grayscale-0 shrink-0">
              <svg 
                viewBox={company.viewBox} 
                className="w-auto h-6 text-white fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={company.path} />
              </svg>
              <span className="text-lg font-semibold text-white">{company.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
