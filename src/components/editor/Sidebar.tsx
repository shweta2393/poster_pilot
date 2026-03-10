"use client";

import { useEditorStore } from "@/store/editorStore";
import type { SidebarTab } from "@/types";
import {
  LayoutTemplate,
  Shapes,
  Type,
  Image,
  Sparkles,
  Layers,
  Paintbrush,
} from "lucide-react";
import TemplatesPanel from "./panels/TemplatesPanel";
import ElementsPanel from "./panels/ElementsPanel";
import TextPanel from "./panels/TextPanel";
import ImagesPanel from "./panels/ImagesPanel";
import AIPanel from "./panels/AIPanel";
import LayersPanel from "./panels/LayersPanel";
import RefinePanel from "./panels/RefinePanel";

const BASE_TABS: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { id: "templates", icon: <LayoutTemplate size={18} />, label: "Templates" },
  { id: "elements", icon: <Shapes size={18} />, label: "Elements" },
  { id: "text", icon: <Type size={18} />, label: "Text" },
  { id: "images", icon: <Image size={18} />, label: "Images" },
  { id: "ai", icon: <Sparkles size={18} />, label: "AI Agent" },
  { id: "layers", icon: <Layers size={18} />, label: "Layers" },
];

const REFINE_TAB = { id: "refine" as SidebarTab, icon: <Paintbrush size={18} />, label: "Refine" };

const PANEL_MAP: Record<SidebarTab, React.ReactNode> = {
  templates: <TemplatesPanel />,
  elements: <ElementsPanel />,
  text: <TextPanel />,
  images: <ImagesPanel />,
  ai: <AIPanel />,
  layers: <LayersPanel />,
  refine: <RefinePanel />,
};

export default function Sidebar() {
  const { activeSidebarTab, setActiveSidebarTab, currentDesignSpec } = useEditorStore();

  const tabs = currentDesignSpec
    ? [REFINE_TAB, ...BASE_TABS]
    : BASE_TABS;

  return (
    <div className="flex h-full">
      {/* Tab Rail */}
      <div className="w-16 bg-canvas-surface border-r border-canvas-border flex flex-col items-center py-2 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSidebarTab(tab.id)}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 ${
              activeSidebarTab === tab.id
                ? "bg-canvas-highlight text-white shadow-lg shadow-canvas-highlight/25"
                : "text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/30"
            }`}
            title={tab.label}
          >
            {tab.icon}
            <span className="text-[9px] font-medium leading-none">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="w-72 bg-canvas-surface/80 backdrop-blur border-r border-canvas-border overflow-y-auto">
        {PANEL_MAP[activeSidebarTab]}
      </div>
    </div>
  );
}
