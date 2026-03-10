"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { deleteSelected } from "@/lib/canvas-utils";
import { HexColorPicker } from "react-colorful";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Trash2,
} from "lucide-react";

const FONT_LIST = [
  "Inter",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Palatino",
  "Garamond",
];

export default function PropertyPanel() {
  const { canvas, selectedElementId, removeElement } = useEditorStore();

  const [props, setProps] = useState<Record<string, unknown>>({});
  const [showFillPicker, setShowFillPicker] = useState(false);
  const [showTextBgPicker, setShowTextBgPicker] = useState(false);
  const [textContent, setTextContent] = useState("");

  const refreshProps = useCallback(() => {
    if (!canvas || !selectedElementId) {
      setProps({});
      return;
    }
    const obj = canvas.getObjects().find((o) => o.data?.id === selectedElementId);
    if (!obj) {
      setProps({});
      return;
    }

    setProps({
      type: obj.data?.type,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      fontSize: (obj as fabric.IText).fontSize,
      fontFamily: (obj as fabric.IText).fontFamily,
      fontWeight: (obj as fabric.IText).fontWeight,
      fontStyle: (obj as fabric.IText).fontStyle,
      underline: (obj as fabric.IText).underline,
      textAlign: (obj as fabric.IText).textAlign,
      textBackgroundColor: (obj as fabric.IText).textBackgroundColor,
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
      height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
      angle: Math.round(obj.angle || 0),
    });

    if (obj.data?.type === "text") {
      setTextContent((obj as fabric.IText).text || "");
    }
  }, [canvas, selectedElementId]);

  useEffect(() => {
    refreshProps();
    if (canvas) {
      canvas.on("object:modified", refreshProps);
      canvas.on("object:scaling", refreshProps);
      canvas.on("object:moving", refreshProps);
      canvas.on("object:rotating", refreshProps);
      return () => {
        canvas.off("object:modified", refreshProps);
        canvas.off("object:scaling", refreshProps);
        canvas.off("object:moving", refreshProps);
        canvas.off("object:rotating", refreshProps);
      };
    }
  }, [canvas, selectedElementId, refreshProps]);

  const updateObject = (updates: Record<string, unknown>) => {
    if (!canvas || !selectedElementId) return;
    const obj = canvas.getObjects().find((o) => o.data?.id === selectedElementId);
    if (obj) {
      obj.set(updates as Partial<fabric.Object>);
      canvas.renderAll();
      refreshProps();
    }
  };

  const updateTextContent = (newText: string) => {
    if (!canvas || !selectedElementId) return;
    const obj = canvas.getObjects().find((o) => o.data?.id === selectedElementId);
    if (obj && obj.data?.type === "text") {
      (obj as fabric.IText).set({ text: newText });
      canvas.renderAll();
      setTextContent(newText);
    }
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const id = deleteSelected(canvas);
    if (id) removeElement(id);
  };

  const PropertyRow = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between gap-2 mb-2">
      <label className="text-[10px] font-medium text-canvas-muted whitespace-nowrap min-w-[60px]">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );

  const inputClass =
    "w-full bg-canvas-bg border border-canvas-border rounded-lg px-2 py-1 text-xs text-canvas-text focus:outline-none focus:border-canvas-highlight transition-colors";

  return (
    <div className="w-60 bg-canvas-surface/80 backdrop-blur border-l border-canvas-border overflow-y-auto p-4">
      {!selectedElementId ? (
        <div className="text-center py-6">
          <p className="text-xs text-canvas-muted">
            Select an element to edit its properties
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-canvas-highlight" />
                <h3 className="text-sm font-semibold text-canvas-text">
                  Properties
                </h3>
              </div>
              <button
                onClick={handleDeleteSelected}
                title="Delete element"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 border border-red-500/30 transition-all"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </div>

          {/* Text Content Editor */}
          {props.type === "text" && (
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold text-canvas-muted uppercase tracking-wider mb-2">
                Content
              </h4>
              <textarea
                value={textContent}
                onChange={(e) => updateTextContent(e.target.value)}
                rows={3}
                className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-2 py-1.5 text-xs text-canvas-text focus:outline-none focus:border-canvas-highlight transition-colors resize-y"
                placeholder="Edit text..."
              />
            </div>
          )}

          {/* Fill Color */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold text-canvas-muted uppercase tracking-wider mb-2">
              Fill
            </h4>
            <div className="relative">
              <button
                onClick={() => setShowFillPicker(!showFillPicker)}
                className="w-full flex items-center gap-2 p-2 rounded-lg border border-canvas-border hover:border-canvas-highlight transition-colors"
              >
                <div
                  className="w-5 h-5 rounded border border-canvas-border"
                  style={{ backgroundColor: props.fill as string || "#000" }}
                />
                <span className="text-xs text-canvas-text font-mono">
                  {props.fill as string || "#000000"}
                </span>
              </button>
              {showFillPicker && (
                <div className="absolute z-50 right-0 mt-2 p-3 bg-canvas-surface rounded-xl border border-canvas-border shadow-xl">
                  <HexColorPicker
                    color={props.fill as string || "#000000"}
                    onChange={(color) => updateObject({ fill: color })}
                  />
                  <button
                    onClick={() => setShowFillPicker(false)}
                    className="w-full mt-2 py-1 text-[10px] text-canvas-muted hover:text-canvas-text"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Text Properties */}
          {props.type === "text" && (
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold text-canvas-muted uppercase tracking-wider mb-2">
                Typography
              </h4>
              <PropertyRow label="Font">
                <select
                  value={props.fontFamily as string || "Inter"}
                  onChange={(e) =>
                    updateObject({ fontFamily: e.target.value })
                  }
                  className={inputClass}
                >
                  {FONT_LIST.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </PropertyRow>
              <PropertyRow label="Size">
                <input
                  type="number"
                  value={props.fontSize as number || 24}
                  onChange={(e) =>
                    updateObject({
                      fontSize: parseInt(e.target.value) || 24,
                    })
                  }
                  className={inputClass}
                  min={8}
                  max={400}
                />
              </PropertyRow>

              <div className="flex gap-1 mb-2">
                <button
                  onClick={() =>
                    updateObject({
                      fontWeight:
                        props.fontWeight === "bold" ? "normal" : "bold",
                    })
                  }
                  className={`p-1.5 rounded-lg border transition-all ${
                    props.fontWeight === "bold"
                      ? "border-canvas-highlight bg-canvas-highlight/20 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:text-canvas-text"
                  }`}
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() =>
                    updateObject({
                      fontStyle:
                        props.fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                  className={`p-1.5 rounded-lg border transition-all ${
                    props.fontStyle === "italic"
                      ? "border-canvas-highlight bg-canvas-highlight/20 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:text-canvas-text"
                  }`}
                >
                  <Italic size={14} />
                </button>
                <button
                  onClick={() =>
                    updateObject({ underline: !props.underline })
                  }
                  className={`p-1.5 rounded-lg border transition-all ${
                    props.underline
                      ? "border-canvas-highlight bg-canvas-highlight/20 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:text-canvas-text"
                  }`}
                >
                  <Underline size={14} />
                </button>

                <div className="w-px bg-canvas-border mx-1" />

                <button
                  onClick={() => updateObject({ textAlign: "left" })}
                  className={`p-1.5 rounded-lg border transition-all ${
                    props.textAlign === "left"
                      ? "border-canvas-highlight bg-canvas-highlight/20 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:text-canvas-text"
                  }`}
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  onClick={() => updateObject({ textAlign: "center" })}
                  className={`p-1.5 rounded-lg border transition-all ${
                    props.textAlign === "center"
                      ? "border-canvas-highlight bg-canvas-highlight/20 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:text-canvas-text"
                  }`}
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  onClick={() => updateObject({ textAlign: "right" })}
                  className={`p-1.5 rounded-lg border transition-all ${
                    props.textAlign === "right"
                      ? "border-canvas-highlight bg-canvas-highlight/20 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:text-canvas-text"
                  }`}
                >
                  <AlignRight size={14} />
                </button>
              </div>

              {/* Text Background Color */}
              {typeof props.textBackgroundColor === "string" && props.textBackgroundColor && (
                <div className="mt-2">
                  <h4 className="text-[10px] font-semibold text-canvas-muted uppercase tracking-wider mb-1.5">
                    Text Background
                  </h4>
                  <div className="relative">
                    <button
                      onClick={() => setShowTextBgPicker(!showTextBgPicker)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg border border-canvas-border hover:border-canvas-highlight transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded border border-canvas-border"
                        style={{ backgroundColor: props.textBackgroundColor as string }}
                      />
                      <span className="text-xs text-canvas-text">
                        Background
                      </span>
                    </button>
                    {showTextBgPicker && (
                      <div className="absolute z-50 right-0 mt-2 p-3 bg-canvas-surface rounded-xl border border-canvas-border shadow-xl">
                        <HexColorPicker
                          color={props.textBackgroundColor as string || "#000000"}
                          onChange={(color) => updateObject({ textBackgroundColor: color })}
                        />
                        <button
                          onClick={() => updateObject({ textBackgroundColor: "" })}
                          className="w-full mt-2 py-1 text-[10px] text-canvas-muted hover:text-red-400 transition-colors"
                        >
                          Remove Background
                        </button>
                        <button
                          onClick={() => setShowTextBgPicker(false)}
                          className="w-full mt-1 py-1 text-[10px] text-canvas-muted hover:text-canvas-text"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Colors */}
          <div className="mb-4">
            <h4 className="text-[10px] font-semibold text-canvas-muted uppercase tracking-wider mb-2">
              Quick Colors
            </h4>
            <div className="grid grid-cols-8 gap-1">
              {[
                "#000000", "#333333", "#666666", "#999999",
                "#cccccc", "#ffffff", "#e94560", "#ff6b6b",
                "#f39c12", "#f1c40f", "#2ecc71", "#1abc9c",
                "#3498db", "#0f3460", "#9b59b6", "#e74c3c",
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => updateObject({ fill: color })}
                  className="w-5 h-5 rounded border border-canvas-border hover:scale-125 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
