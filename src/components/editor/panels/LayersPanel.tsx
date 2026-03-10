"use client";

import { useEditorStore } from "@/store/editorStore";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  Type,
  Square,
  Image,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <Type size={14} />,
  shape: <Square size={14} />,
  image: <Image size={14} />,
};

export default function LayersPanel() {
  const {
    elements,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    removeElement,
    canvas,
  } = useEditorStore();

  const handleSelect = (id: string) => {
    setSelectedElementId(id);
    if (canvas) {
      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (obj) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    }
  };

  const handleToggleVisibility = (id: string, visible: boolean) => {
    updateElement(id, { visible: !visible });
    if (canvas) {
      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (obj) {
        obj.set("visible", !visible);
        canvas.renderAll();
      }
    }
  };

  const handleToggleLock = (id: string, locked: boolean) => {
    updateElement(id, { locked: !locked });
    if (canvas) {
      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (obj) {
        obj.set({
          selectable: locked,
          evented: locked,
        });
        canvas.renderAll();
      }
    }
  };

  const handleDelete = (id: string) => {
    if (canvas) {
      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (obj) {
        canvas.remove(obj);
        canvas.renderAll();
      }
    }
    removeElement(id);
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-canvas-text mb-4">
        Layers
      </h3>

      {elements.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-canvas-muted text-xs">
            No layers yet. Add elements to your canvas.
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {[...elements].reverse().map((el) => (
            <div
              key={el.id}
              onClick={() => handleSelect(el.id)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group ${
                selectedElementId === el.id
                  ? "bg-canvas-highlight/20 border border-canvas-highlight/40"
                  : "hover:bg-canvas-accent/30 border border-transparent"
              }`}
            >
              <div className="text-canvas-muted/40 cursor-grab">
                <GripVertical size={12} />
              </div>
              <div className="text-canvas-muted">
                {TYPE_ICONS[el.type] || <Square size={14} />}
              </div>
              <span className="flex-1 text-xs text-canvas-text truncate">
                {el.name}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(el.id, el.visible);
                  }}
                  className="p-1 rounded text-canvas-muted hover:text-canvas-text"
                  title={el.visible ? "Hide" : "Show"}
                >
                  {el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLock(el.id, el.locked);
                  }}
                  className="p-1 rounded text-canvas-muted hover:text-canvas-text"
                  title={el.locked ? "Unlock" : "Lock"}
                >
                  {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(el.id);
                  }}
                  className="p-1 rounded text-canvas-muted hover:text-canvas-highlight"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
