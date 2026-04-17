# Loghead Design System

This document outlines the core design principles, tokens, and component patterns used in the Loghead website.

## Note: All components must be designed for maximum Server-Side Rendering compatibility to ensure best-in-class SEO.

## 🎨 Color Palette

The design uses a dark, high-contrast theme with neon green accents to evoke a modern, developer-centric tool.

### Primary Colors
- **Brand Green:** `#00FF94` (Used for CTAs, accents, and success states)
- **Background:** `zinc-950` (`#09090b`) - Deepest black for page backgrounds.
- **Surface:** `zinc-900` (`#18181b`) - Used for cards and elevated surfaces.
- **Border:** `zinc-800` (`#27272a`) - Subtle dividers and card borders.

### Text Colors
- **Primary:** `white` (`#ffffff`) - Headings and high-emphasis text.
- **Secondary:** `zinc-400` (`#a1a1aa`) - Body text and descriptions.
- **Muted:** `zinc-500` (`#71717a`) - Meta info, footers, and labels.

## 🔤 Typography

- **Sans Serif:** `Inter` (via `var(--font-inter)`) - Used for all UI text.
- **Monospace:** `Geist Mono` (via `var(--font-geist-mono)`) - Used for logs, code snippets, and technical data.

### Scale
- **H1:** `text-5xl sm:text-7xl font-bold tracking-tight`
- **H2:** `text-3xl sm:text-4xl font-bold tracking-tight`
- **H3:** `text-xl font-bold`
- **Body:** `text-lg leading-relaxed` (Hero) / `text-sm` (Cards)

## 🧩 Component Patterns

### 1. Cards (Bento/Feature)
Cards are the primary container for content.
- **Background:** `bg-zinc-900/50` (with `backdrop-blur` if needed)
- **Border:** `border border-zinc-800`
- **Hover State:** `hover:border-[#00FF94]/30 transition-colors`
- **Radius:** `rounded-xl` or `rounded-2xl`

```tsx
<div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-[#00FF94]/30 transition-all duration-300">
  {/* Content */}
</div>
```

### 2. Buttons
- **Primary:** `bg-[#00FF94] text-black hover:bg-[#00FF94]/90 font-medium`
- **Ghost/Secondary:** `text-zinc-400 hover:text-white hover:bg-white/5`

### 3. Badges / Pills
Used for "Coming Soon" or "New" labels.
- **Style:** `rounded-full bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20`
- **Text:** `text-xs font-bold uppercase tracking-wider`

## ✨ Animations (Framer Motion)

We use `framer-motion` for entrance and interaction animations.

### Standard Entrance
```tsx
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
viewport={{ once: true }}
```

### Interactive Hover
- **Scale:** `whileHover={{ scale: 1.02 }}`
- **Glow:** Add an absolute positioned `div` with a gradient opacity change on hover.

## 🖼️ Icons
- **Library:** `lucide-react`
- **Style:** Stroke width `1.5` or `2` depending on size.
- **Color:** Often colored with the specific section theme (e.g., Cloud = Blue, Error = Red, Success = Green).

## 📐 Layout
- **Container:** `container mx-auto px-4 sm:px-6 lg:px-8`
- **Section Spacing:** `py-24`
- **Grid:** `grid-cols-1 md:grid-cols-3 gap-8` for responsive layouts.
