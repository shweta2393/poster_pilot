import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are PosterPilot AI, a world-class design engine. Given a user's poster request, generate a complete poster design specification as JSON.

You must return ONLY a valid JSON object (no markdown, no code fences) matching this schema:

{
  "headline": "string - the main headline text (can use \\n for line breaks)",
  "subheadline": "string - supporting text below headline",
  "cta": "string - call-to-action button text",
  "bodyText": "string - small detail text",
  "brandText": "string - brand name or tagline",
  "mood": "string - one of: elegant, bold, minimal, vibrant, professional, playful, luxurious, energetic",
  "colorOverrides": {
    "accent": "#hex - primary accent color",
    "dark": "#hex - dark color for text/bg",
    "light": "#hex - light color for backgrounds",
    "secondary": "#hex - secondary color"
  }
}

Rules:
- Headlines should be punchy, short (2-6 words per line), trendy, and attention-grabbing
- Use line breaks (\\n) to create visual hierarchy in headlines
- Subheadlines should be 8-15 words
- CTAs should be 2-3 words, action-oriented
- Body text should be brief (under 60 chars) with key selling points
- Colors should match the industry and mood perfectly
- Be creative and use 2026 design trends: bold typography, gradient accents, minimal layouts`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "sk-your-openai-api-key-here") {
      return NextResponse.json({ spec: null }, { status: 200 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create a poster design for: "${prompt}". Return the JSON specification.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ spec: null }, { status: 200 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ aiContent: parsed });
    } catch {
      return NextResponse.json({ spec: null }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ spec: null }, { status: 200 });
  }
}
