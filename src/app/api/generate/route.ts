import { NextResponse } from "next/server";
import { generateFreepikImage } from "@/lib/freepik";

export async function POST(request: Request) {
  try {
    const { image, prompt, imagination = 50 } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const basePrompt = prompt.trim();
    // Simple anime transformation - just convert the drawing to anime style
    const animePrompt = `${basePrompt}, anime style, highly detailed anime illustration, vibrant colors, clean lines, cel shading, manga art style`;

    console.log("Generating with prompt:", animePrompt);
    console.log("Imagination level:", imagination);

    // Use Freepik API for sketch-to-image generation
    const generatedImageUrl = await generateFreepikImage({
      prompt: animePrompt,
      sketchImage: image,
      imagination,
    });

    return NextResponse.json({ image: generatedImageUrl });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
