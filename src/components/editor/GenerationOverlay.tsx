"use client";

import { useEditorStore } from "@/store/editorStore";
import { Sparkles, Loader2 } from "lucide-react";

export default function GenerationOverlay() {
  const { isGenerating, generationStep } = useEditorStore();

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
      <div className="text-center animate-fade-in max-w-md">
        {/* Animated icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-canvas-highlight to-purple-500 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-canvas-highlight to-purple-500 opacity-50 animate-ping" />
          <div className="relative w-full h-full flex items-center justify-center">
            <Sparkles size={32} className="text-white z-10" />
          </div>
        </div>

        {/* Progress text */}
        <h3 className="text-lg font-bold text-white mb-2">
          Designing Your Poster
        </h3>
        <div className="flex items-center justify-center gap-2 text-sm text-canvas-muted">
          <Loader2 size={14} className="animate-spin text-canvas-highlight" />
          <span className="transition-all duration-300">{generationStep}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-64 mx-auto h-1 bg-canvas-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-canvas-highlight to-purple-500 rounded-full animate-shimmer-bar" />
        </div>
      </div>
    </div>
  );
}
