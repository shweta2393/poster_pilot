"use client";

import { useEditorStore } from "@/store/editorStore";
import {
  addHeadingToCanvas,
  addSubheadingToCanvas,
  addBodyTextToCanvas,
  addTextToCanvas,
} from "@/lib/canvas-utils";
import { Heading1, Heading2, AlignLeft, Quote } from "lucide-react";

const TEXT_PRESETS = [
  {
    label: "Heading",
    description: "Bold, large heading text",
    icon: <Heading1 size={20} />,
    action: "heading" as const,
  },
  {
    label: "Subheading",
    description: "Medium weight subheading",
    icon: <Heading2 size={20} />,
    action: "subheading" as const,
  },
  {
    label: "Body Text",
    description: "Regular paragraph text",
    icon: <AlignLeft size={20} />,
    action: "body" as const,
  },
  {
    label: "Quote",
    description: "Stylized quotation text",
    icon: <Quote size={20} />,
    action: "quote" as const,
  },
];

const FONT_COMBOS = [
  { heading: "Inter", body: "Inter", name: "Clean Modern" },
  { heading: "Georgia", body: "Arial", name: "Classic Serif" },
  { heading: "Impact", body: "Helvetica", name: "Bold Impact" },
  { heading: "Courier New", body: "Courier New", name: "Monospace" },
  { heading: "Palatino", body: "Georgia", name: "Elegant" },
];

export default function TextPanel() {
  const { canvas, addElement } = useEditorStore();

  const handleAddText = (action: string) => {
    if (!canvas) return;
    let el;
    switch (action) {
      case "heading":
        el = addHeadingToCanvas(canvas);
        break;
      case "subheading":
        el = addSubheadingToCanvas(canvas);
        break;
      case "body":
        el = addBodyTextToCanvas(canvas);
        break;
      case "quote":
        el = addTextToCanvas(canvas, {
          text: '"Your inspiring quote here"',
          fontSize: 28,
          fontFamily: "Georgia",
          fill: "#555555",
          textAlign: "center",
        });
        break;
      default:
        el = addBodyTextToCanvas(canvas);
    }
    addElement(el);
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-canvas-text mb-4">
        Add Text
      </h3>
      <div className="space-y-2 mb-6">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleAddText(preset.action)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight hover:bg-canvas-accent/30 text-left transition-all duration-200 group"
          >
            <div className="text-canvas-muted group-hover:text-canvas-highlight transition-colors">
              {preset.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-canvas-text">
                {preset.label}
              </div>
              <div className="text-[10px] text-canvas-muted">
                {preset.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-canvas-text mb-3">
        Font Combinations
      </h3>
      <div className="space-y-2">
        {FONT_COMBOS.map((combo) => (
          <button
            key={combo.name}
            onClick={() => {
              if (!canvas) return;
              const h = addHeadingToCanvas(canvas);
              addElement(h);
              const fabricObj = canvas.getActiveObject();
              if (fabricObj) {
                (fabricObj as fabric.IText).set("fontFamily", combo.heading);
                canvas.renderAll();
              }
            }}
            className="w-full p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight hover:bg-canvas-accent/30 text-left transition-all"
          >
            <div
              className="text-lg font-bold text-canvas-text leading-tight"
              style={{ fontFamily: combo.heading }}
            >
              {combo.name}
            </div>
            <div
              className="text-[10px] text-canvas-muted mt-1"
              style={{ fontFamily: combo.body }}
            >
              {combo.heading} + {combo.body}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
