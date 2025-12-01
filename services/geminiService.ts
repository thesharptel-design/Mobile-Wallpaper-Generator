
import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";
import { getApiKey } from "../utils/storage";

// Helper to get client with current key
const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 우측 상단 설정 아이콘을 눌러 키를 등록해주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

export const testConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Attempt a very cheap/fast generation to verify the key
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });
    return true;
  } catch (error) {
    console.error("Connection Test Error:", error);
    throw error;
  }
};

export const generateWallpapers = async (prompt: string): Promise<GeneratedImage[]> => {
  try {
    const ai = getClient();

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
    // Enhance error message for common API key issues
    if (error.message?.includes('API key')) {
      throw new Error("API Key가 유효하지 않습니다. 설정을 확인해주세요.");
    }
    throw new Error(error.message || "이미지 생성 중 오류가 발생했습니다.");
  }
};
