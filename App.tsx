import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import GPSCapture from './components/GPSCapture';
import SavedLocationsList from './components/SavedLocationsList';
import ExportUnifiedView from './components/ExportUnifiedView';
import ResultCard from './components/ResultCard';
import StakeoutModule from './components/StakeoutModule';
import HelpView from './components/HelpView';
import GlobalFooter from './components/GlobalFooter';
import { SavedLocation, Coordinate, StakeoutPoint } from './types';
import { geoidService } from './services/GeoidService';

const App = () => {
  type ViewType = 'onboarding' | 'dashboard' | 'capture' | 'list' | 'export' | 'result' | 'stakeout' | 'help';
  const [view, setView] = useState<ViewType>('onboarding');
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [lastResult, setLastResult] = useState<SavedLocation | null>(null);
  const [autoShowMap, setAutoShowMap] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [stakeoutInitialPoint, setStakeoutInitialPoint] = useState<StakeoutPoint | null>(null);

  // Navigation wrapper to sync with browser history
  const navigateTo = (newView: ViewType) => {
    if (newView !== view) {
      window.history.pushState({ view: newView }, '');
      setView(newView);
    }
  };

  useEffect(() => {
    geoidService.initialize();

    // Always start with onboarding as requested
    setView('onboarding');
    window.history.replaceState({ view: 'onboarding' }, '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView('onboarding');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const CURRENT_KEY = 'gps_locations_v6.5.5';
    const OLD_KEY = 'gps_locations_v6.5.4';
    
    let saved = localStorage.getItem(CURRENT_KEY);
    if (!saved) {
      const oldData = localStorage.getItem(OLD_KEY);
      if (oldData) {
        localStorage.setItem(CURRENT_KEY, oldData);
        saved = oldData;
      }
    }
    
    if (saved) setLocations(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_locations_v6.5.5', JSON.stringify(locations));
  }, [locations]);

  const handleFinishOnboarding = () => {
    localStorage.setItem('onboarding_v6.5.5_done', 'true');
    // Use replaceState so dashboard becomes the root (can't go back to onboarding)
    window.history.replaceState({ view: 'dashboard' }, '');
    setView('dashboard');
  };

  const handleGPSComplete = (coord: Coordinate, folderName: string, pointName: string, description: string, coordinateSystem: string) => {
    const newLoc: SavedLocation = {
      ...coord,
      id: Date.now().toString(),
      name: pointName,
      folderName: folderName,
      description: description,
      coordinateSystem: coordinateSystem
    };
    setLocations(prev => [newLoc, ...prev]);
    setLastResult(newLoc);
    setAutoShowMap(false);
    navigateTo('result');
  };

  const resetToDashboard = () => {
    setIsContinuing(false);
    navigateTo('dashboard');
  };

  const handleNewMeasurement = (continuing: boolean) => {
    setIsContinuing(continuing);
    navigateTo('capture');
  };

  const handleViewOnMap = (l: SavedLocation) => {
    setLastResult(l);
    setAutoShowMap(true);
    navigateTo('result');
  };

  return (
    <div className="h-full bg-white font-sans text-slate-900 overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        
        {view === 'onboarding' && (
          <div className="flex-1 flex flex-col overflow-y-auto h-full">
            <Onboarding onFinish={handleFinishOnboarding} />
            <GlobalFooter />
          </div>
        )}
        
        {view === 'dashboard' && (
          <div className="flex-1 flex flex-col overflow-y-auto h-full">
            <Dashboard 
              onStartCapture={() => handleNewMeasurement(false)} 
              onStakeout={() => navigateTo('stakeout')}
              onShowList={() => navigateTo('list')}
              onShowExport={() => navigateTo('export')}
              onShowHelp={() => navigateTo('help')}
            />
            <GlobalFooter showAd={true} />
          </div>
        )}

        {view === 'help' && (
          <HelpView onBack={resetToDashboard} />
        )}

        {view === 'stakeout' && (
          <StakeoutModule 
            onBack={() => {
              setStakeoutInitialPoint(null);
              resetToDashboard();
            }} 
            initialPoint={stakeoutInitialPoint}
          />
        )}

        {view === 'capture' && (
          <div className="flex-1 flex flex-col overflow-y-auto h-full">
            <GPSCapture 
              existingLocations={locations}
              onComplete={handleGPSComplete}
              onCancel={resetToDashboard}
              isContinuing={isContinuing}
            />
          </div>
        )}

        {view === 'list' && (
          <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-[#F8FAFC]">
            <header className="px-8 pt-6 pb-6 flex items-center gap-5 shrink-0 bg-white">
              <button onClick={resetToDashboard} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800 active:scale-90 transition-all">
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Kayıtlı Projeler</h2>
              </div>
            </header>
            <div className="flex-1 px-8 overflow-y-auto no-scrollbar pt-0 pb-4">
              <SavedLocationsList 
                locations={locations} 
                onDelete={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
                onDeleteFolder={(name) => setLocations(prev => prev.filter(l => l.folderName !== name))}
                onRenameFolder={(oldName, newName) => setLocations(prev => prev.map(l => 
                  l.folderName === oldName ? { ...l, folderName: newName } : l
                ))}
                onBulkDelete={(ids) => setLocations(prev => prev.filter(l => !ids.includes(l.id)))}
                onViewOnMap={handleViewOnMap}
              />
            </div>
            <GlobalFooter />
          </div>
        )}

        {view === 'export' && (
          <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-[#F8FAFC]">
            <header className="px-8 pt-6 pb-6 flex items-center gap-5 shrink-0 bg-white">
              <button onClick={resetToDashboard} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800 active:scale-90 transition-all">
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Veri Aktar</h2>
              </div>
            </header>
            <div className="flex-1 px-8 overflow-y-auto no-scrollbar pt-0 pb-4">
               <ExportUnifiedView locations={locations} />
            </div>
            <GlobalFooter />
          </div>
        )}

        {view === 'result' && lastResult && (
          <div className="flex-1 flex flex-col animate-in h-full px-8 pt-8 overflow-hidden bg-white">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <ResultCard location={lastResult} initialShowMap={autoShowMap} />
              <div className="mt-8 space-y-4">
                 <button onClick={() => handleNewMeasurement(true)} className="w-full py-2.5 md:py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 active:scale-95 transition-all text-[13px] uppercase tracking-widest">YENİ NOKTA EKLE</button>
                 <button onClick={resetToDashboard} className="w-full py-2.5 md:py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all">ÖLÇÜMÜ BİTİR</button>
              </div>
            </div>
            <GlobalFooter />
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
