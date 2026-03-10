"use client";

import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Toolbar from "@/components/editor/Toolbar";
import Sidebar from "@/components/editor/Sidebar";
import PropertyPanel from "@/components/editor/PropertyPanel";
import ExportDialog from "@/components/editor/ExportDialog";
import SizeDialog from "@/components/editor/SizeDialog";
import CommandBar from "@/components/editor/CommandBar";
import GenerationOverlay from "@/components/editor/GenerationOverlay";

import { useEditorStore } from "@/store/editorStore";
import { deleteSelected, duplicateSelected } from "@/lib/canvas-utils";
import { Sparkles, Wand2 } from "lucide-react";

const CanvasEditor = dynamic(() => import("@/components/editor/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-canvas-bg">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-canvas-highlight to-purple-500 flex items-center justify-center animate-pulse">
          <Sparkles size={28} className="text-white" />
        </div>
        <p className="text-canvas-muted text-sm">Loading canvas...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const { canvas, undo, redo, removeElement, addElement, setShowCommandBar, currentDesignSpec } =
    useEditorStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl/Cmd+K to open command bar
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandBar(true);
        return;
      }

      if (!canvas) return;

      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      if (isInput) return;

      const isEditing = (
        canvas.getActiveObject() as fabric.IText | undefined
      )?.isEditing;
      if (isEditing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const id = deleteSelected(canvas);
        if (id) removeElement(id);
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        }
        if (e.key === "y") {
          e.preventDefault();
          redo();
        }
        if (e.key === "d") {
          e.preventDefault();
          duplicateSelected(canvas, (el) => addElement(el));
        }
      }
    },
    [canvas, undo, redo, removeElement, addElement, setShowCommandBar]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-11 bg-canvas-surface border-b border-canvas-border flex items-center px-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-canvas-highlight to-purple-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <h1 className="text-sm font-bold text-canvas-text tracking-tight">
            PosterPilot
          </h1>
        </div>
        <div className="h-4 w-px bg-canvas-border" />

        {/* Quick AI command trigger in header */}
        <button
          onClick={() => setShowCommandBar(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-canvas-bg border border-canvas-border hover:border-canvas-highlight/50 transition-all group"
        >
          <Wand2
            size={12}
            className="text-canvas-highlight group-hover:rotate-12 transition-transform"
          />
          <span className="text-[11px] text-canvas-muted group-hover:text-canvas-text transition-colors">
            Create with AI...
          </span>
          <kbd className="text-[9px] text-canvas-muted/50 bg-canvas-surface px-1.5 py-0.5 rounded border border-canvas-border ml-4">
            Ctrl+K
          </kbd>
        </button>

        <div className="flex-1" />
        {currentDesignSpec ? (
          <div className="flex items-center gap-1.5 max-w-[360px]">
            <Wand2 size={10} className="text-canvas-highlight shrink-0" />
            <span className="text-[10px] text-canvas-muted font-medium truncate" title={currentDesignSpec.prompt}>
              Prompt: &ldquo;{currentDesignSpec.prompt}&rdquo;
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-canvas-muted font-medium">
            AI-Powered Poster & Ad Creator
          </span>
        )}
      </header>

      {/* Toolbar */}
      <Toolbar />

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <CanvasEditor />
        <PropertyPanel />
      </div>

      {/* Overlays & Dialogs */}
      <ExportDialog />
      <SizeDialog />
      <CommandBar />
      <GenerationOverlay />
    </div>
  );
}
