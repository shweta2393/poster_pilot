import { v4 as uuidv4 } from "uuid";
import type { PosterSize } from "@/types";
import { searchSingleImage } from "@/lib/image-search";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PosterDesignSpec {
  id: string;
  prompt: string;
  size: PosterSize;
  backgroundColor: string;
  elements: DesignElement[];
  meta: DesignMeta;
}

export interface DesignElement {
  id: string;
  kind: "text" | "shape" | "decorative" | "image";
  role:
    | "headline"
    | "subheadline"
    | "body"
    | "cta"
    | "brand"
    | "accent"
    | "divider"
    | "overlay"
    | "badge"
    | "decoration"
    | "background-image";
  props: Record<string, unknown>;
}

export interface DesignMeta {
  platform: string;
  industry: string;
  purpose: string;
  mood: string;
  palette: string[];
  topic: string;
}

// ---------------------------------------------------------------------------
// Prompt understanding — extract platform, industry, purpose, AND topic
// ---------------------------------------------------------------------------

const PLATFORM_SIZES: Record<string, PosterSize> = {
  linkedin: { name: "LinkedIn Post", width: 1200, height: 627, category: "social" },
  "linkedin banner": { name: "LinkedIn Banner", width: 1584, height: 396, category: "social" },
  instagram: { name: "Instagram Post", width: 1080, height: 1080, category: "social" },
  "instagram story": { name: "Instagram Story", width: 1080, height: 1920, category: "social" },
  "instagram reel": { name: "Instagram Story", width: 1080, height: 1920, category: "social" },
  facebook: { name: "Facebook Post", width: 1200, height: 630, category: "social" },
  "facebook cover": { name: "Facebook Cover", width: 820, height: 312, category: "social" },
  twitter: { name: "Twitter/X Post", width: 1200, height: 675, category: "social" },
  x: { name: "Twitter/X Post", width: 1200, height: 675, category: "social" },
  youtube: { name: "YouTube Thumbnail", width: 1280, height: 720, category: "social" },
  pinterest: { name: "Pinterest Pin", width: 1000, height: 1500, category: "social" },
  tiktok: { name: "TikTok Cover", width: 1080, height: 1920, category: "social" },
  poster: { name: "Poster", width: 1080, height: 1440, category: "print" },
  flyer: { name: "Flyer", width: 1080, height: 1440, category: "print" },
  a4: { name: "A4 Portrait", width: 1240, height: 1754, category: "print" },
  "web banner": { name: "Web Banner", width: 1920, height: 600, category: "web" },
};

interface IndustryProfile {
  keywords: string[];
  palettes: string[][];
  fonts: { heading: string; body: string }[];
  moods: string[];
  decorationStyle: "geometric" | "organic" | "minimal" | "bold" | "elegant";
}

const INDUSTRIES: Record<string, IndustryProfile> = {
  salon: {
    keywords: ["salon", "beauty", "hair", "spa", "nails", "makeup", "skincare", "facial", "glow", "lashes", "brow", "wax", "barber"],
    palettes: [
      ["#D4A574", "#2C1810", "#F5E6D3", "#8B6F47", "#FEFAF6"],
      ["#E8A0BF", "#1A1A2E", "#FDF0F5", "#BA6B8A", "#FFFFFF"],
      ["#C9B8A8", "#1C1C1C", "#F7F3EF", "#8A7968", "#FFFFFF"],
      ["#B76E79", "#2D2D2D", "#FFF5F5", "#E8C4C8", "#1A1A1A"],
    ],
    fonts: [
      { heading: "Georgia", body: "Arial" },
      { heading: "Palatino", body: "Helvetica" },
    ],
    moods: ["elegant", "luxurious", "warm", "inviting"],
    decorationStyle: "elegant",
  },
  coffee: {
    keywords: ["coffee", "cafe", "espresso", "latte", "cappuccino", "brew", "barista", "roast", "bean"],
    palettes: [
      ["#6F4E37", "#1A0F08", "#FFF8F0", "#D2A679", "#FFFFFF"],
      ["#3C2415", "#0F0A06", "#F5EDE4", "#A67B5B", "#FFFFFF"],
      ["#C08552", "#1C1008", "#FEF5ED", "#8B5E3C", "#2C1810"],
    ],
    fonts: [
      { heading: "Georgia", body: "Arial" },
      { heading: "Palatino", body: "Helvetica" },
    ],
    moods: ["warm", "cozy", "aromatic", "artisan"],
    decorationStyle: "organic",
  },
  restaurant: {
    keywords: ["restaurant", "food", "dining", "pizza", "burger", "sushi", "menu", "chef", "kitchen", "bistro", "bar", "grill", "bakery"],
    palettes: [
      ["#D4451A", "#1A0F0A", "#FFF8F0", "#E8B886", "#FFFFFF"],
      ["#2D5016", "#1A1A0F", "#F5F5E8", "#8CAF6B", "#FFFFFF"],
      ["#C17817", "#1C0F00", "#FFF9F0", "#E8C886", "#2C1810"],
    ],
    fonts: [
      { heading: "Georgia", body: "Arial" },
      { heading: "Impact", body: "Helvetica" },
    ],
    moods: ["warm", "appetizing", "inviting", "cozy"],
    decorationStyle: "organic",
  },
  tech: {
    keywords: ["tech", "software", "app", "startup", "saas", "cloud", "ai", "digital", "code", "data", "cyber", "blockchain", "crypto", "iot", "machine learning", "automation", "agentic"],
    palettes: [
      ["#6C5CE7", "#0A0A1A", "#F0EEFF", "#A29BFE", "#FFFFFF"],
      ["#00B4D8", "#0A0F1A", "#E8F8FF", "#48CAE4", "#FFFFFF"],
      ["#00F5D4", "#0A1A1A", "#E8FFF8", "#00BBF9", "#1A1A2E"],
    ],
    fonts: [
      { heading: "Arial", body: "Helvetica" },
      { heading: "Verdana", body: "Arial" },
    ],
    moods: ["futuristic", "innovative", "clean", "dynamic"],
    decorationStyle: "geometric",
  },
  fitness: {
    keywords: ["fitness", "gym", "workout", "training", "yoga", "crossfit", "health", "wellness", "sport", "muscle", "cardio", "exercise", "personal trainer", "pilates", "dance", "zumba", "stretch", "barre", "aerobics", "martial arts"],
    palettes: [
      ["#FF4757", "#0A0A0A", "#FFF0F0", "#FF6B81", "#FFFFFF"],
      ["#2ED573", "#0A1A0A", "#F0FFF0", "#7BED9F", "#1A1A1A"],
      ["#FFA502", "#0A0A0A", "#FFF8F0", "#FFBE76", "#1A1A1A"],
      ["#C9B8A8", "#1C1C1C", "#F7F3EF", "#D4C5B9", "#FFFFFF"],
    ],
    fonts: [
      { heading: "Impact", body: "Arial" },
      { heading: "Arial", body: "Helvetica" },
      { heading: "Georgia", body: "Helvetica" },
    ],
    moods: ["energetic", "bold", "powerful", "motivational", "mindful", "balanced"],
    decorationStyle: "bold",
  },
  fashion: {
    keywords: ["fashion", "clothing", "wear", "style", "boutique", "designer", "apparel", "collection", "trend", "outfit", "wardrobe", "luxury", "brand"],
    palettes: [
      ["#C0A36E", "#0F0F0F", "#FAFAFA", "#8A7968", "#FFFFFF"],
      ["#D4A574", "#1A1A1A", "#F5F0E8", "#8B6F47", "#FFFFFF"],
      ["#C17817", "#121212", "#FFFFF0", "#E8D5B5", "#FFFFFF"],
    ],
    fonts: [
      { heading: "Georgia", body: "Helvetica" },
      { heading: "Palatino", body: "Arial" },
    ],
    moods: ["chic", "sophisticated", "trendy", "minimal"],
    decorationStyle: "minimal",
  },
  realestate: {
    keywords: ["real estate", "property", "home", "house", "apartment", "rent", "buy", "listing", "mortgage", "realtor", "condo", "villa"],
    palettes: [
      ["#1B3A5C", "#0A1628", "#F0F4F8", "#C0A36E", "#FFFFFF"],
      ["#2C5530", "#0A1A0F", "#F0F5F0", "#C0A36E", "#FFFFFF"],
    ],
    fonts: [
      { heading: "Georgia", body: "Arial" },
      { heading: "Palatino", body: "Helvetica" },
    ],
    moods: ["professional", "trustworthy", "premium", "established"],
    decorationStyle: "elegant",
  },
  education: {
    keywords: ["education", "course", "learn", "school", "university", "workshop", "tutor", "academy", "study", "online course", "bootcamp", "certification"],
    palettes: [
      ["#4A90D9", "#1A2A3A", "#F0F5FF", "#7BB3E0", "#FFFFFF"],
      ["#6C5CE7", "#1A1A2E", "#F5F0FF", "#A29BFE", "#FFFFFF"],
    ],
    fonts: [
      { heading: "Georgia", body: "Arial" },
      { heading: "Verdana", body: "Helvetica" },
    ],
    moods: ["inspiring", "professional", "trustworthy", "warm"],
    decorationStyle: "geometric",
  },
  music: {
    keywords: ["music", "band", "dj", "live music", "acoustic", "singer", "musician", "album", "song", "hip hop", "jazz", "rock", "pop music", "rap"],
    palettes: [
      ["#C9B8A8", "#1A1610", "#F5EDE3", "#8B7D6B", "#FFFFFF"],
      ["#E8C886", "#1A1208", "#FFF9EC", "#C9A84C", "#FFFFFF"],
      ["#A08060", "#0F0D0A", "#F5F0E8", "#C4A882", "#FFFFFF"],
    ],
    fonts: [
      { heading: "Georgia", body: "Helvetica" },
      { heading: "Palatino", body: "Arial" },
    ],
    moods: ["soulful", "warm", "vintage", "intimate"],
    decorationStyle: "elegant",
  },
  event: {
    keywords: ["event", "concert", "festival", "party", "conference", "meetup", "launch", "celebration", "gala", "webinar", "seminar", "summit"],
    palettes: [
      ["#E94560", "#0A0A1A", "#FFF0F3", "#FF6B81", "#FFFFFF"],
      ["#F39C12", "#1A0A00", "#FFF8E8", "#FFBE76", "#1A1A2E"],
      ["#9B59B6", "#0A0A1A", "#F8F0FF", "#D6A4E8", "#FFFFFF"],
    ],
    fonts: [
      { heading: "Impact", body: "Arial" },
      { heading: "Georgia", body: "Helvetica" },
    ],
    moods: ["exciting", "vibrant", "bold", "energetic"],
    decorationStyle: "bold",
  },
  generic: {
    keywords: [],
    palettes: [
      ["#E94560", "#1A1A2E", "#F0F0F5", "#0F3460", "#FFFFFF"],
      ["#6C5CE7", "#1A1A2E", "#F5F0FF", "#A29BFE", "#FFFFFF"],
      ["#00B894", "#1A2E28", "#F0FFF8", "#55EFC4", "#FFFFFF"],
    ],
    fonts: [
      { heading: "Arial", body: "Helvetica" },
      { heading: "Georgia", body: "Arial" },
    ],
    moods: ["professional", "modern", "clean", "impactful"],
    decorationStyle: "geometric",
  },
};

