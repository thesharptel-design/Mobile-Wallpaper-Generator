import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWallpapers = async (prompt: string): Promise<GeneratedImage[]> => {
  try {
    // Using Imagen 3 via the updated SDK pattern
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        aspectRatio: '9:16',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("이미지를 생성하지 못했습니다.");
    }

    const newImages: GeneratedImage[] = response.generatedImages.map((img) => {
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