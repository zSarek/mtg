export interface RuleItem {
  id: string; // e.g., "702.49"
  name: string; // e.g., "Ninjutsu"
  fullText: string[]; // Collected text from sub-rules (702.49a, 702.49b...)
  category: '701' | '702'; // 701 = Keyword Actions, 702 = Keyword Abilities
}

export interface RuleParsingState {
  currentRule: RuleItem | null;
  rules: RuleItem[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}