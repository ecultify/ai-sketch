export async function generateImageFromDoodle(image: string) {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "f1d05494d18833b371307b065e75123d6a620b22df34e6c317669d7b425b0780",
      input: {
        image: image,
        prompt: "A beautiful detailed digital art, highly detailed, professional composition",
      },
    }),
  });
  return response.json();
}
export async function getPredictionStatus(url: string) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
  });
  return response.json();
}
