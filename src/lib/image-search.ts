export interface ImageResult {
  url: string;
  thumb: string;
  alt: string;
  source: "unsplash" | "pexels" | "static";
}

const PLATFORM_WORDS = new Set([
  "linkedin", "instagram", "facebook", "twitter", "youtube", "pinterest",
  "tiktok", "post", "story", "reel", "banner", "cover", "thumbnail",
  "header", "pin", "ad", "flyer", "poster", "a4", "web",
]);

const PURPOSE_WORDS = new Set([
  "create", "make", "design", "generate", "build", "interactive",
  "advertisement", "advertising", "promotion", "promoting", "announce",
  "announcing", "announcement", "launch", "launching", "invite",
  "invitation", "opening", "grand", "new", "for", "my", "our", "an",
  "a", "the", "of", "and", "with", "about", "featuring", "poster",
]);

/**
 * Extracts a concise image search query from a user's poster prompt.
 * Strips platform names, purpose verbs, and filler to get the visual subject.
 */
export function extractImageQuery(prompt: string): string {
  const lower = prompt.toLowerCase().trim();
  const words = lower.split(/\s+/);

  const kept = words.filter(
    (w) => !PLATFORM_WORDS.has(w) && !PURPOSE_WORDS.has(w) && w.length > 1
  );

  if (kept.length === 0) return prompt.trim();

  const query = kept.join(" ");

  const boosts: Record<string, string> = {
    coffee: "coffee cafe beans latte",
    salon: "beauty hair salon interior",
    "agentic ai": "artificial intelligence robot futuristic",
    ai: "artificial intelligence technology futuristic",
    pilates: "pilates yoga fitness studio",
    concert: "live music concert stage",
    restaurant: "restaurant dining food",
    fitness: "gym fitness workout",
    "real estate": "modern house property",
    fashion: "fashion clothing runway",
  };

  for (const [keyword, boosted] of Object.entries(boosts)) {
    if (lower.includes(keyword)) {
      return `${query} ${boosted}`.trim();
    }
  }

  return query;
}

/**
 * Calls the server-side image search API which tries Unsplash -> Pexels -> static fallback.
 */
export async function searchImages(
  query: string,
  count: number = 9
): Promise<ImageResult[]> {
  try {
    const response = await fetch("/api/images/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, count }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.images ?? [];
  } catch {
    return [];
  }
}

/**
 * Searches for a single relevant image URL for poster generation.
 * Returns the best match URL, or null if search fails.
 */
export async function searchSingleImage(prompt: string): Promise<string | null> {
  const query = extractImageQuery(prompt);
  const results = await searchImages(query, 1);
  return results.length > 0 ? results[0].url : null;
}
