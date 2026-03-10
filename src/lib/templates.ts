import type { Template } from "@/types";

export interface TemplateAddon {
  id: string;
  name: string;
  category: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  items: AddonItem[];
}

export interface AddonItem {
  type: "text" | "badge" | "banner" | "divider";
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fill?: string;
  bgFill?: string;
  bgOpacity?: number;
  padding?: number;
  rounded?: number;
}

// ---------------------------------------------------------------------------
// Add-on templates: themed text groups that get placed onto existing posters
// ---------------------------------------------------------------------------

export const TEMPLATE_ADDONS: TemplateAddon[] = [
  // --- Promotion ---
  {
    id: "promo-50off",
    name: "50% Off Sale",
    category: "Promotion",
    description: "Bold discount badge + CTA",
    previewBg: "#e94560",
    previewAccent: "#ffffff",
    items: [
      { type: "badge", text: "50% OFF", fontSize: 64, fontWeight: "bold", fill: "#ffffff", bgFill: "#e94560", bgOpacity: 0.95, padding: 24, rounded: 16 },
      { type: "text", text: "LIMITED TIME ONLY", fontSize: 24, fontWeight: "600", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.6, padding: 12, rounded: 8 },
      { type: "text", text: "Shop Now", fontSize: 20, fontWeight: "bold", fill: "#ffffff", bgFill: "#e94560", bgOpacity: 0.9, padding: 10, rounded: 20 },
    ],
  },
  {
    id: "promo-flash",
    name: "Flash Sale",
    category: "Promotion",
    description: "Urgent flash sale overlay",
    previewBg: "#FF6B00",
    previewAccent: "#ffffff",
    items: [
      { type: "badge", text: "FLASH\nSALE", fontSize: 72, fontWeight: "bold", fill: "#ffffff", bgFill: "#FF6B00", bgOpacity: 0.95, padding: 28, rounded: 16 },
      { type: "text", text: "UP TO 70% OFF", fontSize: 28, fontWeight: "bold", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.6, padding: 12, rounded: 8 },
      { type: "text", text: "Ends Midnight", fontSize: 18, fontWeight: "600", fill: "#FFD700", bgFill: "#000000", bgOpacity: 0.5, padding: 8, rounded: 6 },
    ],
  },
  {
    id: "promo-bogo",
    name: "Buy One Get One",
    category: "Promotion",
    description: "BOGO deal badge",
    previewBg: "#6C5CE7",
    previewAccent: "#ffffff",
    items: [
      { type: "badge", text: "BUY 1\nGET 1 FREE", fontSize: 56, fontWeight: "bold", fill: "#ffffff", bgFill: "#6C5CE7", bgOpacity: 0.95, padding: 24, rounded: 16 },
      { type: "text", text: "While stocks last", fontSize: 20, fontWeight: "normal", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.5, padding: 10, rounded: 8 },
    ],
  },
  // --- Social ---
  {
    id: "social-follow",
    name: "Follow Us",
    category: "Social",
    description: "Social follow CTA",
    previewBg: "#0f3460",
    previewAccent: "#e94560",
    items: [
      { type: "badge", text: "FOLLOW US", fontSize: 48, fontWeight: "bold", fill: "#ffffff", bgFill: "#e94560", bgOpacity: 0.9, padding: 20, rounded: 12 },
      { type: "text", text: "@yourbrand", fontSize: 28, fontWeight: "600", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.5, padding: 12, rounded: 8 },
    ],
  },
  {
    id: "social-hashtag",
    name: "Hashtag Banner",
    category: "Social",
    description: "Trending hashtag overlay",
    previewBg: "#1DA1F2",
    previewAccent: "#ffffff",
    items: [
      { type: "text", text: "#YourHashtag", fontSize: 40, fontWeight: "bold", fill: "#ffffff", bgFill: "#1DA1F2", bgOpacity: 0.9, padding: 16, rounded: 10 },
      { type: "text", text: "Join the conversation", fontSize: 18, fontWeight: "normal", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.5, padding: 8, rounded: 6 },
    ],
  },
  {
    id: "social-swipe",
    name: "Swipe Up",
    category: "Social",
    description: "Story swipe-up prompt",
    previewBg: "#E1306C",
    previewAccent: "#ffffff",
    items: [
      { type: "text", text: "SWIPE UP", fontSize: 36, fontWeight: "bold", fill: "#ffffff", bgFill: "#E1306C", bgOpacity: 0.9, padding: 14, rounded: 10 },
      { type: "text", text: "Link in bio", fontSize: 18, fontWeight: "normal", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.4, padding: 8, rounded: 6 },
    ],
  },
  // --- Event ---
  {
    id: "event-launch",
    name: "New Launch",
    category: "Event",
    description: "Product/event launch badge",
    previewBg: "#2D3436",
    previewAccent: "#FFD700",
    items: [
      { type: "badge", text: "NEW\nLAUNCH", fontSize: 60, fontWeight: "bold", fill: "#FFD700", bgFill: "#000000", bgOpacity: 0.85, padding: 24, rounded: 16 },
      { type: "text", text: "SAVE THE DATE", fontSize: 22, fontWeight: "bold", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.5, padding: 10, rounded: 8 },
    ],
  },
  {
    id: "event-rsvp",
    name: "RSVP / Register",
    category: "Event",
    description: "Registration call-to-action",
    previewBg: "#00B894",
    previewAccent: "#ffffff",
    items: [
      { type: "text", text: "REGISTER NOW", fontSize: 36, fontWeight: "bold", fill: "#ffffff", bgFill: "#00B894", bgOpacity: 0.9, padding: 16, rounded: 24 },
      { type: "text", text: "Free Entry | Limited Seats", fontSize: 18, fontWeight: "normal", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.5, padding: 10, rounded: 8 },
    ],
  },
  // --- Info ---
  {
    id: "info-contact",
    name: "Contact Info",
    category: "Info",
    description: "Phone, email, website strip",
    previewBg: "#2C3E50",
    previewAccent: "#ECF0F1",
    items: [
      { type: "banner", text: "yourwebsite.com  |  info@email.com  |  +1 234 567 890", fontSize: 18, fontWeight: "normal", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.7, padding: 14, rounded: 0 },
    ],
  },
  {
    id: "info-hours",
    name: "Open Hours",
    category: "Info",
    description: "Business hours strip",
    previewBg: "#34495E",
    previewAccent: "#ECF0F1",
    items: [
      { type: "banner", text: "Mon-Fri 9AM-6PM  |  Sat 10AM-4PM  |  Sun Closed", fontSize: 18, fontWeight: "normal", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.7, padding: 14, rounded: 0 },
    ],
  },
  // --- Product ---
  {
    id: "product-price",
    name: "Price Tag",
    category: "Product",
    description: "Price display with CTA",
    previewBg: "#2C3E50",
    previewAccent: "#E74C3C",
    items: [
      { type: "badge", text: "$99.99", fontSize: 56, fontWeight: "bold", fill: "#ffffff", bgFill: "#E74C3C", bgOpacity: 0.95, padding: 20, rounded: 14 },
      { type: "text", text: "Shop Now", fontSize: 22, fontWeight: "bold", fill: "#ffffff", bgFill: "#2ECC71", bgOpacity: 0.9, padding: 10, rounded: 20 },
    ],
  },
  {
    id: "product-new",
    name: "New Arrival",
    category: "Product",
    description: "New product badge",
    previewBg: "#F39C12",
    previewAccent: "#ffffff",
    items: [
      { type: "badge", text: "NEW\nARRIVAL", fontSize: 52, fontWeight: "bold", fill: "#ffffff", bgFill: "#F39C12", bgOpacity: 0.95, padding: 22, rounded: 14 },
      { type: "text", text: "Be the first to try", fontSize: 18, fontWeight: "normal", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.5, padding: 8, rounded: 6 },
    ],
  },
  // --- YouTube ---
  {
    id: "yt-clickbait",
    name: "Clickbait Title",
    category: "YouTube",
    description: "Bold thumbnail text + badge",
    previewBg: "#FF0000",
    previewAccent: "#ffffff",
    items: [
      { type: "badge", text: "YOU WON'T\nBELIEVE THIS", fontSize: 56, fontWeight: "bold", fill: "#ffffff", bgFill: "#000000", bgOpacity: 0.75, padding: 22, rounded: 12 },
      { type: "text", text: "WATCH NOW", fontSize: 24, fontWeight: "bold", fill: "#ffffff", bgFill: "#FF0000", bgOpacity: 0.95, padding: 12, rounded: 20 },
    ],
  },
  {
    id: "yt-review",
    name: "Review Badge",
    category: "YouTube",
    description: "Star rating review overlay",
    previewBg: "#FF6B00",
    previewAccent: "#FFD700",
    items: [
      { type: "badge", text: "HONEST\nREVIEW", fontSize: 52, fontWeight: "bold", fill: "#ffffff", bgFill: "#FF6B00", bgOpacity: 0.95, padding: 22, rounded: 14 },
      { type: "text", text: "★★★★★", fontSize: 32, fontWeight: "bold", fill: "#FFD700", bgFill: "#000000", bgOpacity: 0.7, padding: 10, rounded: 8 },
    ],
  },
];

export function getAddonsByCategory(): Record<string, TemplateAddon[]> {
  const grouped: Record<string, TemplateAddon[]> = {};
  for (const t of TEMPLATE_ADDONS) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }
  return grouped;
}

// ---------------------------------------------------------------------------
// Legacy full templates (used when canvas is empty)
// ---------------------------------------------------------------------------

export const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: "minimal-promo",
    name: "Minimal Promo",
    category: "Promotion",
    thumbnail: "",
    size: { name: "Instagram Post", width: 1080, height: 1080, category: "social" },
    backgroundColor: "#1a1a2e",
    elements: [
      { type: "shape", props: { shapeType: "rect", left: 0, top: 0, width: 1080, height: 1080, fill: "#1a1a2e" } },
      { type: "text", props: { text: "SPECIAL\nOFFER", fontSize: 120, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", left: 540, top: 300, originX: "center" } },
      { type: "text", props: { text: "50% OFF", fontSize: 80, fontFamily: "Inter", fill: "#e94560", fontWeight: "bold", textAlign: "center", left: 540, top: 580, originX: "center" } },
      { type: "text", props: { text: "Limited time only. Shop now at example.com", fontSize: 24, fontFamily: "Inter", fill: "#8892a4", fontWeight: "normal", textAlign: "center", left: 540, top: 740, originX: "center" } },
    ],
  },
  {
    id: "bold-announcement",
    name: "Bold Announcement",
    category: "Event",
    thumbnail: "",
    size: { name: "Instagram Post", width: 1080, height: 1080, category: "social" },
    backgroundColor: "#e94560",
    elements: [
      { type: "text", props: { text: "NEW\nLAUNCH", fontSize: 140, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", left: 540, top: 280, originX: "center" } },
      { type: "shape", props: { shapeType: "rect", left: 240, top: 620, width: 600, height: 4, fill: "#ffffff" } },
      { type: "text", props: { text: "MARCH 15, 2026", fontSize: 36, fontFamily: "Inter", fill: "#ffffff", fontWeight: "600", textAlign: "center", left: 540, top: 660, originX: "center" } },
      { type: "text", props: { text: "Save the date", fontSize: 24, fontFamily: "Inter", fill: "#1a1a2e", fontWeight: "normal", textAlign: "center", left: 540, top: 740, originX: "center" } },
    ],
  },
  {
    id: "gradient-social",
    name: "Gradient Social",
    category: "Social Media",
    thumbnail: "",
    size: { name: "Instagram Post", width: 1080, height: 1080, category: "social" },
    backgroundColor: "#0f3460",
    elements: [
      { type: "shape", props: { shapeType: "circle", left: 390, top: 140, radius: 150, fill: "#e94560", opacity: 0.3 } },
      { type: "shape", props: { shapeType: "circle", left: 540, top: 240, radius: 100, fill: "#0f3460", opacity: 0.5 } },
      { type: "text", props: { text: "FOLLOW US", fontSize: 80, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", left: 540, top: 440, originX: "center" } },
      { type: "text", props: { text: "@yourbrand", fontSize: 48, fontFamily: "Inter", fill: "#e94560", fontWeight: "600", textAlign: "center", left: 540, top: 580, originX: "center" } },
      { type: "text", props: { text: "Join our community for daily inspiration", fontSize: 22, fontFamily: "Inter", fill: "#8892a4", fontWeight: "normal", textAlign: "center", left: 540, top: 680, originX: "center" } },
    ],
  },
  {
    id: "youtube-thumb",
    name: "YouTube Thumbnail",
    category: "YouTube",
    thumbnail: "",
    size: { name: "YouTube Thumbnail", width: 1280, height: 720, category: "social" },
    backgroundColor: "#000000",
    elements: [
      { type: "shape", props: { shapeType: "rect", left: 0, top: 0, width: 1280, height: 720, fill: "rgba(0,0,0,0.6)" } },
      { type: "text", props: { text: "YOU WON'T\nBELIEVE THIS", fontSize: 96, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "left", left: 60, top: 200 } },
      { type: "shape", props: { shapeType: "rect", left: 60, top: 520, width: 320, height: 60, fill: "#e94560", rx: 30, ry: 30 } },
      { type: "text", props: { text: "WATCH NOW", fontSize: 28, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", left: 220, top: 535, originX: "center" } },
    ],
  },
];

export function getTemplatesByCategory(): Record<string, Template[]> {
  const grouped: Record<string, Template[]> = {};
  for (const t of BUILT_IN_TEMPLATES) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }
  return grouped;
}
