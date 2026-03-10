"use client";

import { useEditorStore } from "@/store/editorStore";
import { addShapeToCanvas } from "@/lib/canvas-utils";
import {
  Square,
  Circle,
  Triangle,
  Minus,
  Star,
} from "lucide-react";

const SHAPES = [
  { type: "rect" as const, icon: <Square size={24} />, label: "Rectangle" },
  { type: "circle" as const, icon: <Circle size={24} />, label: "Circle" },
  { type: "triangle" as const, icon: <Triangle size={24} />, label: "Triangle" },
  { type: "line" as const, icon: <Minus size={24} />, label: "Line" },
  { type: "star" as const, icon: <Star size={24} />, label: "Star" },
];

const PRESET_COLORS = [
  "#e94560",
  "#0f3460",
  "#16213e",
  "#1a1a2e",
  "#ffffff",
  "#f39c12",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#e74c3c",
  "#1abc9c",
  "#34495e",
  "#f1c40f",
  "#e67e22",
  "#95a5a6",
  "#2c3e50",
];

export default function ElementsPanel() {
  const { canvas, addElement } = useEditorStore();

  const handleAddShape = (
    shapeType: "rect" | "circle" | "triangle" | "line" | "star",
    fill?: string
  ) => {
    if (!canvas) return;
    const el = addShapeToCanvas(canvas, shapeType, { fill });
    addElement(el);
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-canvas-text mb-4">
        Shapes
      </h3>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {SHAPES.map((shape) => (
          <button
            key={shape.type}
            onClick={() => handleAddShape(shape.type)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight hover:bg-canvas-accent/30 text-canvas-muted hover:text-canvas-highlight transition-all duration-200"
          >
            {shape.icon}
            <span className="text-[10px] font-medium">{shape.label}</span>
          </button>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-canvas-text mb-3">
        Colored Shapes
      </h3>
      <p className="text-[11px] text-canvas-muted mb-3">
        Click a color, then a shape to add
      </p>
      <div className="grid grid-cols-8 gap-1.5 mb-6">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleAddShape("rect", color)}
            className="w-7 h-7 rounded-lg border border-canvas-border hover:border-white hover:scale-110 transition-all duration-150"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <h3 className="text-sm font-semibold text-canvas-text mb-3">
        Decorative Elements
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            if (!canvas) return;
            const el = addShapeToCanvas(canvas, "rect", {
              width: 400,
              height: 4,
              fill: "#e94560",
            });
            addElement(el);
          }}
          className="p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight text-canvas-muted hover:text-canvas-text transition-all text-xs"
        >
          Divider Line
        </button>
        <button
          onClick={() => {
            if (!canvas) return;
            const el = addShapeToCanvas(canvas, "rect", {
              width: 300,
              height: 60,
              fill: "#e94560",
            });
            addElement(el);
          }}
          className="p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight text-canvas-muted hover:text-canvas-text transition-all text-xs"
        >
          CTA Button
        </button>
        <button
          onClick={() => {
            if (!canvas) return;
            const el = addShapeToCanvas(canvas, "circle", {
              fill: "rgba(233,69,96,0.2)",
              width: 200,
              height: 200,
            });
            addElement(el);
          }}
          className="p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight text-canvas-muted hover:text-canvas-text transition-all text-xs"
        >
          Accent Circle
        </button>
        <button
          onClick={() => {
            if (!canvas) return;
            const el = addShapeToCanvas(canvas, "rect", {
              width: 1080,
              height: 1080,
              fill: "rgba(0,0,0,0.4)",
            });
            addElement(el);
          }}
          className="p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight text-canvas-muted hover:text-canvas-text transition-all text-xs"
        >
          Overlay
        </button>
      </div>
    </div>
  );
}
