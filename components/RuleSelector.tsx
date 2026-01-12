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
    <div className="w-full max-w-xl mx-auto relative z-20">
      <label htmlFor="rule-select" className="block text-center text-xs font-fantasy tracking-[0.2em] text-mtg-accent/80 mb-3 uppercase">
        <span className="inline-block border-b border-mtg-accent/30 pb-1 px-4">Consult the Archives</span>
      </label>
      
      <div className="relative group">
        {/* Glow effect behind selector */}
        <div className="absolute -inset-1 bg-gradient-to-r from-mtg-leaf via-mtg-accent to-mtg-eclipse rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
        
        <select
          id="rule-select"
          disabled={disabled}
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="relative block w-full appearance-none rounded-lg border border-mtg-border bg-[#152225] py-4 pl-6 pr-12 text-mtg-accent shadow-2xl transition-all duration-300
                     focus:border-mtg-accent focus:ring-1 focus:ring-mtg-accent focus:outline-none 
                     hover:bg-[#1a2a2e] hover:border-mtg-leaf
                     font-sans text-xl tracking-wide cursor-pointer placeholder-gray-500"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          <option value="" disabled className="text-gray-500">❧ Select a Keyword Ability...</option>
          {sortedRules.map((rule) => (
            <option key={rule.id} value={rule.id} className="py-2">
              {rule.name}
            </option>
          ))}
        </select>
        
        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-mtg-accent/70 group-hover:text-mtg-accent transition-colors">
            <svg className="h-6 w-6 fill-current drop-shadow-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default RuleSelector;