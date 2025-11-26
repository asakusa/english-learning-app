import { GoogleGenAI, Type } from "@google/genai";
import { WordItem } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateVocabularyForScene = async (sceneTitle: string): Promise<WordItem[]> => {
  const ai = getClient();
  
  const prompt = `Generate 5 essential vocabulary words related to the scene: "${sceneTitle}". 
  Focus on practical, everyday usage.
  Return the result in JSON format including:
  - English word
  - Japanese word (Kanji/Kana mix)
  - Japanese reading (Kana/Romaji) for pronunciation
  - Chinese translation (Simplified)
  - A short example sentence in English using the word.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              japanese: { type: Type.STRING },
              kana: { type: Type.STRING },
              chinese: { type: Type.STRING },
              sentence: { type: Type.STRING }
            },
            required: ["english", "japanese", "kana", "chinese", "sentence"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WordItem[];
    }
    return [];
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    // Return mock data fallback in case of API error for smoother UX during demos
    return [
      {
        english: "Error (Demo)",
        japanese: "エラー",
        kana: "eraa",
        chinese: "错误",
        sentence: "There was an error connecting to the AI."
      }
    ];
  }
};

export const generateImageForWord = async (word: string, context: string): Promise<string | null> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Generate a high-quality, clear illustration or photo of "${word}" in the context of "${context}". No text in the image.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3", 
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
             return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};