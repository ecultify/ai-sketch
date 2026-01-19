interface FreepikGenerateParams {
  prompt: string;
  sketchImage?: string;
  imagination?: number; // 0-100, where 0 follows sketch precisely, 100 is more creative
}

interface FreepikMysticResponse {
  data: {
    base64?: string;
    task_id?: string;
  } | string;
}

interface FreepikTaskResponse {
  data: {
    status: string;
    generated?: Array<string | { url?: string; base64?: string }> | string;
  };
}

export async function generateFreepikImage(params: FreepikGenerateParams): Promise<string> {
  const apiKey = process.env.FREEPIK_API_KEY;
  
  if (!apiKey) {
    throw new Error("Freepik API key not configured");
  }

  // Map imagination (0-100) to structure_strength (100 to 0)
  // 0 imagination = 100 structure_strength (follows sketch precisely)
  // 100 imagination = 0 structure_strength (more creative freedom)
  const imagination = params.imagination ?? 50;
  const structureStrength = 100 - imagination;

  // Extract base64 data from data URL if present
  let base64Image: string | undefined;
  if (params.sketchImage) {
    if (params.sketchImage.startsWith('data:')) {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      base64Image = params.sketchImage.split(',')[1];
    } else {
      base64Image = params.sketchImage;
    }
  }

  // Add anime styling to prompt since there's no anime model
  const animePrompt = `${params.prompt}, anime style, anime illustration, cel shading, vibrant colors, clean lineart, manga art style`;

  const generateBody: any = {
    prompt: animePrompt,
    aspect_ratio: "square_1_1",
    model: "realism", // realism model supports structure_reference better
    resolution: "2k",
    filter_nsfw: true,
  };

  // Add structure reference if sketch image is provided
  if (base64Image) {
    generateBody.structure_reference = base64Image;
    // Use higher structure_strength (80-100) to follow sketch closely
    generateBody.structure_strength = Math.max(structureStrength, 70);
  }

  console.log(`=== FREEPIK MYSTIC API ===`);
  console.log(`Original prompt: ${params.prompt}`);
  console.log(`Anime prompt: ${animePrompt.substring(0, 100)}...`);
  console.log(`Model: ${generateBody.model}`);
  console.log(`Imagination: ${imagination} -> Structure Strength: ${generateBody.structure_strength || 'N/A'}`);
  if (base64Image) {
    console.log(`Sketch image: ${base64Image.length} chars`);
  }

  const response = await fetch("https://api.freepik.com/v1/ai/mystic", {
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

  const result: FreepikMysticResponse = await response.json();
  console.log("Freepik Mystic API response received:", JSON.stringify(result).substring(0, 200));

  // Handle case where data is directly a string (base64 or URL)
  if (typeof result.data === 'string') {
    console.log("Image generated successfully (direct string)");
    if (result.data.startsWith('http')) {
      return result.data;
    }
    return `data:image/jpeg;base64,${result.data}`;
  }

  // Check if we got a task_id (async generation) or direct base64
  if (result.data?.base64) {
    console.log("Image generated successfully (direct base64)");
    return `data:image/jpeg;base64,${result.data.base64}`;
  }

  if (result.data?.task_id) {
    // Poll for the result
    return await pollForResult(apiKey, result.data.task_id);
  }

  throw new Error("Unexpected response format from Freepik API");
}

async function pollForResult(apiKey: string, taskId: string, maxAttempts = 60): Promise<string> {
  console.log(`Polling for task ${taskId}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
    
    const response = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
      headers: {
        "x-freepik-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Poll error (${response.status}):`, errorText.substring(0, 100));
      continue; // Try again
    }

    const result: FreepikTaskResponse = await response.json();
    const status = result.data?.status?.toUpperCase();
    console.log(`Task status: ${status}, generated:`, JSON.stringify(result.data?.generated)?.substring(0, 100));

    if (status === 'COMPLETED' && result.data?.generated) {
      const generated = result.data.generated;
      
      // Handle array format - could be array of strings or array of objects
      if (Array.isArray(generated) && generated.length > 0) {
        const firstImage = generated[0];
        
        // If it's a string directly (URL or base64)
        if (typeof firstImage === 'string') {
          console.log("Image generated successfully (array of strings)");
          if (firstImage.startsWith('http')) {
            return firstImage;
          }
          return `data:image/jpeg;base64,${firstImage}`;
        }
        
        // If it's an object with url or base64
        if (typeof firstImage === 'object' && firstImage !== null) {
          if (firstImage.url) {
            console.log("Image generated successfully (URL in object)");
            return firstImage.url;
          }
          if (firstImage.base64) {
            console.log("Image generated successfully (base64 in object)");
            return `data:image/jpeg;base64,${firstImage.base64}`;
          }
        }
      }
      
      // Handle string format
      if (typeof generated === 'string' && generated.length > 0) {
        console.log("Image generated successfully (string)");
        if (generated.startsWith('http')) {
          return generated;
        }
        return `data:image/jpeg;base64,${generated}`;
      }
    }

    if (status === 'FAILED') {
      throw new Error("Image generation failed");
    }
  }

  throw new Error("Timeout waiting for image generation");
}
