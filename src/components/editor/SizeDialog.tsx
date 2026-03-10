"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { POSTER_SIZES, type PosterSize } from "@/types";
import {
  X,
  Monitor,
  Printer,
  Globe,
  Smartphone,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  social: <Smartphone size={14} />,
  print: <Printer size={14} />,
  web: <Globe size={14} />,
  custom: <Monitor size={14} />,
};

const CATEGORY_LABELS: Record<string, string> = {
  social: "Social Media",
  print: "Print",
  web: "Web & Digital",
};

export default function SizeDialog() {
  const { showSizeDialog, setShowSizeDialog, posterSize, setPosterSize, canvas } =
    useEditorStore();

  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);

  if (!showSizeDialog) return null;

  const handleSelect = (size: PosterSize) => {
    setPosterSize(size);
    if (canvas) {
      canvas.setWidth(size.width);
      canvas.setHeight(size.height);
      canvas.renderAll();
    }
    setShowSizeDialog(false);
  };

  const handleCustom = () => {
    handleSelect({
      name: `Custom (${customWidth}x${customHeight})`,
      width: customWidth,
      height: customHeight,
      category: "custom",
    });
  };

  const grouped = POSTER_SIZES.reduce(
    (acc, size) => {
      if (!acc[size.category]) acc[size.category] = [];
      acc[size.category].push(size);
      return acc;
    },
    {} as Record<string, PosterSize[]>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-canvas-surface border border-canvas-border rounded-2xl w-[520px] max-h-[80vh] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-canvas-border">
          <div>
            <h2 className="text-base font-semibold text-canvas-text">
              Canvas Size
            </h2>
            <p className="text-[11px] text-canvas-muted mt-0.5">
              Current: {posterSize.name}
            </p>
          </div>
          <button
            onClick={() => setShowSizeDialog(false)}
            className="p-1.5 rounded-lg text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/30 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {Object.entries(grouped).map(([category, sizes]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {CATEGORY_ICONS[category]}
                <h3 className="text-xs font-semibold text-canvas-muted uppercase tracking-wider">
                  {CATEGORY_LABELS[category] || category}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => handleSelect(size)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      posterSize.name === size.name
                        ? "border-canvas-highlight bg-canvas-highlight/10"
                        : "border-canvas-border hover:border-canvas-highlight/50"
                    }`}
                  >
                    <div
                      className="border border-canvas-border rounded bg-canvas-bg flex-shrink-0"
                      style={{
                        width: Math.max(24, (size.width / Math.max(size.width, size.height)) * 36),
                        height: Math.max(24, (size.height / Math.max(size.width, size.height)) * 36),
                      }}
                    />
                    <div>
                      <div className="text-xs font-medium text-canvas-text">
                        {size.name}
                      </div>
                      <div className="text-[10px] text-canvas-muted">
                        {size.width} x {size.height}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor size={14} />
              <h3 className="text-xs font-semibold text-canvas-muted uppercase tracking-wider">
                Custom Size
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 100)}
                className="w-24 bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-xs text-canvas-text focus:outline-none focus:border-canvas-highlight"
                placeholder="Width"
                min={100}
                max={10000}
              />
              <span className="text-canvas-muted text-xs">x</span>
              <input
                type="number"
                value={customHeight}
                onChange={(e) =>
                  setCustomHeight(parseInt(e.target.value) || 100)
                }
                className="w-24 bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-xs text-canvas-text focus:outline-none focus:border-canvas-highlight"
                placeholder="Height"
                min={100}
                max={10000}
              />
              <button
                onClick={handleCustom}
                className="px-4 py-2 bg-canvas-highlight text-white rounded-lg text-xs font-semibold hover:bg-canvas-highlight/80 transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
