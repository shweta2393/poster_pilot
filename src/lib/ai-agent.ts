import type { AIAction, AIMessage } from "@/types";
import { v4 as uuidv4 } from "uuid";

const SYSTEM_PROMPT = `You are PosterPilot AI, a creative design assistant specialized in creating digital advertisements, social media posts, and marketing materials. You help users by:

1. Generating compelling headlines, taglines, and body copy
2. Suggesting color palettes that match their brand or mood
3. Recommending layout improvements
4. Writing persuasive ad copy
5. Generating image description prompts

Always be creative, concise, and provide actionable suggestions. When suggesting colors, provide hex codes. When suggesting text, provide multiple options. Format your responses clearly with bullet points or numbered lists when appropriate.`;

export function classifyIntent(message: string): AIAction {
  const lower = message.toLowerCase();
  if (
    lower.includes("headline") ||
    lower.includes("title") ||
    lower.includes("heading")
  )
    return "generate_headline";
  if (lower.includes("tagline") || lower.includes("slogan"))
    return "generate_tagline";
  if (
    lower.includes("body") ||
    lower.includes("copy") ||
    lower.includes("description") ||
    lower.includes("paragraph")
  )
    return "generate_body";
  if (lower.includes("color") || lower.includes("palette"))
    return "suggest_colors";
  if (lower.includes("layout") || lower.includes("arrangement"))
    return "suggest_layout";
  if (
    lower.includes("improve") ||
    lower.includes("rewrite") ||
    lower.includes("better")
  )
    return "improve_text";
  if (lower.includes("image") || lower.includes("photo") || lower.includes("picture"))
    return "generate_image_prompt";
  return "generate_headline";
}

export function buildPrompt(action: AIAction, userMessage: string): string {
  const prompts: Record<AIAction, string> = {
    generate_headline: `Generate 5 creative, attention-grabbing headlines for: ${userMessage}. Make them punchy, memorable, and suitable for poster/ad designs. Vary the tone from bold to elegant.`,
    generate_tagline: `Generate 5 catchy taglines/slogans for: ${userMessage}. Keep them short (under 8 words each), memorable, and impactful.`,
    generate_body: `Write compelling body copy (2-3 sentences) for a poster/ad about: ${userMessage}. Provide 3 variations with different tones: professional, casual, and bold.`,
    suggest_colors: `Suggest 3 color palettes (5 colors each with hex codes) for a design about: ${userMessage}. Name each palette and explain the mood it creates. Format as a list.`,
    suggest_layout: `Suggest 3 layout ideas for a poster/ad about: ${userMessage}. Describe the placement of text, images, and decorative elements. Be specific about positioning and visual hierarchy.`,
    improve_text: `Improve this text for a poster/ad design, making it more compelling and visually impactful. Provide 3 improved versions: ${userMessage}`,
    generate_image_prompt: `Generate 3 detailed image generation prompts (for AI image generators like DALL-E) for a poster/ad about: ${userMessage}. Make them descriptive, including style, mood, composition, and color guidance.`,
  };

  return prompts[action] || userMessage;
}

export async function sendAIMessage(
  messages: AIMessage[],
  userMessage: string
): Promise<AIMessage> {
  const action = classifyIntent(userMessage);

  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
            .filter((m) => m.role !== "system")
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: buildPrompt(action, userMessage) },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "AI request failed");
    }

    const data = await response.json();

    return {
      id: uuidv4(),
      role: "assistant",
      content: data.content,
      timestamp: Date.now(),
      action,
    };
  } catch (error: unknown) {
    const fallback = getFallbackResponse(action, userMessage);
    return {
      id: uuidv4(),
      role: "assistant",
      content: fallback,
      timestamp: Date.now(),
      action,
    };
  }
}

