import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeInventory(items: any[], lang: 'hi' | 'en' = 'hi') {
  if (!process.env.GEMINI_API_KEY) return null;

  const prompt = `Analyze the following Malkhana (Police Evidence Room) inventory data and provide insights in JSON format.
  Items: ${JSON.stringify(items)}
  
  Please identify:
  1. Duplicate entry detection (items with similar descriptions or case numbers).
  2. Missing item alerts (items that should be there based on case patterns).
  3. Smart suggestions (which items are pending for release or destruction based on dates).
  4. A brief summary of the inventory health.
  
  IMPORTANT: Provide all text fields in ${lang === 'hi' ? 'Hindi' : 'English'}.
  
  Return ONLY a JSON object with keys: duplicates (array), alerts (array), suggestions (array), summary (string).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            duplicates: { type: Type.ARRAY, items: { type: Type.STRING } },
            alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["duplicates", "alerts", "suggestions", "summary"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

export function createChatSession(items: any[], lang: 'hi' | 'en' = 'hi') {
  const systemInstruction = `You are a Malkhana (Police Evidence Room) Assistant. 
  You have access to the following inventory data: ${JSON.stringify(items)}.
  Your job is to answer questions about this data accurately and concisely.
  If the user asks about something not in the data, tell them you don't have that information.
  Always respond in ${lang === 'hi' ? 'Hindi' : 'English'}.
  Be professional and helpful.`;

  return ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction,
    },
  });
}
