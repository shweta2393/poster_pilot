# PosterPilot — AI-Powered Poster & Ad Creator

An agentic AI application for creating stunning digital posters, social media graphics, and advertisements from a single natural-language prompt. Type something like _"create a LinkedIn post advertising my salon"_ and PosterPilot generates a complete, publication-ready poster with relevant imagery, industry-tailored copy, and smart layout — then lets you refine every detail interactively.
Screenshots from local run are available in: docs/ui-screenshots.pdf

## Highlights

- **One-Command Generation** — Describe what you need in plain English; the AI agent produces a full poster (headline, body copy, CTA, background image, color palette, layout) in seconds.
- **Dynamic Image Sourcing** — Automatically searches Unsplash and Pexels for contextually relevant images based on your prompt, with static fallbacks to guarantee a result every time.
- **Post-Generation Refinement** — Swap backgrounds (search, upload, or pick from results), change color palettes, or regenerate the entire poster from the Refine panel.
- **Interactive Canvas Editor** — Drag, resize, rotate, and inline-edit every element on a Fabric.js-powered canvas.
- **AI Design Engine** — Detects industry, purpose, and platform from the prompt; generates topic-specific content (benefits, bullet points, CTAs) and anti-overlap vertical-stacking layouts.
- **Template Add-ons** — Themed badges and banners (e.g. "50% OFF", "NEW LAUNCH") that snap onto existing posters without overlapping, with editable text and background colors.
- **20+ Size Presets** — Instagram Story/Post, Facebook Cover, Twitter/X, LinkedIn, YouTube Thumbnail, Pinterest, TikTok, A4, and more.
- **Rich Text Editing** — Multiple fonts, sizes, weights, alignment, and styling with pixel-sharp rendering at any zoom level.
- **Shape Library** — Rectangles, circles, triangles, lines, stars, and decorative elements.
- **Layer Management** — Visibility toggles, locking, z-order controls, and selection.
- **Property Inspector** — Real-time editing of position, size, rotation, color, opacity, typography, and text background color.
- **Export** — PNG, JPG, and SVG at 1×–4× resolution.
- **Keyboard Shortcuts** — Undo/Redo (Ctrl+Z / Ctrl+Y), Delete, Duplicate (Ctrl+D).

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configure API Keys

Copy `.env.local.example` to `.env.local` and add your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Source |
|---|---|---|
| `OPENAI_API_KEY` | Optional | [platform.openai.com](https://platform.openai.com/api-keys) |
| `UNSPLASH_ACCESS_KEY` | Optional | [unsplash.com/developers](https://unsplash.com/developers) (free: 50 req/hr) |
| `PEXELS_API_KEY` | Optional | [pexels.com/api](https://www.pexels.com/api/) (free: 200 req/hr) |

The app works without any API keys — AI features fall back to a built-in design engine, and images fall back to curated stock photos.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** |
| Canvas | **Fabric.js 5** — element manipulation, rendering, zoom |
| Styling | **Tailwind CSS** |
| State | **Zustand** |
| AI | **OpenAI GPT-4o-mini** via Vercel AI SDK |
| Images | **Unsplash API** + **Pexels API** (server-side proxy) |
| Icons | **Lucide React** |
| Color Picker | **react-colorful** |
| Export | **file-saver** |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/              — AI chat & generation routes
│   │   └── images/search/   — Unsplash/Pexels proxy route
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              — Main editor page
├── components/editor/
│   ├── Canvas.tsx            — Fabric.js canvas (zoom, sizing)
│   ├── CommandBar.tsx        — One-command poster generation
│   ├── Toolbar.tsx           — Top toolbar (undo, zoom, export)
│   ├── Sidebar.tsx           — Left sidebar with tab navigation
│   ├── PropertyPanel.tsx     — Right-side properties inspector
│   ├── ExportDialog.tsx      — Export modal (PNG/JPG/SVG)
│   ├── SizeDialog.tsx        — Canvas size picker
│   ├── GenerationOverlay.tsx — Progress overlay during AI gen
│   └── panels/
│       ├── AIPanel.tsx       — AI chat assistant
│       ├── ElementsPanel.tsx — Shape library
│       ├── ImagesPanel.tsx   — Image upload & URL
│       ├── LayersPanel.tsx   — Layer management
│       ├── RefinePanel.tsx   — Post-gen refinement (images, palettes)
│       ├── TemplatesPanel.tsx— Templates & add-on badges
│       └── TextPanel.tsx     — Text presets
├── lib/
│   ├── ai-agent.ts           — AI agent logic & tool execution
│   ├── apply-design.ts       — Renders PosterDesignSpec → canvas
│   ├── canvas-utils.ts       — Canvas helper functions
│   ├── design-engine.ts      — Prompt → PosterDesignSpec engine
│   ├── image-search.ts       — Client-side image search utilities
│   └── templates.ts          — Built-in template definitions
├── store/
│   └── editorStore.ts        — Zustand global state
└── types/
    └── index.ts              — Shared TypeScript types
```

## License

MIT
