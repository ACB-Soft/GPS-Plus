import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinate, SavedLocation, CalculationMethod } from '../types';
import { calculateResult, calculateMaxDistance } from '../utils/MathUtils';
import { convertToMSL } from './GeoidUtils';
import { getAccuracyColor, getAccuracyBg } from '../utils/StyleUtils';
import GlobalFooter from './GlobalFooter';
import Header from './Header';

interface Props {
  onComplete: (coord: Coordinate, folderName: string, pointName: string, description: string, coordinateSystem: string, duration: number, samples: Coordinate[], usedIndices: number[], accuracyLimit: number, method: CalculationMethod) => void;
  onCancel: () => void;
  isContinuing?: boolean;
  existingLocations: SavedLocation[];
  currentStep?: 'SELECT_MODE' | 'FORM' | 'READY' | 'COUNTDOWN';
  onNavigate: (step: 'SELECT_MODE' | 'FORM' | 'READY' | 'COUNTDOWN') => void;
  gnssOnlySetting?: boolean;
}

const GPSCapture: React.FC<Props> = ({ onComplete, onCancel, isContinuing = false, existingLocations, currentStep, onNavigate, gnssOnlySetting = false }) => {
  const [step, setStep] = useState<'SELECT_MODE' | 'FORM' | 'READY' | 'COUNTDOWN'>(currentStep || (isContinuing ? 'READY' : 'SELECT_MODE'));
  const [isNewProject, setIsNewProject] = useState(!isContinuing);

  useEffect(() => {
    if (currentStep && currentStep !== step) {
      setStep(currentStep);
    }
  }, [currentStep]);
  const [folderName, setFolderName] = useState(localStorage.getItem('last_folder_name') || '');
  const [pointName, setPointName] = useState('');
  
  const getInitialSystem = () => {
     const savedFolder = localStorage.getItem('last_folder_name');
     if (savedFolder) {
        const proj = existingLocations.find(l => l.folderName === savedFolder);
        if (proj && proj.coordinateSystem) return proj.coordinateSystem;
     }
     return localStorage.getItem('default_coord_system') || 'WGS84';
  };

  const [coordinateSystem, setCoordinateSystem] = useState(getInitialSystem());
  const [accuracyLimit, setAccuracyLimit] = useState(parseFloat(localStorage.getItem('default_accuracy_limit') || '5.0'));
  const [measurementDuration, setMeasurementDuration] = useState(parseInt(localStorage.getItem('default_duration') || '5'));
  const [seconds, setSeconds] = useState(parseInt(localStorage.getItem('default_duration') || '5'));
  const [sampleCount, setSampleCount] = useState(0);
  const [reliabilityStatus, setReliabilityStatus] = useState<'GOOD' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'>('UNKNOWN');
  const [instantAccuracy, setInstantAccuracy] = useState<number | null>(null);
  const [waitingForSignal, setWaitingForSignal] = useState(true);
  const [captureError, setCaptureError] = useState<string | null>(null);
  
  const samplesRef = useRef<Coordinate[]>([]);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const lastSavedPositionRef = useRef<{lat: number, lng: number, accuracy: number} | null>(null);
  const lastSaveTimestampRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock is active');
      } catch (err: any) {
        // Iframe içinde veya izin politikası kısıtlı olduğunda bu hata normaldir.
        if (err.name === 'NotAllowedError') {
          console.warn('Wake Lock disallowed by permissions policy (likely running in an iframe)');
        } else {
          console.error(`Wake Lock error: ${err.name}, ${err.message}`);
        }
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Wake Lock released');
    }
  };

  // Warm up GPS on mount
  useEffect(() => {
    startGPSWarmup();
    return () => {
      releaseWakeLock();
    };
  }, []);

  const startGPSWarmup = () => {
    if (navigator.geolocation) {
      setWaitingForSignal(true);
      setCaptureError(null);
      
      // iOS için optimize edilmiş ayarlar
      // maximumAge: 5000 -> Son 5 saniyedeki konumu kabul et (hızlı açılış için)
      // timeout: 30000 -> GPS'in ısınması için iPhone'lara daha fazla zaman tanı
      const options = { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 };
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setInstantAccuracy(pos.coords.accuracy);
          lastPositionRef.current = pos;
          setWaitingForSignal(false);
          setCaptureError(null);
        },
        (err) => {
          console.warn("High accuracy failed, trying low accuracy...", err);
          // Yüksek hassasiyet başarısız olursa, düşük hassasiyeti dene (Fallback)
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setInstantAccuracy(pos.coords.accuracy);
              lastPositionRef.current = pos;
              setWaitingForSignal(false);
              setCaptureError(null);
            },
            (err2) => {
              let msg = `Kod: ${err2.code} - ${err2.message}`;
              if (err2.code === 1) {
                msg = "Konum izni reddedildi. Lütfen ayarlardan izin verin.";
              }
              else if (err2.code === 2) msg = "Konum alınamıyor. GPS sinyali zayıf olabilir.";
              else if (err2.code === 3) msg = "Zaman aşımı. GPS yanıt vermedi.";
              setCaptureError(msg);
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
          );
        },
        options
      );
    } else {
      setCaptureError("Tarayıcınız konum servisini desteklemiyor.");
    }
  };

  const getNextPointName = useCallback((projName: string) => {
    const projPoints = existingLocations.filter(l => l.folderName === projName);
    return `Nokta${projPoints.length + 1}`;
  }, [existingLocations]);

  useEffect(() => {
    if (folderName) setPointName(getNextPointName(folderName));
  }, [folderName, getNextPointName]);

  useEffect(() => {
    if (folderName) {
      const existingProject = existingLocations.find(l => l.folderName === folderName);
      if (existingProject && existingProject.coordinateSystem) {
        setCoordinateSystem(existingProject.coordinateSystem);
      }
    }
  }, [folderName, existingLocations]);

  useEffect(() => {
    if (step === 'READY' || step === 'COUNTDOWN') {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setInstantAccuracy(pos.coords.accuracy);
          lastPositionRef.current = pos;
          setWaitingForSignal(false);
          setCaptureError(null);
          
          if (step === 'COUNTDOWN') {
            // --- HİBRİT MANTIK: Farklı Veri Gelirse Kaydet ---
            const current = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            };

            const isDifferent = !lastSavedPositionRef.current || 
              lastSavedPositionRef.current.lat !== current.lat ||
              lastSavedPositionRef.current.lng !== current.lng ||
              lastSavedPositionRef.current.accuracy !== current.accuracy;

            if (isDifferent) {
              // ONLY SAVE IF IT SATISFIES THE DETERMINED LIMITS
              const isAccOk = current.accuracy <= accuracyLimit;
              const isGnssOk = !gnssOnlySetting || (pos.coords.altitude !== null && pos.coords.altitude !== 0);

              if (isAccOk && isGnssOk) {
                samplesRef.current.push({
                  lat: pos.coords.latitude, 
                  lng: pos.coords.longitude,
                  accuracy: pos.coords.accuracy, 
                  altitude: pos.coords.altitude, 
                  altitudeAccuracy: pos.coords.altitudeAccuracy,
                  timestamp: Date.now()
                });
                lastSavedPositionRef.current = current;
                lastSaveTimestampRef.current = Date.now();
                setSampleCount(samplesRef.current.length);

                // Check reliability
                const currentSamples = samplesRef.current;
                const currentAvgAcc = currentSamples.reduce((a, b) => a + b.accuracy, 0) / currentSamples.length;
                
                if (currentAvgAcc > 20) {
                  setReliabilityStatus('CRITICAL');
                } else if (currentSamples.length >= 3) {
                   const maxDist = calculateMaxDistance(currentSamples);
                   
                   if (maxDist > currentAvgAcc * 3) setReliabilityStatus('CRITICAL');
                   else if (maxDist > currentAvgAcc * 1.5) setReliabilityStatus('WARNING');
                   else if (currentAvgAcc > 10) setReliabilityStatus('WARNING');
                   else setReliabilityStatus('GOOD');
                }
              }
            }
          }
        },
        (err) => { 
          setInstantAccuracy(null); 
          setWaitingForSignal(true);
          setCaptureError(`Kod: ${err.code} - ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
    return () => { 
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [step]); // Removed waitingForSignal from deps to avoid infinite loop

  const processSamples = useCallback(() => {
    let samples = [...samplesRef.current];
    
    // Geçen süreyi hesapla (Erken bitirme durumu için)
    const elapsedSeconds = measurementDuration - seconds;
    const actualDuration = elapsedSeconds > 0 ? elapsedSeconds : measurementDuration;

    if (samples.length === 0 && lastPositionRef.current) {
      const p = lastPositionRef.current;
      // Only add manually if it satisfies the accuracy limit and GNSS requirements
      const isAccOk = p.coords.accuracy <= accuracyLimit;
      const isGnssOk = !gnssOnlySetting || (p.coords.altitude !== null && p.coords.altitude !== 0);
      
      if (isAccOk && isGnssOk) {
        samples.push({ 
          lat: p.coords.latitude, 
          lng: p.coords.longitude, 
          accuracy: p.coords.accuracy, 
          altitude: p.coords.altitude, 
          altitudeAccuracy: p.coords.altitudeAccuracy,
          timestamp: Date.now() 
        });
      }
    }
    if (samples.length === 0) {
      alert("Konum verisi alınamadı.");
      window.history.back();
      return;
    }

    const calculationMethod = (localStorage.getItem('default_calculation_method') || 'ARITHMETIC_MEAN') as CalculationMethod;
    const { result: avg, usedIndices } = calculateResult(samples, calculationMethod, accuracyLimit, gnssOnlySetting);

    // Feedback (Sound/Vibration)
    const audioEnabled = localStorage.getItem('default_audio_feedback_enabled') === 'true';
    const vibrationEnabled = localStorage.getItem('default_vibration_feedback_enabled') === 'true';

    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    if (audioEnabled) {
      // Simple beep sound using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        console.warn("Audio feedback failed", e);
      }
    }

    onComplete(avg, folderName, pointName, '', coordinateSystem, actualDuration, samples, usedIndices, accuracyLimit, calculationMethod, gnssOnlySetting);
    releaseWakeLock();
  }, [folderName, pointName, coordinateSystem, measurementDuration, seconds, onComplete, accuracyLimit, gnssOnlySetting]);

  // Ref to track accuracy validity without triggering effect re-runs
  const isAccuracyOkRef = useRef(false);

  useEffect(() => {
    const isAccOk = instantAccuracy !== null && instantAccuracy <= accuracyLimit;
    const isGnssOk = !gnssOnlySetting || (lastPositionRef.current && lastPositionRef.current.coords.altitude !== null && lastPositionRef.current.coords.altitude !== 0);
    isAccuracyOkRef.current = isAccOk && isGnssOk;
  }, [instantAccuracy, accuracyLimit, gnssOnlySetting]);

  useEffect(() => {
    let timer: any;
    
    if (step === 'COUNTDOWN' && !waitingForSignal) {
      timer = setInterval(() => {
        const now = Date.now();
        
        // --- GNSS Only Modu Kontrolü ---
        const isActuallySatellite = !gnssOnlySetting || 
          (lastPositionRef.current && lastPositionRef.current.coords.altitude !== null && lastPositionRef.current.coords.altitude !== 0);

        // --- HİBRİT MANTIK: 5 Saniyede Bir Zorunlu Kayıt (Farklı veri gelmediyse ve hassasiyet uygunsa) ---
        if (isActuallySatellite && isAccuracyOkRef.current && lastPositionRef.current && (now - lastSaveTimestampRef.current >= 5000)) {
          const p = lastPositionRef.current;
          samplesRef.current.push({
            lat: p.coords.latitude, 
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy, 
            altitude: p.coords.altitude, 
            altitudeAccuracy: p.coords.altitudeAccuracy,
            timestamp: now
          });
          lastSaveTimestampRef.current = now;
          lastSavedPositionRef.current = {
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy
          };
          setSampleCount(samplesRef.current.length);

          // Check reliability (repeated for mandatory saves)
          const currentSamples = samplesRef.current;
          const currentAvgAcc = currentSamples.reduce((a, b) => a + b.accuracy, 0) / currentSamples.length;
          
          if (currentAvgAcc > 20) {
            setReliabilityStatus('CRITICAL');
          } else if (currentSamples.length >= 3) {
            const maxDist = calculateMaxDistance(currentSamples);
            
            if (maxDist > currentAvgAcc * 3) setReliabilityStatus('CRITICAL');
            else if (maxDist > currentAvgAcc * 1.5) setReliabilityStatus('WARNING');
            else if (currentAvgAcc > 10) setReliabilityStatus('WARNING');
            else setReliabilityStatus('GOOD');
          }
        }

        // Sadece hassasiyet uygunsa geri sayımı ilerlet
        if (isAccuracyOkRef.current) {
          setSeconds(prev => prev > 0 ? prev - 1 : 0);
        }
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [step, waitingForSignal]);

  useEffect(() => {
    if (step === 'COUNTDOWN' && seconds === 0) {
      processSamples();
    }
  }, [step, seconds, processSamples]);

  const handleStartMeasurement = () => {
    requestWakeLock();
    // Start with the last known position as the first sample
    if (lastPositionRef.current) {
      const p = lastPositionRef.current;
      const initialSample = {
        lat: p.coords.latitude, 
        lng: p.coords.longitude, 
        accuracy: p.coords.accuracy, 
        altitude: p.coords.altitude, 
        altitudeAccuracy: p.coords.altitudeAccuracy,
        timestamp: Date.now()
      };
      samplesRef.current = [initialSample];
      lastSavedPositionRef.current = {
        lat: p.coords.latitude,
        lng: p.coords.longitude,
        accuracy: p.coords.accuracy
      };
      lastSaveTimestampRef.current = Date.now();
      setSampleCount(1);
    } else {
      samplesRef.current = [];
      lastSavedPositionRef.current = null;
      lastSaveTimestampRef.current = 0;
      setSampleCount(0);
    }

    setReliabilityStatus('UNKNOWN');
    setSeconds(measurementDuration);
    if (lastPositionRef.current && instantAccuracy !== null) setWaitingForSignal(false);
    else setWaitingForSignal(true);
    onNavigate('COUNTDOWN');
  };

  if (step === 'SELECT_MODE') return (
    <div className="w-full flex flex-col bg-slate-200 animate-in h-full relative overflow-y-auto no-scrollbar">
      <Header title="Ölçüm Yap" />
      
      <div className="w-full px-6 pt-4 mx-auto">
        <div className="max-w-sm mx-auto w-full space-y-4">
          <button onClick={() => { setIsNewProject(true); setFolderName(''); onNavigate('FORM'); }} className="w-full py-3 md:py-4 px-5 bg-slate-100 rounded-3xl shadow-md border border-slate-100 text-left active:scale-[0.97] transition-all flex items-center gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fas fa-folder-plus text-xl"></i></div>
            <span className="font-black text-lg text-slate-900">Yeni Proje Oluştur</span>
          </button>
          <button onClick={() => { setIsNewProject(false); onNavigate('FORM'); }} className="w-full py-3 md:py-4 px-5 bg-slate-100 rounded-3xl shadow-md border border-slate-100 text-left active:scale-[0.97] transition-all flex items-center gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fas fa-folder-open text-xl"></i></div>
            <span className="font-black text-lg text-slate-900">Mevcut Proje Seç</span>
          </button>
        </div>
      </div>
      <GlobalFooter />
    </div>
  );

  if (step === 'FORM') return (
    <div className="w-full flex flex-col bg-slate-200 animate-in h-full relative overflow-y-auto no-scrollbar">
      <Header title="Proje Bilgisi" />

      <div className="w-full px-6 pt-4 mx-auto">
        <div className="max-w-sm mx-auto w-full">
          <div className="soft-card p-6 w-full space-y-5 bg-slate-100">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Proje Adı</label>
            {isNewProject ? (
              <input type="text" placeholder="Örn: Saha Çalışması A" value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-base" />
            ) : (
              <select value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none text-base">
                <option value="">Seçiniz...</option>
                {Array.from(new Set(existingLocations.map(l => l.folderName))).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Koordinat Sistemi</label>
            <select 
              value={coordinateSystem} 
              onChange={e => setCoordinateSystem(e.target.value)} 
              disabled={!isNewProject}
              className={`w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none text-base ${!isNewProject ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="WGS84">WGS84 (Enlem-Boylam)</option>
              <option value="ITRF96_3">ITRF96 - 3°</option>
              <option value="ED50_3">ED50 - 3°</option>
              <option value="ED50_6">ED50 - 6°</option>
            </select>
          </div>

          <button 
            disabled={!folderName.trim()}
            onClick={() => { localStorage.setItem('last_folder_name', folderName); onNavigate('READY'); }} 
            className="w-full py-3 md:py-4 px-5 bg-blue-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] active:scale-95 disabled:opacity-30 transition-all shadow-xl shadow-blue-100"
          >
            ÖLÇÜME HAZIRLAN
          </button>
        </div>
      </div>
      </div>
      <GlobalFooter />
    </div>
  );

  return (
    <div className="w-full flex flex-col bg-slate-200 h-full animate-in overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        <div className="flex-1 flex flex-col items-center justify-around p-6 text-center relative">
          <button 
            onClick={() => {
              if (step === 'COUNTDOWN' || step === 'READY' || step === 'FORM') {
                window.history.back();
              } else if (isContinuing) {
                onCancel();
              } else {
                window.history.back();
              }
            }} 
            className="absolute left-6 md:left-8 top-6 w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-200 shadow-lg border border-slate-100 text-slate-800 active:scale-90 transition-all z-20"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          
          <div className="absolute top-6 left-0 right-0 flex items-center justify-center px-20 z-10 h-11">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate max-w-[280px] leading-tight">{folderName}</h3>
          </div>

          <div className="relative flex items-center justify-center flex-1 w-full max-h-[300px] mt-8">
            <div className="w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-[3.5rem] md:rounded-[4.5rem] border-8 border-slate-50 shadow-2xl flex items-center justify-center relative bg-slate-200">
              <div className={`absolute inset-4 md:inset-6 border-2 rounded-[2.8rem] md:rounded-[3.8rem] ${instantAccuracy && instantAccuracy <= 10 ? 'border-emerald-100' : 'border-slate-50'}`}></div>
              {step === 'COUNTDOWN' && !waitingForSignal && <div className="scanner-line"></div>}
              
              <span className="text-7xl md:text-9xl font-black text-slate-900 mono-font z-10 tracking-tighter leading-none">
                {waitingForSignal ? (
                  <div className="flex flex-col items-center gap-4">
                    <i className="fas fa-satellite fa-spin text-blue-600 text-4xl md:text-5xl"></i>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 animate-pulse">Sinyal Bekleniyor</span>
                  </div>
                ) : (
                  step === 'COUNTDOWN' ? seconds : <i className={`fas fa-satellite-dish text-5xl md:text-7xl transition-all duration-700 ${getAccuracyColor(instantAccuracy)}`}></i>
                )}
              </span>

              {instantAccuracy !== null && (
                 <div className={`absolute -bottom-2 px-5 py-2 rounded-2xl border-2 shadow-xl flex items-center gap-2.5 animate-in fade-in zoom-in z-30 ${getAccuracyBg(instantAccuracy)}`}>
                    <div className={`w-2 h-2 rounded-full ${getAccuracyColor(instantAccuracy).replace('text','bg')} animate-pulse`}></div>
                    <span className={`text-[12px] md:text-[14px] font-black mono-font ${getAccuracyColor(instantAccuracy)}`}>±{instantAccuracy.toFixed(1)}m</span>
                 </div>
              )}

              {captureError && (
                <div className="absolute -bottom-24 left-0 right-0 animate-in slide-in-from-top-2 flex flex-col items-center gap-2 z-30">
                  <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                    <i className="fas fa-exclamation-circle text-rose-500 text-xs"></i>
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">{captureError}</span>
                  </div>
                  <button 
                    onClick={startGPSWarmup}
                    className="px-4 py-2 bg-slate-200 border border-slate-200 shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 active:scale-95 transition-all"
                  >
                    <i className="fas fa-rotate-right mr-2"></i>
                    Tekrar Dene
                  </button>
                  {captureError.includes("izni reddedildi") && (
                    <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest mt-1 text-center px-4 leading-tight opacity-80">
                      Safari Ayarlarından "Konum" İznini Kontrol Edin
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto w-full shrink-0 pb-4">
            {step === 'READY' ? (
              <div className="bg-slate-100 p-5 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight block h-5 flex flex-col justify-center">
                    <span>Nokta İsmi</span>
                  </label>
                  <input type="text" value={pointName} onChange={e => setPointName(e.target.value)} className="w-full p-2.5 bg-slate-200 rounded-xl font-black text-center text-lg text-slate-900 outline-none border border-slate-200 leading-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight block h-5 flex flex-col justify-center">
                      <span>Hassasiyet</span>
                      <span>Limiti (m)</span>
                    </label>
                    <select 
                      value={accuracyLimit} 
                      onChange={e => setAccuracyLimit(parseFloat(e.target.value))}
                      className="w-full p-2.5 bg-slate-200 rounded-xl font-black text-center text-lg text-slate-900 outline-none border border-slate-200 leading-none appearance-none"
                    >
                      {[2, 3, 4, 5, 10, 25, 50, 100].map(v => <option key={v} value={v}>{v}m</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight block h-5 flex flex-col justify-center">
                      <span>Ölçüm</span>
                      <span>Süresi (sn)</span>
                    </label>
                    <select 
                      value={measurementDuration} 
                      onChange={e => setMeasurementDuration(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-slate-200 rounded-xl font-black text-center text-lg text-slate-900 outline-none border border-slate-200 leading-none appearance-none"
                    >
                      {[5, 10, 15, 30, 60, 120].map(v => <option key={v} value={v}>{v}sn</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleStartMeasurement} 
                  disabled={instantAccuracy === null}
                  className="w-full py-4 md:py-6 px-5 bg-emerald-600 text-white rounded-2xl font-black text-[13px] md:text-[14px] active:scale-[0.96] disabled:bg-slate-200 transition-all uppercase tracking-[0.25em] leading-none shadow-2xl shadow-emerald-100"
                >
                  ÖLÇÜMÜ BAŞLAT
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {reliabilityStatus !== 'UNKNOWN' && (
                  <div className="animate-in slide-in-from-top-2">
                     <div className={`mx-auto px-4 py-3 rounded-2xl border-2 flex items-center gap-3 shadow-lg w-full max-w-[280px] ${
                       reliabilityStatus === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-700' : 
                       reliabilityStatus === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                     }`}>
                        <i className={`fas ${reliabilityStatus === 'CRITICAL' ? 'fa-triangle-exclamation' : reliabilityStatus === 'WARNING' ? 'fa-circle-info' : 'fa-circle-check'} text-lg shrink-0`}></i>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                            {reliabilityStatus === 'CRITICAL' ? 'KRİTİK TUTARSIZLIK' : reliabilityStatus === 'WARNING' ? 'TUTARSIZ VERİ' : 'GÜVENİLİR VERİ'}
                          </span>
                          <span className="text-[8px] font-bold leading-tight uppercase opacity-90">
                            {reliabilityStatus === 'CRITICAL' 
                              ? 'Toplanan veriler yüksek sinyal sapmaları içeriyor! Ölçümün açık bir alanda tekrarlanması önerilir.' 
                              : reliabilityStatus === 'WARNING' 
                                ? 'Toplanan veriler sinyal sapmaları içeriyor! Ölçümün açık bir alanda tekrarlanması önerilir.' 
                                : 'Toplanan veriler belirlediğiniz hassasiyet limitine uygun.'}
                          </span>
                        </div>
                     </div>
                  </div>
                )}

                {instantAccuracy !== null && instantAccuracy > accuracyLimit ? (
                  <div className="animate-pulse space-y-1">
                    <p className="font-black text-amber-600 text-[12px] md:text-[13px] uppercase tracking-[0.2em] leading-none">Hassasiyet Bekleniyor...</p>
                    <p className="text-slate-400 text-[10px] font-bold leading-tight uppercase tracking-widest px-4">
                      Mevcut hassasiyet (±{instantAccuracy.toFixed(1)}m),<br/>belirlenen {accuracyLimit}m limitinden yüksek.
                    </p>
                  </div>
                ) : gnssOnlySetting && (!lastPositionRef.current || lastPositionRef.current.coords.altitude === null || lastPositionRef.current.coords.altitude === 0) ? (
                  <div className="animate-pulse space-y-1">
                    <p className="font-black text-blue-600 text-[12px] md:text-[13px] uppercase tracking-[0.2em] leading-none">Uydu Kilidi Bekleniyor...</p>
                    <p className="text-slate-400 text-[10px] font-bold leading-tight uppercase tracking-widest px-4">
                      Sadece GNSS modu aktif.<br/>Yükseklik verisi içeren uydu sinyali bekleniyor.
                    </p>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-1">
                    <p className="font-black text-emerald-600 text-[12px] md:text-[13px] uppercase tracking-[0.3em] leading-none">{sampleCount} KONUM ÖRNEĞİ</p>
                    <p className="text-slate-400 text-[11px] md:text-[12px] font-bold leading-none uppercase tracking-widest">SABİT TUTUN</p>
                  </div>
                )}

                <button 
                  onClick={() => processSamples()}
                  disabled={sampleCount === 0}
                  className="mx-auto mt-2 py-3 px-8 bg-blue-600 text-white rounded-2xl font-black text-[11px] md:text-[12px] active:scale-[0.96] disabled:opacity-50 transition-all uppercase tracking-[0.2em] leading-none shadow-xl shadow-blue-100 flex items-center justify-center gap-2 whitespace-nowrap w-full max-w-[280px]"
                >
                  <i className="fas fa-check-circle"></i>
                  Hemen Bitir ve Kaydet
                </button>
              </div>
            )}
          </div>
        </div>
        <GlobalFooter />
      </div>
    </div>
  );
};

export default GPSCapture;