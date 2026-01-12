import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  // Accessing the API key directly from process.env as per guidelines
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
      Jesteś sędzią Magic: The Gathering.
      Wyjaśnij mechanikę "${ruleName}" w oparciu o tekst:
      ${ruleText}

      INSTRUKCJE STYLU (BEZWZGLĘDNE):
      1. NIE UŻYWAJ żadnych powitań ("Witaj", "Cześć").
      2. NIE PRZEDSTAWIAJ SIĘ ("Jako sędzia...", "Oto wyjaśnienie...").
      3. Zacznij od razu od konkretnego wyjaśnienia. Bądź zwięzły.

      STRUKTURA ODPOWIEDZI:
      1. Wyjaśnienie "po ludzku" jak to działa (krótko i na temat).
      2. Prosty przykład sytuacji z gry.
      3. Wyświetlane odpowiedzi bedą w oknie w telefonie, więc bądź w odpowiedziach wizualny.
      4. Używaj kolorów i odpowiedniego formatowania, aby odpowiedź nie była ścianą tekstu.
      
      Odpowiadaj po polsku, zachowując angielskie terminy gry.
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
