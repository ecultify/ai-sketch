import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: await createFormData(base64Data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedImageUrl = data.data[0].url;

    return NextResponse.json({ image: generatedImageUrl });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function createFormData(base64Data: string): Promise<FormData> {
  const binaryData = Buffer.from(base64Data, "base64");
  const blob = new Blob([binaryData], { type: "image/png" });

  const formData = new FormData();
  formData.append("image", blob, "doodle.png");
  formData.append("prompt", "Transform this simple doodle or sketch into a detailed, polished, and visually appealing digital artwork. Maintain the original shapes and composition but add colors, shading, textures, and artistic details to make it look professional and beautiful.");
  formData.append("n", "1");
  formData.append("size", "512x512");

  return formData;
}
