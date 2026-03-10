import { fabric } from "fabric";
import type { CanvasElement } from "@/types";
import type { PosterDesignSpec, DesignElement } from "./design-engine";

export async function applyDesignToCanvas(
  canvas: fabric.Canvas,
  spec: PosterDesignSpec
): Promise<CanvasElement[]> {
  canvas.clear();
  canvas.setBackgroundColor(spec.backgroundColor, () => {});

  const elements: CanvasElement[] = [];

  for (const el of spec.elements) {
    const fabricObj = await createFabricObject(el, spec.size.width, spec.size.height);
    if (!fabricObj) continue;

    fabricObj.set({ data: { id: el.id, type: el.kind, role: el.role } });
    canvas.add(fabricObj);

    elements.push({
      id: el.id,
      type: el.kind === "decorative" || el.kind === "image" ? "shape" : el.kind,
      name: labelForRole(el.role, elements.length + 1),
      visible: true,
      locked: false,
      fabricObject: fabricObj,
    });
  }

  canvas.renderAll();
  return elements;
}

async function createFabricObject(
  el: DesignElement,
  canvasW: number,
  canvasH: number
): Promise<fabric.Object | null> {
  const p = el.props;

  if (el.kind === "image") {
    return loadFabricImage(
      p.src as string,
      p.left as number,
      p.top as number,
      (p.width as number) || canvasW,
      (p.height as number) || canvasH,
      (p.opacity as number) ?? 1
    );
  }

  if (el.kind === "text") {
    const hasMaxWidth = typeof p.maxWidth === "number" && p.maxWidth > 0;

    if (hasMaxWidth) {
      return new fabric.Textbox(p.text as string, {
        left: p.left as number,
        top: p.top as number,
        width: p.maxWidth as number,
        fontSize: p.fontSize as number,
        fontFamily: (p.fontFamily as string) || "Inter",
        fill: p.fill as string,
        fontWeight: p.fontWeight as string,
        fontStyle: ((p.fontStyle as string) || "normal") as "" | "normal" | "italic" | "oblique",
        textAlign: p.textAlign as string,
        originX: (p.originX as string) || "left",
        lineHeight: (p.lineHeight as number) || 1.2,
        opacity: (p.opacity as number) ?? 1,
        editable: true,
        splitByGrapheme: false,
        objectCaching: false,
      });
    }

    return new fabric.IText(p.text as string, {
      left: p.left as number,
      top: p.top as number,
      fontSize: p.fontSize as number,
      fontFamily: (p.fontFamily as string) || "Inter",
      fill: p.fill as string,
      fontWeight: p.fontWeight as string,
      fontStyle: ((p.fontStyle as string) || "normal") as "" | "normal" | "italic" | "oblique",
      textAlign: p.textAlign as string,
      originX: (p.originX as string) || "left",
      lineHeight: (p.lineHeight as number) || 1.2,
      opacity: (p.opacity as number) ?? 1,
      editable: true,
      objectCaching: false,
    });
  }

  if (el.kind === "shape" || el.kind === "decorative") {
    const shapeType = (p.shapeType as string) || "rect";

    if (shapeType === "circle") {
      return new fabric.Circle({
        left: p.left as number,
        top: p.top as number,
        radius: p.radius as number,
        fill: p.fill as string,
        opacity: (p.opacity as number) ?? 1,
      });
    }

    return new fabric.Rect({
      left: p.left as number,
      top: p.top as number,
      width: p.width as number,
      height: p.height as number,
      fill: (p.fill as string) || "transparent",
      rx: (p.rx as number) || 0,
      ry: (p.ry as number) || 0,
      opacity: (p.opacity as number) ?? 1,
      stroke: (p.stroke as string) || undefined,
      strokeWidth: (p.strokeWidth as number) || 0,
    });
  }

  return null;
}

function loadFabricImage(
  src: string,
  left: number,
  top: number,
  targetW: number,
  targetH: number,
  opacity: number
): Promise<fabric.Object | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn("Image load timed out:", src);
      resolve(null);
    }, 12000);

    // Preload with native Image to handle redirects/CORS better
    const htmlImg = new Image();
    htmlImg.crossOrigin = "anonymous";
    htmlImg.onload = () => {
      clearTimeout(timeout);
      const fImg = new fabric.Image(htmlImg, {
        left,
        top,
        opacity,
        selectable: false,
        evented: false,
      });
      const scaleX = targetW / (fImg.width || 1);
      const scaleY = targetH / (fImg.height || 1);
      const scale = Math.max(scaleX, scaleY);
      fImg.set({ scaleX: scale, scaleY: scale });
      resolve(fImg);
    };
    htmlImg.onerror = () => {
      clearTimeout(timeout);
      console.warn("Image load failed:", src);
      resolve(null);
    };
    htmlImg.src = src;
  });
}

function labelForRole(role: string, idx: number): string {
  const labels: Record<string, string> = {
    headline: "Headline",
    subheadline: "Subheadline",
    body: "Body Text",
    cta: "CTA",
    brand: "Brand",
    accent: "Accent",
    divider: "Divider",
    overlay: "Overlay",
    badge: "Badge",
    decoration: "Decoration",
    "background-image": "Background Image",
  };
  return `${labels[role] || "Element"} ${idx}`;
}
