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

  return (
    <div className="min-h-screen bg-mtg-dark text-mtg-text font-sans selection:bg-mtg-accent selection:text-black pb-20">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gray-700 shadow-lg mb-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white">
            <span className="text-mtg-accent">MTG</span> Rules
          </h1>
          <div className="text-xs text-gray-500 font-mono hidden sm:block">Unofficial Companion</div>
        </div>
      </header>

      {/* Main Content - Restored standard padding (px-4) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {status === LoadingState.LOADING && (
          <div className="text-center pt-10">
            <LoadingSpinner />
            <p className="text-gray-400 mt-4 text-sm">Wczytuję zasady...</p>
          </div>
        )}

        {status === LoadingState.ERROR && (
          <div className="bg-red-900/50 border border-red-500 text-red-100 p-4 rounded-lg text-center max-w-lg mx-auto mt-10">
            <h3 className="font-bold text-lg mb-2">Błąd</h3>
            <p>{errorMsg}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors text-sm"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {status === LoadingState.SUCCESS && (
          <div className="space-y-6 animate-fade-in">
            
            <RuleSelector 
              rules={rules}
              selectedId={selectedRuleId}
              onSelect={setSelectedRuleId}
              disabled={false}
            />

            {selectedRule ? (
              <RuleDisplay rule={selectedRule} />
            ) : (
              <div className="text-center py-20 opacity-30">
                <div className="text-6xl mb-4 grayscale">📜</div>
                <p className="text-lg font-light">Wybierz słowo kluczowe</p>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="fixed bottom-0 w-full bg-[#1a1818]/95 backdrop-blur-sm text-center py-3 text-[10px] text-gray-600 border-t border-gray-800">
        Fan Content Policy permitted. Not official WotC content.
      </footer>
    </div>
  );
};

export default App;