// ---------------------------------------------------------------------------
// Prompt parsing — extracts platform, industry, purpose, topic, and style
// ---------------------------------------------------------------------------

function detectPlatform(prompt: string): PosterSize {
  const lower = prompt.toLowerCase();
  for (const [key, size] of Object.entries(PLATFORM_SIZES)) {
    if (lower.includes(key)) return size;
  }
  return PLATFORM_SIZES.instagram;
}

function detectIndustry(prompt: string): [string, IndustryProfile] {
  const lower = prompt.toLowerCase();
  // Score each industry by keyword match length (prefer more specific matches)
  let bestMatch: [string, IndustryProfile] | null = null;
  let bestScore = 0;
  for (const [name, profile] of Object.entries(INDUSTRIES)) {
    if (name === "generic") continue;
    for (const kw of profile.keywords) {
      if (lower.includes(kw) && kw.length > bestScore) {
        bestScore = kw.length;
        bestMatch = [name, profile];
      }
    }
  }
  return bestMatch || ["generic", INDUSTRIES.generic];
}

function detectPurpose(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("review")) return "review";
  if (lower.includes("advertis") || lower.includes("promot") || lower.includes("ad ") || lower.includes("marketing"))
    return "advertising";
  if (lower.includes("announce") || lower.includes("launch")) return "announcement";
  if (lower.includes("sale") || lower.includes("discount") || lower.includes("offer")) return "promotion";
  if (lower.includes("event") || lower.includes("invite") || lower.includes("webinar")) return "event";
  if (lower.includes("hiring") || lower.includes("job") || lower.includes("recruit")) return "hiring";
  if (lower.includes("tutorial") || lower.includes("how to") || lower.includes("guide")) return "tutorial";
  return "advertising";
}

/**
 * Extract the real subject being advertised. For "create poster for linkedin
 * advertising my hair salon with bold and edgy image" we want "My Hair Salon"
 * — NOT "hair salon with bold and edgy image".
 */
function extractSubject(prompt: string, industryName: string): string {
  const lower = prompt.toLowerCase();

  // Try to grab the subject after intent keywords
  const patterns = [
    /(?:advertis\w*|promot\w*|marketing|announcing)\s+(?:my|our|the|a|an)\s+(.+?)(?:\s+(?:with|using|in|on|featuring|that|which|and)\s+|$)/i,
    /(?:advertis\w*|promot\w*|marketing|announcing)\s+(.+?)(?:\s+(?:with|using|in|on|featuring|that|which|and)\s+|$)/i,
    /(?:my|our)\s+(.+?)(?:\s+(?:with|using|in|on|featuring|that|which|and)\s+|$)/i,
  ];

  for (const pat of patterns) {
    const match = lower.match(pat);
    if (match && match[1]) {
      let subject = match[1].trim();
      // Remove trailing platform words
      subject = subject.replace(/\b(linkedin|instagram|facebook|twitter|youtube|pinterest|tiktok)\b/gi, "").trim();
      subject = subject.replace(/\b(flash sale|sale|discount|offer|promotion|advertising|review|tutorial)\b/gi, "").replace(/\s+at\s*$/i, "").replace(/\s+/g, " ").trim();
      if (subject.length > 2) return capitalize(subject);
    }
  }

  // Fallback: use industry name as subject
  const industryLabels: Record<string, string> = {
    coffee: "My Coffee Cafe", salon: "My Salon", restaurant: "My Restaurant",
    tech: "Technology", fitness: "My Studio", fashion: "My Brand",
    realestate: "Dream Properties", education: "Our Courses",
    event: "This Event", music: "Live Music Night", generic: "Our Brand",
  };
  return industryLabels[industryName] || "Our Brand";
}

