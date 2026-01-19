interface OpenAIGenerateParams {
  prompt: string;
  sketchImage?: string; 
  imagination?: number; 
}

export async function generateOpenAIImage(params: OpenAIGenerateParams): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Enhance prompt with anime styling
  const animePrompt = `${params.prompt}, anime style, high quality anime illustration, vibrant colors, clean lineart, cel shading, manga art style, detailed anime artwork`;

  console.log(`=== OPENAI DALL-E 3 API ===`);
  console.log(`Original prompt: ${params.prompt}`);
  console.log(`Enhanced prompt: ${animePrompt}`);

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: animePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard", // "standard" or "hd"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("OpenAI API response received");

    if (result.data && result.data.length > 0 && result.data[0].url) {
      console.log("Image generated successfully");
      return result.data[0].url;
    }

    throw new Error("No image data received from OpenAI API");
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
