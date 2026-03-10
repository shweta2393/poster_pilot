import { NextRequest, NextResponse } from "next/server";

interface ImageResult {
  url: string;
  thumb: string;
  alt: string;
  source: "unsplash" | "pexels" | "static";
}

async function searchUnsplash(
  query: string,
  count: number
): Promise<ImageResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || key === "your-unsplash-access-key") return [];

  try {
    const params = new URLSearchParams({
      query,
      per_page: String(count),
      orientation: "landscape",
    });

    const res = await fetch(
      `https://api.unsplash.com/search/photos?${params}`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.results ?? []).map(
      (photo: {
        urls: { regular: string; small: string };
        alt_description?: string;
      }) => ({
        url: photo.urls.regular,
        thumb: photo.urls.small,
        alt: photo.alt_description || query,
        source: "unsplash" as const,
      })
    );
  } catch {
    return [];
  }
}

async function searchPexels(
  query: string,
  count: number
): Promise<ImageResult[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key || key === "your-pexels-api-key") return [];

  try {
    const params = new URLSearchParams({
      query,
      per_page: String(count),
      orientation: "landscape",
    });

    const res = await fetch(
      `https://api.pexels.com/v1/search?${params}`,
      {
        headers: { Authorization: key },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.photos ?? []).map(
      (photo: {
        src: { large: string; medium: string };
        alt?: string;
      }) => ({
        url: photo.src.large,
        thumb: photo.src.medium,
        alt: photo.alt || query,
        source: "pexels" as const,
      })
    );
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, count = 9 } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ images: [] }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(1, count), 30);

    // Try Unsplash first
    let images = await searchUnsplash(query, safeCount);

    // Fall back to Pexels
    if (images.length === 0) {
      images = await searchPexels(query, safeCount);
    }

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