function capitalize(s: string): string {
  return s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Industry-specific content generation
// ---------------------------------------------------------------------------

interface TopicContent {
  headline: string;
  subheadline: string;
  bulletPoints: string[];
  cta: string;
  bodyText: string;
  badge: string;
}

type ContentGen = (subject: string, purpose: string) => TopicContent;

const CONTENT_GENERATORS: Record<string, ContentGen> = {
  coffee: (subject, purpose) => {
    const headlines = [
      "Brewed To\nPerfection",
      "Life Begins\nAfter Coffee",
      "Your Perfect\nCup Awaits",
      "Sip, Savor,\nRepeat",
      "Crafted With\nPassion",
      "Wake Up &\nSmell The Coffee",
    ];
    const subs = [
      `${subject} — where every cup tells a story`,
      `Handcrafted coffee & warm vibes at ${subject}`,
      `Start your day right at ${subject}`,
    ];
    const bullets = shuffle([
      "Single-Origin & Specialty Beans",
      "Handcrafted Espresso Drinks",
      "Freshly Baked Pastries Daily",
      "Cozy Atmosphere & Free WiFi",
      "Seasonal Specials & Cold Brews",
      "Locally Roasted, Ethically Sourced",
      "Oat, Almond & Soy Milk Options",
      "Loyalty Card — 10th Coffee Free",
    ]).slice(0, 4);
    const ctas = ["Visit Us Today", "Order Now", "Grab Your Cup", "Find Us Here"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `${subject} • Freshly Roasted • Brewed With Love`,
      badge: purpose === "promotion" ? "SPECIAL BREW" : "COFFEE & MORE",
    };
  },

  salon: (subject, purpose) => {
    const headlines = [
      "Your Beauty\nIs Our Art",
      "Glow Like\nNever Before",
      "Because You\nDeserve Beautiful",
      "Transform\nYour Look Today",
      "Where Style\nMeets Elegance",
      "Pamper Yourself,\nYou've Earned It",
      "Beauty Starts\nHere",
    ];
    const subs = [
      `${subject} — where every visit is a transformation`,
      `Premium styling & care at ${subject}`,
      `Experience luxury beauty services tailored to you`,
      `Treat yourself to the best at ${subject}`,
    ];
    const bullets = shuffle([
      "Expert Stylists & Colorists",
      "Premium Hair & Skincare Products",
      "Relaxing Spa-Like Atmosphere",
      "Walk-ins Welcome | Online Booking",
      "Bridal & Special Event Packages",
      "20% Off Your First Visit",
      "Cuts • Color • Blowouts • Treatments",
      "Trusted by 5,000+ Happy Clients",
    ]).slice(0, 4);
    const ctas = ["Book Now", "Visit Us Today", "Claim Your Offer", "Schedule Appointment"];
    const footers = [
      `${subject} • Premium Beauty Services`,
      `Expert Stylists • Premium Products • Relaxing Vibes`,
      `Walk-ins Welcome | ${subject}`,
    ];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: pick(footers),
      badge: purpose === "promotion" ? "SPECIAL OFFER" : "BEAUTY & STYLE",
    };
  },

  restaurant: (subject, purpose) => {
    const headlines = [
      "Taste The\nDifference",
      "A Feast For\nEvery Sense",
      "Savor Every\nBite",
      "Fresh Flavors,\nCrafted Daily",
      "Where Food\nBecomes Art",
      "Dine With\nPassion",
    ];
    const subs = [
      `${subject} — handcrafted dishes, unforgettable flavors`,
      `Farm-to-table cuisine at ${subject}`,
      `Every meal tells a story at ${subject}`,
    ];
    const bullets = shuffle([
      "Fresh, Locally Sourced Ingredients",
      "Award-Winning Chef & Kitchen",
      "Cozy Ambiance & Great Company",
      "Dine-in • Takeout • Delivery",
      "Reservations Now Open",
      "Happy Hour Specials Daily",
      "Private Dining Available",
      "New Seasonal Menu Out Now",
    ]).slice(0, 4);
    const ctas = ["Reserve a Table", "Order Now", "View Menu", "Dine With Us"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `${subject} • Fresh Daily • Made With Love`,
      badge: purpose === "promotion" ? "LIMITED OFFER" : "DINE WITH US",
    };
  },

  tech: (subject, purpose) => {
    if (purpose === "review") {
      const headlines = [
        "HONEST\nREVIEW",
        "IS IT WORTH\nTHE HYPE?",
        "THE TRUTH\nABOUT THIS",
        "FULL REVIEW\nINSIDE",
        "WATCH BEFORE\nYOU BUY",
        "TESTED &\nRATED",
      ];
      const subs = [
        `Everything you need to know about ${subject.toLowerCase()}`,
        `An unbiased deep-dive into ${subject.toLowerCase()}`,
        `We tested it so you don't have to — ${subject.toLowerCase()}`,
      ];
      const bullets = shuffle([
        "Performance & Speed Tested",
        "Build Quality & Design Rated",
        "Real-World Usage Results",
        "Value For Money Verdict",
        "Pros & Cons Breakdown",
        "Compared vs. Competition",
        "Who Should Buy This?",
        "Final Score Revealed",
      ]).slice(0, 4);
      return {
        headline: pick(headlines),
        subheadline: pick(subs),
        bulletPoints: bullets,
        cta: "Watch Now",
        bodyText: `Honest Reviews • No Sponsorship • Real Results`,
        badge: "FULL PRODUCT REVIEW",
      };
    }

    // Detect specific tech topics for better content
    const sl = subject.toLowerCase();
    const isAI = sl.includes("ai") || sl.includes("agentic") || sl.includes("machine learning") || sl.includes("automation");

    if (isAI) {
      const headlines = [
        "Smarter Decisions,\nAutonomous Action",
        "From Automation\nTo Autonomy",
        "AI That Acts,\nNot Just Thinks",
        "The Future of\nIntelligent Work",
        "Autonomous AI\nFor Real Results",
        "Intelligence\nThat Delivers",
      ];
      const subs = [
        "Agentic AI goes beyond chatbots — it reasons, decides, and acts on your behalf",
        "From intelligent automation to fully autonomous decision-making",
        "Transform your workflow with AI agents that think, plan, and execute",
      ];
      const bullets = shuffle([
        "Autonomous Decision-Making",
        "Real-Time Data Processing",
        "Self-Learning & Adaptive Systems",
        "Seamless Workflow Integration",
        "Reduce Manual Work by 80%",
        "Dynamic Pricing & Smart Actions",
        "Enterprise-Grade Security",
        "Scale Without Adding Headcount",
        "24/7 Intelligent Operations",
        "From Insight to Action — Instantly",
      ]).slice(0, 4);
      const ctas = ["Get Started", "Book a Demo", "Learn More", "See It Live"];
      return {
        headline: pick(headlines),
        subheadline: pick(subs),
        bulletPoints: bullets,
        cta: pick(ctas),
        bodyText: `Trusted by 10,000+ Companies • Enterprise AI`,
        badge: "THE FUTURE OF AI",
      };
    }

    // Generic tech
    const headlines = [
      "Build Faster,\nShip Smarter",
      "Technology That\nJust Works",
      "Innovate Without\nLimits",
      "Your Stack,\nSupercharged",
    ];
    const subs = [
      `${subject} — the platform modern teams rely on`,
      `See why developers love ${subject.toLowerCase()}`,
      `Powerful, reliable, built for scale`,
    ];
    const bullets = shuffle([
      "Lightning-Fast Performance",
      "99.99% Uptime Guarantee",
      "Developer-Friendly APIs",
      "Secure & Compliant",
      "Scales to Millions of Users",
      "14-Day Free Trial",
      "World-Class Support Team",
      "Integrates With Your Stack",
    ]).slice(0, 4);
    const ctas = ["Start Free Trial", "Get Started", "Learn More", "Try It Free"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `${subject} • Fast • Secure • Scalable`,
      badge: "TECHNOLOGY",
    };
  },

  fitness: (subject, purpose) => {
    const sl = subject.toLowerCase();
    const isMindful = sl.includes("pilates") || sl.includes("yoga") || sl.includes("stretch") || sl.includes("barre") || sl.includes("meditation");

    const headlines = isMindful
      ? [
          "Feel The\nStretch",
          "Strengthen\nYour Soul",
          "Flow Into\nBalance",
          "Mind, Body\n& Breath",
          "Find Your\nCenter",
        ]
      : [
          "UNLEASH\nYOUR POWER",
          "STRONGER\nEVERY DAY",
          "NO LIMITS,\nNO EXCUSES",
          "TRANSFORM\nYOUR BODY",
          "YOUR FITNESS\nJOURNEY\nSTARTS HERE",
        ];
    const subs = isMindful
      ? [
          `${subject} — for all levels, all bodies`,
          `Restore balance and build strength at ${subject}`,
          `Your journey to a healthier you starts here`,
        ]
      : [
          `${subject} — transform your body and mind`,
          `Push beyond your limits with expert guidance`,
          `Where dedication meets real results`,
        ];
    const bullets = shuffle(
      isMindful
        ? [
            "Classes for All Levels",
            "Certified Instructors",
            "Small Group Sessions",
            "Morning & Evening Slots",
            "First Class Free",
            "Strengthen & Tone",
            "Breathwork & Mindfulness",
            "Flexible Scheduling",
          ]
        : [
            "State-of-the-Art Equipment",
            "Certified Personal Trainers",
            "Group Classes & HIIT Sessions",
            "Nutrition Plans Included",
            "24/7 Gym Access",
            "First Month FREE",
            "Locker Rooms & Sauna",
            "Custom Workout Programs",
          ]
    ).slice(0, 4);
    const ctas = isMindful
      ? ["Book a Class", "Try Free", "Join Us", "Start Today"]
      : ["Join Now", "Start Training", "Claim Free Trial", "Get Fit Today"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: isMindful
        ? `${subject} • Balance • Breathe • Grow`
        : `${subject} • Train Hard • Win Big`,
      badge: purpose === "promotion" ? "SPECIAL OFFER" : (isMindful ? "FOR ALL LEVELS" : "FITNESS & STRENGTH"),
    };
  },

  fashion: (subject, purpose) => {
    const headlines = [
      "NEW\nCOLLECTION",
      "REDEFINE\nYOUR STYLE",
      "TIMELESS\nELEGANCE",
      "WEAR YOUR\nCONFIDENCE",
      "DRESS THE\nPART",
    ];
    const subs = [
      `Curated pieces at ${subject} for the modern you`,
      `Where style meets substance — ${subject}`,
      `Discover your signature look at ${subject}`,
    ];
    const bullets = shuffle([
      "Handcrafted & Sustainable",
      "New Arrivals Every Week",
      "Free Shipping Over $100",
      "Members Get Early Access",
      "Limited Edition Pieces",
      "Premium Fabrics & Quality",
      "Easy Returns & Exchanges",
      "Style Consultation Available",
    ]).slice(0, 4);
    const ctas = ["Shop Now", "Explore Collection", "Pre-Order", "Get The Look"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `${subject} • Handcrafted • Timeless`,
      badge: purpose === "promotion" ? "SALE" : "NEW COLLECTION",
    };
  },

  realestate: (subject, purpose) => {
    const headlines = [
      "Find Your\nDream Home",
      "Your Next\nChapter Awaits",
      "Live Where\nYou Love",
      "Luxury Living\nRedefined",
    ];
    const subs = [
      `Premium properties curated by ${subject}`,
      `Expert guidance for life's biggest investment`,
      `Trusted by thousands of happy homeowners`,
    ];
    const bullets = shuffle([
      "500+ Properties Listed",
      "Expert Real Estate Agents",
      "Virtual Tours Available",
      "Mortgage Pre-Approval Help",
      "Neighborhoods You'll Love",
      "Seamless Buying Process",
      "Investment Properties",
      "First-Time Buyer Programs",
    ]).slice(0, 4);
    const ctas = ["View Listings", "Book a Tour", "Contact Agent", "Explore Now"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `${subject} • Trusted • Premium • Local`,
      badge: "REAL ESTATE",
    };
  },

  education: (subject, purpose) => {
    const headlines = [
      "Learn Without\nLimits",
      "Shape Your\nFuture",
      "Knowledge\nIs Power",
      "Unlock Your\nPotential",
    ];
    const subs = [
      `Expert-led courses at ${subject} for every level`,
      `Transform your career with world-class education`,
      `Join thousands of learners at ${subject}`,
    ];
    const bullets = shuffle([
      "100+ Expert-Led Courses",
      "Industry-Recognized Certificates",
      "Flexible Self-Paced Learning",
      "Community & Mentorship",
      "Hands-On Projects Included",
      "Career Support & Placement",
      "Lifetime Course Access",
      "30-Day Money-Back Guarantee",
    ]).slice(0, 4);
    const ctas = ["Enroll Now", "Start Learning", "Join Free", "Apply Today"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `${subject} • Learn • Grow • Succeed`,
      badge: "EDUCATION",
    };
  },

  event: (subject, purpose) => {
    const headlines = [
      "YOU'RE\nINVITED",
      "DON'T\nMISS OUT",
      "SAVE THE\nDATE",
      "THE EVENT\nOF THE YEAR",
      "JOIN US\nLIVE",
    ];
    const subs = [
      `${subject} — an experience you won't forget`,
      `Limited spots available — register for ${subject} now`,
      `Be part of something unforgettable`,
    ];
    const bullets = shuffle([
      "Live Performances & Speakers",
      "Networking Opportunities",
      "Food & Drinks Included",
      "VIP & Early Access Tickets",
      "Interactive Workshops",
      "Limited Capacity — Act Fast",
      "Meet Industry Leaders",
      "Exclusive After-Party",
    ]).slice(0, 4);
    const ctas = ["Register Now", "Get Tickets", "RSVP Today", "Save My Spot"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `March 2026 • 7 PM • City Convention Center`,
      badge: "UPCOMING EVENT",
    };
  },

  generic: (subject, purpose) => {
    const headlines = [
      "Stand Out\nFrom The Crowd",
      "Make Your\nMark",
      "Bold Ideas,\nReal Impact",
      "Elevate\nEverything",
    ];
    const subs = [
      `${subject} — delivering excellence, every time`,
      `See why people trust ${subject}`,
      `Quality and innovation at ${subject}`,
    ];
    const bullets = shuffle([
      "Proven Track Record",
      "Trusted by Thousands",
      "Quality You Can Count On",
      "Exceptional Customer Service",
      "Competitive Pricing",
      "Fast & Reliable",
      "Industry-Leading Standards",
      "Satisfaction Guaranteed",
    ]).slice(0, 4);
    const ctas = ["Learn More", "Get Started", "Contact Us", "Discover More"];
    return {
      headline: pick(headlines),
      subheadline: pick(subs),
      bulletPoints: bullets,
      cta: pick(ctas),
      bodyText: `${subject} • Quality • Trust • Results`,
      badge: purpose.toUpperCase(),
    };
  },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Music content generator
CONTENT_GENERATORS.music = (subject, purpose) => {
  const headlines = [
    "Live\nMUSIC",
    "Feel The\nRhythm",
    "The Sound\nOf Soul",
    "Unplug &\nListen",
    "One Night\nOnly",
    "Music That\nMoves You",
  ];
  const subs = [
    `${subject} — an unforgettable night of live sound`,
    `Experience the magic of live performance at ${subject}`,
    `Let the music take you somewhere beautiful`,
  ];
  const bullets = shuffle([
    "Live Acoustic Performances",
    "Special Guest Artists",
    "Intimate Venue Setting",
    "Food & Craft Drinks Available",
    "Doors Open at 7 PM",
    "Limited Seating — Book Early",
    "Meet & Greet After Show",
    "Original & Classic Covers",
  ]).slice(0, 4);
  const ctas = ["Get Tickets", "Reserve Now", "Listen Live", "Join Us"];
  return {
    headline: pick(headlines),
    subheadline: pick(subs),
    bulletPoints: bullets,
    cta: pick(ctas),
    bodyText: `${subject} • Live Sound • Real Music`,
    badge: "LIVE MUSIC",
  };
};

// ---------------------------------------------------------------------------
// Curated background images per industry (Unsplash, CORS-friendly)
// ---------------------------------------------------------------------------

const INDUSTRY_IMAGES: Record<string, string[]> = {
  coffee: [
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80&fit=crop",
  ],
  salon: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80&fit=crop",
  ],
  restaurant: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&fit=crop",
  ],
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&fit=crop",
  ],
  fitness: [
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&fit=crop",
  ],
  pilates: [
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80&fit=crop",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80&fit=crop",
  ],
  realestate: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&fit=crop",
  ],
  education: [
    "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&q=80&fit=crop",
  ],
  music: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80&fit=crop",
  ],
  event: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&fit=crop",
  ],
  generic: [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80&fit=crop",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80&fit=crop",
  ],
};

