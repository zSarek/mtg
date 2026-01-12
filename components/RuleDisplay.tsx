import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { RuleItem } from '../types';
import { explainRule } from '../services/geminiService';

interface Props {
  rule: RuleItem;
}

const RuleDisplay: React.FC<Props> = ({ rule }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when rule changes
  useEffect(() => {
    setExplanation(null);
    setLoading(false);
  }, [rule.id]);

  const handleExplain = async () => {
    setLoading(true);
    const fullTextBlob = rule.fullText.join('\n');
    const result = await explainRule(rule.name, fullTextBlob);
    setExplanation(result);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-mtg-surface rounded-xl shadow-xl overflow-hidden border border-gray-700">
      
      {/* Rule Header & Text */}
      <div className="p-6 border-b border-gray-700">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-mtg-accent">{rule.name}</h2>
          <span className="text-sm text-gray-500 font-mono">Rule {rule.id}</span>
        </div>
        <div className="space-y-4">
          {rule.fullText.length > 0 ? (
            rule.fullText.map((paragraph, index) => (
              <p key={index} className="text-gray-200 leading-relaxed text-lg border-l-4 border-gray-600 pl-4 bg-black/20 p-2 rounded-r">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-gray-500 italic">Brak szczegółowego opisu dla tej zasady.</p>
          )}
        </div>
      </div>

      {/* AI Explanation Section */}
      <div className="p-6 bg-[#222020]">
        
        {!explanation && !loading && (
          <div className="text-center py-4">
            <button
              onClick={handleExplain}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium text-lg shadow-lg hover:shadow-indigo-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Wyjaśnij tę zasadę (AI)
            </button>
            <p className="text-gray-500 mt-2 text-sm">Kliknij, aby otrzymać proste wyjaśnienie i przykład od sędziego AI.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <p className="text-indigo-400 animate-pulse">Sędzia analizuje księgę zasad...</p>
          </div>
        )}

        {explanation && (
          <div className="animate-fade-in bg-[#2a2626] border border-gray-700 rounded-lg p-6 shadow-inner">
            <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤖</span> Opinia Sędziego
            </h3>
            <div className="prose prose-invert prose-p:text-gray-300 max-w-none">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
              <button 
                onClick={handleExplain} 
                className="text-sm text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Wygeneruj ponownie
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RuleDisplay;