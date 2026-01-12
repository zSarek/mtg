import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This error will be caught in explainRule
    throw new Error("Missing API_KEY. Check your .env file or GitHub Secrets.");
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
      7. Jeśli to pomoże, używaj kolorów i emoji.

      STRUKTURA ODPOWIEDZI:
      1. Pierwsze zdanie ma jak najkrocej podsumowac zdolnosc.
      2. Wyjaśnienie "po ludzku" jak to działa (krótko i na temat).
      3. Prosty przykład sytuacji z gry.
    `;

    // Changed from 'gemini-3-flash-preview' (20 RPD limit) to 'gemini-2.0-flash-exp' (1500 RPD limit)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash',
      contents: prompt,
    });

    return response.text || "Nie udało się wygenerować wyjaśnienia (pusta odpowiedź).";

  } catch (error: any) {
    console.error("Gemini API Error Full:", error);
    
    let errorMessage = "Wystąpił nieznany błąd.";
    let errorType = "Błąd";

    // Extract message from various error structures
    const rawMsg = error instanceof Error ? error.message : String(error);

    if (rawMsg.includes("429") || rawMsg.includes("Too Many Requests") || rawMsg.includes("quota")) {
      errorType = "Limit zapytań (429)";
      errorMessage = "Osiągnięto limit darmowych zapytań do API. Odczekaj chwilę i spróbuj ponownie.";
    } else if (rawMsg.includes("401") || rawMsg.includes("key") || rawMsg.includes("unauthorized")) {
      errorType = "Błąd autoryzacji (401)";
      errorMessage = "Klucz API jest nieprawidłowy lub go brakuje. Sprawdź konfigurację GitHub Secrets lub plik .env.";
    } else if (rawMsg.includes("503") || rawMsg.includes("overloaded")) {
      errorType = "Przeciążenie serwera";
      errorMessage = "Serwery Google AI są obecnie przeciążone. Spróbuj ponownie później.";
    } else if (rawMsg.includes("fetch failed") || rawMsg.includes("network")) {
      errorType = "Błąd sieci";
      errorMessage = "Nie udało się połączyć z API. Sprawdź swoje połączenie internetowe.";
    } else {
      errorMessage = `Szczegóły techniczne: ${rawMsg.slice(0, 100)}...`;
    }

    // Return specific markdown formatted error
    return `### ${errorType}\n> ${errorMessage}`;
  }
};
