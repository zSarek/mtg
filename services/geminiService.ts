import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const explainRule = async (ruleName: string, ruleText: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
      Jesteś sędzią Magic: The Gathering. Wyjaśnij graczowi działanie mechaniki "${ruleName}" w prosty sposób, po polsku.
      
      Oto oficjalny tekst zasad:
      ${ruleText}

      Zasady:
      1. Wyjaśnij krótko i zwięźle.
      2. Podaj prosty przykład użycia, jeśli to możliwe.
      3. Używaj polskiej terminologii MTG, ale w nawiasie podaj angielską, jeśli jest kluczowa.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Nie udało się wygenerować wyjaśnienia.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Wystąpił błąd podczas łączenia z AI Judge. Sprawdź klucz API.";
  }
};