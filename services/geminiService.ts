
import { GoogleGenAI, Type } from "@google/genai";
import { DesignAnalysis, PosterTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeProductImage = async (
  productImages: string[], 
  referenceImages: string[], 
  userInstructions?: string
): Promise<DesignAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are an elite Global Creative Director and Consumer Psychologist at a top-tier advertising agency.
  Your goal is to perform a Deep Visual & Psychological Analysis of the product to create a "Premium Brand Identity".
  
  ANALYSIS CRITERIA:
  1. Psychological Mood: Go beyond simple descriptions. Define an atmosphere (e.g., "Stoic Cyberpunk", "High-Society Minimalism", "Urban Rebellion").
  2. Material Textures: Focus on how to render the product's materials (Leather grain, Soft cotton, Matte metal) to look expensive.
  3. Visual Hierarchy: Suggest a composition that screams "Premium".
  
  IMAGE PROMPT (English): Create an ultra-detailed photographic prompt for a commercial shoot. Include specific camera settings (e.g., Phase One XF, 80mm Lens), studio lighting (e.g., Soft-box with rim lighting, Volumetric shadows), and environment.
  
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
        { text: "CLIENT PRODUCT SAMPLES:" },
        ...productParts,
        ...(referenceImages.length > 0 ? [{ text: "STYLE REFERENCES (Mimic this quality level):" }, ...refParts] : []),
        {
          text: `Conduct a premium psychological design analysis. ${userInstructions ? `User request: "${userInstructions}".` : ""} Output a world-class design strategy and prompt.`
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
              lightingAtmosphere: { type: Type.STRING },
              emotionalImpact: { type: Type.STRING }
            },
            required: ["mood", "colorPalette", "lightingAtmosphere", "emotionalImpact"]
          },
          designStrategy: {
            type: Type.OBJECT,
            properties: {
              backgroundConcept: { type: Type.STRING },
              compositionRule: { type: Type.STRING },
              materialTextureFocus: { type: Type.STRING },
              style: { type: Type.STRING }
            },
            required: ["backgroundConcept", "compositionRule", "materialTextureFocus", "style"]
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
        ...productParts,
        ...(referenceImages.length > 0 ? [{ text: "STYLE VIBE:" }, ...refParts] : []),
        {
          text: `ACT AS A MASTER PHOTOGRAPHER. Generate a hyper-realistic, high-end commercial photo. 
          PROMPT: ${prompt}.
          Maintain the product's identity 100%. Ensure textures look expensive and lighting is cinematic.`
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
    throw new Error("Failed to generate premium vision");
  }

  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const generateProductPoster = async (
  base64Image: string,
  analysis: DesignAnalysis,
  posterInstructions: string,
  theme: PosterTheme = 'Streetwear',
  aspectRatio: string = "9:16"
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';

  let designDirectives = "";
  switch(theme) {
    case 'Streetwear':
      designDirectives = "Futuristic Streetwear Aesthetic. Overlay technical barcodes, technical data cards, glass-morphism UI panels, and bold neo-tokyo typography.";
      break;
    case 'Editorial':
      designDirectives = "High-End Editorial Minimalism. Add circular branding text, thin architectural lines, sophisticated serif fonts, and plenty of negative space.";
      break;
    case 'Magazine':
      designDirectives = "Premium Fashion Magazine Layout. Add a massive bold title, structured typographic columns, and designer color-swatch elements.";
      break;
    case 'Urban':
      designDirectives = "Gritty Urban Rebellion Style. Use distorted bold typography, spray-textured overlays, and raw industrial branding elements.";
      break;
  }

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image.split(',')[1]
          }
        },
        {
          text: `ACT AS A LEAD GRAPHIC DESIGNER. 
          Transform this product shot into a world-class finished poster.
          
          THEME: ${designDirectives}
          USER DATA TO INCLUDE: "${posterInstructions}"
          
          INSTRUCTIONS:
          - Incorporate the User Data using professional agency-level typography.
          - Add small premium details like "New Arrival 2026", "Auth Tech", or price badges.
          - The final result must look like it belongs on a billboard or a high-end social media campaign.`
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
    throw new Error("Failed to generate elite poster");
  }

  return `data:image/png;base64,${imagePart.inlineData.data}`;
};
