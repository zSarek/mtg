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

  // Find the full rule object based on selection
  const selectedRule = useMemo(() => 
    rules.find(r => r.id === selectedRuleId), 
  [rules, selectedRuleId]);

  return (
    <div className="min-h-screen bg-mtg-dark text-mtg-text font-sans selection:bg-mtg-accent selection:text-black pb-20">
      
      {/* Header / Hero */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gray-700 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            <span className="text-mtg-accent">MTG</span> Rules Companion
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Przeglądarka Keywords (701) i Keyword Abilities (702) z oficjalnych zasad (Comprehensive Rules).
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* State: Loading */}
        {status === LoadingState.LOADING && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-400 mt-4">Pobieranie i przetwarzanie księgi zasad...</p>
          </div>
        )}

        {/* State: Error */}
        {status === LoadingState.ERROR && (
          <div className="bg-red-900/50 border border-red-500 text-red-100 p-4 rounded-lg text-center max-w-lg mx-auto">
            <h3 className="font-bold text-lg mb-2">Błąd</h3>
            <p>{errorMsg}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* State: Success */}
        {status === LoadingState.SUCCESS && (
          <div className="space-y-8 animate-fade-in">
            
            <RuleSelector 
              rules={rules}
              selectedId={selectedRuleId}
              onSelect={setSelectedRuleId}
              disabled={false}
            />

            {selectedRule ? (
              <RuleDisplay rule={selectedRule} />
            ) : (
              <div className="text-center py-20 opacity-50">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-xl font-light">Wybierz słowo kluczowe z listy powyżej, aby zobaczyć opis.</p>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-sm text-center py-2 text-xs text-gray-600 border-t border-gray-800">
        Data source: Wizards of the Coast (MagicCompRules 20251114.txt). Unofficial Fan Content.
      </footer>
    </div>
  );
};

export default App;