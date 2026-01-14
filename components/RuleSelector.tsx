import React, { useState, useEffect, useRef } from 'react';
import { RuleItem } from '../types';

interface Props {
  rules: RuleItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const RuleSelector: React.FC<Props> = ({ rules, selectedId, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal query state with external selectedId prop
  useEffect(() => {
    const selected = rules.find(r => r.id === selectedId);
    if (selected) {
      setQuery(selected.name);
    } else if (selectedId === '') {
      setQuery('');
    }
  }, [selectedId, rules]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Revert query to selected item name if closed without selecting new one
        const selected = rules.find(r => r.id === selectedId);
        if (selected) {
          setQuery(selected.name);
        } else {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [rules, selectedId]);

  // Filter rules based on query
  const filteredRules = query === ''
    ? rules.sort((a, b) => a.name.localeCompare(b.name))
    : rules.filter((rule) => {
        const lowerQuery = query.toLowerCase();
        return (
          rule.name.toLowerCase().includes(lowerQuery) ||
          rule.id.includes(lowerQuery)
        );
      }).sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (rule: RuleItem) => {
    onSelect(rule.id);
    setQuery(rule.name);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('');
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto relative z-20" ref={wrapperRef}>
      <label htmlFor="rule-combobox" className="block text-center text-xs font-fantasy tracking-[0.2em] text-mtg-accent/80 mb-3 uppercase">
        <span className="inline-block border-b border-mtg-accent/30 pb-1 px-4">Consult the Archives</span>
      </label>
      
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-mtg-leaf via-mtg-accent to-mtg-eclipse rounded-xl opacity-20 transition duration-500 blur ${isOpen ? 'opacity-50' : 'group-hover:opacity-40'}`}></div>
        
        {/* Input Field */}
        <div className="relative">
          <input
            id="rule-combobox"
            type="text"
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              if (e.target.value === '') onSelect('');
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a keyword..."
            className="block w-full rounded-lg border border-mtg-border bg-[#152225] py-4 pl-12 pr-12 text-mtg-accent shadow-2xl transition-all duration-300
                       focus:border-mtg-accent focus:ring-1 focus:ring-mtg-accent focus:outline-none 
                       placeholder-gray-600 font-sans text-xl tracking-wide"
            autoComplete="off"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          />
          
          {/* Search Icon (Left) */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="h-5 w-5 text-mtg-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Clear / Chevron Icon (Right) */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            {query && !disabled ? (
              <button onClick={handleClear} className="text-gray-500 hover:text-red-400 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <div className="pointer-events-none text-mtg-accent/50">
                <svg className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown List */}
        {isOpen && !disabled && (
          <div className="absolute mt-2 w-full rounded-lg border border-mtg-border/60 bg-[#0f1216]/95 backdrop-blur-md shadow-card overflow-hidden z-50 animate-fade-in">
             {filteredRules.length > 0 ? (
               <ul className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-mtg-border scrollbar-track-transparent">
                 {filteredRules.map((rule) => {
                   const isSelected = rule.id === selectedId;
                   return (
                     <li key={rule.id}>
                       <button
                         onClick={() => handleSelect(rule)}
                         className={`w-full text-left px-6 py-3 transition-colors flex justify-between items-center group
                           ${isSelected 
                             ? 'bg-mtg-leaf/20 text-mtg-accent' 
                             : 'text-[#d0d4c5] hover:bg-white/5 hover:text-mtg-accentHover'
                           }`}
                       >
                         <span className="font-sans text-lg">{rule.name}</span>
                         <span className="text-xs font-fantasy text-gray-600 group-hover:text-mtg-leaf/80 transition-colors">
                           {rule.id}
                         </span>
                       </button>
                     </li>
                   );
                 })}
               </ul>
             ) : (
               <div className="px-6 py-4 text-center text-gray-500 italic font-sans">
                 No arcana found matching your query.
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleSelector;