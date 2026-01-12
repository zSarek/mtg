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
    <div className="w-full max-w-4xl mx-auto bg-mtg-surface rounded-lg shadow-xl overflow-hidden border border-gray-700">
      
      {/* Rule Header - Restored padding and text sizes */}
      <div className="p-6 border-b border-gray-700 bg-[#2b2727]">
        <div className="mb-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-mtg-accent leading-tight">{rule.name}</h2>
          <span className="text-sm text-gray-500 font-mono block mt-1">Rule {rule.id}</span>
        </div>
        
        {/* Raw Rule Text */}
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
          {rule.fullText.length > 0 ? (
            rule.fullText.map((paragraph, index) => (
              <p key={index} className="text-gray-400 text-sm border-l-2 border-gray-600 pl-3">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-gray-500 italic text-xs">Brak opisu.</p>
          )}
        </div>
      </div>

      {/* AI Action Area */}
      <div className="bg-[#1a1818] min-h-[200px] relative">
        
        {!explanation && !loading && (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <button
              onClick={handleExplain}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-xl transition-all font-semibold text-lg shadow-lg shadow-indigo-900/30 touch-manipulation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Wyjaśnij (AI)
            </button>
            <p className="text-gray-500 mt-3 text-sm text-center">Kliknij, aby uzyskać prosty opis i przykład.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full animate-ping opacity-20 bg-indigo-500"></div>
            </div>
            <p className="text-indigo-400 text-sm animate-pulse font-medium">Analizuję...</p>
          </div>
        )}

        {explanation && (
          <div className="p-6 animate-fade-in pb-8">
             {/* Restored Styling */}
            <div className="prose prose-invert max-w-none text-gray-300 text-base leading-relaxed">
              <ReactMarkdown
                components={{
                  h3: ({node, ...props}) => <h3 className="text-mtg-accent font-bold text-lg mt-6 mb-3 border-b border-gray-700 pb-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-indigo-400 font-extrabold" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-300" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-gray-200" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-mtg-blue bg-[#222020] p-4 rounded-r-lg my-6 italic text-gray-300 shadow-md" {...props} />
                  ),
                }}
              >
                {explanation}
              </ReactMarkdown>
            </div>
            
            <div className="mt-8 flex justify-center border-t border-gray-800 pt-4">
              <button 
                onClick={handleExplain} 
                className="text-xs text-gray-600 hover:text-indigo-400 transition-colors uppercase tracking-widest font-bold"
              >
                Odśwież
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleDisplay;