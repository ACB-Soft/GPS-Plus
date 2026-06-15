import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import GPSCapture from './components/GPSCapture';
import SavedLocationsList from './components/SavedLocationsList';
import ExportUnifiedView from './components/ExportUnifiedView';
import ResultCard from './components/ResultCard';
import StakeoutModule from './components/StakeoutModule';
import HelpView from './components/HelpView';
import SettingsView from './components/SettingsView';
import DataAnalysisView from './components/DataAnalysisView';
import GlobalFooter from './components/GlobalFooter';
import Header from './components/Header';
import { SavedLocation, Coordinate, StakeoutPoint, AppSettings, CalculationMethod } from './types';
import { geoidService } from './services/GeoidService';
import { calculateResult } from './utils/MathUtils';
import { useLanguage } from './utils/LanguageContext';

const App = () => {
  const { t } = useLanguage();
  type ViewType = 'onboarding' | 'dashboard' | 'capture' | 'list' | 'export' | 'result' | 'stakeout' | 'help' | 'settings' | 'acblabs';
  const [view, setView] = useState<ViewType>('onboarding');
  const [subView, setSubView] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const viewRef = React.useRef<ViewType>(view);
  const subViewRef = React.useRef<string | null>(subView);

  // Keep refs in sync
  React.useEffect(() => {
    viewRef.current = view;
    subViewRef.current = subView;
  }, [view, subView]);

  const [locations, setLocations] = useState<SavedLocation[]>(() => {
    const CURRENT_KEY = 'gps_locations_v5.0';
    const PREV_KEY = 'gps_locations_v7.8.8';
    const OLD_KEY = 'gps_locations_v7.8.0';
    let saved = localStorage.getItem(CURRENT_KEY);
    if (!saved) {
      const prevData = localStorage.getItem(PREV_KEY);
      if (prevData) {
        localStorage.setItem(CURRENT_KEY, prevData);
        saved = prevData;
      } else {
        const oldData = localStorage.getItem(OLD_KEY);
        if (oldData) {
          localStorage.setItem(CURRENT_KEY, oldData);
          saved = oldData;
        }
      }
    }
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved locations:", e);
      return [];
    }
  });
  const [lastResult, setLastResult] = useState<SavedLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: 'capture' | 'stakeout'; continuing?: boolean } | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [resultSource, setResultSource] = useState<'capture' | 'list'>('capture');
  const [autoShowMap, setAutoShowMap] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [stakeoutInitialPoint, setStakeoutInitialPoint] = useState<StakeoutPoint | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => ({
    defaultCoordinateSystem: localStorage.getItem('default_coord_system') || 'WGS84',
    defaultAccuracyLimit: parseFloat(localStorage.getItem('default_accuracy_limit') || '5'),
    defaultMeasurementDuration: parseInt(localStorage.getItem('default_duration') || '15'),
    alertsEnabled: localStorage.getItem('default_audio_feedback_enabled') !== 'false',
    vibrationEnabled: localStorage.getItem('default_vibration_feedback_enabled') === 'true',
    screenAlwaysOn: localStorage.getItem('default_screen_always_on') !== 'false',
    mapProvider: localStorage.getItem('default_map_provider') || 'Google Hybrid',
    locationPrecision: parseInt(localStorage.getItem('default_location_precision') || '2'),
    heightPrecision: parseInt(localStorage.getItem('default_height_precision') || '1'),
    heightType: (localStorage.getItem('default_height_type') as 'orthometric' | 'ellipsoidal') || 'orthometric',
    calculationMethod: (localStorage.getItem('default_calculation_method') || 'WEIGHTED_LSE') as any,
    gnssOnlyMode: localStorage.getItem('default_gnss_only_mode') === 'true',
    showOnboarding: localStorage.getItem('show_onboarding_every_time') !== 'false',
  }));

  // Navigation wrapper to sync with browser history
  const navigateTo = (newView: ViewType, newSubView: string | null = null) => {
    if (newView !== view || newSubView !== subView) {
      const currentState = window.history.state;
      const currentIndex = (currentState && typeof currentState.index === 'number') ? currentState.index : 0;

      if (newView === 'dashboard') {
        // Reset to dashboard: jump back to the root entry
        if (currentIndex > 0) {
          window.history.go(-currentIndex);
        } else {
          window.history.replaceState({ view: 'dashboard', subView: null, index: 0 }, '');
          setView('dashboard');
          setSubView(null);
        }
      } else {
        const nextIndex = currentIndex + 1;
        window.history.pushState({ view: newView, subView: newSubView, index: nextIndex }, '');
        setView(newView);
        setSubView(newSubView);
      }
    }
  };

  useEffect(() => {
    geoidService.initialize();

    const showOnboardingEveryTime = localStorage.getItem('show_onboarding_every_time') !== 'false';
    const onboardingDone = localStorage.getItem('onboarding_v5.0_done') === 'true';
    
    // Start with onboarding if not done or if requested to show every time
    const initialView = (!onboardingDone || showOnboardingEveryTime) ? 'onboarding' : 'dashboard';
    
    setView(initialView);
    setSubView(null);
    window.history.replaceState({ view: initialView, subView: null, index: 0 }, '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
        setSubView(event.state.subView || null);
      } else if (viewRef.current !== 'onboarding') {
        // Only go back to onboarding if we're not already there
        setView('onboarding');
        setSubView(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Recalculate locations when calculation method changes
  useEffect(() => {
    setLocations(prevLocations => {
      let changed = false;
      const updated = prevLocations.map(loc => {
        if (loc.samples && loc.samples.length > 0 && 
           (loc.calculationMethod !== settings.calculationMethod || loc.gnssOnlyMode !== settings.gnssOnlyMode)) {
          const { result, usedIndices, fallbackApplied, actualMethodUsed } = calculateResult(loc.samples, settings.calculationMethod, loc.accuracyLimit || 5, settings.gnssOnlyMode);
          changed = true;
          return {
            ...loc,
            lat: result.lat,
            lng: result.lng,
            accuracy: result.accuracy,
            altitude: result.altitude,
            altitudeAccuracy: result.altitudeAccuracy,
            calculationMethod: settings.calculationMethod,
            gnssOnlyMode: settings.gnssOnlyMode,
            usedSampleIndices: usedIndices,
            fallbackApplied,
            actualMethodUsed
          };
        }
        return loc;
      });
      return changed ? updated : prevLocations;
    });

    if (lastResult && lastResult.samples && lastResult.samples.length > 0 && 
       (lastResult.calculationMethod !== settings.calculationMethod || lastResult.gnssOnlyMode !== settings.gnssOnlyMode)) {
      const { result, usedIndices, fallbackApplied, actualMethodUsed } = calculateResult(lastResult.samples, settings.calculationMethod, lastResult.accuracyLimit || 5, settings.gnssOnlyMode);
      setLastResult({
        ...lastResult,
        lat: result.lat,
        lng: result.lng,
        accuracy: result.accuracy,
        altitude: result.altitude,
        altitudeAccuracy: result.altitudeAccuracy,
        calculationMethod: settings.calculationMethod,
        gnssOnlyMode: settings.gnssOnlyMode,
        usedSampleIndices: usedIndices,
        fallbackApplied,
        actualMethodUsed
      });
    }
  }, [settings.calculationMethod, settings.gnssOnlyMode]);

  const triggerProtectedAction = (actionType: 'capture' | 'stakeout', continuing: boolean = false) => {
    if (!navigator.geolocation) {
      setLocationError("NOT_SUPPORTED");
      setPendingAction({ type: actionType, continuing });
      return;
    }

    const executeAction = () => {
      setLocationError(null);
      setPendingAction(null);
      if (actionType === 'capture') {
        handleNewMeasurement(continuing);
      } else {
        navigateTo('stakeout', 'MENU');
      }
    };

    setIsCheckingLocation(true);

    // Use permissions API first if available for an instant transition if already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          setIsCheckingLocation(false);
          executeAction();
        } else if (result.state === 'denied') {
          setIsCheckingLocation(false);
          setLocationError("PERMISSION_DENIED");
          setPendingAction({ type: actionType, continuing });
        } else {
          // 'prompt' state - perform actual getCurrentPosition to trigger browser dialog
          navigator.geolocation.getCurrentPosition(
            () => {
              setIsCheckingLocation(false);
              executeAction();
            },
            (err) => {
              setIsCheckingLocation(false);
              if (err.code === 1) { // PERMISSION_DENIED
                setLocationError("PERMISSION_DENIED");
                setPendingAction({ type: actionType, continuing });
              } else {
                // Other errors (timeout/unavailable) mean permission IS granted, but direct GPS signal is not ready.
                // We should let them enter the screen.
                executeAction();
              }
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
        }
      }).catch(() => {
        // Fallback if permissions query fails
        navigator.geolocation.getCurrentPosition(
          () => {
            setIsCheckingLocation(false);
            executeAction();
          },
          (err) => {
            setIsCheckingLocation(false);
            if (err.code === 1) {
              setLocationError("PERMISSION_DENIED");
              setPendingAction({ type: actionType, continuing });
            } else {
              executeAction();
            }
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      });
    } else {
      // No permissions API support (e.g., older iOS), just run getCurrentPosition
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsCheckingLocation(false);
          executeAction();
        },
        (err) => {
          setIsCheckingLocation(false);
          if (err.code === 1) {
            setLocationError("PERMISSION_DENIED");
            setPendingAction({ type: actionType, continuing });
          } else {
            executeAction();
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  };



  useEffect(() => {
    // Request persistent storage so browsers (especially iOS/Safari) don't auto-clear site data
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist()
        .then((persisted) => {
          if (persisted) {
            console.log("Storage persistence granted successfully.");
          } else {
            console.warn("Storage persistence request denied by the browser.");
          }
        })
        .catch((err) => {
          console.error("Failed to request storage persistence:", err);
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_locations_v5.0', JSON.stringify(locations));
  }, [locations]);

  const handleFinishOnboarding = () => {
    localStorage.setItem('onboarding_v5.0_done', 'true');
    navigateTo('dashboard');
  };

  const handleGPSComplete = (coord: Coordinate, folderName: string, pointName: string, description: string, coordinateSystem: string, duration: number, samples: Coordinate[], usedIndices: number[], accLimit: number, method: any, gnssOnly: boolean, rawSamples?: Coordinate[]) => {
    const { fallbackApplied, actualMethodUsed } = calculateResult(samples, method, accLimit, gnssOnly);
    const newLoc: SavedLocation = {
      ...coord,
      id: Date.now().toString(),
      name: pointName,
      folderName: folderName,
      description: description,
      coordinateSystem: coordinateSystem,
      measurementDuration: duration,
      calculationMethod: method,
      gnssOnlyMode: gnssOnly,
      samples: samples,
      rawSamples: rawSamples && rawSamples.length > 0 ? rawSamples : samples,
      usedSampleIndices: usedIndices,
      accuracyLimit: accLimit,
      fallbackApplied,
      actualMethodUsed
    };
    setLocations(prev => [newLoc, ...prev]);
    setLastResult(newLoc);
    setAutoShowMap(false);
    setResultSource('capture');
    navigateTo('result');
  };

  const resetToDashboard = () => {
    setIsContinuing(false);
    navigateTo('dashboard');
  };

  const handleNewMeasurement = (continuing: boolean) => {
    setIsContinuing(continuing);
    navigateTo('capture', continuing ? 'READY' : 'SELECT_MODE');
  };

  const handleViewOnMap = (l: SavedLocation) => {
    setLastResult(l);
    setAutoShowMap(true);
    setResultSource('list');
    navigateTo('result');
  };

   const handleOpenACBLabs = () => {
    if (localStorage.getItem('acb_labs_authorized') === 'true') {
      navigateTo('acblabs');
      return;
    }
    setPasswordInput('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === "748123") {
      localStorage.setItem('acb_labs_authorized', 'true');
      setShowPasswordModal(false);
      navigateTo('acblabs');
    } else {
      setPasswordError(t("Hatalı şifre!"));
    }
  };

  return (
    <div className="h-full bg-slate-200 font-sans text-slate-900 overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        
        {view === 'onboarding' && (
          <div className="flex-1 flex flex-col overflow-y-auto h-full">
            <Onboarding onFinish={handleFinishOnboarding} />
            <GlobalFooter />
          </div>
        )}
        
        {view === 'dashboard' && (
          <div className="flex-1 flex flex-col overflow-y-auto h-full no-scrollbar">
            <Dashboard 
              onStartCapture={() => triggerProtectedAction('capture')} 
              onStakeout={() => triggerProtectedAction('stakeout')}
              onShowList={() => navigateTo('list')}
              onShowExport={() => navigateTo('export')}
              onShowHelp={() => navigateTo('help')}
              onShowSettings={() => navigateTo('settings')}
              onRetryLocation={() => {}}
              locationError={null}
            />
            <GlobalFooter />
          </div>
        )}

        {view === 'help' && (
          <HelpView onBack={() => window.history.back()} />
        )}

        {view === 'settings' && (
          <SettingsView 
            onBack={() => {
              // Refresh settings when coming back from settings
              setSettings({
                defaultCoordinateSystem: localStorage.getItem('default_coord_system') || 'WGS84',
                defaultAccuracyLimit: parseFloat(localStorage.getItem('default_accuracy_limit') || '5'),
                defaultMeasurementDuration: parseInt(localStorage.getItem('default_duration') || '15'),
                alertsEnabled: localStorage.getItem('default_audio_feedback_enabled') !== 'false',
                vibrationEnabled: localStorage.getItem('default_vibration_feedback_enabled') === 'true',
                screenAlwaysOn: localStorage.getItem('default_screen_always_on') !== 'false',
                mapProvider: localStorage.getItem('default_map_provider') || 'Google Hybrid',
                locationPrecision: parseInt(localStorage.getItem('default_location_precision') || '2'),
                heightPrecision: parseInt(localStorage.getItem('default_height_precision') || '1'),
                heightType: (localStorage.getItem('default_height_type') as 'orthometric' | 'ellipsoidal') || 'orthometric',
                calculationMethod: (localStorage.getItem('default_calculation_method') || 'WEIGHTED_LSE') as any,
                gnssOnlyMode: localStorage.getItem('default_gnss_only_mode') === 'true',
                showOnboarding: localStorage.getItem('show_onboarding_every_time') !== 'false',
              });
              window.history.back();
            }} 
            onRestoreLocations={setLocations}
          />
        )}

        {view === 'stakeout' && (
          <StakeoutModule 
            onBack={() => {
              setStakeoutInitialPoint(null);
              window.history.back();
            }} 
            initialPoint={stakeoutInitialPoint}
            settings={settings}
            currentStep={subView}
            onNavigate={(step) => navigateTo('stakeout', step)}
          />
        )}

        {view === 'capture' && (
          <div className="flex-1 flex flex-col overflow-y-auto h-full">
            <GPSCapture 
              existingLocations={locations}
              onComplete={handleGPSComplete}
              onCancel={() => window.history.back()}
              isContinuing={isContinuing}
              currentStep={subView as any}
              onNavigate={(step) => navigateTo('capture', step)}
              settings={settings}
            />
          </div>
        )}

        {view === 'list' && (
          <div className="flex-1 flex flex-col animate-in h-full overflow-y-auto no-scrollbar bg-slate-200">
            <Header title="Kayıtlı Ölçümler" />
            <div className="px-8 pt-4 pb-4 w-full">
              <div className="max-w-sm mx-auto w-full">
                <SavedLocationsList 
                  locations={locations} 
                  settings={settings}
                  onDelete={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
                onDeleteFolder={(name) => setLocations(prev => prev.filter(l => l.folderName !== name))}
                onRenameFolder={(oldName, newName) => setLocations(prev => prev.map(l => 
                  l.folderName === oldName ? { ...l, folderName: newName } : l
                ))}
                onRenamePoint={(id, newName) => setLocations(prev => prev.map(l => 
                  l.id === id ? { ...l, name: newName } : l
                ))}
                onBulkDelete={(ids) => setLocations(prev => prev.filter(l => !ids.includes(l.id)))}
                onViewOnMap={handleViewOnMap}
              />
            </div>
            </div>
            <GlobalFooter />
          </div>
        )}

        {view === 'export' && (
          <div className="flex-1 flex flex-col animate-in h-full overflow-y-auto no-scrollbar bg-slate-200">
            <Header title="Veri Aktar" />
            <div className="px-8 pt-4 pb-4">
               <ExportUnifiedView locations={locations} settings={settings} onOpenACBLabs={handleOpenACBLabs} />
            </div>
            <GlobalFooter />
          </div>
        )}

        {view === 'acblabs' && (
          <DataAnalysisView 
            locations={locations} 
            settings={settings} 
            onClose={() => window.history.back()} 
          />
        )}

        {view === 'result' && lastResult && (
          <div className="flex-1 flex flex-col animate-in h-full overflow-y-auto no-scrollbar bg-slate-200 px-8">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pt-8">
              <ResultCard 
                location={lastResult} 
                settings={settings}
                initialShowMap={autoShowMap} 
                onCloseMap={resultSource === 'list' ? () => window.history.back() : undefined}
              />
              <div className="mt-8 space-y-4">
                 <button 
                   onClick={() => triggerProtectedAction('capture', true)} 
                   className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 active:scale-95 transition-all text-[13px] uppercase tracking-[0.2em] leading-none"
                 >
                   {t("YENİ NOKTA EKLE")}
                 </button>
                 <button 
                   onClick={resetToDashboard} 
                   className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all leading-none shadow-xl shadow-slate-300"
                 >
                   {t("ÖLÇÜMÜ BİTİR")}
                 </button>
              </div>
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {/* Dynamic Location Permissions overlays */}
        {isCheckingLocation && (
          <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-md px-6 py-5 rounded-3xl shadow-2xl border border-slate-150 flex items-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{t("CİHAZ BAĞLANTISI")}</p>
                <h4 className="text-xs font-black text-slate-800 leading-tight">{t("Konum İzni Denetleniyor...")}</h4>
              </div>
            </div>
          </div>
        )}

        {locationError && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                    <i className="fas fa-triangle-exclamation text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-red-900 font-black uppercase tracking-tight text-lg leading-tight animate-pulse">
                      {locationError === "NOT_SUPPORTED" ? t("Desteklenmiyor") : (
                        <>{t("Konum İzni")}<br/>{t("Gerekli")}</>
                      )}
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-4 text-[13px] font-bold text-slate-600 leading-snug">
                  {locationError === "NOT_SUPPORTED" ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      {t("Tarayıcınız konum servisini desteklemiyor. Lütfen farklı bir tarayıcı deneyin veya cihaz ayarlarınızı kontrol edin.")}
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-red-600 block mb-1 uppercase text-[10px] tracking-widest font-black">{t("1. Android Kullanıcıları")}</span>
                        {t("Üst bildiri panelinden konum servislerini aktif hale getirin.")}
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-red-600 block mb-1 uppercase text-[10px] tracking-widest font-black">{t("2. iOS Kullanıcıları")}</span>
                        {t("Ayarlar-Konum-Safari Siteleri-Konum iznini aktif hale getirin.")}
                      </div>
                    </>
                  )}
                  
                  <div className="pt-2 flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        if (pendingAction) {
                          triggerProtectedAction(pendingAction.type, pendingAction.continuing);
                        } else {
                          // Fallback check
                          navigator.geolocation.getCurrentPosition(
                            () => setLocationError(null),
                            (err) => {
                              if (err.code === 1) setLocationError("PERMISSION_DENIED");
                            }
                          );
                        }
                      }}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <i className="fas fa-rotate-right"></i>
                      {locationError === "NOT_SUPPORTED" ? t("Tekrar Dene") : t("İzni Tekrar Kontrol Et")}
                    </button>

                    <button 
                      onClick={() => {
                        setLocationError(null);
                        setPendingAction(null);
                      }}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {t("İptal")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACB Labs Password Modal Prompt */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <form 
              onSubmit={handlePasswordSubmit}
              className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <i className="fas fa-lock text-2xl animate-pulse"></i>
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-extrabold uppercase tracking-tight text-base leading-tight">
                      {t("Aktivasyon Kodu")}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <input 
                      type="password"
                      autoFocus
                      required
                      placeholder="••••••"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError('');
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 placeholder-slate-300 rounded-xl text-center font-mono text-lg font-black tracking-[0.3em] outline-none transition-all"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 animate-in shake duration-200">
                      <i className="fas fa-circle-exclamation text-xs"></i>
                      <span className="text-[11px] font-bold uppercase tracking-tight">{passwordError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fas fa-sign-in-alt"></i>
                      {t("Giriş Yap")}
                    </button>

                    <button 
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {t("İptal")}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
