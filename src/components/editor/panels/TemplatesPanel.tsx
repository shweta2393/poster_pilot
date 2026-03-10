"use client";

import { useEditorStore } from "@/store/editorStore";
import {
  getTemplatesByCategory,
  getAddonsByCategory,
  type TemplateAddon,
  type AddonItem,
} from "@/lib/templates";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import type { Template, CanvasElement } from "@/types";

function estimateTextWidth(text: string, fontSize: number): number {
  const longestLine = text
    .split("\n")
    .reduce((max, line) => Math.max(max, line.length), 0);
  return longestLine * fontSize * 0.55;
}

function estimateTextHeight(text: string, fontSize: number): number {
  const lineCount = text.split("\n").length;
  return lineCount * fontSize * 1.25;
}

export default function TemplatesPanel() {
  const {
    canvas,
    setPosterSize,
    setBackgroundColor,
    setElements,
    elements,
    addElement,
    currentDesignSpec,
    posterSize,
  } = useEditorStore();

  const hasExistingContent = elements.length > 0 || currentDesignSpec !== null;

  // -----------------------------------------------------------------------
  // Find the lowest occupied Y on the canvas to stack new items below
  // -----------------------------------------------------------------------
  function findBottomY(): number {
    if (!canvas) return 0;
    const objects = canvas.getObjects();
    let maxBottom = 0;
    for (const obj of objects) {
      const bound = obj.getBoundingRect(true);
      maxBottom = Math.max(maxBottom, bound.top + bound.height);
    }
    return maxBottom;
  }

  // -----------------------------------------------------------------------
  // Convert hex + opacity to rgba string for textBackgroundColor
  // -----------------------------------------------------------------------
  function hexToRgba(hex: string, opacity: number): string {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }

  // -----------------------------------------------------------------------
  // Add a single addon item (text with built-in background color)
  // -----------------------------------------------------------------------
  function addAddonItem(
    item: AddonItem,
    cursorY: number,
    canvasW: number,
    canvasH: number,
  ): { elements: CanvasElement[]; newY: number } {
    if (!canvas) return { elements: [], newY: cursorY };

    const text = item.text || "";
    const fontSize = item.fontSize || 32;
    const padding = item.padding || 12;
    const textH = estimateTextHeight(text, fontSize);
    const blockH = textH + padding * 2;

    const centerX = canvasW / 2;
    const top = Math.min(cursorY, canvasH - blockH - 10);

    const bgColor = item.bgFill
      ? hexToRgba(item.bgFill, item.bgOpacity ?? 0.8)
      : "";

    const paddingStr = " ".repeat(Math.ceil(padding / (fontSize * 0.3)));

    const paddedText = item.type === "banner"
      ? `  ${text}  `
      : text.split("\n").map((line) => `${paddingStr}${line}${paddingStr}`).join("\n");

    const textId = uuidv4();
    const textObj = new fabric.IText(paddedText, {
      left: centerX,
      top,
      fontSize,
      fontFamily: item.fontFamily || "Inter",
      fill: item.fill || "#ffffff",
      fontWeight: item.fontWeight || "normal",
      textAlign: "center",
      originX: "center",
      editable: true,
      objectCaching: false,
      textBackgroundColor: bgColor,
      data: { id: textId, type: "text", role: "addon-text" },
    });
    canvas.add(textObj);

    const addedElements: CanvasElement[] = [{
      id: textId,
      type: "text",
      name: `${text.split("\n")[0].slice(0, 20)} ${canvas.getObjects().length}`,
      visible: true,
      locked: false,
      fabricObject: textObj,
    }];

    const actualH = textObj.getBoundingRect(true).height || blockH;
    return {
      elements: addedElements,
      newY: top + actualH + 16,
    };
  }

  // -----------------------------------------------------------------------
  // Remove previously added addon elements from the canvas
  // -----------------------------------------------------------------------
  function removeExistingAddons() {
    if (!canvas) return;

    const toRemove = canvas.getObjects().filter((obj) => {
      const role = (obj as fabric.Object & { data?: { role?: string } }).data?.role;
      return role === "addon-text";
    });

    const removedIds = new Set(
      toRemove.map((obj) => (obj as fabric.Object & { data?: { id?: string } }).data?.id)
    );

    for (const obj of toRemove) {
      canvas.remove(obj);
    }

    const currentElements = useEditorStore.getState().elements;
    setElements(currentElements.filter((el) => !removedIds.has(el.id)));
  }

  // -----------------------------------------------------------------------
  // Apply add-on template: replaces previous addon, adds themed text
  // -----------------------------------------------------------------------
  const applyAddon = (addon: TemplateAddon) => {
    if (!canvas) return;

    removeExistingAddons();

    const canvasW = posterSize.width;
    const canvasH = posterSize.height;

    const totalItemsH = addon.items.reduce((sum, item) => {
      const fontSize = item.fontSize || 32;
      const padding = item.padding || 12;
      return sum + estimateTextHeight(item.text || "", fontSize) + padding * 2 + 12;
    }, 0);

    const occupiedBottom = findBottomY();
    const availableFromBottom = canvasH - occupiedBottom;

    let startY: number;
    if (availableFromBottom >= totalItemsH + 20) {
      startY = occupiedBottom + 20;
    } else {
      startY = canvasH - totalItemsH - 20;
    }

    startY = Math.max(20, startY);

    let cursorY = startY;
    for (const item of addon.items) {
      const result = addAddonItem(item, cursorY, canvasW, canvasH);
      for (const el of result.elements) {
        addElement(el);
      }
      cursorY = result.newY;
    }

    canvas.renderAll();
  };

  // -----------------------------------------------------------------------
  // Apply full template (empty canvas only)
  // -----------------------------------------------------------------------
  const applyTemplateFull = (template: Template) => {
    if (!canvas) return;

    canvas.clear();
    setElements([]);

    setPosterSize(template.size);
    setBackgroundColor(template.backgroundColor);
    canvas.setBackgroundColor(template.backgroundColor, () => {});

    const newElements: CanvasElement[] = [];

    for (const el of template.elements) {
      const id = uuidv4();

      if (el.type === "text") {
        const text = new fabric.IText(el.props.text as string, {
          left: el.props.left as number,
          top: el.props.top as number,
          fontSize: el.props.fontSize as number,
          fontFamily: (el.props.fontFamily as string) || "Inter",
          fill: el.props.fill as string,
          fontWeight: el.props.fontWeight as string,
          textAlign: el.props.textAlign as string,
          originX: (el.props.originX as string) || "left",
          editable: true,
          objectCaching: false,
          data: { id, type: "text" },
        });
        canvas.add(text);
        newElements.push({
          id,
          type: "text",
          name: `Text ${newElements.length + 1}`,
          visible: true,
          locked: false,
          fabricObject: text,
        });
      } else if (el.type === "shape") {
        const shapeType = el.props.shapeType as string;
        let shape: fabric.Object;

        if (shapeType === "circle") {
          shape = new fabric.Circle({
            left: el.props.left as number,
            top: el.props.top as number,
            radius: el.props.radius as number,
            fill: el.props.fill as string,
            opacity: (el.props.opacity as number) ?? 1,
            data: { id, type: "shape" },
          });
        } else {
          shape = new fabric.Rect({
            left: el.props.left as number,
            top: el.props.top as number,
            width: el.props.width as number,
            height: el.props.height as number,
            fill: el.props.fill as string,
            rx: (el.props.rx as number) || 0,
            ry: (el.props.ry as number) || 0,
            opacity: (el.props.opacity as number) ?? 1,
            data: { id, type: "shape" },
          });
        }

        canvas.add(shape);
        newElements.push({
          id,
          type: "shape",
          name: `Shape ${newElements.length + 1}`,
          visible: true,
          locked: false,
          fabricObject: shape,
        });
      }
    }

    setElements(newElements);
    canvas.renderAll();
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  if (hasExistingContent) {
    const grouped = getAddonsByCategory();

    return (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-canvas-text mb-1">
          Add to Poster
        </h3>
        <p className="text-[10px] text-canvas-muted mb-4">
          Click to add themed text onto your poster. Drag to reposition.
        </p>

        {Object.entries(grouped).map(([category, addons]) => (
          <div key={category} className="mb-5">
            <h4 className="text-xs font-medium text-canvas-muted uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="space-y-1.5">
              {addons.map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => applyAddon(addon)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-canvas-border hover:border-canvas-highlight transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[8px] font-bold leading-tight text-center"
                    style={{
                      backgroundColor: addon.previewBg,
                      color: addon.previewAccent,
                    }}
                  >
                    {addon.items[0]?.text?.split("\n")[0]?.slice(0, 6) || "ADD"}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-medium text-canvas-text group-hover:text-canvas-highlight transition-colors truncate">
                      {addon.name}
                    </div>
                    <div className="text-[10px] text-canvas-muted truncate">
                      {addon.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const grouped = getTemplatesByCategory();

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-canvas-text mb-4">
        Templates
      </h3>

      {Object.entries(grouped).map(([category, templates]) => (
        <div key={category} className="mb-6">
          <h4 className="text-xs font-medium text-canvas-muted uppercase tracking-wider mb-3">
            {category}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplateFull(t)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-canvas-border hover:border-canvas-highlight transition-all duration-200"
                style={{ backgroundColor: t.backgroundColor }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  {t.elements
                    .filter((el) => el.type === "text")
                    .slice(0, 2)
                    .map((el, idx) => (
                      <span
                        key={idx}
                        className="text-[8px] font-bold truncate max-w-full leading-tight"
                        style={{ color: el.props.fill as string }}
                      >
                        {(el.props.text as string)?.split("\n")[0]}
                      </span>
                    ))}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
                  <span className="text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.name}
                  </span>
                </div>
                <div className="absolute top-1 right-1 text-[7px] text-white/60 bg-black/30 px-1 rounded">
                  {t.size.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