function getStaticIndustryImage(industryName: string, prompt?: string): string {
  const lower = (prompt || "").toLowerCase();
  if (industryName === "fitness" && (lower.includes("pilates") || lower.includes("yoga") || lower.includes("stretch") || lower.includes("meditation"))) {
    return pick(INDUSTRY_IMAGES.pilates);
  }
  const images = INDUSTRY_IMAGES[industryName] || INDUSTRY_IMAGES.generic;
  return pick(images);
}

async function getRelevantImage(industryName: string, prompt: string): Promise<string> {
  try {
    const dynamicUrl = await searchSingleImage(prompt);
    if (dynamicUrl) return dynamicUrl;
  } catch {
    // fall through to static
  }
  return getStaticIndustryImage(industryName, prompt);
}

function generateContent(
  subject: string,
  purpose: string,
  industryName: string
): TopicContent {
  const gen = CONTENT_GENERATORS[industryName] || CONTENT_GENERATORS.generic;
  return gen(subject, purpose);
}

// ---------------------------------------------------------------------------
// Text height estimation for anti-overlap layout
// ---------------------------------------------------------------------------

function estimateTextHeight(
  text: string,
  fontSize: number,
  maxWidth: number,
  lineHeight = 1.2
): number {
  const lines = text.split("\n");
  let totalLines = 0;

  for (const line of lines) {
    // Use 0.62 as average char width factor (safe for serif fonts like Georgia)
    const avgCharWidth = fontSize * 0.62;
    const charsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));
    const wrappedLines = Math.max(1, Math.ceil(line.length / charsPerLine));
    totalLines += wrappedLines;
  }

  // Add 15% safety margin to account for font metrics, descenders, etc.
  return totalLines * fontSize * lineHeight * 1.15;
}