function getFallbackResponse(action: AIAction, context: string): string {
  const responses: Record<AIAction, string> = {
    generate_headline: `Here are some headline ideas:\n\n1. **"Transform Your Vision Into Reality"**\n2. **"Bold. Fresh. Unforgettable."**\n3. **"Where Creativity Meets Impact"**\n4. **"Stand Out From the Crowd"**\n5. **"Make Every Pixel Count"**\n\n💡 *Tip: Click any headline to add it to your canvas!*\n\n_(AI service unavailable — showing sample suggestions. Add your OpenAI API key in .env.local for personalized results.)_`,

    generate_tagline: `Here are some tagline ideas:\n\n1. **"Design Without Limits"**\n2. **"Create. Inspire. Convert."**\n3. **"Your Story, Beautifully Told"**\n4. **"Elevate Your Brand"**\n5. **"Where Ideas Take Shape"**\n\n_(AI service unavailable — showing sample suggestions.)_`,

    generate_body: `Here are 3 body copy variations:\n\n**Professional:** "Discover innovative solutions designed to elevate your brand presence. Our approach combines cutting-edge technology with creative excellence to deliver results that matter."\n\n**Casual:** "Ready to level up your brand game? We've got the tools, the talent, and the passion to make your vision pop. Let's create something amazing together!"\n\n**Bold:** "Stop blending in. Start standing out. We don't just design — we craft experiences that demand attention and drive action."\n\n_(AI service unavailable — showing sample suggestions.)_`,

    suggest_colors: `Here are 3 color palettes:\n\n**🎨 Modern & Bold**\n• \`#E94560\` (Hot Pink)\n• \`#1A1A2E\` (Deep Navy)\n• \`#16213E\` (Dark Blue)\n• \`#0F3460\` (Royal Blue)\n• \`#EAEAEA\` (Light Gray)\n\n**🌿 Fresh & Natural**\n• \`#2D6A4F\` (Forest Green)\n• \`#40916C\` (Sage)\n• \`#95D5B2\` (Mint)\n• \`#D8F3DC\` (Light Green)\n• \`#1B4332\` (Deep Green)\n\n**🌅 Warm & Inviting**\n• \`#FF6B35\` (Tangerine)\n• \`#F7C59F\` (Peach)\n• \`#EFEFD0\` (Cream)\n• \`#004E89\` (Ocean Blue)\n• \`#1A659E\` (Steel Blue)\n\n_(AI service unavailable — showing sample palettes.)_`,

    suggest_layout: `Here are 3 layout suggestions:\n\n**1. Hero Center**\nPlace your headline large and centered at the top third. Use a bold background image with an overlay. Position your CTA button at the bottom third.\n\n**2. Split Design**\nDivide the canvas vertically. Left side: bold text and messaging. Right side: striking imagery. Add a subtle divider or gradient transition.\n\n**3. Minimal Focus**\nLarge whitespace with a single impactful line of text centered. Small logo at top, contact info at bottom. Let the typography do the heavy lifting.\n\n_(AI service unavailable — showing sample layouts.)_`,

    improve_text: `Here are improved versions of your text:\n\n**Version 1 (Punchy):** A more direct, impactful version focusing on action verbs.\n\n**Version 2 (Elegant):** A refined version with sophisticated word choices.\n\n**Version 3 (Conversational):** A friendly, approachable version that connects with the reader.\n\n_(AI service unavailable — add your OpenAI API key in .env.local for personalized text improvements.)_`,

    generate_image_prompt: `Here are image generation prompts:\n\n**1.** "A modern minimalist composition with geometric shapes, soft gradient background in pastel tones, professional product photography style, clean and sophisticated"\n\n**2.** "Dynamic abstract design with bold colors and flowing lines, digital art style, vibrant and energetic mood, suitable for advertisement"\n\n**3.** "Elegant lifestyle photography setup with natural lighting, warm tones, bokeh background, premium brand aesthetic"\n\n_(AI service unavailable — showing sample prompts.)_`,
  };

  return responses[action];
}
