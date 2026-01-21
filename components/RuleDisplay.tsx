import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { RuleItem } from '../types';
import { explainRule } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import CardTooltip from './CardTooltip';

interface Props {
  rule: RuleItem;
  cachedExplanation?: string;
  onCache: (explanation: string) => void;
}

const RuleDisplay: React.FC<Props> = ({ rule, cachedExplanation, onCache }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isCustom = rule.id === 'custom';

  useEffect(() => {
    if (cachedExplanation) {
      setExplanation(cachedExplanation);
    } else {
      setExplanation(null);
      // Auto-fetch for custom queries if not cached
      if (isCustom) {
        // slight delay to allow UI to render first
        const timer = setTimeout(() => {
            fetchExplanation();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
    setLoading(false);
  }, [rule.id, rule.name, cachedExplanation]);

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

  // Pre-process the explanation text to convert [[Card Name]] to standard Markdown links
  // Format: [Card Name](#card:Card%20Name) - Using #card: prevents url sanitization issues
  const processedContent = useMemo(() => {
    if (!explanation) return '';
    return explanation.replace(/\[\[(.*?)\]\]/g, (match, cardName) => {
      // Encode the card name for the URL-like structure, but keep display text normal
      return `[${cardName}](#card:${encodeURIComponent(cardName)})`;
    });
  }, [explanation]);

  return (
    // FIX: Removed 'perspective-1000' and 'group' which created a 3D context that trapped the tooltip z-index
    <div className="w-full max-w-4xl mx-auto relative">
      
      {/* Decorative Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-mtg-leaf via-black to-mtg-eclipse rounded-xl blur opacity-30 transition duration-1000"></div>

      {/* Main Card Container - Stone/Parchment Texture */}
      {/* FIX: Ensure z-index is handled naturally, removed 3D transform logic */}
      <div className="relative bg-[#162021] rounded-xl shadow-card border border-mtg-border/60 backdrop-blur-sm">
        
        {/* Header Section */}
        <div className="relative bg-[#0f1216] border-b border-[#2d4a3e] px-8 py-6 flex justify-between items-start rounded-t-xl">
          {/* Top Border Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mtg-leaf via-mtg-accent to-mtg-eclipse rounded-t-xl"></div>
          
          <div className="z-10 w-full">
             <h2 className="text-3xl sm:text-4xl font-fantasy font-bold text-mtg-text tracking-wider drop-shadow-md break-words">
              {rule.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
               <span className={`font-fantasy text-xs tracking-widest text-mtg-accent border border-mtg-accent/30 px-2 py-1 rounded bg-[#1a1810] ${isCustom ? 'bg-mtg-eclipse/20 text-purple-300' : ''}`}>
                 {isCustom ? 'QUERY' : `CR ${rule.id}`}
               </span>
               <div className="h-px w-8 bg-mtg-border"></div>
               <span className="text-sm italic text-gray-400 font-sans">
                 {isCustom ? 'Judge Consultation' : 'Comprehensive Rules'}
               </span>
            </div>
          </div>
          
          {/* Decorative Rune/Symbol */}
          <div className="hidden sm:block opacity-20 text-mtg-accent shrink-0 ml-4">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
               <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
            </svg>
          </div>
        </div>
        
        {/* Official Rules Body (Oracle Text) - Only show if not custom or has text */}
        {!isCustom && (
          <div className="p-8 bg-[#1a2324] relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            {/* Book style: removed indent-6, added italic, kept text-justify */}
            <div className="font-sans text-base text-[#d0d4c5] leading-relaxed space-y-2">
               {rule.fullText.length > 0 ? (
                  rule.fullText.map((paragraph, index) => (
                    <p key={index} className="italic text-justify">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No official text available via API. The AI interpretation will use its knowledge base.</span>
                )}
            </div>
          </div>
        )}

        {/* AI Interpretation Section (The "Spell") */}
        <div className={`bg-[#121518] relative border-mtg-border/50 min-h-[120px] rounded-b-xl ${!isCustom ? 'border-t' : ''}`}>
          
          {/* Magical Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.05] rounded-b-xl" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
          </div>

          {!explanation && !loading && !isCustom && (
            <div className="relative z-10 flex flex-col items-center justify-center py-8">
              <button
                onClick={handleExplain}
                className="group relative overflow-hidden rounded-full px-6 py-2 transition-transform active:scale-95 hover:shadow-glow-purple"
              >
                {/* Button Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-mtg-eclipse via-indigo-900 to-mtg-leaf opacity-80 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Button Border */}
                <div className="absolute inset-0 rounded-full border border-mtg-accent/50 group-hover:border-mtg-accent"></div>
                
                <span className="relative flex items-center gap-2 font-fantasy font-bold tracking-widest text-mtg-text text-sm uppercase">
                   <span>🔮</span>
                   <span>Invoke Interpretation</span>
                   <span>🔮</span>
                </span>
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="scale-75"><LoadingSpinner /></div>
              <p className="text-mtg-eclipse text-xs font-fantasy tracking-[0.2em] animate-pulse">
                {isCustom ? 'Consulting the Oracle...' : 'Weaving magic...'}
              </p>
            </div>
          )}

          {explanation && (
            <div className="p-8 relative z-10 animate-fade-in">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-px bg-mtg-eclipse flex-grow opacity-50"></div>
                 <h3 className="font-fantasy text-mtg-accent text-xl tracking-widest uppercase">
                   {isCustom ? "Judge's Ruling" : "Oracle's Insight"}
                 </h3>
                 <div className="h-px bg-mtg-eclipse flex-grow opacity-50"></div>
               </div>

              {/* Markdown Content */}
              <div className="prose prose-invert max-w-none 
                prose-headings:font-fantasy prose-headings:text-mtg-accent prose-headings:tracking-wide
                prose-strong:text-indigo-300 prose-strong:font-bold
                prose-li:text-gray-300 prose-li:marker:text-mtg-leaf">
                <ReactMarkdown
                  components={{
                    h3: ({node, ...props}) => <h3 className="text-xl text-mtg-accent mt-4 mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-[#f5e3a8] font-normal border-b border-[#f5e3a8]/30" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-mtg-eclipse bg-black/20 p-4 my-4 rounded-r italic text-gray-400" {...props} />
                    ),
                    p: ({node, ...props}) => <p className="text-justify mb-4 last:mb-0 leading-7 text-[#e0e0d0] font-sans text-base" {...props} />,
                    li: ({node, ...props}) => <li className="text-justify mb-1 text-[#e0e0d0] font-sans text-base" {...props} />,
                    // Custom Link Renderer for Cards
                    a: ({node, href, children, ...props}) => {
                      // Check for #card: prefix which is safe from markdown sanitization
                      if (href && href.startsWith('#card:')) {
                        // Decode the name back from the URL
                        const cardName = decodeURIComponent(href.replace('#card:', ''));
                        return <CardTooltip cardName={cardName}>{children}</CardTooltip>;
                      }
                      return <a href={href} className="text-mtg-accent hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                    }
                  }}
                >
                  {processedContent}
                </ReactMarkdown>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleRegenerate} 
                  className="text-xs text-gray-500 hover:text-mtg-accent transition-colors uppercase tracking-widest font-bold flex items-center gap-2 px-4 py-2 rounded hover:bg-white/5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Recast Spell
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