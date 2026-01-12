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
    <div className="min-h-screen font-sans text-mtg-text pb-20 overflow-x-hidden">
      
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-mtg-dark/80 border-b border-mtg-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Planeswalker Spark Icon (Simple SVG) */}
            <svg className="w-8 h-8 text-mtg-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <h1 className="text-xl md:text-2xl font-fantasy font-bold tracking-wider text-white bg-clip-text">
              MTG Rules <span className="text-mtg-accent">Companion</span>
            </h1>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-mono hidden sm:block uppercase tracking-widest">
            AI Powered Judge
          </div>
        </div>
        {/* Mystic Line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-mtg-accent to-transparent opacity-50"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {status === LoadingState.LOADING && (
          <div className="flex flex-col items-center pt-20">
            <LoadingSpinner />
            <p className="text-mtg-accent font-fantasy mt-6 text-lg animate-pulse">Summoning Knowledge...</p>
          </div>
        )}

        {status === LoadingState.ERROR && (
          <div className="bg-red-950/30 border border-red-800 text-red-200 p-6 rounded-xl text-center max-w-lg mx-auto mt-10 shadow-2xl backdrop-blur-sm">
            <div className="text-4xl mb-4">💀</div>
            <h3 className="font-fantasy font-bold text-xl mb-2">Fizzled</h3>
            <p className="mb-4">{errorMsg}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-900 hover:bg-red-800 border border-red-700 rounded transition-all shadow-lg text-sm font-semibold tracking-wider uppercase"
            >
              Try Again
            </button>
          </div>
        )}

        {status === LoadingState.SUCCESS && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="flex justify-center">
               <RuleSelector 
                 rules={rules}
                 selectedId={selectedRuleId}
                 onSelect={setSelectedRuleId}
                 disabled={false}
               />
            </div>

            {selectedRule ? (
              <div className="animate-slide-up">
                <RuleDisplay 
                  rule={selectedRule}
                  cachedExplanation={explanationCache[selectedRule.id]}
                  onCache={(explanation) => handleCacheUpdate(selectedRule.id, explanation)}
                />
              </div>
            ) : (
              <div className="text-center py-24 opacity-40 select-none">
                <div className="text-7xl mb-6 text-gray-700">📜</div>
                <p className="text-2xl font-fantasy text-gray-500">Select a keyword to begin</p>
                <p className="text-sm font-mono text-gray-600 mt-2">Example: "Trample", "Storm", "Ward"</p>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="fixed bottom-0 w-full bg-mtg-dark/90 backdrop-blur-md text-center py-2 text-[10px] text-gray-600 border-t border-mtg-border z-10">
        <p>Unofficial Fan Content. Not approved/endorsed by Wizards of the Coast.</p>
      </footer>
    </div>
  );
};

export default App;