import { RuleItem, RuleParsingState } from '../types';

// Źródło online - tylko najnowsza wersja
const ONLINE_SOURCE = 'https://media.wizards.com/2026/downloads/MagicCompRules%2020260116.txt';
// Nazwa pliku lokalnego (musi znajdować się w folderze public/ lub obok index.html po buildzie)
const LOCAL_SOURCE = './rules2026.txt'; 

const STORAGE_KEY = 'mtg_rules_text_cache';
const STORAGE_VERSION = '20260116';

export const fetchAndParseRules = async (): Promise<RuleItem[]> => {
  // 1. Try Local Storage Cache first to avoid network calls
  try {
    const cachedText = localStorage.getItem(STORAGE_KEY);
    const cachedVer = localStorage.getItem(STORAGE_KEY + '_ver');
    if (cachedText && cachedVer === STORAGE_VERSION && isValidRulesText(cachedText)) {
      console.log("[RulesService] Loaded rules from local cache.");
      try {
        return parseAndValidate(cachedText);
      } catch (e) {
        console.warn("[RulesService] Cached text was invalid during parse. Clearing cache.");
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY + '_ver');
        // Continue to network fetch
      }
    }
  } catch (e) {
    console.warn("[RulesService] Cache check failed", e);
  }

  let text = '';
  let lastError: any;

  // 2. Network/Local Fetch Strategies
  // Priority: 
  // 1. Local file (rules2026.txt) - Fastest, avoids CORS and Proxy latency.
  // 2. Proxies - Fallback if local file is missing.
  const strategies = [
    // Strategy A: Local File
    () => LOCAL_SOURCE,
    // Strategy B: Primary Proxy (AllOrigins)
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // Strategy C: Secondary Proxy (CorsProxy.io)
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  for (const strategy of strategies) {
    try {
      const fetchUrl = strategy(ONLINE_SOURCE); // Note: For local strategy, ONLINE_SOURCE is ignored
      console.log(`[RulesService] Attempting to fetch rules from: ${fetchUrl}`);
      
      // Increased timeout to 15s for large text files/slow proxies
      // Local fetch usually takes <100ms
      text = await fetchTextWithTimeout(fetchUrl, 15000);
      
      if (isValidRulesText(text)) {
        console.log(`[RulesService] Download success from ${fetchUrl}.`);
        // Cache the successful download
        try {
          localStorage.setItem(STORAGE_KEY, text);
          localStorage.setItem(STORAGE_KEY + '_ver', STORAGE_VERSION);
        } catch (e) { /* ignore quota errors */ }
        
        break; // Stop trying other sources
      } else {
        console.warn(`[RulesService] Downloaded text from ${fetchUrl} was invalid (too short or wrong format).`);
      }
    } catch (error) {
      console.warn(`[RulesService] Strategy failed for ${strategy.name || 'unknown'}.`, error);
      lastError = error;
      // Continue to next strategy
    }
  }

  // 3. Validation
  if (!isValidRulesText(text)) {
    const msg = lastError instanceof Error ? lastError.message : "Unknown error";
    throw new Error(`Failed to load rules. Please ensure 'rules2026.txt' is in the root directory or check your internet connection for fallback. (Last error: ${msg})`);
  }

  return parseAndValidate(text);
};

const parseAndValidate = (text: string): RuleItem[] => {
  const rules = parseRulesText(text);
  if (rules.length === 0) {
    throw new Error("Downloaded rules text appears invalid (no rules found).");
  }
  console.log(`[RulesService] Successfully parsed ${rules.length} rules.`);
  return rules;
};

const isValidRulesText = (text: string | null | undefined): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  // Basic check: content check.
  // We lowered the limit slightly to 1000 chars to allow for testing with smaller valid files if needed,
  // but real CR is huge (>5MB).
  if (text.length < 1000) return false;

  // Security/Format check
  if (text.includes('<!DOCTYPE') || text.includes('<html')) return false;

  return true;
};

const fetchTextWithTimeout = async (url: string, timeoutMs: number): Promise<string> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    
    if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
    return await response.text();
  } catch (error: any) {
    clearTimeout(id);
    // Transform "signal is aborted without reason" into a readable Timeout error
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs/1000}s`);
    }
    throw error;
  }
};

const parseRulesText = (text: string): RuleItem[] => {
  // Normalize line endings - split by any common newline character
  const lines = text.split(/\r\n|\r|\n/);
  
  const state: RuleParsingState = {
    currentRule: null,
    rules: []
  };

  // Regex for rule headers: "701.1. Name" or "702.12. Name"
  const headerRegex = /^\s*(701|702)\.(\d+)\.?\s+(.+)/;
  
  // Regex for sub-rules: "702.12a Text..."
  const subRuleRegex = /^\s*(701|702)\.(\d+)([a-z]+)?\s+(.+)/;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Stop if we hit sections beyond Keywords (e.g., 703, 800)
    if (line.match(/^\s*(703|704|800|900)\./)) {
        if (state.rules.length > 0) break;
    }

    const headerMatch = line.match(headerRegex);
    // Check if it is a header and NOT a sub-rule (702.1a is sub, 702.1 is header)
    const isSubRule = /^\s*(701|702)\.(\d+)[a-z]/.test(line);

    if (headerMatch && !isSubRule) {
      if (state.currentRule) {
        state.rules.push(state.currentRule);
      }
      state.currentRule = {
        id: `${headerMatch[1]}.${headerMatch[2]}`,
        category: headerMatch[1] as '701' | '702',
        name: headerMatch[3].trim(),
        fullText: []
      };
      continue;
    }

    if (state.currentRule) {
      const rootId = state.currentRule.id; 
      
      if (line.startsWith(rootId)) {
         const subMatch = line.match(subRuleRegex);
         if (subMatch) {
            state.currentRule.fullText.push(subMatch[4].trim());
         } else {
             state.currentRule.fullText.push(line);
         }
      } else if (!line.match(/^\d{3}\./)) {
        // Continuation of previous line or non-rule text block
        if (state.currentRule.fullText.length > 0) {
            state.currentRule.fullText[state.currentRule.fullText.length - 1] += " " + line;
        } else {
            state.currentRule.fullText.push(line);
        }
      }
    }
  }

  if (state.currentRule) {
    state.rules.push(state.currentRule);
  }

  // Filter out general section headers if any (e.g., "701. General")
  return state.rules.filter(r => !r.name.toLowerCase().includes("general"));
};