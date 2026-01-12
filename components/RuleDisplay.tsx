import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { RuleItem } from '../types';
import { explainRule } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  rule: RuleItem;
  cachedExplanation?: string;
  onCache: (explanation: string) => void;
}

const RuleDisplay: React.FC<Props> = ({ rule, cachedExplanation, onCache }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cachedExplanation) {
      setExplanation(cachedExplanation);
    } else {
      setExplanation(null);
    }
    setLoading(false);
  }, [rule.id, cachedExplanation]);

  const fetchExplanation = async () => {
    setLoading(true);
    const fullTextBlob = rule.fullText.join('\n');
    const result = await explainRule(rule.name, fullTextBlob);
    
    setExplanation(result);
    onCache(result);
    setLoading(false);
  };

  const handleExplain = async () => {
    if (loading || explanation) return;
    await fetchExplanation();
  };

  const handleRegenerate = async () => {
    if (loading) return;
    await fetchExplanation();
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative group">
      
      {/* Decorative Glow behind the card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-mtg-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

      {/* Card Container */}
      <div className="relative bg-mtg-surface rounded-xl shadow-card border border-mtg-border overflow-hidden">
        
        {/* Card Title Bar */}
        <div className="relative bg-[#151414] border-b border-[#3d3a3a] px-6 py-4 flex justify-between items-center shadow-md">
          <div className="absolute top-0 left-0 w-1 h-full bg-mtg-accent"></div>
          <div>
             <h2 className="text-2xl md:text-3xl font-fantasy font-bold text-white tracking-wide drop-shadow-md">
              {rule.name}
            </h2>
            <div className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
               <span className="bg-[#2a2626] px-2 py-0.5 rounded text-gray-400">CR {rule.id}</span>
               <span className="text-mtg-accent opacity-60">Keywords</span>
            </div>
          </div>
          {/* Mana Cost / Symbol Placeholder */}
          <div className="hidden sm:flex space-x-1 opacity-70">
            <div className="w-4 h-4 rounded-full bg-gray-600/50"></div>
            <div className="w-4 h-4 rounded-full bg-gray-600/50"></div>
          </div>
        </div>
        
        {/* Official Rules Text (Oracle Text style) */}
        <div className="p-6 bg-[#1f1d1d]">
          <div className="text-sm text-gray-300 leading-relaxed font-sans opacity-95">
             {rule.fullText.length > 0 ? (
                rule.fullText.map((paragraph, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))
              ) : (
                <span className="text-gray-600">No official text available.</span>
              )}
          </div>
        </div>

        {/* AI Action / Explanation Area */}
        <div className="bg-[#151414] min-h-[180px] relative border-t border-mtg-border">
          
          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

          {!explanation && !loading && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <button
                onClick={handleExplain}
                className="group relative inline-flex items-center justify-center px-8 py-3 font-fantasy font-bold text-white transition-all duration-200 bg-indigo-900 font-lg rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 offset-gray-900 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                <span className="relative flex items-center gap-2 tracking-widest uppercase text-sm">
                   <span className="text-xl">✨</span> Explain Mechanic
                </span>
              </button>
              <p className="text-gray-600 mt-4 text-xs text-center max-w-sm">
                Spend 1 mana to summon a simplified explanation and examples from the AEther.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LoadingSpinner />
              <p className="text-mtg-accent text-sm animate-pulse font-fantasy tracking-widest uppercase">Consulting the Oracle...</p>
            </div>
          )}

          {explanation && (
            <div className="p-6 animate-fade-in relative z-10">
               {/* Markdown Output */}
              <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:font-fantasy prose-headings:text-mtg-accent prose-strong:text-indigo-300 prose-li:text-gray-300">
                <ReactMarkdown
                  components={{
                    h3: ({node, ...props}) => <h3 className="text-xl mt-4 mb-3 border-b border-gray-800 pb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-indigo-400" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-4" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-indigo-500/50 bg-[#1c1b1b] p-4 rounded italic text-gray-400 my-4" {...props} />
                    ),
                  }}
                >
                  {explanation}
                </ReactMarkdown>
              </div>
              
              <div className="mt-8 flex justify-end border-t border-gray-800 pt-4">
                <button 
                  onClick={handleRegenerate} 
                  className="text-[10px] text-gray-500 hover:text-mtg-accent transition-colors uppercase tracking-widest font-bold flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Mulligan (Regenerate)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuleDisplay;