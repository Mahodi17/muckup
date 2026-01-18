
import { GoogleGenAI, Type } from "@google/genai";
import { DesignAnalysis } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductImage = async (
  productImages: string[], 
  referenceImages: string[], 
  userInstructions?: string
): Promise<DesignAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are a world-class Product Marketing Psychologist and Commercial Creative Director. 
  You will receive two sets of images: 
  1. Product Images: The core product that must be featured in the ad.
  2. Style Reference Images (Optional): These represent the desired lighting, composition, mood, or environment the user wants to mimic.

  Create a design strategy for a world-class advertisement.
  CRITICAL: You MUST incorporate the user's specific instructions and the visual style from the reference images (if provided) into your analysis.
  
  The "imagePrompt" must be an elite-level English prompt for an image generator. 
  Include specific photographic details: camera lens (e.g. 85mm f/1.8), lighting setup, material textures, and background. 
  Ensure the prompt describes the original product accurately but in a highly stylized, commercial setting inspired by the references.
  
  Return the analysis in JSON format. All descriptions (except imagePrompt) MUST be in Bengali (বাংলা).`;

  const productParts = productImages.map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
  }));
  
  const refParts = referenceImages.map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
  }));

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: "CORE PRODUCT IMAGES:" },
        ...productParts,
        ...(referenceImages.length > 0 ? [{ text: "STYLE REFERENCE IMAGES (Mimic this vibe):" }, ...refParts] : []),
        {
          text: `Analyze these images. ${userInstructions ? `User instructions: "${userInstructions}".` : ""} Provide a professional design strategy and a high-end commercial image prompt in Bengali (except the prompt string).`
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

export const generateProductVision = async (
  prompt: string, 
  productImages: string[], 
  referenceImages: string[],
  aspectRatio: string = "1:1"
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const productParts = productImages.map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
  }));

  const refParts = referenceImages.map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
  }));

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: "THE PRODUCT TO FEATURE (maintain identity exactly):" },
        ...productParts,
        ...(referenceImages.length > 0 ? [{ text: "STYLE/VIBE REFERENCE (use this atmosphere):" }, ...refParts] : []),
        {
          text: `Generate a professional commercial advertisement shot based on this prompt: ${prompt}. Use the product images as the primary object and reference images for environmental/style cues.`
        }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!imagePart || !imagePart.inlineData) {
    throw new Error("Failed to generate image vision");
  }

  return `data:image/png;base64,${imagePart.inlineData.data}`;
};
