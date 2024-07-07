import fs from 'fs';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Stability.ai API endpoint and headers
  const path = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
  const apiKey = "sk-07WuAH6MxY18zTOaLpG6jgDAMjseAiw5JeqiUh38xkWgm2io"; // Replace with your actual API key
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Request body for text-to-image generation
  const body = {
    steps: 40,
    width: 1024,
    height: 1024,
    seed: 0,
    cfg_scale: 5,
    samples: 1,
    text_prompts: [
      {
        text: req.body.prompt, // Use the prompt sent from frontend
        weight: 1
      },
      {
        text: "blurry, bad",
        weight: -1
      }
    ],
  };

  try {
    // Make the API request
    const response = await fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Process API response
    const responseJSON = await response.json();

    // Save image artifacts to files
    const imageUrls = responseJSON.artifacts.map((image, index) => {
      const fileName = `txt2img_${image.seed}.png`;
      const filePath = `./public/${fileName}`; // Adjust the path where images should be saved
      fs.writeFileSync(filePath, Buffer.from(image.base64, 'base64'));
      console.log(`Image ${index + 1} saved at ${filePath}`);
      return `/${fileName}`; // Return the path to the saved image
    });

    console.log("Text-to-image generation completed successfully.");
    return res.status(200).json({ images: imageUrls });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
