import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import type { CanvasElement } from "@/types";

export function addTextToCanvas(
  canvas: fabric.Canvas,
  options: {
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    fontWeight?: string;
    textAlign?: string;
    top?: number;
    left?: number;
  } = {}
): CanvasElement {
  const id = uuidv4();
  const zoom = canvas.getZoom() || 1;
  const logicalW = canvas.getWidth() / zoom;
  const logicalH = canvas.getHeight() / zoom;
  const text = new fabric.IText(options.text || "Double-click to edit", {
    left: options.left ?? logicalW / 2 - 100,
    top: options.top ?? logicalH / 2 - 20,
    fontSize: options.fontSize || 32,
    fontFamily: options.fontFamily || "Inter",
    fill: options.fill || "#000000",
    fontWeight: options.fontWeight || "normal",
    textAlign: options.textAlign || "left",
    editable: true,
    objectCaching: false,
    data: { id, type: "text" },
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();

  return {
    id,
    type: "text",
    name: `Text ${canvas.getObjects().length}`,
    visible: true,
    locked: false,
    fabricObject: text,
  };
}

export function addHeadingToCanvas(
  canvas: fabric.Canvas,
  headingText?: string
): CanvasElement {
  return addTextToCanvas(canvas, {
    text: headingText || "Your Heading Here",
    fontSize: 64,
    fontWeight: "bold",
    textAlign: "center",
  });
}

export function addSubheadingToCanvas(
  canvas: fabric.Canvas,
  text?: string
): CanvasElement {
  return addTextToCanvas(canvas, {
    text: text || "Subheading text",
    fontSize: 36,
    fontWeight: "600",
  });
}

export function addBodyTextToCanvas(
  canvas: fabric.Canvas,
  text?: string
): CanvasElement {
  return addTextToCanvas(canvas, {
    text: text || "Body text goes here. Edit this to add your content.",
    fontSize: 20,
    fontWeight: "normal",
  });
}

export function addShapeToCanvas(
  canvas: fabric.Canvas,
  shapeType: "rect" | "circle" | "triangle" | "line" | "star",
  options: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
  } = {}
): CanvasElement {
  const id = uuidv4();
  let shape: fabric.Object;
  const zoom = canvas.getZoom() || 1;
  const centerX = canvas.getWidth() / zoom / 2;
  const centerY = canvas.getHeight() / zoom / 2;
  const fill = options.fill || "#e94560";
  const stroke = options.stroke || "";
  const strokeWidth = options.strokeWidth || 0;

  switch (shapeType) {
    case "rect":
      shape = new fabric.Rect({
        left: centerX - 75,
        top: centerY - 50,
        width: options.width || 150,
        height: options.height || 100,
        fill,
        stroke,
        strokeWidth,
        rx: 8,
        ry: 8,
        data: { id, type: "shape" },
      });
      break;
    case "circle":
      shape = new fabric.Circle({
        left: centerX - 50,
        top: centerY - 50,
        radius: 50,
        fill,
        stroke,
        strokeWidth,
        data: { id, type: "shape" },
      });
      break;
    case "triangle":
      shape = new fabric.Triangle({
        left: centerX - 50,
        top: centerY - 50,
        width: options.width || 100,
        height: options.height || 100,
        fill,
        stroke,
        strokeWidth,
        data: { id, type: "shape" },
      });
      break;
    case "line":
      shape = new fabric.Line(
        [centerX - 75, centerY, centerX + 75, centerY],
        {
          stroke: fill,
          strokeWidth: options.strokeWidth || 3,
          data: { id, type: "shape" },
        }
      );
      break;
    case "star": {
      const points = createStarPoints(5, 50, 25);
      shape = new fabric.Polygon(points, {
        left: centerX - 50,
        top: centerY - 50,
        fill,
        stroke,
        strokeWidth,
        data: { id, type: "shape" },
      });
      break;
    }
    default:
      shape = new fabric.Rect({
        left: centerX - 75,
        top: centerY - 50,
        width: 150,
        height: 100,
        fill,
        data: { id, type: "shape" },
      });
  }

  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.renderAll();

  return {
    id,
    type: "shape",
    name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${canvas.getObjects().length}`,
    visible: true,
    locked: false,
    fabricObject: shape,
  };
}

function createStarPoints(
  spikes: number,
  outerRadius: number,
  innerRadius: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const step = Math.PI / spikes;

  for (let i = 0; i < 2 * spikes; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    points.push({
      x: outerRadius + radius * Math.cos(angle),
      y: outerRadius + radius * Math.sin(angle),
    });
  }
  return points;
}

export function addImageToCanvas(
  canvas: fabric.Canvas,
  url: string,
  callback?: (element: CanvasElement) => void
): void {
  const id = uuidv4();
  fabric.Image.fromURL(
    url,
    (img) => {
      const maxDim = Math.min(canvas.getWidth(), canvas.getHeight()) * 0.6;
      const scale = Math.min(
        maxDim / (img.width || 1),
        maxDim / (img.height || 1)
      );
      img.set({
        left: canvas.getWidth() / 2 - ((img.width || 0) * scale) / 2,
        top: canvas.getHeight() / 2 - ((img.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        data: { id, type: "image" },
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      if (callback) {
        callback({
          id,
          type: "image",
          name: `Image ${canvas.getObjects().length}`,
          visible: true,
          locked: false,
          fabricObject: img,
        });
      }
    },
    { crossOrigin: "anonymous" }
  );
}

export function deleteSelected(canvas: fabric.Canvas): string | null {
  const active = canvas.getActiveObject();
  if (!active) return null;
  const id = active.data?.id;
  canvas.remove(active);
  canvas.discardActiveObject();
  canvas.renderAll();
  return id;
}

export function duplicateSelected(
  canvas: fabric.Canvas,
  callback?: (element: CanvasElement) => void
): void {
  const active = canvas.getActiveObject();
  if (!active) return;

  active.clone((cloned: fabric.Object) => {
    const id = uuidv4();
    cloned.set({
      left: (cloned.left || 0) + 20,
      top: (cloned.top || 0) + 20,
      data: { id, type: active.data?.type || "shape" },
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();

    if (callback) {
      callback({
        id,
        type: active.data?.type || "shape",
        name: `Copy ${canvas.getObjects().length}`,
        visible: true,
        locked: false,
        fabricObject: cloned,
      });
    }
  });
}

export function bringForward(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.bringForward(active);
    canvas.renderAll();
  }
}

export function sendBackward(canvas: fabric.Canvas): void {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.sendBackwards(active);
    canvas.renderAll();
  }
}

export function alignObject(
  canvas: fabric.Canvas,
  alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
): void {
  const active = canvas.getActiveObject();
  if (!active) return;

  const bound = active.getBoundingRect();

  switch (alignment) {
    case "left":
      active.set("left", 0);
      break;
    case "center":
      active.set("left", canvas.getWidth() / 2 - bound.width / 2);
      break;
    case "right":
      active.set("left", canvas.getWidth() - bound.width);
      break;
    case "top":
      active.set("top", 0);
      break;
    case "middle":
      active.set("top", canvas.getHeight() / 2 - bound.height / 2);
      break;
    case "bottom":
      active.set("top", canvas.getHeight() - bound.height);
      break;
  }

  active.setCoords();
  canvas.renderAll();
}
