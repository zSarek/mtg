import React, { useState, useEffect } from 'react';
import { RuleItem } from '../types';
import { explainRule } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Assuming we might want md support later, but plain text for now

interface Props {
  rule: RuleItem;
}

const RuleDisplay: React.FC<Props> = ({ rule }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Reset explanation when rule changes
  useEffect(() => {
    setExplanation(null);
  }, [rule.id]);

  const handleAskAi = async () => {
    setLoadingAi(true);
    const fullTextBlob = rule.fullText.join('\n');
    const result = await explainRule(rule.name, fullTextBlob);
    setExplanation(result);
    setLoadingAi(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-mtg-surface rounded-xl shadow-xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-[#221f1f] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-mtg-accent">{rule.name}</h2>
          <span className="text-sm text-gray-500 font-mono">Rule {rule.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {rule.fullText.length > 0 ? (
          rule.fullText.map((paragraph, index) => (
            <p key={index} className="text-gray-200 leading-relaxed text-lg border-l-4 border-gray-600 pl-4">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-gray-500 italic">Brak szczegółowego opisu dla tej zasady.</p>
        )}
      </div>

      {/* AI Action Area */}
      <div className="bg-[#1f1d1d] p-6 border-t border-gray-700">
        {!explanation && !loadingAi && (
          <button
            onClick={handleAskAi}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            Wyjaśnij mi to (AI Judge)
          </button>
        )}

        {loadingAi && (
          <div className="text-center text-indigo-400 animate-pulse">
            Konsultacja z sędzią AI...
          </div>
        )}

        {explanation && (
          <div className="mt-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
            <h3 className="text-indigo-300 font-bold mb-2 flex items-center gap-2">
              <span className="text-xl">⚖️</span> Sędzia AI wyjaśnia:
            </h3>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleDisplay;