import React from 'react';
import { RuleItem } from '../types';

interface Props {
  rules: RuleItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const RuleSelector: React.FC<Props> = ({ rules, selectedId, onSelect, disabled }) => {
  const sortedRules = [...rules].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full max-w-lg mx-auto relative z-10">
      <label htmlFor="rule-select" className="block text-xs font-fantasy tracking-widest text-mtg-accent mb-2 uppercase ml-1">
        Search Grimoire
      </label>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
        <select
          id="rule-select"
          disabled={disabled}
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="relative block w-full rounded-lg border-0 bg-[#1c1b1b] py-4 pl-4 pr-10 text-gray-200 shadow-xl ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-mtg-accent sm:text-base cursor-pointer appearance-none transition-all hover:bg-[#252323] font-sans"
        >
          <option value="" disabled>-- Choose a Keyword --</option>
          {sortedRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-mtg-accent">
            <svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
        </div>
      </div>
    </div>
  );
};

export default RuleSelector;