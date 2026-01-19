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

    const basePrompt = prompt?.trim() || "character";
    const animePrompt = `masterpiece, best quality, highly detailed anime illustration, anime style, ${basePrompt}, vibrant colors, detailed anime art, manga style`;
    const negativePrompt = "blurry, low quality, deformed, ugly, mutated, worst quality, photo, realistic, 3d render";

    const input = {
      image: image,
      prompt: animePrompt,
      n_prompt: negativePrompt,
      scale: 9,
      ddim_steps: 30,
      num_samples: "1",
      image_resolution: "512",
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
