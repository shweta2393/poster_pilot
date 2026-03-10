"use client";

import { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { generatePosterFromPrompt, generatePosterWithAI } from "@/lib/design-engine";
import { applyDesignToCanvas } from "@/lib/apply-design";
import {
  Sparkles,
  Wand2,
  ArrowRight,
  Zap,
  X,
  ChevronDown,
} from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Create a LinkedIn post advertising my salon with elegant vibes",
  "Instagram story for a flash sale at my clothing boutique",
  "YouTube thumbnail for a tech product review",
  "Facebook post promoting a new restaurant opening",
  "Instagram post for a fitness gym membership offer",
  "LinkedIn banner for a software startup launch",
  "Pinterest pin for a luxury real estate listing",
  "Twitter post announcing a live music event",
  "Instagram post for an online course launch",
  "Poster for a yoga and wellness retreat",
];

export default function CommandBar() {
  const {
    showCommandBar,
    setShowCommandBar,
    canvas,
    isGenerating,
    setIsGenerating,
    setGenerationStep,
    setCurrentDesignSpec,
    setPosterSize,
    setBackgroundColor,
    setElements,
    setActiveSidebarTab,
  } = useEditorStore();

  const [prompt, setPrompt] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (showCommandBar) inputRef.current?.focus();
  }, [showCommandBar]);

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || !canvas || isGenerating) return;

    setIsGenerating(true);
    setShowCommandBar(false);

    const steps = [
      "Analyzing your request...",
      "Detecting platform & industry...",
      "Searching for relevant images...",
      "Selecting color palette...",
      "Designing layout...",
      "Generating text content...",
      "Adding decorative elements...",
      "Rendering to canvas...",
    ];

    let stepIdx = 0;
    const advanceSteps = async (upTo: number) => {
      while (stepIdx < upTo && stepIdx < steps.length) {
        setGenerationStep(steps[stepIdx]);
        stepIdx++;
        await sleep(300 + Math.random() * 200);
      }
    };

    await advanceSteps(3);

    let spec = await generatePosterFromPrompt(text);

    await advanceSteps(6);

    try {
      const aiSpec = await generatePosterWithAI(text);
      if (aiSpec) spec = aiSpec;
    } catch {
      // Fallback already generated
    }

    await advanceSteps(steps.length);

    setCurrentDesignSpec(spec);
    setPosterSize(spec.size);
    setBackgroundColor(spec.backgroundColor);

    setGenerationStep("Loading images & rendering...");
    const newElements = await applyDesignToCanvas(canvas, spec);
    setElements(newElements);

    setGenerationStep("Done! Your poster is ready.");
    await sleep(600);
    setIsGenerating(false);
    setGenerationStep("");
    setActiveSidebarTab("refine");
  };

  if (!showCommandBar) {
    return (
      <button
        onClick={() => setShowCommandBar(true)}
        className="fixed top-[52px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-canvas-surface/90 backdrop-blur border border-canvas-border hover:border-canvas-highlight shadow-lg transition-all group"
      >
        <Wand2
          size={14}
          className="text-canvas-highlight group-hover:rotate-12 transition-transform"
        />
        <span className="text-xs font-medium text-canvas-muted group-hover:text-canvas-text transition-colors">
          Create with AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md pt-[12vh]">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Hero heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-highlight/10 border border-canvas-highlight/20 text-canvas-highlight text-[11px] font-medium mb-4">
            <Zap size={12} />
            AI-Powered Design — One Command
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            What poster do you want to create?
          </h2>
          <p className="text-sm text-canvas-muted">
            Describe your poster and the AI will design it instantly — layout,
            text, and colors.
          </p>
        </div>

        {/* Main input */}
        <div className="relative">
          <div className="flex items-center bg-canvas-surface border-2 border-canvas-border focus-within:border-canvas-highlight rounded-2xl shadow-2xl shadow-black/30 transition-colors">
            <div className="pl-4">
              <Sparkles size={20} className="text-canvas-highlight" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder={EXAMPLE_PROMPTS[placeholderIdx]}
              className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder:text-canvas-muted/60 focus:outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="mr-2 p-2.5 rounded-xl bg-canvas-highlight text-white hover:bg-canvas-highlight/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Examples toggle */}
          <div className="mt-3 flex items-center justify-between px-1">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1.5 text-[11px] text-canvas-muted hover:text-canvas-text transition-colors"
            >
              <ChevronDown
                size={12}
                className={`transition-transform ${showExamples ? "rotate-180" : ""}`}
              />
              {showExamples ? "Hide" : "Show"} examples
            </button>
            <button
              onClick={() => setShowCommandBar(false)}
              className="flex items-center gap-1 text-[11px] text-canvas-muted hover:text-canvas-text transition-colors"
            >
              <X size={12} />
              Skip — use editor manually
            </button>
          </div>

          {/* Examples grid */}
          {showExamples && (
            <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in">
              {EXAMPLE_PROMPTS.slice(0, 8).map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(ex);
                    inputRef.current?.focus();
                  }}
                  className="text-left px-3 py-2.5 rounded-xl bg-canvas-surface/60 border border-canvas-border hover:border-canvas-highlight/50 text-[11px] text-canvas-muted hover:text-canvas-text transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
