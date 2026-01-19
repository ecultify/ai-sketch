import { NextResponse } from "next/server";
import { generateGoogleImage } from "@/lib/google";

export async function POST(request: Request) {
  try {
    const { image, prompt, imagination = 50 } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Use prompt if provided, otherwise use a generic description
    const basePrompt = prompt?.trim() || "anime character";

    console.log("Generating with base prompt:", basePrompt);
    console.log("Using Google Gemini (Nano Banana) - sketch + prompt for anime generation");

    // Use Google Gemini for sketch-to-anime generation
    const generatedImageUrl = await generateGoogleImage({
      prompt: basePrompt,
      sketchImage: image, // Google Gemini uses the sketch as reference!
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
