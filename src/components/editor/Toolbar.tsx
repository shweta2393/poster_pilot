"use client";

import { useEditorStore } from "@/store/editorStore";
import {
  deleteSelected,
  duplicateSelected,
  bringForward,
  sendBackward,
  alignObject,
} from "@/lib/canvas-utils";
import {
  Undo2,
  Redo2,
  Trash2,
  Copy,
  ArrowUpToLine,
  ArrowDownToLine,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
  RefreshCw,
} from "lucide-react";

export default function Toolbar() {
  const {
    canvas,
    zoom,
    setZoom,
    undo,
    redo,
    history,
    historyIndex,
    removeElement,
    addElement,
    setShowExportDialog,
    setShowSizeDialog,
    posterSize,
    currentDesignSpec,
    setShowCommandBar,
  } = useEditorStore();

  const handleDelete = () => {
    if (!canvas) return;
    const id = deleteSelected(canvas);
    if (id) removeElement(id);
  };

  const handleDuplicate = () => {
    if (!canvas) return;
    duplicateSelected(canvas, (el) => addElement(el));
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1));
  const handleZoomFit = () => setZoom(0.5);

  const ToolButton = ({
    onClick,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded-lg text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className="w-px h-6 bg-canvas-border mx-1" />
  );

  return (
    <div className="h-12 bg-canvas-surface border-b border-canvas-border flex items-center px-3 gap-1">
      <button
        onClick={() => setShowSizeDialog(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/50 transition-all"
        title="Change canvas size"
      >
        <Maximize size={14} />
        <span>
          {posterSize.name} ({posterSize.width}x{posterSize.height})
        </span>
      </button>

      <Divider />

      <ToolButton
        onClick={undo}
        disabled={historyIndex <= 0}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </ToolButton>
      <ToolButton
        onClick={redo}
        disabled={historyIndex >= history.length - 1}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={16} />
      </ToolButton>

      <Divider />

      <ToolButton onClick={handleDuplicate} title="Duplicate (Ctrl+D)">
        <Copy size={16} />
      </ToolButton>
      <ToolButton onClick={handleDelete} title="Delete (Del)">
        <Trash2 size={16} />
      </ToolButton>

      <Divider />

      <ToolButton
        onClick={() => canvas && bringForward(canvas)}
        title="Bring Forward"
      >
        <ArrowUpToLine size={16} />
      </ToolButton>
      <ToolButton
        onClick={() => canvas && sendBackward(canvas)}
        title="Send Backward"
      >
        <ArrowDownToLine size={16} />
      </ToolButton>

      <Divider />

      <ToolButton
        onClick={() => canvas && alignObject(canvas, "center")}
        title="Align Center"
      >
        <AlignHorizontalJustifyCenter size={16} />
      </ToolButton>
      <ToolButton
        onClick={() => canvas && alignObject(canvas, "middle")}
        title="Align Middle"
      >
        <AlignVerticalJustifyCenter size={16} />
      </ToolButton>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <ToolButton onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </ToolButton>
        <button
          onClick={handleZoomFit}
          className="px-2 py-1 text-xs font-mono text-canvas-muted hover:text-canvas-text transition-colors min-w-[48px] text-center"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <ToolButton onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </ToolButton>
      </div>

      <Divider />

      {currentDesignSpec && (
        <>
          <button
            onClick={() => setShowCommandBar(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/50 transition-all"
            title="Regenerate poster"
          >
            <RefreshCw size={14} />
            Regenerate
          </button>
          <Divider />
        </>
      )}

      <button
        onClick={() => setShowExportDialog(true)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-all"
      >
        <Download size={14} />
        Export
      </button>
    </div>
  );
}
