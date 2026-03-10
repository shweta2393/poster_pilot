"use client";

import { useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { useEditorStore, isRestoringHistory } from "@/store/editorStore";

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    setCanvas,
    posterSize,
    zoom,
    setZoom,
    backgroundColor,
    setSelectedElementId,
    pushHistory,
  } = useEditorStore();

  const saveHistory = useCallback(() => {
    if (fabricRef.current) {
      const json = JSON.stringify(fabricRef.current.toJSON(["data"]));
      pushHistory(json);
    }
  }, [pushHistory]);

  const debouncedSaveHistory = useCallback(() => {
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      saveHistory();
    }, 600);
  }, [saveHistory]);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: posterSize.width,
      height: posterSize.height,
      backgroundColor,
      preserveObjectStacking: true,
      selection: true,
    });

    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0];
      if (obj?.data?.id) {
        setSelectedElementId(obj.data.id);
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0];
      if (obj?.data?.id) {
        setSelectedElementId(obj.data.id);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedElementId(null);
    });

    canvas.on("object:modified", () => {
      if (!isRestoringHistory()) saveHistory();
    });

    canvas.on("object:added", () => {
      if (!isRestoringHistory()) debouncedSaveHistory();
    });

    fabricRef.current = canvas;
    setCanvas(canvas);

    const json = JSON.stringify(canvas.toJSON(["data"]));
    pushHistory(json);

    return () => {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      canvas.dispose();
      fabricRef.current = null;
      setCanvas(null);
    };
  }, []);

  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.setBackgroundColor(backgroundColor, () => {
        fabricRef.current?.renderAll();
      });
    }
  }, [backgroundColor]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.setZoom(zoom);
    canvas.setWidth(posterSize.width * zoom);
    canvas.setHeight(posterSize.height * zoom);
    canvas.renderAll();
  }, [zoom, posterSize]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.min(Math.max(zoom + delta, 0.1), 3);
      setZoom(newZoom);
    },
    [zoom, setZoom]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-canvas-bg flex items-center justify-center p-8"
      onWheel={handleWheel}
    >
      <div className="relative shadow-2xl">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
