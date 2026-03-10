import { create } from "zustand";
import type {
  CanvasElement,
  PosterSize,
  SidebarTab,
  AIMessage,
} from "@/types";
import type { PosterDesignSpec } from "@/lib/design-engine";

interface EditorState {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;

  posterSize: PosterSize;
  setPosterSize: (size: PosterSize) => void;

  elements: CanvasElement[];
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;

  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;

  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;

  zoom: number;
  setZoom: (zoom: number) => void;

  backgroundColor: string;
  setBackgroundColor: (color: string) => void;

  aiMessages: AIMessage[];
  addAIMessage: (message: AIMessage) => void;
  clearAIMessages: () => void;

  isAILoading: boolean;
  setIsAILoading: (loading: boolean) => void;

  history: string[];
  historyIndex: number;
  pushHistory: (state: string) => void;
  undo: () => void;
  redo: () => void;

  showExportDialog: boolean;
  setShowExportDialog: (show: boolean) => void;

  showSizeDialog: boolean;
  setShowSizeDialog: (show: boolean) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationStep: string;
  setGenerationStep: (step: string) => void;
  currentDesignSpec: PosterDesignSpec | null;
  setCurrentDesignSpec: (spec: PosterDesignSpec | null) => void;

  // Command bar
  showCommandBar: boolean;
  setShowCommandBar: (v: boolean) => void;
}

let _restoringHistory = false;
export function isRestoringHistory(): boolean {
  return _restoringHistory;
}

const DEFAULT_SIZE: PosterSize = {
  name: "Instagram Post",
  width: 1080,
  height: 1080,
  category: "social",
};

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),

  posterSize: DEFAULT_SIZE,
  setPosterSize: (posterSize) => set({ posterSize }),

  elements: [],
  setElements: (elements) => set({ elements }),
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    })),
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  selectedElementId: null,
  setSelectedElementId: (selectedElementId) => set({ selectedElementId }),

  activeSidebarTab: "templates",
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),

  zoom: 0.5,
  setZoom: (zoom) => set({ zoom }),

  backgroundColor: "#ffffff",
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),

  aiMessages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI design assistant. I can help you create stunning posters. Try asking me to:\n\n• Generate a catchy headline\n• Suggest a color palette\n• Write ad copy or taglines\n• Improve your existing text\n• Suggest layout ideas",
      timestamp: Date.now(),
    },
  ],
  addAIMessage: (message) =>
    set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  clearAIMessages: () =>
    set({
      aiMessages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Chat cleared! How can I help you with your poster design?",
          timestamp: Date.now(),
        },
      ],
    }),

  isAILoading: false,
  setIsAILoading: (isAILoading) => set({ isAILoading }),

  history: [],
  historyIndex: -1,
  pushHistory: (state) =>
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(state);
      if (newHistory.length > 50) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),
  undo: () => {
    const { history, historyIndex, canvas } = get();
    if (historyIndex > 0 && canvas) {
      const prevIndex = historyIndex - 1;
      set({ historyIndex: prevIndex });
      _restoringHistory = true;
      canvas.loadFromJSON(JSON.parse(history[prevIndex]), () => {
        canvas.getObjects().forEach((obj) => {
          if (obj.type === "i-text" || obj.type === "textbox") {
            obj.set({ objectCaching: false });
          }
        });
        canvas.renderAll();
        _restoringHistory = false;
        rebuildElements(canvas, set);
      });
    }
  },
  redo: () => {
    const { history, historyIndex, canvas } = get();
    if (historyIndex < history.length - 1 && canvas) {
      const nextIndex = historyIndex + 1;
      set({ historyIndex: nextIndex });
      _restoringHistory = true;
      canvas.loadFromJSON(JSON.parse(history[nextIndex]), () => {
        canvas.getObjects().forEach((obj) => {
          if (obj.type === "i-text" || obj.type === "textbox") {
            obj.set({ objectCaching: false });
          }
        });
        canvas.renderAll();
        _restoringHistory = false;
        rebuildElements(canvas, set);
      });
    }
  },

  showExportDialog: false,
  setShowExportDialog: (showExportDialog) => set({ showExportDialog }),

  showSizeDialog: false,
  setShowSizeDialog: (showSizeDialog) => set({ showSizeDialog }),

  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  generationStep: "",
  setGenerationStep: (generationStep) => set({ generationStep }),
  currentDesignSpec: null,
  setCurrentDesignSpec: (currentDesignSpec) => set({ currentDesignSpec }),

  showCommandBar: true,
  setShowCommandBar: (showCommandBar) => set({ showCommandBar }),
}));

function rebuildElements(
  canvas: fabric.Canvas,
  set: (partial: Partial<EditorState>) => void
) {
  const elements: CanvasElement[] = [];
  const roleLabels: Record<string, string> = {
    headline: "Headline",
    subheadline: "Subheadline",
    body: "Body Text",
    cta: "CTA",
    brand: "Brand",
    overlay: "Overlay",
    "background-image": "Background Image",
    "addon-text": "Template Add-on",
  };
  canvas.getObjects().forEach((obj, idx) => {
    const data = obj.data;
    if (!data?.id) return;
    const kind = data.type || (obj.type === "i-text" || obj.type === "textbox" ? "text" : "shape");
    elements.push({
      id: data.id,
      type: kind === "image" ? "image" : kind === "text" || kind === "i-text" || kind === "textbox" ? "text" : "shape",
      name: roleLabels[data.role] || `Element ${idx + 1}`,
      visible: obj.visible !== false,
      locked: !obj.selectable,
      fabricObject: obj,
    });
  });
  set({ elements });
}