// ---------------------------------------------------------------------------
// Layout generators — collision-free stacking
// ---------------------------------------------------------------------------

type LayoutFn = (
  size: PosterSize,
  palette: string[],
  font: { heading: string; body: string },
  content: TopicContent,
  decorationStyle: string
) => DesignElement[];

/**
 * Centered layout with proper vertical stacking. Uses a Y cursor that
 * advances after every element so nothing overlaps.
 */
const layoutCenterStack: LayoutFn = (size, palette, font, content, decoStyle) => {
  const w = size.width;
  const h = size.height;
  const elements: DesignElement[] = [];
  const accent = palette[0];
  const dark = palette[1];
  const secondary = palette[3];
  const textColor = "#FFFFFF";

  const pad = w * 0.08;
  const textArea = w - pad * 2;
  const gap = h * 0.035;

  // Decoration circles (background, won't affect stacking)
  if (decoStyle === "geometric") {
    elements.push({
      id: uuidv4(), kind: "decorative", role: "decoration",
      props: { shapeType: "circle", left: w * 0.72, top: -h * 0.05, radius: w * 0.16, fill: accent, opacity: 0.10 },
    });
    elements.push({
      id: uuidv4(), kind: "decorative", role: "decoration",
      props: { shapeType: "circle", left: -w * 0.06, top: h * 0.75, radius: w * 0.12, fill: secondary, opacity: 0.08 },
    });
  } else if (decoStyle === "bold") {
    elements.push({
      id: uuidv4(), kind: "shape", role: "accent",
      props: { shapeType: "rect", left: 0, top: 0, width: w * 0.025, height: h, fill: accent, opacity: 0.85 },
    });
  }

  // Industry-themed decorative shapes
  if (decoStyle === "elegant") {
    // Elegant arched shapes for salon/realestate
    elements.push({
      id: uuidv4(), kind: "decorative", role: "decoration",
      props: { shapeType: "circle", left: w * 0.5, top: -h * 0.35, radius: w * 0.4, fill: accent, opacity: 0.06 },
    });
    elements.push({
      id: uuidv4(), kind: "shape", role: "decoration",
      props: { shapeType: "rect", left: w * 0.04, top: h * 0.04, width: w * 0.92, height: h * 0.92, fill: "transparent", stroke: accent, strokeWidth: 2, opacity: 0.15, rx: 16, ry: 16 },
    });
  } else if (decoStyle === "organic") {
    // Warm organic shapes for restaurant
    elements.push({
      id: uuidv4(), kind: "decorative", role: "decoration",
      props: { shapeType: "circle", left: w * 0.75, top: h * 0.7, radius: w * 0.2, fill: accent, opacity: 0.08 },
    });
    elements.push({
      id: uuidv4(), kind: "decorative", role: "decoration",
      props: { shapeType: "circle", left: -w * 0.05, top: -h * 0.05, radius: w * 0.15, fill: secondary, opacity: 0.06 },
    });
  } else if (decoStyle === "minimal") {
    // Clean lines for fashion
    elements.push({
      id: uuidv4(), kind: "shape", role: "decoration",
      props: { shapeType: "rect", left: w * 0.05, top: h * 0.05, width: w * 0.9, height: h * 0.9, fill: "transparent", stroke: accent, strokeWidth: 1, opacity: 0.2 },
    });
  }

  // --- Vertical stacking cursor ---
  let cursor = h * 0.07;

  // Badge
  const badgeFontSize = Math.round(Math.min(w * 0.018, h * 0.025));
  elements.push({
    id: uuidv4(), kind: "text", role: "badge",
    props: {
      text: content.badge,
      fontSize: badgeFontSize,
      fontFamily: font.body,
      fill: accent,
      fontWeight: "bold",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center", opacity: 0.85,
    },
  });
  cursor += estimateTextHeight(content.badge, badgeFontSize, textArea) + gap;

  // Headline
  const headlineFontSize = Math.round(Math.min(w * 0.07, h * 0.09));
  elements.push({
    id: uuidv4(), kind: "text", role: "headline",
    props: {
      text: content.headline,
      fontSize: headlineFontSize,
      fontFamily: font.heading,
      fill: textColor,
      fontWeight: "bold",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center",
      lineHeight: 1.15,
    },
  });
  cursor += estimateTextHeight(content.headline, headlineFontSize, textArea, 1.15) + gap;

  // Divider
  const divW = w * 0.12;
  elements.push({
    id: uuidv4(), kind: "shape", role: "divider",
    props: { shapeType: "rect", left: w / 2 - divW / 2, top: cursor, width: divW, height: 3, fill: accent, opacity: 0.6 },
  });
  cursor += 3 + gap;

  // Subheadline
  const subFontSize = Math.round(Math.min(w * 0.022, h * 0.032));
  elements.push({
    id: uuidv4(), kind: "text", role: "subheadline",
    props: {
      text: content.subheadline,
      fontSize: subFontSize,
      fontFamily: font.body,
      fill: "rgba(255,255,255,0.75)",
      fontWeight: "normal",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center",
    },
  });
  cursor += estimateTextHeight(content.subheadline, subFontSize, textArea * 0.85) + gap * 0.8;

  // Bullet points
  const bulletFontSize = Math.round(Math.min(w * 0.019, h * 0.026));
  const bulletText = content.bulletPoints.map((b) => `•  ${b}`).join("\n");
  elements.push({
    id: uuidv4(), kind: "text", role: "body",
    props: {
      text: bulletText,
      fontSize: bulletFontSize,
      fontFamily: font.body,
      fill: "rgba(255,255,255,0.7)",
      fontWeight: "normal",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center",
      lineHeight: 1.6,
      opacity: 0.85,
    },
  });
  cursor += estimateTextHeight(bulletText, bulletFontSize, textArea, 1.6) + gap;

  // CTA button
  const ctaFontSize = Math.round(Math.min(w * 0.022, h * 0.03));
  const ctaW = Math.max(w * 0.28, ctaFontSize * content.cta.length * 0.7);
  const ctaH = ctaFontSize * 2.5;
  elements.push({
    id: uuidv4(), kind: "shape", role: "cta",
    props: {
      shapeType: "rect",
      left: w / 2 - ctaW / 2, top: cursor,
      width: ctaW, height: ctaH,
      fill: accent,
      rx: ctaH / 2, ry: ctaH / 2,
    },
  });
  elements.push({
    id: uuidv4(), kind: "text", role: "cta",
    props: {
      text: content.cta,
      fontSize: ctaFontSize,
      fontFamily: font.body,
      fill: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "center",
      left: w / 2, top: cursor + ctaH * 0.28,
      originX: "center",
    },
  });
  cursor += ctaH + gap;

  // Footer body text
  const footerFontSize = Math.round(Math.min(w * 0.016, h * 0.02));
  elements.push({
    id: uuidv4(), kind: "text", role: "body",
    props: {
      text: content.bodyText,
      fontSize: footerFontSize,
      fontFamily: font.body,
      fill: "rgba(255,255,255,0.45)",
      fontWeight: "normal",
      textAlign: "center",
      left: w / 2,
      top: Math.min(cursor, h - footerFontSize * 3),
      originX: "center",
      opacity: 0.55,
    },
  });

  return elements;
};

/**
 * Split layout: colored left panel + content on the right.
 * Right-side content stacks with a cursor.
 */
const layoutSplitStack: LayoutFn = (size, palette, font, content, decoStyle) => {
  const w = size.width;
  const h = size.height;
  const elements: DesignElement[] = [];
  const accent = palette[0];
  const dark = palette[1];
  const secondary = palette[3];
  const textColor = "#FFFFFF";
  const splitX = w * 0.38;

  // Left colored panel
  elements.push({
    id: uuidv4(), kind: "shape", role: "accent",
    props: { shapeType: "rect", left: 0, top: 0, width: splitX, height: h, fill: accent, opacity: 1 },
  });

  // Decorative circle on left panel
  elements.push({
    id: uuidv4(), kind: "decorative", role: "decoration",
    props: { shapeType: "circle", left: splitX * 0.5, top: h * 0.3, radius: splitX * 0.35, fill: dark, opacity: 0.10 },
  });

  // Additional decorative elements on the left panel
  elements.push({
    id: uuidv4(), kind: "decorative", role: "decoration",
    props: { shapeType: "circle", left: splitX * 0.15, top: h * 0.65, radius: splitX * 0.2, fill: "#FFFFFF", opacity: 0.06 },
  });
  elements.push({
    id: uuidv4(), kind: "decorative", role: "decoration",
    props: { shapeType: "rect", left: splitX * 0.1, top: h * 0.12, width: splitX * 0.04, height: h * 0.3, fill: "#FFFFFF", opacity: 0.08, rx: 4, ry: 4 },
  });

  // Brand label on left panel
  const brandFontSize = Math.round(Math.min(w * 0.016, h * 0.025));
  elements.push({
    id: uuidv4(), kind: "text", role: "brand",
    props: {
      text: content.badge,
      fontSize: brandFontSize,
      fontFamily: font.body,
      fill: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "center",
      left: splitX / 2, top: h * 0.08,
      originX: "center",
      opacity: 0.9,
    },
  });

  // --- Right-side stacking ---
  const rightPad = w * 0.05;
  const rightX = splitX + rightPad;
  const rightW = w - splitX - rightPad * 2;
  let cursor = h * 0.1;
  const gap = h * 0.035;

  // Headline
  const headlineFontSize = Math.round(Math.min(w * 0.055, h * 0.085));
  elements.push({
    id: uuidv4(), kind: "text", role: "headline",
    props: {
      text: content.headline,
      fontSize: headlineFontSize,
      fontFamily: font.heading,
      fill: textColor,
      fontWeight: "bold",
      textAlign: "left",
      left: rightX, top: cursor,
      lineHeight: 1.15,
      maxWidth: rightW,
    },
  });
  cursor += estimateTextHeight(content.headline, headlineFontSize, rightW, 1.15) + gap * 0.6;

  // Divider
  elements.push({
    id: uuidv4(), kind: "shape", role: "divider",
    props: { shapeType: "rect", left: rightX, top: cursor, width: w * 0.10, height: 4, fill: accent },
  });
  cursor += 4 + gap;

  // Subheadline
  const subFontSize = Math.round(Math.min(w * 0.02, h * 0.028));
  elements.push({
    id: uuidv4(), kind: "text", role: "subheadline",
    props: {
      text: content.subheadline,
      fontSize: subFontSize,
      fontFamily: font.body,
      fill: "rgba(255,255,255,0.75)",
      fontWeight: "normal",
      textAlign: "left",
      left: rightX, top: cursor,
      maxWidth: rightW,
    },
  });
  cursor += estimateTextHeight(content.subheadline, subFontSize, rightW) + gap;

  // Bullet points
  const bulletFontSize = Math.round(Math.min(w * 0.017, h * 0.023));
  const bulletText = content.bulletPoints.map((b) => `•  ${b}`).join("\n");
  elements.push({
    id: uuidv4(), kind: "text", role: "body",
    props: {
      text: bulletText,
      fontSize: bulletFontSize,
      fontFamily: font.body,
      fill: "rgba(255,255,255,0.7)",
      fontWeight: "normal",
      textAlign: "left",
      left: rightX, top: cursor,
      lineHeight: 1.55,
      opacity: 0.8,
      maxWidth: rightW,
    },
  });
  cursor += estimateTextHeight(bulletText, bulletFontSize, rightW, 1.55) + gap;

  // CTA button
  const ctaFontSize = Math.round(Math.min(w * 0.02, h * 0.028));
  const ctaW = Math.max(w * 0.22, ctaFontSize * content.cta.length * 0.65);
  const ctaH = ctaFontSize * 2.4;
  const ctaTop = Math.min(cursor, h - ctaH - h * 0.06);
  elements.push({
    id: uuidv4(), kind: "shape", role: "cta",
    props: {
      shapeType: "rect", left: rightX, top: ctaTop,
      width: ctaW, height: ctaH, fill: accent,
      rx: 6, ry: 6,
    },
  });
  elements.push({
    id: uuidv4(), kind: "text", role: "cta",
    props: {
      text: content.cta,
      fontSize: ctaFontSize,
      fontFamily: font.body,
      fill: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "center",
      left: rightX + ctaW / 2, top: ctaTop + ctaH * 0.28,
      originX: "center",
    },
  });

  return elements;
};

/**
 * Top-heavy layout: accent banner on top, content below.
 * Stacks with cursor for collision-free placement.
 */
const layoutTopBanner: LayoutFn = (size, palette, font, content, decoStyle) => {
  const w = size.width;
  const h = size.height;
  const elements: DesignElement[] = [];
  const accent = palette[0];
  const secondary = palette[3];

  // Calculate how much vertical space the headline needs
  const headlineFontSize = Math.round(Math.min(w * 0.065, h * 0.065));
  const headlineHeight = estimateTextHeight(content.headline, headlineFontSize, w * 0.8, 1.15);
  const badgeFontSize = Math.round(Math.min(w * 0.017, h * 0.022));
  const topSectionHeight = h * 0.06 + badgeFontSize * 2 + headlineHeight + h * 0.06;
  const bannerH = Math.min(topSectionHeight + h * 0.04, h * 0.52);

  // Top banner
  elements.push({
    id: uuidv4(), kind: "shape", role: "accent",
    props: { shapeType: "rect", left: 0, top: 0, width: w, height: bannerH, fill: accent, opacity: 0.95 },
  });

  let cursor = h * 0.05;
  const gap = h * 0.03;

  // Badge
  elements.push({
    id: uuidv4(), kind: "text", role: "badge",
    props: {
      text: content.badge,
      fontSize: badgeFontSize,
      fontFamily: font.body,
      fill: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center",
      opacity: 0.8,
    },
  });
  cursor += badgeFontSize * 1.5 + gap * 0.5;

  // Headline (inside the banner)
  elements.push({
    id: uuidv4(), kind: "text", role: "headline",
    props: {
      text: content.headline,
      fontSize: headlineFontSize,
      fontFamily: font.heading,
      fill: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center",
      lineHeight: 1.15,
    },
  });
  cursor = bannerH + gap;

  // Subheadline (below the banner)
  const subFontSize = Math.round(Math.min(w * 0.021, h * 0.028));
  elements.push({
    id: uuidv4(), kind: "text", role: "subheadline",
    props: {
      text: content.subheadline,
      fontSize: subFontSize,
      fontFamily: font.body,
      fill: "rgba(255,255,255,0.8)",
      fontWeight: "normal",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center",
    },
  });
  cursor += estimateTextHeight(content.subheadline, subFontSize, w * 0.8) + gap;

  // Bullet points
  const bulletFontSize = Math.round(Math.min(w * 0.018, h * 0.023));
  const bulletText = content.bulletPoints.map((b) => `•  ${b}`).join("\n");
  elements.push({
    id: uuidv4(), kind: "text", role: "body",
    props: {
      text: bulletText,
      fontSize: bulletFontSize,
      fontFamily: font.body,
      fill: "rgba(255,255,255,0.75)",
      fontWeight: "normal",
      textAlign: "center",
      left: w / 2, top: cursor,
      originX: "center",
      lineHeight: 1.55,
      opacity: 0.85,
    },
  });
  cursor += estimateTextHeight(bulletText, bulletFontSize, w * 0.8, 1.55) + gap;

  // CTA
  const ctaFontSize = Math.round(Math.min(w * 0.021, h * 0.026));
  const ctaW = Math.max(w * 0.28, ctaFontSize * content.cta.length * 0.7);
  const ctaH = ctaFontSize * 2.4;
  const ctaTop = Math.min(cursor, h - ctaH - h * 0.05);
  elements.push({
    id: uuidv4(), kind: "shape", role: "cta",
    props: {
      shapeType: "rect", left: w / 2 - ctaW / 2, top: ctaTop,
      width: ctaW, height: ctaH, fill: accent,
      rx: ctaH / 2, ry: ctaH / 2,
    },
  });
  elements.push({
    id: uuidv4(), kind: "text", role: "cta",
    props: {
      text: content.cta,
      fontSize: ctaFontSize,
      fontFamily: font.body,
      fill: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "center",
      left: w / 2, top: ctaTop + ctaH * 0.28,
      originX: "center",
    },
  });

  return elements;
};

/**
 * Image-first layout: fullscreen background image with gradient overlay and
 * elegant text placement. Looks like professional poster designs.
 */
type ImageLayoutFn = (
  size: PosterSize,
  palette: string[],
  font: { heading: string; body: string },
  content: TopicContent,
  decorationStyle: string,
  imageUrl: string
) => DesignElement[];

const layoutImageOverlay: ImageLayoutFn = (size, palette, font, content, _decoStyle, imageUrl) => {
  const w = size.width;
  const h = size.height;
  const elements: DesignElement[] = [];
  const accent = palette[0];

  // Fullscreen background image — high opacity so it's clearly visible
  elements.push({
    id: uuidv4(), kind: "image", role: "background-image",
    props: { src: imageUrl, left: 0, top: 0, width: w, height: h, opacity: 1 },
  });

  // Semi-transparent dark overlay for text readability (NOT fully opaque)
  elements.push({
    id: uuidv4(), kind: "shape", role: "overlay",
    props: { shapeType: "rect", left: 0, top: 0, width: w, height: h, fill: palette[1], opacity: 0.45 },
  });

  // Bottom gradient for footer text readability
  elements.push({
    id: uuidv4(), kind: "shape", role: "overlay",
    props: { shapeType: "rect", left: 0, top: h * 0.6, width: w, height: h * 0.4, fill: palette[1], opacity: 0.35 },
  });

  const pad = w * 0.08;
  const textArea = w - pad * 2;
  const gap = h * 0.03;

  // Badge at top
  const badgeFontSize = Math.round(Math.min(w * 0.018, h * 0.022));
  let cursor = h * 0.08;
  elements.push({
    id: uuidv4(), kind: "text", role: "badge",
    props: {
      text: content.badge,
      fontSize: badgeFontSize, fontFamily: font.body, fill: accent,
      fontWeight: "bold", textAlign: "left",
      left: pad, top: cursor, opacity: 0.9,
      fontStyle: "italic",
      maxWidth: textArea,
    },
  });
  cursor += badgeFontSize * 2 + gap;

  // Large headline
  const headlineW = textArea * 0.85;
  const headlineFontSize = Math.round(Math.min(w * 0.075, h * 0.085));
  elements.push({
    id: uuidv4(), kind: "text", role: "headline",
    props: {
      text: content.headline,
      fontSize: headlineFontSize, fontFamily: font.heading, fill: "#FFFFFF",
      fontWeight: "bold", textAlign: "left",
      left: pad, top: cursor, lineHeight: 1.1,
      maxWidth: headlineW,
    },
  });
  cursor += estimateTextHeight(content.headline, headlineFontSize, headlineW, 1.1) + gap;

  // Subheadline
  const subW = textArea * 0.9;
  const subFontSize = Math.round(Math.min(w * 0.022, h * 0.026));
  elements.push({
    id: uuidv4(), kind: "text", role: "subheadline",
    props: {
      text: content.subheadline,
      fontSize: subFontSize, fontFamily: font.body, fill: "rgba(255,255,255,0.8)",
      fontWeight: "normal", textAlign: "left",
      left: pad, top: cursor,
      maxWidth: subW,
    },
  });
  cursor += estimateTextHeight(content.subheadline, subFontSize, subW) + gap * 1.5;

  // CTA button
  const ctaFontSize = Math.round(Math.min(w * 0.02, h * 0.024));
  const ctaW = Math.max(w * 0.22, ctaFontSize * content.cta.length * 0.7);
  const ctaH = ctaFontSize * 2.4;
  const ctaTop = Math.min(cursor, h - ctaH - gap * 3 - Math.round(Math.min(w * 0.016, h * 0.019)) * 2);
  elements.push({
    id: uuidv4(), kind: "shape", role: "cta",
    props: {
      shapeType: "rect", left: pad, top: ctaTop,
      width: ctaW, height: ctaH, fill: accent,
      rx: 6, ry: 6, opacity: 0.95,
    },
  });
  elements.push({
    id: uuidv4(), kind: "text", role: "cta",
    props: {
      text: content.cta, fontSize: ctaFontSize,
      fontFamily: font.body, fill: "#FFFFFF", fontWeight: "bold",
      textAlign: "center", left: pad + ctaW / 2, top: ctaTop + ctaH * 0.28,
      originX: "center",
    },
  });

  // Footer body text at bottom
  const footerFontSize = Math.round(Math.min(w * 0.016, h * 0.019));
  const footerTop = ctaTop + ctaH + gap;
  elements.push({
    id: uuidv4(), kind: "text", role: "body",
    props: {
      text: content.bodyText,
      fontSize: footerFontSize, fontFamily: font.body, fill: "rgba(255,255,255,0.6)",
      fontWeight: "bold", textAlign: "left",
      left: pad, top: footerTop,
      maxWidth: textArea,
    },
  });

  return elements;
};

/**
 * YouTube thumbnail layout: bold, impactful, designed for clicks.
 * Uses stacking cursor for collision-free layout.
 */
const layoutYouTubeThumbnail: ImageLayoutFn = (size, palette, font, content, _decoStyle, imageUrl) => {
  const w = size.width;
  const h = size.height;
  const elements: DesignElement[] = [];
  const accent = palette[0];
  const dark = palette[1];

  // Background image on left half — visible and vibrant
  elements.push({
    id: uuidv4(), kind: "image", role: "background-image",
    props: { src: imageUrl, left: 0, top: 0, width: w * 0.5, height: h, opacity: 0.85 },
  });

  // Left dark overlay for contrast
  elements.push({
    id: uuidv4(), kind: "shape", role: "overlay",
    props: { shapeType: "rect", left: 0, top: 0, width: w * 0.5, height: h, fill: dark, opacity: 0.4 },
  });

  // Accent stripe on the left edge
  elements.push({
    id: uuidv4(), kind: "shape", role: "accent",
    props: { shapeType: "rect", left: 0, top: 0, width: w * 0.025, height: h, fill: accent, opacity: 0.9 },
  });

  // Right-side content area with stacking cursor
  const rightX = w * 0.52;
  const rightW = w * 0.44;
  let cursor = h * 0.08;
  const gap = h * 0.035;

  // Badge
  const badgeFontSize = Math.round(h * 0.035);
  elements.push({
    id: uuidv4(), kind: "text", role: "badge",
    props: {
      text: content.badge, fontSize: badgeFontSize, fontFamily: font.body,
      fill: accent, fontWeight: "bold", textAlign: "left", left: rightX, top: cursor,
      maxWidth: rightW,
    },
  });
  cursor += badgeFontSize * 1.5 + gap * 0.5;

  // Headline — capped to prevent overflow
  const headlineFontSize = Math.round(Math.min(w * 0.06, h * 0.11));
  elements.push({
    id: uuidv4(), kind: "text", role: "headline",
    props: {
      text: content.headline, fontSize: headlineFontSize, fontFamily: "Impact",
      fill: "#FFFFFF", fontWeight: "bold", textAlign: "left",
      left: rightX, top: cursor, lineHeight: 1.05,
      maxWidth: rightW,
    },
  });
  cursor += estimateTextHeight(content.headline, headlineFontSize, rightW, 1.05) + gap;

  // Subheadline
  const subFontSize = Math.round(h * 0.035);
  elements.push({
    id: uuidv4(), kind: "text", role: "subheadline",
    props: {
      text: content.subheadline, fontSize: subFontSize, fontFamily: font.body,
      fill: "rgba(255,255,255,0.75)", fontWeight: "normal", textAlign: "left",
      left: rightX, top: cursor,
      maxWidth: rightW,
    },
  });
  cursor += estimateTextHeight(content.subheadline, subFontSize, rightW) + gap;

  // CTA button — positioned safely based on cursor
  const ctaFontSize = Math.round(h * 0.045);
  const ctaW = w * 0.3;
  const ctaH = ctaFontSize * 2.2;
  const ctaTop = Math.min(cursor, h - ctaH - h * 0.08);
  elements.push({
    id: uuidv4(), kind: "shape", role: "cta",
    props: {
      shapeType: "rect", left: rightX, top: ctaTop,
      width: ctaW, height: ctaH, fill: accent,
      rx: 8, ry: 8,
    },
  });
  elements.push({
    id: uuidv4(), kind: "text", role: "cta",
    props: {
      text: content.cta, fontSize: ctaFontSize, fontFamily: font.body,
      fill: "#FFFFFF", fontWeight: "bold", textAlign: "center",
      left: rightX + ctaW / 2, top: ctaTop + ctaH * 0.25, originX: "center",
    },
  });

  return elements;
};

const STANDARD_LAYOUTS: LayoutFn[] = [layoutCenterStack, layoutSplitStack, layoutTopBanner];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generatePosterFromPrompt(prompt: string): Promise<PosterDesignSpec> {
  const size = detectPlatform(prompt);
  const [industryName, industry] = detectIndustry(prompt);
  const purpose = detectPurpose(prompt);
  const subject = extractSubject(prompt, industryName);
  const lower = prompt.toLowerCase();
  const isMindful = industryName === "fitness" && (lower.includes("pilates") || lower.includes("yoga") || lower.includes("stretch") || lower.includes("barre") || lower.includes("meditation"));

  const palette = isMindful
    ? industry.palettes[industry.palettes.length - 1]
    : pick(industry.palettes);
  const font = isMindful
    ? { heading: "Georgia", body: "Helvetica" }
    : pick(industry.fonts);

  const backgroundColor = palette[1];
  const content = generateContent(subject, purpose, industryName);
  const imageUrl = await getRelevantImage(industryName, prompt);

  const isYouTube = size.name.toLowerCase().includes("youtube");
  const isInstagram = size.name.toLowerCase().includes("instagram");
  const isPinterest = size.name.toLowerCase().includes("pinterest");

  // Industries that benefit from photo backgrounds
  const imageIndustries = ["fitness", "salon", "restaurant", "coffee", "music", "fashion", "realestate"];
  const prefersImage = imageIndustries.includes(industryName);

  let elements: DesignElement[];
  if (isYouTube) {
    elements = layoutYouTubeThumbnail(size, palette, font, content, industry.decorationStyle, imageUrl);
  } else if (prefersImage || isInstagram || isPinterest) {
    elements = layoutImageOverlay(size, palette, font, content, industry.decorationStyle, imageUrl);
  } else {
    const layoutFn = pick(STANDARD_LAYOUTS);
    elements = layoutFn(size, palette, font, content, industry.decorationStyle);
  }

  return {
    id: uuidv4(),
    prompt,
    size,
    backgroundColor,
    elements,
    meta: {
      platform: size.name,
      industry: industryName,
      purpose,
      mood: pick(industry.moods),
      palette,
      topic: subject,
    },
  };
}

export async function generatePosterWithAI(prompt: string): Promise<PosterDesignSpec> {
  const fallback = await generatePosterFromPrompt(prompt);

  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const ai = data.aiContent;
    if (!ai) return fallback;

    // Merge AI-generated content into our collision-free layout
    for (const el of fallback.elements) {
      if (el.role === "headline" && ai.headline) {
        el.props.text = ai.headline;
      }
      if (el.role === "subheadline" && ai.subheadline) {
        el.props.text = ai.subheadline;
      }
      if (el.role === "body" && ai.bodyText) {
        el.props.text = ai.bodyText;
      }
      if (el.role === "cta" && el.kind === "text" && ai.cta) {
        el.props.text = ai.cta;
      }
      if (el.role === "brand" && ai.brandText) {
        el.props.text = ai.brandText;
      }
    }

    if (ai.colorOverrides) {
      const co = ai.colorOverrides;
      for (const el of fallback.elements) {
        if (el.role === "accent" && el.kind === "shape" && co.accent) {
          el.props.fill = co.accent;
        }
        if (el.role === "cta" && el.kind === "shape" && co.accent) {
          el.props.fill = co.accent;
        }
      }
    }

    if (ai.mood) fallback.meta.mood = ai.mood;

    return fallback;
  } catch {
    return fallback;
  }
}

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
