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
      Jesteś ekspertem Magic: The Gathering. Wyjaśniasz mechanikę "${ruleName}".
      
      Tekst źródłowy:
      ${ruleText}

      INSTRUKCJE STYLU (BEZWZGLĘDNE):
      1. NIE UŻYWAJ żadnych powitań ("Witaj", "Cześć").
      2. NIE PRZEDSTAWIAJ SIĘ ("Jako sędzia...", "Oto wyjaśnienie...").
      3. Zacznij od razu od konkretnego wyjaśnienia. Bądź zwięzły.
      4. Wyświetlane odpowiedzi bedą w oknie w telefonie, więc bądź w odpowiedziach wizualny.
      5. Używaj kolorów i odpowiedniego formatowania, aby odpowiedź nie była ścianą tekstu.
      6. Bądź czytelny w odpowiedzi. Używaj przerw pomiędzy strukturami w odpowiedzi.
      7. Jeśli to pomoże, używaj kolorów.

      STRUKTURA ODPOWIEDZI:
      1. Pierwsze zdanie ma jak najkrocej podsumowac zdolnosc.
      2. Wyjaśnienie "po ludzku" jak to działa (krótko i na temat).
      3. Prosty przykład sytuacji z gry.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Nie udało się wygenerować wyjaśnienia.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "### Błąd połączenia\n> Wystąpił problem z API (sprawdź klucz lub połączenie).";
  }
};