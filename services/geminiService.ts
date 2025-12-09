import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates analyzing a video file name to generate a creative template name.
 * In a real app, we might upload a frame, but here we use text processing for speed.
 */
export const generateCreativeTemplateName = async (fileName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am uploading a video file named "${fileName}" to a video template app. 
      Generate a short, creative, and catchy name for this video template in Chinese (max 10 chars). 
      Return ONLY the name, no quotes or explanation.`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "新模板"; // Fallback
  }
};