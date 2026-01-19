import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: Request) {
  try {
    const { image, prompt } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "Replicate API token not configured" },
        { status: 500 }
      );
    }

    const replicate = new Replicate({ auth: apiToken });

    const userPrompt = prompt?.trim() 
      ? `a detailed, high quality ${prompt}` 
      : "a detailed, polished, colorful digital artwork based on this sketch";

    const input = {
      image: image,
      prompt: userPrompt,
    };

    const output = await replicate.run(
      "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
      { input }
    );

    const outputArray = output as { url: () => string }[];
    const generatedImageUrl = outputArray[0].url();

    return NextResponse.json({ image: generatedImageUrl });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
