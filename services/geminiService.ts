import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing API_KEY. Check your .env file or GitHub Secrets.");
  }
  return new GoogleGenAI({ apiKey });
};

export const explainRule = async (ruleName: string, ruleText: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const isCustomQuery = !ruleText || ruleText.trim().length === 0;

    let prompt = '';

    if (isCustomQuery) {
      // Prompt for custom questions (e.g., "Can I stifle a fetchland?")
      prompt = `
        Jesteś sędzią Magic: The Gathering. Użytkownik zadał pytanie lub wpisał nazwę karty/mechaniki, której nie ma w podstawowym spisie CR.
        
        Pytanie/Temat: "${ruleName}"

        INSTRUKCJE STYLU:
        1. NIE UŻYWAJ powitań.
        2. Odpowiedz konkretnie na pytanie.
        3. Jeśli to pytanie o interakcję, wyjaśnij ją krok po kroku.
        4. Jeśli to pytanie o nieznany keyword, wyjaśnij go.
        5. Używaj formatowania (bold, listy), aby odpowiedź była czytelna na telefonie.
        6. Bądź czytelny w odpowiedzi. Używaj przerw pomiędzy strukturami w odpowiedzi.
        7. Jeśli to pomoże, używaj kolorów w tekście i emoji.

        LINKOWANIE KART (BARDZO WAŻNE):
        Jeśli w swojej odpowiedzi wymieniasz nazwę konkretnej karty Magic: The Gathering (np. Black Lotus, Shock, Tarmogoyf), MUSISZ otoczyć ją podwójnymi nawiasami kwadratowymi.
        Przykład: "Kiedy zagrywasz [[Lightning Bolt]], możesz..."
        Dzięki temu aplikacja wyświetli obrazek karty.

        WIZUALIZACJA KOLORÓW MANY:
        1. Zamiast {G/W} {B} uzywaj ikonek kul w odpowiednim kolorze:
          Plains - żółty
          Swamps - czarny
          Island - niebieski
          Forrest - zielony
          Mountines - czerwony
          Colorless - jasny szary lub jeśli więcej niż 1 - liczba.
        2. WAŻNE! Zwracaj uwage na ilość uniwersalnej (colorless) many, pokazuj ją jako liczbę, albo szarą kulę.
        
        STRUKTURA:
        1. Bezpośrednia odpowiedź (Tak/Nie/Działa to tak...).
        2. Pierwsze zdanie ma jak najkrocej podsumowac zdolnosc.
        3. Krótkie uzasadnienie z zasad (jeśli znasz odpowiednie reguły).
        4. Przykład (opcjonalnie, jeśli to skomplikowane).
      `;
    } else {
      // Standard prompt for existing CR rules
      prompt = `
        Jesteś ekspertem Magic: The Gathering. Wyjaśniasz mechanikę "${ruleName}".
        
        Tekst źródłowy:
        ${ruleText}

        INSTRUKCJE STYLU (BEZWZGLĘDNE):
        1. NIE UŻYWAJ żadnych powitań ("Witaj", "Cześć").
        2. NIE PRZEDSTAWIAJ SIĘ ("Jako sędzia...", "Oto wyjaśnienie...").
        3. Zacznij od razu od konkretnego wyjaśnienia. Bądź bardzo zwięzły.
        4. Wyświetlane odpowiedzi bedą w oknie w telefonie, więc bądź w odpowiedziach wizualny.
        5. Używaj kolorów i odpowiedniego formatowania, aby odpowiedź nie była ścianą tekstu.
        6. Bądź czytelny w odpowiedzi. Używaj przerw pomiędzy strukturami w odpowiedzi.
        7. Jeśli to pomoże, używaj kolorów w tekście i emoji.
        8. Zamiast {G/W} {B} uzywaj ikonek kul w odpowiednim kolorze.
        9. WAŻNE! Zwracaj uwage na ilość uniwersalnej (colorless) many, pokazuj ją jako liczbę, albo szarą kulę.
        
        LINKOWANIE KART (BARDZO WAŻNE):
        Jeśli w przykładach wymieniasz nazwę konkretnej karty (np. Grizzly Bears), MUSISZ otoczyć ją podwójnymi nawiasami kwadratowymi.
        Przykład: "Jeśli stwór np. [[Grizzly Bears]] blokuje..."
        
        WIZUALIZACJA KOLORÓW MANY:
        1. Zamiast {G/W} {B} uzywaj ikonek kul w odpowiednim kolorze:
          Plains - żółty
          Swamps - czarny
          Island - niebieski
          Forrest - zielony
          Mountines - czerwony
          Colorless - jasny szary lub jeśli więcej niż 1 - liczba.
        2. WAŻNE! Zwracaj uwage na ilość uniwersalnej (colorless) many, pokazuj ją jako liczbę, albo szarą kulę.

        STRUKTURA ODPOWIEDZI:
        1. Pierwsze zdanie ma jak najkrocej podsumowac zdolnosc.
        2. Wyjaśnienie "po ludzku" jak to działa (krótko i na temat).
        3. Prosty przykład sytuacji z gry.
      `;
    }

    // ---------------------------------------------------------
    // KONFIGURACJA MODELU (MODEL CONFIGURATION)
    // ---------------------------------------------------------
    // Dostępne modele:
    // 1. 'gemini-3-flash-preview'  <- Najnowszy, bardzo szybki (uwaga na limity!)
    // 2. 'gemini-2.0-flash-exp'    <- Wysokie limity, stabilny
    // 3. 'gemini-3-pro-preview'    <- Najinteligentniejszy, do trudnych zadań
    // ---------------------------------------------------------
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
    });

    return response.text || "Nie udało się wygenerować wyjaśnienia (pusta odpowiedź).";

  } catch (error: any) {
    console.error("Gemini API Error Full:", error);
    
    let errorMessage = "Wystąpił nieznany błąd.";
    let errorType = "Błąd";

    const rawMsg = error instanceof Error ? error.message : String(error);

    if (rawMsg.includes("429") || rawMsg.includes("Too Many Requests") || rawMsg.includes("quota")) {
      errorType = "Limit zapytań (429)";
      errorMessage = "Osiągnięto limit darmowych zapytań dla tego modelu (gemini-3-flash ma niskie limity). Spróbuj zmienić model na gemini-2.0-flash-exp w services/geminiService.ts";
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

    return `### ${errorType}\n> ${errorMessage}`;
  }
};