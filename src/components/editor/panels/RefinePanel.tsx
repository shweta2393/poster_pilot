"use client";

import { useState, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { searchImages, type ImageResult } from "@/lib/image-search";
import { generatePosterFromPrompt, generatePosterWithAI } from "@/lib/design-engine";
import { applyDesignToCanvas } from "@/lib/apply-design";
import { fabric } from "fabric";
import {
  Search,
  Upload,
  RefreshCw,
  Loader2,
  ImageIcon,
  Palette,
  Check,
} from "lucide-react";

const MOOD_PALETTES: { name: string; colors: string[] }[] = [
  { name: "Bold & Dark", colors: ["#FF4757", "#0A0A0A", "#FFF0F0", "#FF6B81", "#FFFFFF"] },
  { name: "Ocean Cool", colors: ["#00B4D8", "#0A0F1A", "#E8F8FF", "#48CAE4", "#FFFFFF"] },
  { name: "Warm Earth", colors: ["#D4A574", "#2C1810", "#F5E6D3", "#8B6F47", "#FEFAF6"] },
  { name: "Royal Purple", colors: ["#6C5CE7", "#0A0A1A", "#F0EEFF", "#A29BFE", "#FFFFFF"] },
  { name: "Fresh Green", colors: ["#2ED573", "#0A1A0A", "#F0FFF0", "#7BED9F", "#1A1A1A"] },
  { name: "Sunset Gold", colors: ["#FFA502", "#1C0F00", "#FFF9F0", "#FFBE76", "#2C1810"] },
];

export default function RefinePanel() {
  const {
    canvas,
    currentDesignSpec,
    setCurrentDesignSpec,
    setPosterSize,
    setBackgroundColor,
    setElements,
    posterSize,
    setIsGenerating,
    setGenerationStep,
    setActiveSidebarTab,
  } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [activePalette, setActivePalette] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    try {
      const results = await searchImages(q, 9);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const swapBackgroundImage = useCallback(async (imageUrl: string) => {
    if (!canvas) return;
    setIsSwapping(true);

    try {
      const objects = canvas.getObjects();
      const bgImage = objects.find(
        (obj) => (obj as fabric.Object & { data?: { role?: string } }).data?.role === "background-image"
      );

      const w = posterSize.width;
      const h = posterSize.height;

      const newImg = await new Promise<fabric.Image | null>((resolve) => {
        const timeout = setTimeout(() => resolve(null), 12000);
        const htmlImg = new Image();
        htmlImg.crossOrigin = "anonymous";
        htmlImg.onload = () => {
          clearTimeout(timeout);
          const fImg = new fabric.Image(htmlImg, {
            left: 0,
            top: 0,
            opacity: 1,
            selectable: false,
            evented: false,
          });
          const scaleX = w / (fImg.width || 1);
          const scaleY = h / (fImg.height || 1);
          fImg.set({ scaleX: Math.max(scaleX, scaleY), scaleY: Math.max(scaleX, scaleY) });
          resolve(fImg);
        };
        htmlImg.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        htmlImg.src = imageUrl;
      });

      if (!newImg) return;

      newImg.set({ data: { id: bgImage?.data?.id || "bg-swap", type: "image", role: "background-image" } } as Partial<fabric.Image>);

      if (bgImage) {
        const idx = objects.indexOf(bgImage);
        canvas.remove(bgImage);
        canvas.insertAt(newImg, idx, false);
      } else {
        canvas.insertAt(newImg, 0, false);
      }

      canvas.renderAll();
    } finally {
      setIsSwapping(false);
    }
  }, [canvas, posterSize]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      swapBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [swapBackgroundImage]);

  const applyPalette = useCallback((paletteIndex: number) => {
    if (!canvas || !currentDesignSpec) return;

    const palette = MOOD_PALETTES[paletteIndex].colors;
    const [accent, dark, light, secondary, text] = palette;

    setActivePalette(paletteIndex);

    canvas.setBackgroundColor(dark, () => {});
    setBackgroundColor(dark);

    const objects = canvas.getObjects();
    for (const obj of objects) {
      const data = (obj as fabric.Object & { data?: { role?: string; type?: string } }).data;
      if (!data) continue;

      if (data.role === "overlay") {
        obj.set({ fill: dark, opacity: 0.45 });
      } else if (data.role === "headline" || data.role === "subheadline" || data.role === "body" || data.role === "brand") {
        obj.set({ fill: text });
      } else if (data.role === "cta" && data.type === "shape") {
        obj.set({ fill: accent });
      } else if (data.role === "cta" && data.type === "text") {
        obj.set({ fill: text });
      } else if (data.role === "badge") {
        obj.set({ fill: light });
      } else if (data.role === "accent" && data.type === "shape") {
        obj.set({ fill: accent });
      } else if (data.role === "decoration") {
        obj.set({ fill: secondary, opacity: 0.3 });
      }
    }

    canvas.renderAll();

    setCurrentDesignSpec({
      ...currentDesignSpec,
      backgroundColor: dark,
      meta: { ...currentDesignSpec.meta, palette },
    });
  }, [canvas, currentDesignSpec, setBackgroundColor, setCurrentDesignSpec]);

  const handleRegenerate = useCallback(async () => {
    if (!canvas || !currentDesignSpec || isRegenerating) return;

    setIsRegenerating(true);
    setIsGenerating(true);
    setGenerationStep("Regenerating poster...");

    try {
      let spec = await generatePosterFromPrompt(currentDesignSpec.prompt);
      try {
        const aiSpec = await generatePosterWithAI(currentDesignSpec.prompt);
        if (aiSpec) spec = aiSpec;
      } catch { /* use fallback */ }

      setCurrentDesignSpec(spec);
      setPosterSize(spec.size);
      setBackgroundColor(spec.backgroundColor);

      setGenerationStep("Loading images & rendering...");
      const newElements = await applyDesignToCanvas(canvas, spec);
      setElements(newElements);

      setGenerationStep("Done!");
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      setIsRegenerating(false);
      setIsGenerating(false);
      setGenerationStep("");
    }
  }, [canvas, currentDesignSpec, isRegenerating, setCurrentDesignSpec, setPosterSize, setBackgroundColor, setElements, setIsGenerating, setGenerationStep]);

  if (!currentDesignSpec) {
    return (
      <div className="p-4 text-center">
        <ImageIcon size={32} className="mx-auto text-canvas-muted mb-3" />
        <p className="text-sm text-canvas-muted">
          Generate a poster first to unlock refinement options.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-canvas-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Palette size={14} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-canvas-text">Refine Poster</h3>
            <p className="text-[9px] text-canvas-muted">Swap images, colors & more</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Section 1: Swap Background Image */}
        <section>
          <h4 className="text-xs font-semibold text-canvas-text mb-2 uppercase tracking-wider">
            Background Image
          </h4>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search images..."
                className="w-full bg-canvas-bg border border-canvas-border rounded-lg pl-8 pr-3 py-2 text-xs text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-highlight transition-colors"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-canvas-muted" />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-3 py-2 bg-canvas-highlight text-white rounded-lg text-xs font-medium hover:bg-canvas-highlight/80 disabled:opacity-50 transition-all"
            >
              {isSearching ? <Loader2 size={12} className="animate-spin" /> : "Go"}
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-canvas-border hover:border-canvas-highlight text-canvas-muted hover:text-canvas-text text-xs transition-all mb-3"
          >
            <Upload size={14} />
            Upload custom image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {isSwapping && (
            <div className="flex items-center justify-center gap-2 py-3 text-canvas-muted text-xs">
              <Loader2 size={14} className="animate-spin" />
              Swapping image...
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {searchResults.map((img, i) => (
                <button
                  key={i}
                  onClick={() => swapBackgroundImage(img.url)}
                  disabled={isSwapping}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-canvas-border hover:border-canvas-highlight transition-all"
                >
                  <img
                    src={img.thumb}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ImageIcon size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] text-white/70 bg-black/40 px-1 rounded">
                    {img.source}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Color Palette */}
        <section>
          <h4 className="text-xs font-semibold text-canvas-text mb-2 uppercase tracking-wider">
            Color Palette
          </h4>
          <div className="space-y-1.5">
            {MOOD_PALETTES.map((p, i) => (
              <button
                key={p.name}
                onClick={() => applyPalette(i)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-lg border transition-all ${
                  activePalette === i
                    ? "border-canvas-highlight bg-canvas-highlight/10"
                    : "border-canvas-border hover:border-canvas-highlight/50"
                }`}
              >
                <div className="flex gap-0.5">
                  {p.colors.map((c, j) => (
                    <div
                      key={j}
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-canvas-muted flex-1 text-left">{p.name}</span>
                {activePalette === i && <Check size={12} className="text-canvas-highlight" />}
              </button>
            ))}
          </div>
        </section>

        {/* Section 3: Quick Actions */}
        <section>
          <h4 className="text-xs font-semibold text-canvas-text mb-2 uppercase tracking-wider">
            Quick Actions
          </h4>
          <div className="space-y-1.5">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-canvas-highlight text-white text-xs font-medium hover:bg-canvas-highlight/80 disabled:opacity-50 transition-all"
            >
              {isRegenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isRegenerating ? "Regenerating..." : "Regenerate Poster"}
            </button>

            <div className="text-[10px] text-canvas-muted text-center pt-1">
              Original prompt: &ldquo;{currentDesignSpec.prompt.slice(0, 50)}
              {currentDesignSpec.prompt.length > 50 ? "..." : ""}&rdquo;
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
