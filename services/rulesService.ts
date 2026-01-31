import { RuleItem, RuleParsingState } from '../types';

// The URL has a space in the filename, represented as %20 in browsers.
// We define it with a space here so encodeURIComponent handles it correctly once.
const RULES_URL = 'rules.txt';

// Manually added rules that might be missing from the parsed section (701/702) or are from new sets not yet in the CR text.
const MANUAL_RULES: RuleItem[] = [
  { 
    id: '702.VIVID', 
    category: '702', 
    name: 'Vivid', 
    fullText: ['Vivid is an ability word that highlights abilities that care in some way about the number of colors among permanents you control. This number will be between zero and five.'] 
  },
  { 
    id: '702.BLIGHT', 
    category: '702', 
    name: 'Blight', 
    fullText: ['To blight N, put N -1/-1 counters on a creature you control. That creature is not targeted, so you choose which creature will get the -1/-1 counters as you are taking the blight action. Importantly, you can put more -1/-1 counters on a creature than it would take to get rid of it.'] 
  },
  { 
    id: '702.KINDRED', 
    category: '702', 
    name: 'Kindred', 
    fullText: ['"Kindred" is a card type (formerly known as "Tribal"). It allows non-creature cards to have creature types.'] 
  },
  { 
    id: '712.DFC', 
    category: '702', 
    name: 'Double-Faced Cards', 
    fullText: ['Double-faced cards have a Magic card face on each side. They have no Magic card back. They can be Transforming Double-Faced Cards (TDFC) or Modal Double-Faced Cards (MDFC).'] 
  }
];

export const fetchAndParseRules = async (): Promise<RuleItem[]> => {
  // Strategy: Try primary proxy (corsproxy.io), fallback to secondary (allorigins).
  // This helps avoid "Failed to fetch" if one service is down or rate-limited.
  
  // 1. Try corsproxy.io
  try {
    // corsproxy.io generally works well with encoded URLs query param
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(RULES_URL)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Primary proxy returned status ${response.status}`);
    }
    const text = await response.text();
    return parseRulesText(text);
  } catch (error) {
    console.warn("Primary proxy failed, attempting fallback...", error);
  }

  // 2. Try allorigins.win
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(RULES_URL)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Fallback proxy returned status ${response.status}`);
    }
    const text = await response.text();
    return parseRulesText(text);
  } catch (error) {
    console.error("All proxies failed:", error);
    throw new Error("Failed to fetch rules from all sources. Please check your internet connection.");
  }
};

const parseRulesText = (text: string): RuleItem[] => {
  const lines = text.split('\n');
  const state: RuleParsingState = {
    currentRule: null,
    rules: []
  };

  // Regex to identify a main keyword header: e.g., "702.49. Ninjutsu"
  const headerRegex = /^(701|702)\.(\d+)\.\s+(.+)/;

  // Regex to identify a sub-rule: e.g., "702.49a Text here..."
  const subRuleRegex = /^(701|702)\.(\d+)([a-z]+)?\s+(.+)/;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // SECURITY BREAK: Stop parsing if we reach section 703 or higher.
    // This prevents "leaking" of the rest of the document into the last rule.
    // CRITICAL FIX: Only break if we have actually started collecting rules (currentRule is set).
    // This prevents breaking early due to Table of Contents at the top of the file which might list "703.".
    const sectionMatch = line.match(/^(\d{3})\./);
    if (sectionMatch) {
      const sectionNum = parseInt(sectionMatch[1], 10);
      if (sectionNum > 702 && state.currentRule !== null) {
        break; 
      }
    }

    // Check if it is a Main Header (New Rule)
    const headerMatch = line.match(headerRegex);
    if (headerMatch) {
      // Save previous rule if exists
      if (state.currentRule) {
        state.rules.push(state.currentRule);
      }

      // Start new rule
      state.currentRule = {
        id: `${headerMatch[1]}.${headerMatch[2]}`,
        category: headerMatch[1] as '701' | '702',
        name: headerMatch[3].trim(),
        fullText: []
      };
      continue;
    }

    // Check if it is a Sub Rule content
    if (state.currentRule) {
      const currentIdRoot = state.currentRule.id; // e.g. "702.49"
      
      // Does line start with the current ID?
      if (line.startsWith(currentIdRoot)) {
         const subMatch = line.match(subRuleRegex);
         if (subMatch) {
            // Add the text content (Group 4)
            state.currentRule.fullText.push(subMatch[4].trim());
         } else {
             // Fallback for lines that look like they belong but might be continuation or weird formatting
             // Just append if it doesn't look like a completely new numbered rule
             if (!line.match(/^\d{3}\./)) {
                 const lastIdx = state.currentRule.fullText.length - 1;
                 if (lastIdx >= 0) {
                     state.currentRule.fullText[lastIdx] += " " + line;
                 }
             }
         }
      } else if (!line.match(/^\d{3}\./)) {
        // Continuation of previous paragraph (line doesn't start with a rule number)
        // e.g. second line of a long paragraph
        const lastIdx = state.currentRule.fullText.length - 1;
        if (lastIdx >= 0) {
            state.currentRule.fullText[lastIdx] += " " + line;
        }
      }
    }
  }

  // Push the very last rule found
  if (state.currentRule) {
    state.rules.push(state.currentRule);
  }

  // Filter out introductory rules 701.1 and 702.1
  const filteredRules = state.rules.filter(r => r.id !== '701.1' && r.id !== '702.1');
  
  // Merge manually added rules
  return [...filteredRules, ...MANUAL_RULES];
};
