"use client";

import { useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { addImageToCanvas } from "@/lib/canvas-utils";
import { Upload, Link, ImagePlus } from "lucide-react";

export default function ImagesPanel() {
  const { canvas, addElement } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addImageToCanvas(canvas, dataUrl, (el) => addElement(el));
    };
    reader.readAsDataURL(file);
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim() || !canvas) return;
    addImageToCanvas(canvas, urlInput.trim(), (el) => addElement(el));
    setUrlInput("");
    setShowUrlInput(false);
  };

  const SAMPLE_PATTERNS = [
    {
      name: "Gradient Blue",
      url: "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><rect fill="url(#g)" width="400" height="400"/></svg>'
        ),
    },
    {
      name: "Gradient Warm",
      url: "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f093fb"/><stop offset="100%" stop-color="#f5576c"/></linearGradient></defs><rect fill="url(#g)" width="400" height="400"/></svg>'
        ),
    },
    {
      name: "Gradient Green",
      url: "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#11998e"/><stop offset="100%" stop-color="#38ef7d"/></linearGradient></defs><rect fill="url(#g)" width="400" height="400"/></svg>'
        ),
    },
    {
      name: "Gradient Sunset",
      url: "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fa709a"/><stop offset="100%" stop-color="#fee140"/></linearGradient></defs><rect fill="url(#g)" width="400" height="400"/></svg>'
        ),
    },
    {
      name: "Abstract Circles",
      url: "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#1a1a2e" width="400" height="400"/><circle cx="100" cy="100" r="80" fill="#e94560" opacity="0.6"/><circle cx="300" cy="200" r="120" fill="#0f3460" opacity="0.5"/><circle cx="200" cy="350" r="60" fill="#16213e" opacity="0.7"/></svg>'
        ),
    },
    {
      name: "Dots Pattern",
      url: "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#f8f9fa" width="400" height="400"/><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="#ccc"/></pattern><rect fill="url(#p)" width="400" height="400"/></svg>'
        ),
    },
  ];

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-canvas-text mb-4">
        Images
      </h3>

      <div className="space-y-2 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-canvas-border hover:border-canvas-highlight text-canvas-muted hover:text-canvas-text transition-all"
        >
          <Upload size={20} />
          <div className="text-left">
            <div className="text-sm font-medium">Upload Image</div>
            <div className="text-[10px]">JPG, PNG, SVG, GIF</div>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-canvas-border hover:border-canvas-highlight text-canvas-muted hover:text-canvas-text transition-all"
        >
          <Link size={18} />
          <span className="text-sm">Add from URL</span>
        </button>

        {showUrlInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-canvas-bg border border-canvas-border rounded-lg px-3 py-2 text-xs text-canvas-text placeholder:text-canvas-muted focus:outline-none focus:border-canvas-highlight"
              onKeyDown={(e) => e.key === "Enter" && handleUrlAdd()}
            />
            <button
              onClick={handleUrlAdd}
              className="px-3 py-2 bg-canvas-highlight text-white rounded-lg text-xs font-medium hover:bg-canvas-highlight/80"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-canvas-text mb-3">
        Backgrounds & Patterns
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {SAMPLE_PATTERNS.map((pattern) => (
          <button
            key={pattern.name}
            onClick={() => {
              if (!canvas) return;
              addImageToCanvas(canvas, pattern.url, (el) => addElement(el));
            }}
            className="group relative aspect-square rounded-xl overflow-hidden border border-canvas-border hover:border-canvas-highlight transition-all"
          >
            <img
              src={pattern.url}
              alt={pattern.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-1.5">
              <span className="text-[9px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {pattern.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
