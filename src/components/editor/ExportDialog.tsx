"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { saveAs } from "file-saver";
import { X, Download, FileImage, FileCode } from "lucide-react";
import type { ExportFormat } from "@/types";

const FORMAT_OPTIONS: {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    format: "png",
    label: "PNG",
    icon: <FileImage size={18} />,
    description: "Lossless, best for web",
  },
  {
    format: "jpg",
    label: "JPG",
    icon: <FileImage size={18} />,
    description: "Smaller file size",
  },
  {
    format: "svg",
    label: "SVG",
    icon: <FileCode size={18} />,
    description: "Scalable vector",
  },
];

const SCALE_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
  { value: 4, label: "4x" },
];

export default function ExportDialog() {
  const { canvas, posterSize, showExportDialog, setShowExportDialog } =
    useEditorStore();

  const [format, setFormat] = useState<ExportFormat>("png");
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.92);

  if (!showExportDialog) return null;

  const handleExport = () => {
    if (!canvas) return;

    const multiplier = scale;
    const fileName = `poster-${posterSize.name.replace(/\s/g, "-").toLowerCase()}-${Date.now()}`;

    if (format === "svg") {
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      saveAs(blob, `${fileName}.svg`);
    } else {
      const dataUrl = canvas.toDataURL({
        format: format === "jpg" ? "jpeg" : "png",
        quality: format === "jpg" ? quality : 1,
        multiplier,
      });

      const link = document.createElement("a");
      link.download = `${fileName}.${format}`;
      link.href = dataUrl;
      link.click();
    }

    setShowExportDialog(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-canvas-surface border border-canvas-border rounded-2xl w-[420px] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-canvas-border">
          <div>
            <h2 className="text-base font-semibold text-canvas-text">
              Export Poster
            </h2>
            <p className="text-[11px] text-canvas-muted mt-0.5">
              {posterSize.name} ({posterSize.width} x {posterSize.height})
            </p>
          </div>
          <button
            onClick={() => setShowExportDialog(false)}
            className="p-1.5 rounded-lg text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/30 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs font-medium text-canvas-muted mb-2 block">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.format}
                  onClick={() => setFormat(opt.format)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    format === opt.format
                      ? "border-canvas-highlight bg-canvas-highlight/10 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:border-canvas-highlight/50"
                  }`}
                >
                  {opt.icon}
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[9px] opacity-70">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-canvas-muted mb-2 block">
              Scale ({scale}x = {posterSize.width * scale} x{" "}
              {posterSize.height * scale}px)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScale(opt.value)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    scale === opt.value
                      ? "border-canvas-highlight bg-canvas-highlight/10 text-canvas-highlight"
                      : "border-canvas-border text-canvas-muted hover:border-canvas-highlight/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {format === "jpg" && (
            <div>
              <label className="text-xs font-medium text-canvas-muted mb-2 block">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-canvas-highlight"
              />
            </div>
          )}
        </div>

        <div className="p-5 border-t border-canvas-border flex gap-3">
          <button
            onClick={() => setShowExportDialog(false)}
            className="flex-1 py-2.5 rounded-xl border border-canvas-border text-xs font-medium text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/30 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 rounded-xl bg-canvas-highlight text-white text-xs font-semibold hover:bg-canvas-highlight/80 transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
