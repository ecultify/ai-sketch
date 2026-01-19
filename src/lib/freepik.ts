interface FreepikGenerateParams {
  prompt: string;
  sketchImage?: string;
}

interface FreepikImageData {
  base64: string;
  has_nsfw: boolean;
}

interface FreepikResponse {
  data: FreepikImageData[];
  meta: {
    prompt: string;
    seed: number;
    image: {
      size: string;
      width: number;
      height: number;
    };
  };
}

export async function generateFreepikImage(params: FreepikGenerateParams): Promise<string> {
  const apiKey = process.env.FREEPIK_API_KEY;
  
  if (!apiKey) {
    throw new Error("Freepik API key not configured");
  }

  const generateBody: any = {
    prompt: params.prompt,
    num_images: 1,
    image: {
      size: "square_1_1"
    }
  };

  // If sketch image is provided, use it for sketch-to-image with high weight
  if (params.sketchImage) {
    generateBody.image.structure_reference = {
      url: params.sketchImage,
      weight: 1.0  // Maximum weight to follow the sketch structure closely
    };
    console.log("Using structure reference with weight 1.0");
  }

  console.log("Sending request to Freepik API with prompt:", generateBody.prompt.substring(0, 100));

  const response = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey,
    },
    body: JSON.stringify(generateBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Freepik API error:", errorText);
    throw new Error(`Freepik API error (${response.status}): ${errorText}`);
  }

  const result: FreepikResponse = await response.json();
  console.log("Freepik API response received");

  if (!result.data || result.data.length === 0) {
    throw new Error("No image data in response");
  }

  // The API returns base64 image data directly
  const base64Data = result.data[0].base64;
  
  // Convert to data URL
  const dataUrl = `data:image/jpeg;base64,${base64Data}`;
  
  console.log("Image generated successfully");
  return dataUrl;
}
