interface GoogleGenerateParams {
  prompt: string;
  sketchImage?: string;
  imagination?: number;
}

export async function generateGoogleImage(params: GoogleGenerateParams): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Google API key not configured");
  }

  // Use imagination level to control how closely to follow the sketch
  const imagination = params.imagination ?? 50;
  
  let styleGuidance = "";
  if (imagination <= 20) {
    styleGuidance = "IMPORTANT: Follow the sketch EXACTLY. Keep the exact same pose, proportions, and composition. Only change the style to anime.";
  } else if (imagination <= 40) {
    styleGuidance = "Follow the sketch closely but you can make small improvements to proportions. Keep the same pose and composition.";
  } else if (imagination <= 60) {
    styleGuidance = "Use the sketch as a strong reference. Keep the general pose and composition but feel free to enhance details.";
  } else if (imagination <= 80) {
    styleGuidance = "Use the sketch as inspiration. You can be creative with details while keeping the general idea.";
  } else {
    styleGuidance = "Use the sketch as loose inspiration only. Be very creative and artistic with your interpretation.";
  }

  // Enhance prompt with anime styling and background
  const animePrompt = `Transform this sketch into anime style: ${params.prompt}. 
${styleGuidance}
Make it a high quality anime illustration with vibrant colors, clean lineart, cel shading, manga art style.
IMPORTANT: Add a beautiful, detailed anime-style background that fits the scene. Do not leave the background empty or white.`;

  console.log(`Imagination level: ${imagination}%`);

  console.log(`=== GOOGLE GEMINI 2.5 FLASH IMAGE API ===`);
  console.log(`Original prompt: ${params.prompt}`);
  console.log(`Has sketch image: ${!!params.sketchImage}`);

  // Build the request parts - include both text and image
  const parts: any[] = [];

  // Add the sketch image if provided
  if (params.sketchImage) {
    // Extract base64 data from data URL
    let base64Data = params.sketchImage;
    let mimeType = "image/png";
    
    if (params.sketchImage.startsWith('data:')) {
      const matches = params.sketchImage.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Data
      }
    });
  }

  // Add the text prompt
  parts.push({ text: animePrompt });

  const requestBody = {
    contents: [{
      parts: parts
    }],
    generationConfig: {
      temperature: 1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192
    }
  };

  try {
    // Use Gemini 2.5 Flash Image for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google API error:", errorData);
      throw new Error(`Google API error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Google API response received:", JSON.stringify(result).substring(0, 500));

    // Extract the generated image from the response (similar to Python SDK)
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // Check for inlineData (camelCase - Google API format)
          if (part.inlineData && part.inlineData.data) {
            console.log("Image generated successfully!");
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${part.inlineData.data}`;
          }
          // Also check snake_case format (just in case)
          if (part.inline_data && part.inline_data.data) {
            console.log("Image generated successfully (snake_case)!");
            const mimeType = part.inline_data.mime_type || 'image/png';
            return `data:${mimeType};base64,${part.inline_data.data}`;
          }
          // Log any text parts (the model may return text alongside or instead of image)
          if (part.text) {
            console.log("Text part received:", part.text.substring(0, 200));
          }
        }
      }
    }

    throw new Error("No image data received from Google API. The model may not have generated an image.");
  } catch (error) {
    console.error("Error calling Google API:", error);
    throw error;
  }
}
