import React from 'react';
import { RuleItem } from '../types';

interface Props {
  rules: RuleItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const RuleSelector: React.FC<Props> = ({ rules, selectedId, onSelect, disabled }) => {
  // Sort rules alphabetically by name for easier searching
  const sortedRules = [...rules].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <label htmlFor="rule-select" className="block text-sm font-medium text-gray-400 mb-2">
        Wybierz Keyword (zacznij pisać, aby wyszukać)
      </label>
      <div className="relative">
        <select
          id="rule-select"
          disabled={disabled}
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="block w-full rounded-md border-0 bg-mtg-surface py-3 pl-3 pr-10 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-mtg-accent sm:text-sm sm:leading-6 cursor-pointer appearance-none transition-colors hover:bg-[#363232]"
        >
          <option value="" disabled>-- Wybierz z listy --</option>
          {sortedRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.name} ({rule.id})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
        </div>
      </div>
    </div>
  );
};

export default RuleSelector;