import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateTestImage = async (prompt: string): Promise<string | null> => {
  if (!ai) {
    console.warn("Gemini API Key is missing. Skipping generation.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // We do not set responseMimeType for image generation models per guidelines
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw error;
  }
};
