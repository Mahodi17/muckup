
import { GoogleGenAI, Type } from "@google/genai";
import { DesignAnalysis } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductImage = async (base64Images: string[]): Promise<DesignAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are a world-class Product Marketing Psychologist and Commercial Creative Director for high-end brands. 
  Analyze the product from the provided reference images (which may show different angles or details) and create a design strategy for a world-class advertisement.
  
  The "imagePrompt" must be an elite-level English prompt for an image generator. 
  Include specific photographic details: camera lens (e.g. 85mm f/1.8), lighting setup (e.g. volumetric lighting, rim light), material textures, and background environment. 
  Ensure the prompt describes the original product accurately but in a highly stylized, commercial setting.
  
  Return the analysis in JSON format. All descriptions (except imagePrompt) MUST be in Bengali (বাংলা).`;

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1]
    }
  }));

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...imageParts,
        {
          text: "Analyze these product reference images and provide a professional design strategy and a high-end commercial image prompt."
        }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productTitle: { type: Type.STRING },
          category: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          psychologicalProfile: {
            type: Type.OBJECT,
            properties: {
              mood: { type: Type.STRING },
              colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
              emotionalImpact: { type: Type.STRING }
            },
            required: ["mood", "colorPalette", "emotionalImpact"]
          },
          designStrategy: {
            type: Type.OBJECT,
            properties: {
              lighting: { type: Type.STRING },
              background: { type: Type.STRING },
              composition: { type: Type.STRING },
              style: { type: Type.STRING }
            },
            required: ["lighting", "background", "composition", "style"]
          },
          imagePrompt: { type: Type.STRING }
        },
        required: ["productTitle", "category", "targetAudience", "psychologicalProfile", "designStrategy", "imagePrompt"]
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text);
};

export const generateProductVision = async (prompt: string, base64Images: string[]): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1]
    }
  }));

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...imageParts,
        {
          text: `Using these reference images as the product source, generate a professional commercial advertisement shot based on this prompt: ${prompt}. Maintain the product's core identity perfectly but enhance the lighting and environment significantly.`
        }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!imagePart || !imagePart.inlineData) {
    throw new Error("Failed to generate image vision");
  }

  return `data:image/png;base64,${imagePart.inlineData.data}`;
};
