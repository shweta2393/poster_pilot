"use client";

import { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { sendAIMessage } from "@/lib/ai-agent";
import { addSubheadingToCanvas } from "@/lib/canvas-utils";
import { v4 as uuidv4 } from "uuid";
import {
  Send,
  Sparkles,
  Wand2,
  Palette,
  Layout,
  MessageSquare,
  Trash2,
  PlusCircle,
  Check,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Generate Headline", prompt: "Generate a headline for my poster", icon: <Wand2 size={14} /> },
  { label: "Write Tagline", prompt: "Write a catchy tagline", icon: <MessageSquare size={14} /> },
  { label: "Color Palette", prompt: "Suggest color palettes", icon: <Palette size={14} /> },
  { label: "Layout Ideas", prompt: "Suggest layout ideas", icon: <Layout size={14} /> },
];

interface ParsedPalette {
  name: string;
  colors: string[];
}

function extractPalettes(content: string): ParsedPalette[] {
  const palettes: ParsedPalette[] = [];
  const paletteBlocks = content.split(/\n\n+/);
  let currentName = "";
  let currentColors: string[] = [];

  for (const block of paletteBlocks) {
    const nameMatch = block.match(/\*\*[^*]*?([A-Z][a-zA-Z &]+)/);
    const hexMatches = block.match(/#[0-9A-Fa-f]{6}/g);

    if (nameMatch && hexMatches && hexMatches.length >= 3) {
      if (currentName && currentColors.length >= 3) {
        palettes.push({ name: currentName, colors: currentColors });
      }
      currentName = nameMatch[1].trim();
      currentColors = Array.from(new Set(hexMatches));
    } else if (hexMatches && hexMatches.length >= 1 && currentName) {
      currentColors.push(...hexMatches);
      currentColors = Array.from(new Set(currentColors));
    }
  }
  if (currentName && currentColors.length >= 3) {
    palettes.push({ name: currentName, colors: currentColors });
  }
  return palettes;
}

type LayoutKind = "hero-center" | "split" | "minimal";

interface ParsedLayout {
  name: string;
  kind: LayoutKind;
}

function extractLayouts(content: string): ParsedLayout[] {
  const layouts: ParsedLayout[] = [];
  const lower = content.toLowerCase();

  if (lower.includes("hero") || lower.includes("center")) {
    layouts.push({ name: "Hero Center", kind: "hero-center" });
  }
  if (lower.includes("split")) {
    layouts.push({ name: "Split Design", kind: "split" });
  }
  if (lower.includes("minimal") || lower.includes("focus")) {
    layouts.push({ name: "Minimal Focus", kind: "minimal" });
  }
  return layouts;
}

export default function AIPanel() {
  const {
    aiMessages,
    addAIMessage,
    clearAIMessages,
    isAILoading,
    setIsAILoading,
    canvas,
    addElement,
    removeElement,
    posterSize,
  } = useEditorStore();

  const [input, setInput] = useState("");
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const handleSend = async (message?: string) => {
    const text = message || input.trim();
    if (!text || isAILoading) return;

    const userMsg = {
      id: uuidv4(),
      role: "user" as const,
      content: text,
      timestamp: Date.now(),
    };
    addAIMessage(userMsg);
    setInput("");
    setIsAILoading(true);

    try {
      const response = await sendAIMessage(aiMessages, text);
      addAIMessage(response);
    } catch {
      addAIMessage({
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const handleApplyText = (text: string) => {
    if (!canvas) return;

    const existing = canvas.getObjects().filter(
      (o) => o.data?.role === "ai-suggestion"
    );
    existing.forEach((o) => {
      canvas.remove(o);
      removeElement(o.data?.id);
    });

    const cleanText = text.replace(/\*\*/g, "").replace(/^[""]|[""]$/g, "");
    const el = addSubheadingToCanvas(canvas, cleanText);
    if (el.fabricObject) {
      el.fabricObject.set({ data: { ...el.fabricObject.data, role: "ai-suggestion" } });
    }
    addElement(el);
  };

  const applyPalette = (palette: ParsedPalette, msgId: string) => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    const bg = palette.colors[0];
    const primary = palette.colors[1] || palette.colors[0];
    const accent = palette.colors[2] || palette.colors[1];
    const textColor = palette.colors[3] || "#ffffff";
    const ctaColor = palette.colors[4] || accent;

    canvas.setBackgroundColor(bg, () => {});

    for (const obj of objects) {
      const role = obj.data?.role as string | undefined;
      const type = obj.data?.type as string | undefined;

      if (role === "background-image" || type === "image") continue;

      if (role === "headline" || role === "title") {
        obj.set({ fill: primary });
      } else if (role === "subheadline" || role === "body" || role === "subtitle") {
        obj.set({ fill: textColor });
      } else if (role === "cta" || role === "button") {
        obj.set({ fill: ctaColor });
        if ((obj as fabric.IText).textBackgroundColor) {
          (obj as fabric.IText).set({ textBackgroundColor: accent });
        }
      } else if (role === "addon-text") {
        obj.set({ fill: textColor });
        if ((obj as fabric.IText).textBackgroundColor) {
          (obj as fabric.IText).set({ textBackgroundColor: accent });
        }
      } else if (type === "text") {
        obj.set({ fill: textColor });
      } else if (role === "overlay") {
        obj.set({ fill: bg, opacity: obj.opacity });
      }
    }

    canvas.renderAll();
    setAppliedId(`palette-${msgId}-${palette.name}`);
    setTimeout(() => setAppliedId(null), 1500);
  };

  const applyLayout = (layout: ParsedLayout, msgId: string) => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    const w = posterSize.width;
    const h = posterSize.height;

    const textObjects = objects.filter(
      (o) => o.data?.type === "text" && o.data?.role !== "addon-text"
    );
    const headlines = textObjects.filter((o) =>
      ["headline", "title"].includes(o.data?.role || "")
    );
    const bodies = textObjects.filter((o) =>
      ["subheadline", "body", "subtitle", "bullet"].includes(o.data?.role || "")
    );
    const ctas = textObjects.filter((o) =>
      ["cta", "button"].includes(o.data?.role || "")
    );

    const margin = w * 0.08;

    const position = (obj: fabric.Object, left: number, top: number, originX: string, align: string) => {
      obj.set({ left, top, originX } as Partial<fabric.Object>);
      (obj as fabric.IText).set({ textAlign: align });
    };

    switch (layout.kind) {
      case "hero-center": {
        let curY = h * 0.2;
        for (const obj of headlines) {
          position(obj, w / 2, curY, "center", "center");
          curY += (obj.getBoundingRect(true).height || 60) + 20;
        }
        for (const obj of bodies) {
          position(obj, w / 2, curY, "center", "center");
          curY += (obj.getBoundingRect(true).height || 40) + 16;
        }
        for (const obj of ctas) {
          position(obj, w / 2, h * 0.78, "center", "center");
        }
        break;
      }
      case "split": {
        const leftX = margin;
        let curY = h * 0.15;
        for (const obj of headlines) {
          position(obj, leftX, curY, "left", "left");
          curY += (obj.getBoundingRect(true).height || 60) + 20;
        }
        for (const obj of bodies) {
          position(obj, leftX, curY, "left", "left");
          curY += (obj.getBoundingRect(true).height || 40) + 16;
        }
        for (const obj of ctas) {
          position(obj, leftX, h * 0.82, "left", "left");
        }
        break;
      }
      case "minimal": {
        for (const obj of headlines) {
          position(obj, w / 2, h / 2 - 40, "center", "center");
        }
        for (const obj of bodies) {
          position(obj, w / 2, h / 2 + 40, "center", "center");
        }
        for (const obj of ctas) {
          position(obj, w / 2, h * 0.88, "center", "center");
        }
        break;
      }
    }

    for (const obj of textObjects) {
      obj.setCoords();
    }
    canvas.renderAll();
    setAppliedId(`layout-${msgId}-${layout.kind}`);
    setTimeout(() => setAppliedId(null), 1500);
  };

  const extractClickableTexts = (content: string): string[] => {
    const matches = content.match(/\*\*"([^"]+)"\*\*/g) || [];
    return matches.map((m) => m.replace(/\*\*/g, "").replace(/^"|"$/g, ""));
  };

  const renderMessageActions = (msg: { id: string; content: string; action?: string }) => {
    const clickableTexts = extractClickableTexts(msg.content);
    const palettes = extractPalettes(msg.content);
    const layouts = extractLayouts(msg.content);
    const hasPalettes = palettes.length > 0 && (msg.action === "suggest_colors" || msg.content.includes("#"));
    const hasLayouts = layouts.length > 0 && (msg.action === "suggest_layout" || msg.content.toLowerCase().includes("layout"));

    if (!clickableTexts.length && !hasPalettes && !hasLayouts) return null;

    return (
      <div className="mt-2 pt-2 border-t border-canvas-border space-y-2">
        {clickableTexts.length > 0 && (
          <div>
            <p className="text-[9px] text-canvas-muted mb-1">Click to add to canvas:</p>
            <div className="flex flex-wrap gap-1">
              {clickableTexts.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyText(text)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-canvas-accent/50 text-canvas-text hover:bg-canvas-highlight hover:text-white text-[9px] transition-all"
                >
                  <PlusCircle size={10} />
                  <span className="truncate max-w-[140px]">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {hasPalettes && (
          <div>
            <p className="text-[9px] text-canvas-muted mb-1">Click to apply palette:</p>
            <div className="space-y-1.5">
              {palettes.map((p, idx) => {
                const key = `palette-${msg.id}-${p.name}`;
                const isApplied = appliedId === key;
                return (
                  <button
                    key={idx}
                    onClick={() => applyPalette(p, msg.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-canvas-accent/30 hover:bg-canvas-accent/60 transition-all group"
                  >
                    <div className="flex gap-0.5">
                      {p.colors.slice(0, 5).map((c, ci) => (
                        <div
                          key={ci}
                          className="w-4 h-4 rounded-sm border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-canvas-text truncate flex-1 text-left">
                      {p.name}
                    </span>
                    {isApplied ? (
                      <Check size={10} className="text-green-400 shrink-0" />
                    ) : (
                      <span className="text-[8px] text-canvas-muted group-hover:text-canvas-highlight shrink-0">
                        Apply
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {hasLayouts && (
          <div>
            <p className="text-[9px] text-canvas-muted mb-1">Click to apply layout:</p>
            <div className="space-y-1">
              {layouts.map((l, idx) => {
                const key = `layout-${msg.id}-${l.kind}`;
                const isApplied = appliedId === key;
                return (
                  <button
                    key={idx}
                    onClick={() => applyLayout(l, msg.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md bg-canvas-accent/30 hover:bg-canvas-accent/60 text-[9px] text-canvas-text transition-all group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Layout size={10} className="text-canvas-muted" />
                      <span>{l.name}</span>
                    </div>
                    {isApplied ? (
                      <Check size={10} className="text-green-400" />
                    ) : (
                      <span className="text-[8px] text-canvas-muted group-hover:text-canvas-highlight">
                        Apply
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-canvas-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-canvas-highlight to-purple-500 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-canvas-text">
                AI Assistant
              </h3>
              <p className="text-[9px] text-canvas-muted">
                Powered by AI
              </p>
            </div>
          </div>
          <button
            onClick={clearAIMessages}
            className="p-1.5 rounded-lg text-canvas-muted hover:text-canvas-highlight hover:bg-canvas-accent/30 transition-all"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.prompt)}
              disabled={isAILoading}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium text-canvas-muted bg-canvas-bg border border-canvas-border hover:border-canvas-highlight hover:text-canvas-text disabled:opacity-50 transition-all"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-canvas-highlight text-white rounded-br-sm"
                  : "bg-canvas-bg text-canvas-text border border-canvas-border rounded-bl-sm"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" && renderMessageActions(msg)}
            </div>
          </div>
        ))}
        {isAILoading && (
          <div className="flex justify-start">
            <div className="bg-canvas-bg text-canvas-muted border border-canvas-border rounded-xl rounded-bl-sm px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-canvas-highlight rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 bg-canvas-highlight rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 bg-canvas-highlight rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-canvas-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask AI for help..."
            disabled={isAILoading}
            className="flex-1 bg-canvas-bg border border-canvas-border rounded-xl px-3 py-2 text-xs text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-highlight disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isAILoading}
            className="p-2 rounded-xl bg-canvas-highlight text-white hover:bg-canvas-highlight/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
