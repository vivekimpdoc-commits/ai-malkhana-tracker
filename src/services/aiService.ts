import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeInventory(items: any[], lang: 'hi' | 'en' = 'hi') {
  // Mock fallback if API key is missing
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "undefined" || process.env.GEMINI_API_KEY === "") {
    console.warn("Gemini API key missing. Using mock insights for demo.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      duplicates: lang === 'hi' ? ["केस नंबर FIR-2024-001 और FIR-2024-003 में सामान का विवरण समान है।"] : ["Potential duplicate between Case FIR-2024-001 and FIR-2024-003."],
      alerts: lang === 'hi' ? ["3 आइटम पिछले 6 महीनों से लंबित हैं।", "पिस्तौल (ID: ITEM-1) के लिए बैलिस्टिक रिपोर्ट प्राप्त नहीं हुई है।"] : ["3 items pending for more than 6 months.", "Ballistic report missing for Pistol (ID: ITEM-1)."],
      suggestions: lang === 'hi' ? ["पुराने इलेक्ट्रॉनिक सामान को नष्ट करने की प्रक्रिया शुरू करें।", "विवादित संपत्ति के लिए कोर्ट से आदेश प्राप्त करें।"] : ["Initiate disposal process for old electronics.", "Request court order for disputed property."],
      summary: lang === 'hi' ? "मालखाना इन्वेंट्री वर्तमान में व्यवस्थित है, लेकिन कुछ पुराने मामलों में कार्रवाई की आवश्यकता है।" : "Inventory is generally organized, but actions are required on older cases."
    };
  }

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
  // Mock session wrapper for missing API key
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "undefined" || process.env.GEMINI_API_KEY === "") {
    return {
      sendMessage: async ({ message }: { message: string }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          text: lang === 'hi' 
            ? `क्षमा करें, वर्तमान में डेमो मोड सक्रिय है। आपके प्रश्न "${message}" का उत्तर देने के लिए सक्रिय API key की आवश्यकता है।` 
            : `Sorry, the app is currently in Demo Mode. An active API key is required to answer your specific question: "${message}".`
        };
      }
    };
  }

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
