import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Coordinate, SavedLocation, CalculationMethod } from '../types';
import { calculateResult, calculateMaxDistance } from '../utils/MathUtils';
import { convertToMSL } from './GeoidUtils';
import { getAccuracyColor, getAccuracyBg } from '../utils/StyleUtils';
import GlobalFooter from './GlobalFooter';
import Header from './Header';
import { useLanguage } from '../utils/LanguageContext';

// Map rendering helper to invalidate size on dynamic render
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [map]);
  return null;
};

interface Props {
  onComplete: (
    coord: Coordinate, 
    folderName: string, 
    pointName: string, 
    description: string, 
    coordinateSystem: string, 
    duration: number, 
    samples: Coordinate[], 
    usedIndices: number[], 
    accuracyLimit: number, 
    method: CalculationMethod,
    gnssOnly: boolean,
    rawSamples?: Coordinate[]
  ) => void;
  onCancel: () => void;
  isContinuing?: boolean;
  existingLocations: SavedLocation[];
  currentStep?: 'SELECT_MODE' | 'FORM' | 'READY' | 'COUNTDOWN';
  onNavigate: (step: 'SELECT_MODE' | 'FORM' | 'READY' | 'COUNTDOWN') => void;
  settings: any;
}

const GPSCapture: React.FC<Props> = ({ onComplete, onCancel, isContinuing = false, existingLocations, currentStep, onNavigate, settings }) => {
  const { t } = useLanguage();
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
  const [accuracyLimit, setAccuracyLimit] = useState(parseFloat(localStorage.getItem('default_accuracy_limit') || '5'));
  const [measurementDuration, setMeasurementDuration] = useState(parseInt(localStorage.getItem('default_duration') || '15'));
  const [seconds, setSeconds] = useState(parseInt(localStorage.getItem('default_duration') || '15'));
  const [sampleCount, setSampleCount] = useState(0);
  const [reliabilityStatus, setReliabilityStatus] = useState<'GOOD' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'>('UNKNOWN');
  const [instantAccuracy, setInstantAccuracy] = useState<number | null>(null);
  const [waitingForSignal, setWaitingForSignal] = useState(true);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [showLiveMap, setShowLiveMap] = useState(false);
  
  const samplesRef = useRef<Coordinate[]>([]);
  const rawSamplesRef = useRef<Coordinate[]>([]);
  const latestMotionRef = useRef<{ accelX: number | null; accelY: number | null; accelZ: number | null }>({
    accelX: null,
    accelY: null,
    accelZ: null
  });
  const latestOrientationRef = useRef<{ gyroAlpha: number | null; gyroBeta: number | null; gyroGamma: number | null }>({
    gyroAlpha: null,
    gyroBeta: null,
    gyroGamma: null
  });
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const lastSavedPositionRef = useRef<{lat: number, lng: number, accuracy: number} | null>(null);
  const lastSaveTimestampRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    const screenAlwaysOn = settings.screenAlwaysOn;
    if (!screenAlwaysOn) return;
    
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

  // Listen for device motion and orientation sensors
  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.acceleration || e.accelerationIncludingGravity;
      if (acc) {
        latestMotionRef.current = {
          accelX: acc.x !== undefined && acc.x !== null ? acc.x : null,
          accelY: acc.y !== undefined && acc.y !== null ? acc.y : null,
          accelZ: acc.z !== undefined && acc.z !== null ? acc.z : null,
        };
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      latestOrientationRef.current = {
        gyroAlpha: e.alpha !== undefined && e.alpha !== null ? e.alpha : null,
        gyroBeta: e.beta !== undefined && e.beta !== null ? e.beta : null,
        gyroGamma: e.gamma !== undefined && e.gamma !== null ? e.gamma : null,
      };
    };

    try {
      window.addEventListener('devicemotion', handleMotion);
      window.addEventListener('deviceorientation', handleOrientation);
    } catch (err) {
      console.warn("Sensor event listeners failed to attach:", err);
    }

    return () => {
      try {
        window.removeEventListener('devicemotion', handleMotion);
        window.removeEventListener('deviceorientation', handleOrientation);
      } catch (err) {
        console.warn("Sensor event listeners removal failed:", err);
      }
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
                msg = t("Konum izni reddedildi. Lütfen ayarlardan izin verin.");
              }
              else if (err2.code === 2) msg = t("Konum alınamıyor. GPS sinyali zayıf olabilir.");
              else if (err2.code === 3) msg = t("Zaman aşımı. GPS yanıt vermedi.");
              setCaptureError(msg);
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
          );
        },
        options
      );
    } else {
      setCaptureError(t("Tarayıcınız konum servisini desteklemiyor."));
    }
  };

  const getNextPointName = useCallback((projName: string) => {
    const projPoints = existingLocations.filter(l => l.folderName === projName);
    const label = t("Nokta");
    return `${label}${projPoints.length + 1}`;
  }, [existingLocations, t]);

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
            // Unconditionally save raw geolocation update with speed and heading
            rawSamplesRef.current.push({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              speed: pos.coords.speed,
              heading: pos.coords.heading,
              timestamp: Date.now(),
              accelX: latestMotionRef.current.accelX,
              accelY: latestMotionRef.current.accelY,
              accelZ: latestMotionRef.current.accelZ,
              gyroAlpha: latestOrientationRef.current.gyroAlpha,
              gyroBeta: latestOrientationRef.current.gyroBeta,
              gyroGamma: latestOrientationRef.current.gyroGamma,
            });

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
              const isGnssOk = !settings.gnssOnlyMode || (pos.coords.altitude !== null && pos.coords.altitude !== 0);

              if (isAccOk && isGnssOk) {
                samplesRef.current.push({
                  lat: pos.coords.latitude, 
                  lng: pos.coords.longitude,
                  accuracy: pos.coords.accuracy, 
                  altitude: pos.coords.altitude, 
                  altitudeAccuracy: pos.coords.altitudeAccuracy,
                  timestamp: Date.now(),
                  speed: pos.coords.speed,
                  heading: pos.coords.heading,
                  accelX: latestMotionRef.current.accelX,
                  accelY: latestMotionRef.current.accelY,
                  accelZ: latestMotionRef.current.accelZ,
                  gyroAlpha: latestOrientationRef.current.gyroAlpha,
                  gyroBeta: latestOrientationRef.current.gyroBeta,
                  gyroGamma: latestOrientationRef.current.gyroGamma,
                });
                lastSavedPositionRef.current = current;
                lastSaveTimestampRef.current = Date.now();
                setSampleCount(samplesRef.current.length);

                // Check reliability
                const currentSamples = samplesRef.current;
                if (currentSamples.length > 0) {
                  const currentAvgAcc = currentSamples.reduce((a, b) => a + b.accuracy, 0) / currentSamples.length;
                  const maxDist = calculateMaxDistance(currentSamples);
                  const sampleCountVal = currentSamples.length;

                  const isRed = (currentAvgAcc > 20) || (maxDist > 20) || (maxDist > currentAvgAcc * 3);
                  const isGreen = (currentAvgAcc <= 10) && (maxDist <= 10) && (maxDist <= currentAvgAcc) && (sampleCountVal >= 5);

                  if (isRed) {
                    setReliabilityStatus('CRITICAL');
                  } else if (isGreen) {
                    setReliabilityStatus('GOOD');
                  } else {
                    setReliabilityStatus('WARNING');
                  }
                } else {
                  setReliabilityStatus('UNKNOWN');
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
      const isGnssOk = !settings.gnssOnlyMode || (p.coords.altitude !== null && p.coords.altitude !== 0);
      
      if (isAccOk && isGnssOk) {
        samples.push({ 
          lat: p.coords.latitude, 
          lng: p.coords.longitude, 
          accuracy: p.coords.accuracy, 
          altitude: p.coords.altitude, 
          altitudeAccuracy: p.coords.altitudeAccuracy,
          timestamp: Date.now(),
          speed: p.coords.speed,
          heading: p.coords.heading,
          accelX: latestMotionRef.current.accelX,
          accelY: latestMotionRef.current.accelY,
          accelZ: latestMotionRef.current.accelZ,
          gyroAlpha: latestOrientationRef.current.gyroAlpha,
          gyroBeta: latestOrientationRef.current.gyroBeta,
          gyroGamma: latestOrientationRef.current.gyroGamma,
        });
      }
    }
    if (samples.length === 0) {
      alert(t("Konum verisi alınamadı."));
      window.history.back();
      return;
    }

    const calculationMethod = settings.calculationMethod;
    const { result: avg, usedIndices } = calculateResult(samples, calculationMethod, accuracyLimit, settings.gnssOnlyMode);

    // Feedback (Sound/Vibration) - Sync with Settings defaults
    const audioEnabled = settings.alertsEnabled;
    const vibrationEnabled = settings.vibrationEnabled;

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

    onComplete(avg, folderName, pointName, '', coordinateSystem, actualDuration, samples, usedIndices, accuracyLimit, calculationMethod, settings.gnssOnlyMode, rawSamplesRef.current);
    releaseWakeLock();
  }, [folderName, pointName, coordinateSystem, measurementDuration, seconds, onComplete, accuracyLimit, settings.gnssOnlyMode, settings.calculationMethod, settings.alertsEnabled, settings.vibrationEnabled]);

  // Ref to track accuracy validity without triggering effect re-runs
  const isAccuracyOkRef = useRef(false);

  useEffect(() => {
    const isAccOk = instantAccuracy !== null && instantAccuracy <= accuracyLimit;
    const isGnssOk = !settings.gnssOnlyMode || (lastPositionRef.current && lastPositionRef.current.coords.altitude !== null && lastPositionRef.current.coords.altitude !== 0);
    isAccuracyOkRef.current = isAccOk && isGnssOk;
  }, [instantAccuracy, accuracyLimit, settings.gnssOnlyMode]);

  useEffect(() => {
    let timer: any;
    
    if (step === 'COUNTDOWN' && !waitingForSignal) {
      timer = setInterval(() => {
        const now = Date.now();
        
        // --- GNSS Only Modu Kontrolü ---
        const isActuallySatellite = !settings.gnssOnlyMode || 
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
            timestamp: now,
            speed: p.coords.speed,
            heading: p.coords.heading,
            accelX: latestMotionRef.current.accelX,
            accelY: latestMotionRef.current.accelY,
            accelZ: latestMotionRef.current.accelZ,
            gyroAlpha: latestOrientationRef.current.gyroAlpha,
            gyroBeta: latestOrientationRef.current.gyroBeta,
            gyroGamma: latestOrientationRef.current.gyroGamma,
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
          if (currentSamples.length > 0) {
            const currentAvgAcc = currentSamples.reduce((a, b) => a + b.accuracy, 0) / currentSamples.length;
            const maxDist = calculateMaxDistance(currentSamples);
            const sampleCountVal = currentSamples.length;

            const isRed = (currentAvgAcc > 20) || (maxDist > 20) || (maxDist > currentAvgAcc * 3);
            const isGreen = (currentAvgAcc <= 10) && (maxDist <= 10) && (maxDist <= currentAvgAcc) && (sampleCountVal >= 5);

            if (isRed) {
              setReliabilityStatus('CRITICAL');
            } else if (isGreen) {
              setReliabilityStatus('GOOD');
            } else {
              setReliabilityStatus('WARNING');
            }
          } else {
            setReliabilityStatus('UNKNOWN');
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
    
    // Request permission for iOS sensors if needed
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        (DeviceMotionEvent as any).requestPermission()
          .catch((err: any) => console.warn('DeviceMotion permission error:', err));
      } catch (e) {
        console.warn('DeviceMotion requestPermission sync error:', e);
      }
    }
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        (DeviceOrientationEvent as any).requestPermission()
          .catch((err: any) => console.warn('DeviceOrientation permission error:', err));
      } catch (e) {
        console.warn('DeviceOrientation requestPermission sync error:', e);
      }
    }

    // Start with the last known position as the first sample
    if (lastPositionRef.current) {
      const p = lastPositionRef.current;
      const initialSample = {
        lat: p.coords.latitude, 
        lng: p.coords.longitude, 
        accuracy: p.coords.accuracy, 
        altitude: p.coords.altitude, 
        altitudeAccuracy: p.coords.altitudeAccuracy,
        timestamp: Date.now(),
        speed: p.coords.speed,
        heading: p.coords.heading,
        accelX: latestMotionRef.current.accelX,
        accelY: latestMotionRef.current.accelY,
        accelZ: latestMotionRef.current.accelZ,
        gyroAlpha: latestOrientationRef.current.gyroAlpha,
        gyroBeta: latestOrientationRef.current.gyroBeta,
        gyroGamma: latestOrientationRef.current.gyroGamma,
      };
      samplesRef.current = [initialSample];
      rawSamplesRef.current = [initialSample];
      lastSavedPositionRef.current = {
        lat: p.coords.latitude,
        lng: p.coords.longitude,
        accuracy: p.coords.accuracy
      };
      lastSaveTimestampRef.current = Date.now();
      setSampleCount(1);
    } else {
      samplesRef.current = [];
      rawSamplesRef.current = [];
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
      <Header title={t("Ölçüm Yap")} />
      
      <div className="w-full px-6 pt-4 mx-auto">
        <div className="max-w-sm mx-auto w-full space-y-4">
          <button onClick={() => { setIsNewProject(true); setFolderName(''); onNavigate('FORM'); }} className="w-full py-3 md:py-4 px-5 bg-slate-100 rounded-3xl shadow-md border border-slate-100 text-left active:scale-[0.97] transition-all flex items-center gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fas fa-folder-plus text-xl"></i></div>
            <span className="font-black text-lg text-slate-900">{t("Yeni Proje Oluştur")}</span>
          </button>
          <button onClick={() => { setIsNewProject(false); onNavigate('FORM'); }} className="w-full py-3 md:py-4 px-5 bg-slate-100 rounded-3xl shadow-md border border-slate-100 text-left active:scale-[0.97] transition-all flex items-center gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fas fa-folder-open text-xl"></i></div>
            <span className="font-black text-lg text-slate-900">{t("Mevcut Proje Seç")}</span>
          </button>
        </div>
      </div>
      <GlobalFooter />
    </div>
  );

  if (step === 'FORM') return (
    <div className="w-full flex flex-col bg-slate-200 animate-in h-full relative overflow-y-auto no-scrollbar">
      <Header title={t("Proje Bilgisi")} />

      <div className="w-full px-6 pt-4 mx-auto">
        <div className="max-w-sm mx-auto w-full">
          <div className="soft-card p-6 w-full space-y-5 bg-slate-100">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Proje Adı")}</label>
            {isNewProject ? (
              <input type="text" placeholder={t("Örn: Saha Çalışması A")} value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-base" />
            ) : (
              <select value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none text-base">
                <option value="">{t("Seçiniz...")}</option>
                {Array.from(new Set(existingLocations.map(l => l.folderName))).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Koordinat Sistemi")}</label>
            <select 
              value={coordinateSystem} 
              onChange={e => setCoordinateSystem(e.target.value)} 
              disabled={!isNewProject}
              className={`w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none text-base ${!isNewProject ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="WGS84">{t("WGS84 (Enlem-Boylam)")}</option>
              <option value="ITRF96_3">{t("ITRF96 - 3° - TM")}</option>
              <option value="ITRF96_6">{t("ITRF96 - 6° - UTM")}</option>
              <option value="ED50_3">{t("ED50 - 3° - TM")}</option>
              <option value="ED50_6">{t("ED50 - 6° - UTM")}</option>
            </select>
          </div>

          <button 
            disabled={!folderName.trim()}
            onClick={() => { localStorage.setItem('last_folder_name', folderName); onNavigate('READY'); }} 
            className="w-full py-3 md:py-4 px-5 bg-blue-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] active:scale-95 disabled:opacity-30 transition-all shadow-xl shadow-blue-100"
          >
            {t("ÖLÇÜME HAZIRLAN")}
          </button>
        </div>
      </div>
      </div>
      <GlobalFooter />
    </div>
  );

  const getMapCenter = (): [number, number] => {
    if (lastPositionRef.current) {
      return [lastPositionRef.current.coords.latitude, lastPositionRef.current.coords.longitude];
    }
    if (samplesRef.current && samplesRef.current.length > 0) {
      return [samplesRef.current[0].lat, samplesRef.current[0].lng];
    }
    return [39.9334, 32.8597];
  };

  const getMapProviderInfo = () => {
    switch (localStorage.getItem('default_map_provider')) {
      case 'OpenTopoMap': return { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", maxNativeZoom: 17 };
      default: return { url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", maxNativeZoom: 22 };
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-200 h-full animate-in overflow-hidden">
      <Header 
        title={folderName} 
        onBack={() => {
          if (step === 'COUNTDOWN' || step === 'READY' || step === 'FORM') {
            window.history.back();
          } else if (isContinuing) {
            onCancel();
          } else {
            window.history.back();
          }
        }}
      />
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        <div className="flex-1 flex flex-col items-center justify-around p-6 text-center relative pt-2">
          <div className="relative flex items-center justify-center flex-1 w-full max-h-[300px] mt-2">
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
                    {t("Tekrar Dene")}
                  </button>
                  {captureError.includes("izni reddedildi") && (
                    <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest mt-1 text-center px-4 leading-tight opacity-80">
                      {t("Safari Ayarlarından \"Konum\" İznini Kontrol Edin")}
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
                    <span>{t("Nokta İsmi")}</span>
                  </label>
                  <input type="text" value={pointName} onChange={e => setPointName(e.target.value)} className="w-full p-2.5 bg-slate-200 rounded-xl font-black text-center text-lg text-slate-900 outline-none border border-slate-200 leading-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight block h-5 flex flex-col justify-center">
                      <span>{t("Hassasiyet")}</span>
                      <span>{t("Limiti (m)")}</span>
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
                      <span>{t("Ölçüm")}</span>
                      <span>{t("Süresi (sn)")}</span>
                    </label>
                    <select 
                      value={measurementDuration} 
                      onChange={e => setMeasurementDuration(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-slate-200 rounded-xl font-black text-center text-lg text-slate-900 outline-none border border-slate-200 leading-none appearance-none"
                    >
                      {[5, 10, 15, 30, 60, 120].map(v => <option key={v} value={v}>{t(`${v}sn`)}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleStartMeasurement} 
                  disabled={instantAccuracy === null}
                  className="w-full py-4 md:py-6 px-5 bg-emerald-600 text-white rounded-2xl font-black text-[13px] md:text-[14px] active:scale-[0.96] disabled:bg-slate-200 transition-all uppercase tracking-[0.25em] leading-none shadow-2xl shadow-emerald-100"
                >
                  {t("ÖLÇÜMÜ BAŞLAT")}
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
                            {reliabilityStatus === 'CRITICAL' ? t('DÜŞÜK SİNYAL KALİTESİ') : reliabilityStatus === 'WARNING' ? (sampleCount < 5 ? t('YETERSİZ KONUM VERİSİ') : t('ORTA SİNYAL KALİTESİ')) : t('GÜÇLÜ SİNYAL KALİTESİ')}
                          </span>
                          <span className="text-[8px] font-bold leading-tight opacity-90">
                            {reliabilityStatus === 'CRITICAL' 
                              ? t('Ölçüm sırasında çevresel ve donanımsal faktörler nedeniyle hatalar tespit edildi, ölçümün açık bir alanda tekrarlanması önerilir!') 
                              : reliabilityStatus === 'WARNING' 
                                ? (sampleCount < 5 
                                    ? t('Ölçüm sırasında çevresel veya donanımsal faktörler nedeniyle yeterli sayıda konum verisi toplanamadı, ölçüm süresinin uzatılması önerilir!') 
                                    : t('Ölçüm sırasında çevresel ve donanımsal faktörler nedeniyle hatalar tespit edildi, ölçümün açık bir alanda tekrarlanması önerilir!'))
                                : t('Toplanan veriler hassasiyet limitlerine uygun görünüyor.')}
                          </span>
                        </div>
                     </div>
                  </div>
                )}

                {instantAccuracy !== null && instantAccuracy > accuracyLimit ? (
                  <div className="animate-pulse space-y-1">
                    <p className="font-black text-amber-600 text-[12px] md:text-[13px] uppercase tracking-[0.2em] leading-none">{t("Hassasiyet Bekleniyor...")}</p>
                    <p className="text-slate-400 text-[10px] font-bold leading-tight uppercase tracking-widest px-4">
                      {t("Mevcut hassasiyet")} (±{instantAccuracy.toFixed(1)}m),<br/>{t("belirlenen")} {accuracyLimit}m {t("limitinden yüksek.")}
                    </p>
                  </div>
                ) : settings.gnssOnlyMode && (!lastPositionRef.current || lastPositionRef.current.coords.altitude === null || lastPositionRef.current.coords.altitude === 0) ? (
                  <div className="animate-pulse space-y-1">
                    <p className="font-black text-blue-600 text-[12px] md:text-[13px] uppercase tracking-[0.2em] leading-none">{t("Uydu Kilidi Bekleniyor...")}</p>
                    <p className="text-slate-400 text-[10px] font-bold leading-tight uppercase tracking-widest px-4">
                      {t("Sadece GNSS modu aktif.")}<br/>{t("Yükseklik verisi içeren uydu sinyali bekleniyor.")}
                    </p>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-1">
                    <p className="font-black text-emerald-600 text-[12px] md:text-[13px] uppercase tracking-[0.3em] leading-none">{sampleCount} {t("KONUM ÖRNEĞİ")}</p>
                    <p className="text-slate-400 text-[11px] md:text-[12px] font-bold leading-none uppercase tracking-widest">{t("SABİT TUTUN")}</p>
                  </div>
                )}

                <button 
                  onClick={() => processSamples()}
                  disabled={sampleCount === 0}
                  className="mx-auto mt-2 py-3 px-8 bg-blue-600 text-white rounded-2xl font-black text-[11px] md:text-[12px] active:scale-[0.96] disabled:opacity-50 transition-all uppercase tracking-[0.2em] leading-none shadow-xl shadow-blue-100 flex items-center justify-center gap-2 whitespace-nowrap w-full max-w-[280px]"
                >
                  <i className="fas fa-check-circle"></i>
                  {t("Hemen Bitir ve Kaydet")}
                </button>

                <button 
                  onClick={() => setShowLiveMap(true)}
                  className="mx-auto mt-2 py-3 px-8 bg-slate-100 text-slate-800 border border-slate-300 rounded-2xl font-black text-[11px] md:text-[12px] active:scale-[0.96] transition-all uppercase tracking-[0.2em] leading-none flex items-center justify-center gap-2 whitespace-nowrap w-full max-w-[280px] hover:bg-slate-200 cursor-pointer"
                >
                  <i className="fas fa-map-location-dot text-blue-600"></i>
                  {t("Canlı Veri İzleme")}
                </button>
              </div>
            )}
          </div>
        </div>
        <GlobalFooter />
      </div>

      {showLiveMap && (
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col animate-in fade-in">
          {/* Header Bar */}
          <div className="absolute top-4 left-4 z-[10000] flex items-center gap-3">
            <button 
              onClick={() => setShowLiveMap(false)}
              className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl text-slate-900 active:scale-95 transition-all outline-none cursor-pointer"
            >
              <i className="fas fa-arrow-left text-lg"></i>
            </button>
            <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex flex-col text-left">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">
                {folderName}
              </span>
              <span className="text-sm font-black text-slate-900 leading-tight">
                {pointName || t("Nokta")}
              </span>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-[10000] flex flex-col gap-2">
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl text-right flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">
                {t("Ölçüm Süresi")}
              </span>
              <span className="text-lg font-black text-blue-600 leading-none">
                {sampleCount} / {measurementDuration}
              </span>
            </div>

            {instantAccuracy !== null && (
              <div className={`backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl text-right flex items-center gap-2 border ${
                instantAccuracy <= accuracyLimit ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : 'bg-amber-50/95 border-amber-200 text-amber-800'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${instantAccuracy <= accuracyLimit ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                <span className="text-xs font-black mono-font">
                  ±{instantAccuracy.toFixed(1)}m
                </span>
              </div>
            )}
          </div>

          {/* Floating Legend */}
          <div className="absolute bottom-6 left-6 right-6 z-[10000]">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 max-w-sm mx-auto flex flex-col gap-2 border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  <i className="fas fa-map-location-dot text-blue-600 mr-2"></i>
                  {t("Canlı Veri Haritası")}
                </span>
                <span className="text-[9px] font-black uppercase text-blue-600 animate-pulse bg-blue-50 px-2.5 py-1 rounded-full">
                  GPS LIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm shrink-0"></div>
                  <span className="text-[10px] font-bold text-slate-600">{t("Filtrelenmiş Örnekler")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full shadow-sm shrink-0"></div>
                  <span className="text-[10px] font-bold text-slate-600">{t("Tüm Ham Gözlemler (Raw)")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Content */}
          <div className="flex-1 w-full h-full">
            <MapContainer 
              center={getMapCenter()} 
              zoom={getMapProviderInfo().maxNativeZoom - 1} 
              maxZoom={22}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url={getMapProviderInfo().url}
                attribution={localStorage.getItem('default_map_provider') === 'OpenTopoMap' ? '&copy; OpenTopoMap' : '&copy; Google'}
                maxZoom={22}
                maxNativeZoom={getMapProviderInfo().maxNativeZoom}
              />
              <MapResizer />
              
              {/* Draw All Raw Samples */}
              {rawSamplesRef.current.map((s, idx) => (
                <Circle 
                  key={`raw-${idx}`}
                  center={[s.lat, s.lng]}
                  radius={0.3}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.6,
                    weight: 1
                  }}
                />
              ))}

              {/* Draw Accepted Filtered Samples */}
              {samplesRef.current.map((s, idx) => (
                <Circle 
                  key={`filtered-${idx}`}
                  center={[s.lat, s.lng]}
                  radius={0.4}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.8,
                    weight: 1.5
                  }}
                />
              ))}

              {/* Draw Instant Location Marker & Accuracy Circle */}
              {lastPositionRef.current && (
                <>
                  <Circle 
                    center={[lastPositionRef.current.coords.latitude, lastPositionRef.current.coords.longitude]}
                    radius={lastPositionRef.current.coords.accuracy}
                    pathOptions={{
                      color: lastPositionRef.current.coords.accuracy <= accuracyLimit ? '#10b981' : '#f59e0b',
                      fillColor: lastPositionRef.current.coords.accuracy <= accuracyLimit ? '#10b981' : '#f59e0b',
                      fillOpacity: 0.15,
                      weight: 1,
                      dashArray: '4, 4'
                    }}
                  />
                  <Marker 
                    position={[lastPositionRef.current.coords.latitude, lastPositionRef.current.coords.longitude]}
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSCapture;