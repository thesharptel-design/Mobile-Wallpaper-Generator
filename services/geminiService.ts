import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWallpapers = async (prompt: string): Promise<GeneratedImage[]> => {
  try {
    // API limits usually cap at 4 images per request. 
    // To generate 6 versions, we make two parallel requests of 3 images each.
    const requestConfig = {
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 3,
        outputMimeType: 'image/jpeg',
        aspectRatio: '9:16',
      },
    };

    const [response1, response2] = await Promise.all([
      ai.models.generateImages(requestConfig),
      ai.models.generateImages(requestConfig)
    ]);

    const images1 = response1.generatedImages || [];
    const images2 = response2.generatedImages || [];
    const allImages = [...images1, ...images2];

    if (allImages.length === 0) {
      throw new Error("이미지를 생성하지 못했습니다.");
    }

    const newImages: GeneratedImage[] = allImages.map((img) => {
      const base64Data = img.image.imageBytes;
      const url = `data:image/jpeg;base64,${base64Data}`;
      
      return {
        id: crypto.randomUUID(),
        url: url,
        prompt: prompt,
        createdAt: Date.now(),
      };
    });

    return newImages;

  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    throw new Error(error.message || "이미지 생성 중 오류가 발생했습니다.");
  }
};