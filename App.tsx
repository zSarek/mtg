import React, { useEffect, useState, useMemo } from 'react';
import { fetchAndParseRules } from './services/rulesService';
import { RuleItem, LoadingState } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import RuleSelector from './components/RuleSelector';
import RuleDisplay from './components/RuleDisplay';

const App: React.FC = () => {
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const [explanationCache, setExplanationCache] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      setStatus(LoadingState.LOADING);
      try {
        const parsedRules = await fetchAndParseRules();
        setRules(parsedRules);
        setStatus(LoadingState.SUCCESS);
      } catch (err) {
        setStatus(LoadingState.ERROR);
        setErrorMsg('Nie udało się pobrać zasad. Sprawdź połączenie internetowe.');
      }
    };

    loadData();
  }, []);

  const selectedRule = useMemo(() => 
    rules.find(r => r.id === selectedRuleId), 
  [rules, selectedRuleId]);

  const handleCacheUpdate = (ruleId: string, explanation: string) => {
    setExplanationCache(prev => ({
      ...prev,
      [ruleId]: explanation
    }));
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden relative">
      
      {/* Ambient Eclipse Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-mtg-accent opacity-[0.03] blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-mtg-eclipse opacity-[0.05] blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1216]/90 backdrop-blur-sm border-b border-mtg-border/50 shadow-glow-purple">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            {/* Stylized Eclipse Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-mtg-accent rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-md"></div>
              <svg className="w-8 h-8 text-mtg-accent drop-shadow-[0_0_8px_rgba(220,177,88,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" stroke="currentColor" className="opacity-50" />
                <path d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2L12 4M12 20L12 22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12L4 12M20 12L22 12M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" className="opacity-70" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-fantasy font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-mtg-accent via-[#f5e3a8] to-mtg-accent drop-shadow-sm">
                LORWYN
              </h1>
              <span className="text-[10px] tracking-[0.3em] uppercase text-mtg-eclipse font-bold -mt-1 ml-0.5">Rules Codex</span>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <div className="px-3 py-1 rounded-full border border-mtg-border/50 bg-black/20 text-xs text-mtg-accent/70 font-fantasy tracking-wider">
              Cycle: Eclipse
            </div>
          </div>
        </div>
        
        {/* Vine/Separator Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-mtg-leaf to-transparent opacity-60"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {status === LoadingState.LOADING && (
          <div className="flex flex-col items-center pt-24 min-h-[50vh]">
            <LoadingSpinner />
            <p className="text-mtg-accent font-fantasy mt-8 text-2xl animate-pulse tracking-widest drop-shadow-glow-gold">
              Communing with Nature...
            </p>
          </div>
        )}

        {status === LoadingState.ERROR && (
          <div className="bg-red-950/20 border border-red-900/50 text-red-200 p-8 rounded-2xl text-center max-w-lg mx-auto mt-16 shadow-card backdrop-blur-md">
            <div className="text-5xl mb-6 opacity-80">🥀</div>
            <h3 className="font-fantasy font-bold text-2xl mb-3 text-red-400">The Spell Failed</h3>
            <p className="mb-6 font-sans text-lg">{errorMsg}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 rounded-full transition-all shadow-lg text-sm font-fantasy tracking-widest uppercase text-red-100 hover:shadow-red-900/20"
            >
              Rekindle
            </button>
          </div>
        )}

        {status === LoadingState.SUCCESS && (
          <div className="space-y-8 animate-fade-in pb-12">
            
            <div className="flex justify-center w-full">
               <RuleSelector 
                 rules={rules}
                 selectedId={selectedRuleId}
                 onSelect={setSelectedRuleId}
                 disabled={false}
               />
            </div>

            {selectedRule ? (
              <div className="animate-slide-up transition-all duration-500 ease-out">
                <RuleDisplay 
                  rule={selectedRule}
                  cachedExplanation={explanationCache[selectedRule.id]}
                  onCache={(explanation) => handleCacheUpdate(selectedRule.id, explanation)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 opacity-50 select-none text-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-mtg-border flex items-center justify-center mb-6">
                   <span className="text-5xl filter grayscale opacity-50">🌿</span>
                </div>
                <p className="text-3xl font-fantasy text-mtg-leaf/80 mb-2">The Grimoire is Closed</p>
                <p className="text-lg font-sans text-gray-500 italic max-w-md">
                  "Knowledge grows like a wild vine. Select a seed from the list above to verify its nature."
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="fixed bottom-0 w-full bg-[#0f1216]/95 backdrop-blur-md text-center py-3 border-t border-mtg-border/40 z-20">
        <p className="text-[10px] text-gray-500 font-sans tracking-wide">
          <span className="text-mtg-leaf">✿</span> Fan Content. Not approved by Wizards of the Coast. <span className="text-mtg-leaf">✿</span>
        </p>
      </footer>
    </div>
  );
};

export default App;