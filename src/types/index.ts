export type PosterSize = {
  name: string;
  width: number;
  height: number;
  category: "social" | "print" | "web" | "custom";
};

export const POSTER_SIZES: PosterSize[] = [
  { name: "Instagram Post", width: 1080, height: 1080, category: "social" },
  { name: "Instagram Story", width: 1080, height: 1920, category: "social" },
  { name: "Facebook Post", width: 1200, height: 630, category: "social" },
  { name: "Facebook Cover", width: 820, height: 312, category: "social" },
  { name: "Twitter/X Post", width: 1200, height: 675, category: "social" },
  { name: "Twitter/X Header", width: 1500, height: 500, category: "social" },
  { name: "LinkedIn Post", width: 1200, height: 627, category: "social" },
  { name: "LinkedIn Banner", width: 1584, height: 396, category: "social" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, category: "social" },
  { name: "Pinterest Pin", width: 1000, height: 1500, category: "social" },
  { name: "TikTok Cover", width: 1080, height: 1920, category: "social" },
  { name: "A4 Portrait", width: 2480, height: 3508, category: "print" },
  { name: "A4 Landscape", width: 3508, height: 2480, category: "print" },
  { name: "US Letter", width: 2550, height: 3300, category: "print" },
  { name: "Poster 18x24", width: 5400, height: 7200, category: "print" },
  { name: "Web Banner", width: 1920, height: 600, category: "web" },
  { name: "Leaderboard Ad", width: 728, height: 90, category: "web" },
  { name: "Medium Rectangle", width: 300, height: 250, category: "web" },
  { name: "Skyscraper", width: 160, height: 600, category: "web" },
];

export type ElementType = "text" | "shape" | "image" | "group";

export interface CanvasElement {
  id: string;
  type: ElementType;
  name: string;
  visible: boolean;
  locked: boolean;
  fabricObject?: fabric.Object;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  size: PosterSize;
  elements: TemplateElement[];
  backgroundColor: string;
}

export interface TemplateElement {
  type: ElementType;
  props: Record<string, unknown>;
}

export type AIAction =
  | "generate_headline"
  | "generate_tagline"
  | "generate_body"
  | "suggest_colors"
  | "suggest_layout"
  | "improve_text"
  | "generate_image_prompt";

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  action?: AIAction;
}

export type SidebarTab =
  | "templates"
  | "elements"
  | "text"
  | "images"
  | "ai"
  | "layers"
  | "refine";

export type ExportFormat = "png" | "jpg" | "svg" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  quality: number;
  scale: number;
}
