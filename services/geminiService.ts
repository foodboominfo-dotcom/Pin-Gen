
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// The API key must be provided in the environment variable API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    // Truncate prompt if excessively long to avoid errors
    const safePrompt = prompt.length > 500 ? prompt.substring(0, 500) : prompt;
    
    // Ensure we get clean photography with no text
    const enhancedPrompt = `${safePrompt}, no text, no writing, clean photography, high quality, 8k resolution`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: enhancedPrompt,
      config: {
        imageConfig: {
            aspectRatio: "1:1", // We use 1:1 images to stack them into a 1:2 pin
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const editImage = async (base64ImageWithHeader: string, prompt: string): Promise<string> => {
  try {
    // Extract mime type and base64 data from data URI
    const match = base64ImageWithHeader.match(/^data:(image\/[a-z]+);base64,(.+)$/i);
    if (!match) {
        throw new Error("Invalid image data format");
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                { text: prompt }
            ]
        }
    });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        // Return as data URI to match existing app structure
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};
