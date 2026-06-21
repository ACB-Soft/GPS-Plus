import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, Polygon, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { StakeoutPoint, Coordinate, StakeoutGeometry, AppSettings } from '../types';
import { getAccuracyColor, getAccuracyBg } from '../utils/StyleUtils';
import { parseKML } from '../utils/KmlParser';
import { convertCoordinate, convertToWGS84 } from '../utils/CoordinateUtils';
import { isIOS } from '../utils/browser';
import JSZip from 'jszip';
import GlobalFooter from './GlobalFooter';
import Header from './Header';
import { useLanguage } from '../utils/LanguageContext';


interface Props {
  onBack: () => void;
  initialPoint?: StakeoutPoint | null;
  settings: AppSettings;
  currentStep?: string | null;
  onNavigate: (step: string) => void;
}

// Optimized helper components
const MapPopupContent = React.memo(({ name, subtitle, onGo, color }: { name: string, subtitle?: string, onGo: () => void, color?: string }) => {
  const { t } = useLanguage();
  return (
    <div className="p-3 min-w-[140px] bg-slate-200 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-2">
      <div className="flex flex-col px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color || '#3b82f6' }}></div>
          <h4 className="font-black text-slate-800 text-[11px] truncate leading-tight">{name}</h4>
        </div>
        {subtitle && (
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 ml-4">{subtitle}</p>
        )}
      </div>
      <button 
        onClick={onGo}
        className="w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all"
      >
        {t("GİT")}
      </button>
    </div>
  );
});

// Optimized Vertex Layer with Spatial Filtering
const LazyVertexLayer = React.memo(({ geometries, zoom, onVertexSelect }: { geometries: StakeoutGeometry[], zoom: number, onVertexSelect: (g: StakeoutGeometry, c: {lat: number, lng: number}, idx: number) => void }) => {
  const { t } = useLanguage();
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => setBounds(map.getBounds()),
  });

  if (zoom <= 16) return null;

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  return (
    <>
      {geometries.flatMap(g => {
        return g.coordinates.map((c, idx) => {
          // Simple numerical bounds check is much faster than object creation (L.latLng)
          if (c.lat < sw.lat || c.lat > ne.lat || c.lng < sw.lng || c.lng > ne.lng) return null;

          return (
            <Circle
              key={`${g.id}-v-${idx}`}
              center={[c.lat, c.lng]}
              radius={1.5}
              pathOptions={{ color: 'white', fillColor: g.color || '#3b82f6', fillOpacity: 1, weight: 1 }}
            >
              <Popup closeButton={false} className="custom-leaflet-popup">
                <MapPopupContent 
                  name={g.name}
                  subtitle={`${t("Köşe")} ${idx + 1}`}
                  color={g.color}
                  onGo={() => onVertexSelect(g, c, idx)}
                />
              </Popup>
            </Circle>
          );
        });
      })}
    </>
  );
});

// Memoized Marker component
const StakeoutMarker = React.memo(({ p, zoom, onGo }: { p: StakeoutPoint, zoom: number, onGo: (p: StakeoutPoint) => void }) => {
  const icon = React.useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `<div style="width: 12px; height: 12px; background: ${p.color || '#3b82f6'}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  }), [p.color]);

  return (
    <Marker position={[p.lat, p.lng]} icon={icon}>
      {zoom >= 14 && (
        <Tooltip permanent direction="top" offset={[0, -10]} className="custom-tooltip">
          <span 
            className="font-black uppercase tracking-tighter"
            style={{ fontSize: `${Math.min(10, zoom - 8)}px` }}
          >
            {p.name}
          </span>
        </Tooltip>
      )}
      <Popup closeButton={false} className="custom-leaflet-popup">
        <MapPopupContent 
          name={p.name}
          color={p.color}
          onGo={() => onGo(p)}
        />
      </Popup>
    </Marker>
  );
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapCenterer = ({ trigger }: { trigger: { pos: [number, number], time: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger) {
      map.setView(trigger.pos, 17);
    }
  }, [trigger, map]);
  return null;
};

const getTileLayer = (provider: string) => {
  switch (provider) {
    case 'Google Hybrid':
      return {
        url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        attribution: '&copy; Google',
        maxNativeZoom: 20,
        tms: false
      };
    case 'Google Satellite':
      return {
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attribution: '&copy; Google',
        maxNativeZoom: 20,
        tms: false
      };
    case 'OpenTopoMap':
      return {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: '&copy; OpenTopoMap contributors',
        maxNativeZoom: 17,
        tms: false
      };
    case 'Esri World Imagery':
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri',
        maxNativeZoom: 19,
        tms: false
      };
    case 'Copernicus / Sentinel':
      return {
        url: "https://tiles.maps.mundialis.de/service/tms/1.0.0/copernicus_sentinel2/{z}/{x}/{y}.png",
        attribution: '&copy; Copernicus',
        maxNativeZoom: 14,
        tms: true
      };
    case 'USGS':
      return {
        url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles courtesy of the USGS',
        maxNativeZoom: 16,
        tms: false
      };
    case 'Google Roadmap':
    default:
      return {
        url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        attribution: '&copy; Google',
        maxNativeZoom: 20,
        tms: false
      };
  }
};

const ZoomTracker = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
};

const BoundsUpdater = ({ points, geometries }: { points: StakeoutPoint[], geometries: StakeoutGeometry[] }) => {
  const map = useMap();
  const hasFittedRef = useRef<boolean>(false);

  useEffect(() => {
    const allCoords: [number, number][] = [];
    points.forEach(p => allCoords.push([p.lat, p.lng]));
    geometries.forEach(g => g.coordinates.forEach(c => allCoords.push([c.lat, c.lng])));

    if (allCoords.length > 0 && !hasFittedRef.current) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
      hasFittedRef.current = true;
    }
  }, [points, geometries, map]);
  return null;
};

const StakeoutModule: React.FC<Props> = ({ onBack, initialPoint, settings, currentStep, onNavigate }) => {
  const { t } = useLanguage();
  const [view, setView] = useState<'MENU' | 'LIST' | 'MANUAL' | 'MAP' | 'ALL_MAP'>((currentStep as any) || (initialPoint ? 'MAP' : 'MENU'));
  const [allMapZoom, setAllMapZoom] = useState(0);
  const [allMapCenterTrigger, setAllMapCenterTrigger] = useState<{ pos: [number, number], time: number } | null>(null);

  useEffect(() => {
    if (currentStep && currentStep !== view) {
      setView(currentStep as any);
    }
  }, [currentStep]);
  const [sourceView, setSourceView] = useState<'LIST' | 'ALL_MAP' | 'MENU'>(initialPoint ? 'LIST' : 'MENU');
  const [points, setPoints] = useState<StakeoutPoint[]>(() => {
    const saved = localStorage.getItem('stakeout_points_v1');
    const existingPoints = saved ? JSON.parse(saved) : [];
    if (initialPoint && !existingPoints.find((p: StakeoutPoint) => p.id === initialPoint.id)) {
      return [initialPoint, ...existingPoints];
    }
    return existingPoints;
  });
  const [geometries, setGeometries] = useState<StakeoutGeometry[]>(() => {
    const saved = localStorage.getItem('stakeout_geometries_v1');
    return saved ? JSON.parse(saved) : [];
  });

  // Pre-processed coordinates for Leaflet components
  const processedGeometries = React.useMemo(() => {
    return geometries.map(g => ({
      ...g,
      leafletCoords: g.coordinates.map(c => [c.lat, c.lng] as [number, number])
    }));
  }, [geometries]);
  const [activePoint, setActivePoint] = useState<StakeoutPoint | null>(initialPoint || null);
  const [confirmClear, setConfirmClear] = useState<'NONE' | 'LIST' | 'MAP'>('NONE');
  const [keepScreenOn, setKeepScreenOn] = useState(settings.screenAlwaysOn);
  const [targetReached, setTargetReached] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const wakeLockRef = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerAlert = () => {
    if (!settings.alertsEnabled) return;
    
    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300]);
    }
    
    // Sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitch for target
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio alert failed', e);
    }
  };

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Stakeout Wake Lock is active');
      } catch (err: any) {
        // Iframe içinde veya izin politikası kısıtlı olduğunda bu hata normaldir.
        if (err.name === 'NotAllowedError') {
          console.warn('Stakeout Wake Lock disallowed by permissions policy');
        } else {
          console.error(`Stakeout Wake Lock error: ${err.name}, ${err.message}`);
        }
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Stakeout Wake Lock released');
    }
  };

  useEffect(() => {
    if (keepScreenOn) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [keepScreenOn]);

  useEffect(() => {
    if (confirmClear !== 'NONE') {
      const timer = setTimeout(() => setConfirmClear('NONE'), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmClear]);

  useEffect(() => {
    localStorage.setItem('stakeout_points_v1', JSON.stringify(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem('stakeout_geometries_v1', JSON.stringify(geometries));
  }, [geometries]);
  const [userPos, setUserPos] = useState<Coordinate | null>(null);
  const [heading, setHeading] = useState<number | null>(null);

  // Manual Entry State
  const [manualName, setManualName] = useState('');
  const [manualX, setManualX] = useState('');
  const [manualY, setManualY] = useState('');
  const [manualSystem, setManualSystem] = useState('WGS84');
  const [manualZone, setManualZone] = useState('33');

  useEffect(() => {
    if (manualSystem.endsWith('_3')) {
      setManualZone('33');
    } else if (manualSystem.endsWith('_6')) {
      setManualZone('36');
    }
  }, [manualSystem]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: pos.timestamp
        });
        if (pos.coords.heading !== null) {
          setHeading(pos.coords.heading);
        }
      },
      (err) => {
        console.error(err);
        if (err.code === 1) {
          showToast(t("Konum izni reddedildi. Lütfen cihaz ayarlarınızdan izin verin."), "error");
        } else {
          showToast(`${t("Konum alınamıyor")}: ${err.message}`, "error");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const webkitHeading = (e as any).webkitCompassHeading;
      if (webkitHeading !== undefined) {
        setHeading(webkitHeading);
      } else if (e.alpha !== null) {
        setHeading(360 - e.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleKmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isKmz = fileName.endsWith('.kmz') || file.type === 'application/vnd.google-earth.kmz' || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
    
    if (isKmz) {
      try {
        const zip = new JSZip();
        // Using arrayBuffer() is more robust on some mobile browsers
        const arrayBuffer = await file.arrayBuffer();
        const contents = await zip.loadAsync(arrayBuffer);
        const kmlFiles = Object.keys(contents.files).filter(name => name.toLowerCase().endsWith('.kml'));
        
        if (kmlFiles.length > 0) {
          let totalPoints: StakeoutPoint[] = [];
          let totalGeometries: StakeoutGeometry[] = [];
          
          for (const kmlFileName of kmlFiles) {
            const kmlText = await contents.files[kmlFileName].async('string');
            const result = parseKML(kmlText);
            totalPoints = [...totalPoints, ...result.points];
            totalGeometries = [...totalGeometries, ...result.geometries];
          }
          
          if (totalPoints.length > 0 || totalGeometries.length > 0) {
            setPoints(prev => [...prev, ...totalPoints]);
            setGeometries(prev => [...prev, ...totalGeometries]);
            showToast(`${totalPoints.length} ${t("nokta ve")} ${totalGeometries.length} ${t("geometri yüklendi")}`, "success");
          } else {
            showToast(t("KML dosyaları içerisinde veri bulunamadı."), "info");
          }
        } else {
          showToast(t("KMZ dosyası içerisinde KML bulunamadı."), "error");
        }
      } catch (err) {
        console.error("KMZ okuma hatası:", err);
        showToast(t("KMZ dosyası okunamadı."), "error");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const result = parseKML(text);
        setPoints(prev => [...prev, ...result.points]);
        setGeometries(prev => [...prev, ...result.geometries]);
        showToast(t("KML/KMZ dosya yüklendi"), "success");
      };
      reader.readAsText(file);
    }
  };

  const handleAddManual = () => {
    if (!manualName || !manualX || !manualY) return;

    let lat = 0, lng = 0;
    if (manualSystem === 'WGS84') {
      lat = parseFloat(manualX);
      lng = parseFloat(manualY);
    } else {
      const zoneVal = parseInt(manualZone);
      const wgs = convertToWGS84(parseFloat(manualX), parseFloat(manualY), manualSystem, zoneVal);
      lat = wgs.lat;
      lng = wgs.lng;
    }

    if (isNaN(lat) || isNaN(lng)) {
      showToast(t("Geçersiz koordinat girişi."), "error");
      return;
    }

    const newPoint: StakeoutPoint = {
      id: `manual-${Date.now()}`,
      name: manualName,
      lat,
      lng,
      coordinateSystem: manualSystem,
      originalX: parseFloat(manualX),
      originalY: parseFloat(manualY)
    };

    setPoints(prev => [...prev, newPoint]);
    setManualName('');
    setManualX('');
    setManualY('');
    onNavigate('LIST');
  };

  const calculateGuidance = () => {
    if (!userPos || !activePoint) return null;

    const R = 6371e3;
    const φ1 = userPos.lat * Math.PI/180;
    const φ2 = activePoint.lat * Math.PI/180;
    const Δφ = (activePoint.lat - userPos.lat) * Math.PI/180;
    const Δλ = (activePoint.lng - userPos.lng) * Math.PI/180;

    // North/South distance (approx)
    const distNS = Δφ * R;
    // East/West distance (approx)
    const distEW = Δλ * R * Math.cos(φ1);

    const totalDist = Math.sqrt(distNS * distNS + distEW * distEW);

    let forward = distNS;
    let right = distEW;

    if (heading !== null) {
      const rad = heading * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      
      // Rotate coordinates based on heading
      // Standard rotation: x' = x cos θ + y sin θ, y' = -x sin θ + y cos θ
      // Here y is North, x is East. Heading is clockwise from North.
      forward = distNS * cos + distEW * sin;
      right = distEW * cos - distNS * sin;
    }

    return {
      totalDist,
      forward,
      right,
      north: distNS,
      east: distEW
    };
  };

  const guidance = calculateGuidance();

  useEffect(() => {
    if (guidance && guidance.totalDist < 2.0 && !targetReached) {
      setTargetReached(true);
      triggerAlert();
    } else if (guidance && guidance.totalDist >= 2.0) {
      setTargetReached(false);
    }
  }, [guidance?.totalDist, targetReached]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-200">
      <style>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
      <Header 
        title={view === 'MENU' ? t('Aplikasyon Yap') : 
               view === 'LIST' ? t('Nokta Listesi') : 
               view === 'MANUAL' ? t('Manuel Ekle') : 
               view === 'ALL_MAP' ? t('Tüm Noktalar') : t('Aplikasyon Ekranı')} 
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-in slide-in-from-top-full duration-500">
          <div className={`bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl p-4 flex items-center gap-4 ${toast.type === 'error' ? 'border-rose-200' : toast.type === 'info' ? 'border-blue-200' : 'border-emerald-200'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-rose-100 text-rose-600' : toast.type === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <i className={`fas ${toast.type === 'error' ? 'fa-circle-exclamation' : toast.type === 'info' ? 'fa-circle-info' : 'fa-circle-check'} text-xl`}></i>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {toast.type === 'error' ? t('Hata') : toast.type === 'info' ? t('Bilgi') : t('Başarılı')}
              </h4>
              <p className="text-[11px] text-slate-500 font-bold leading-tight mt-0.5">{toast.message}</p>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${toast.type === 'error' ? 'bg-rose-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {view === 'MENU' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar px-8">
              <div className="py-8 pt-4 space-y-4 max-w-sm mx-auto w-full">
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => onNavigate('MANUAL')} className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-keyboard text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("Manuel Koordinat Ekle")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("El ile Giriş")}</span>
                    </div>
                  </button>
  
                  <label className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-file-import text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("KML / KMZ Yükle")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("Dosyadan Aktar")}</span>
                    </div>
                      <input 
                        type="file" 
                        accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz,application/zip,application/x-zip-compressed,application/octet-stream" 
                        onChange={handleKmlUpload} 
                        className="hidden" 
                      />
                  </label>
  
                  <button onClick={() => onNavigate('LIST')} className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-list-ul text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("Nokta Listesini Gör")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{points.length} {t("Nokta Hazır")}</span>
                    </div>
                  </button>
  
                  <button 
                    onClick={() => {
                      if (points.length === 0 && geometries.length === 0) showToast(t("Haritada gösterilecek veri bulunamadı."), "info");
                      else onNavigate('ALL_MAP');
                    }} 
                    className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 active:scale-[0.98] transition-all"
                  >
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-map-marked-alt text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("Harita Üzerinde Gör")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{points.length} {t("Nokta")}, {geometries.length} {t("Geometri")}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {view === 'LIST' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar px-8">
              <div className="py-8 pt-4 space-y-4 max-w-sm mx-auto w-full">
                {points.length === 0 ? (
                  <div className="p-12 text-center bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
                    <i className="fas fa-ghost text-3xl text-slate-200"></i>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t("Liste Boş")}</p>
                  </div>
                ) : (
                  points.map(p => (
                    <div key={p.id} className="soft-card py-3 md:py-4 px-5 flex items-center justify-between group">
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <h4 className="font-black text-slate-800">{p.name}</h4>
                          <div className="flex flex-col">
                            {(() => {
                              const { x, y, labelX, labelY } = convertCoordinate(p.lat, p.lng, p.coordinateSystem || 'WGS84');
                              const isUTM = p.coordinateSystem && p.coordinateSystem !== 'WGS84';
                              const precision = isUTM ? 3 : 8;
                              return (
                                <>
                                  <p className="text-[10px] font-bold text-slate-400 mono-font">
                                    {t(labelX)}: {x.toFixed(precision)}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 mono-font">
                                    {t(labelY)}: {y.toFixed(precision)}
                                  </p>
                                </>
                              );
                            })()}
                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">
                              {p.coordinateSystem?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { 
                            setSourceView('LIST');
                            setActivePoint(p); 
                            onNavigate('MAP'); 
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all"
                        >
                          {t("GİT")}
                        </button>
                        <button 
                          onClick={() => setPoints(prev => prev.filter(pt => pt.id !== p.id))}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button 
                  onClick={() => { 
                    if (confirmClear === 'LIST') {
                      localStorage.removeItem('stakeout_points_v1');
                      localStorage.removeItem('stakeout_geometries_v1');
                      setPoints([]); 
                      setGeometries([]); 
                      setConfirmClear('NONE');
                    } else {
                      setConfirmClear('LIST');
                    }
                  }}
                  className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${confirmClear === 'LIST' ? 'text-red-600 bg-red-100 rounded-2xl' : 'text-slate-400 hover:text-red-500'}`}
                >
                  {confirmClear === 'LIST' ? t('EMİN MİSİNİZ? (TEKRAR TIKLAYIN)') : t('LİSTEYİ TEMİZLE')}
                </button>
              </div>
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {view === 'MANUAL' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar px-8">
              <div className="py-8 pt-4 mx-auto max-w-sm w-full">
                <div className="soft-card p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Nokta Adı")}</label>
                    <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder={t("Örn: P1")} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Koordinat Sistemi")}</label>
                    <select value={manualSystem} onChange={e => setManualSystem(e.target.value)} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none">
                      <option value="WGS84">{t("WGS84 (Enlem-Boylam)")}</option>
                      <option value="ITRF96_3">{t("ITRF96 - 3° - TM")}</option>
                      <option value="ITRF96_6">{t("ITRF96 - 6° - UTM")}</option>
                      <option value="ED50_3">{t("ED50 - 3° - TM")}</option>
                      <option value="ED50_6">{t("ED50 - 6° - UTM")}</option>
                    </select>
                  </div>

                  {manualSystem !== 'WGS84' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {manualSystem.endsWith('_3') ? t('Dilim Orta Meridyeni (DOM)') : t('UTM Zon (6°)')}
                      </label>
                      <select 
                        value={manualZone} 
                        onChange={e => setManualZone(e.target.value)} 
                        className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none"
                      >
                        {manualSystem.endsWith('_3') ? (
                           <>
                             <option value="27">27° (DOM)</option>
                             <option value="30">30° (DOM)</option>
                             <option value="33">33° (DOM)</option>
                             <option value="36">36° (DOM)</option>
                             <option value="39">39° (DOM)</option>
                             <option value="42">42° (DOM)</option>
                             <option value="45">45° (DOM)</option>
                           </>
                        ) : (
                           <>
                             <option value="35">35 (Zon)</option>
                             <option value="36">36 (Zon)</option>
                             <option value="37">37 (Zon)</option>
                             <option value="38">38 (Zon)</option>
                           </>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {manualSystem === 'WGS84' ? t('Enlem (N/X)') : t('Sağa (E/Y)')}
                      </label>
                      <input type="number" value={manualX} onChange={e => setManualX(e.target.value)} placeholder="0.000" className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {manualSystem === 'WGS84' ? t('Boylam (E/Y)') : t('Yukarı (N/X)')}
                      </label>
                      <input type="number" value={manualY} onChange={e => setManualY(e.target.value)} placeholder="0.000" className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all" />
                    </div>
                  </div>
                  <button onClick={handleAddManual} className="w-full py-2.5 md:py-3.5 px-5 bg-blue-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
                    {t("LİSTEYE EKLE")}
                  </button>
                </div>
              </div>
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {view === 'ALL_MAP' && (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 relative z-10">
              <MapContainer 
                center={[userPos?.lat || 39, userPos?.lng || 35]} 
                zoom={19} 
                maxZoom={22}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
                preferCanvas={true}
              >
                <TileLayer
                  url={getTileLayer(settings.mapProvider).url}
                  attribution={getTileLayer(settings.mapProvider).attribution}
                  maxZoom={22}
                  maxNativeZoom={getTileLayer(settings.mapProvider).maxNativeZoom}
                  tms={getTileLayer(settings.mapProvider).tms}
                />
                
                {processedGeometries.map(g => (
                  <React.Fragment key={g.id}>
                    {g.type === 'LineString' ? (
                      <Polyline 
                        positions={g.leafletCoords} 
                        pathOptions={{ color: g.color || '#3b82f6', weight: 3 }} 
                      />
                    ) : (
                      <Polygon 
                        positions={g.leafletCoords} 
                        pathOptions={{ color: g.color || '#3b82f6', fillColor: g.color || '#3b82f6', fillOpacity: 0.1, weight: 2 }} 
                      />
                    )}
                  </React.Fragment>
                ))}

                <LazyVertexLayer 
                  geometries={geometries} 
                  zoom={allMapZoom} 
                  onVertexSelect={(g, c, idx) => {
                    const newPt: StakeoutPoint = {
                      id: `snap-${Date.now()}`,
                      name: `${g.name} - ${t("Köşe")} ${idx + 1}`,
                      lat: c.lat,
                      lng: c.lng,
                      coordinateSystem: 'WGS84',
                      originalX: c.lat,
                      originalY: c.lng
                    };
                    setSourceView('ALL_MAP');
                    setActivePoint(newPt);
                    onNavigate('MAP');
                  }}
                />

                {points.map(p => (
                  <StakeoutMarker 
                    key={p.id} 
                    p={p} 
                    zoom={allMapZoom} 
                    onGo={(pt) => {
                      setSourceView('ALL_MAP');
                      setActivePoint(pt); 
                      onNavigate('MAP'); 
                    }}
                  />
                ))}

                {userPos && (
                  <>
                    <Circle 
                      center={[userPos.lat, userPos.lng]} 
                      radius={userPos.accuracy} 
                      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
                    />
                    <Marker 
                      position={[userPos.lat, userPos.lng]} 
                      icon={L.divIcon({
                        className: 'user-marker',
                        html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); transform: rotate(${heading || 0}deg);">
                                <div style="position: absolute; top: -10px; left: 5px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 10px solid #3b82f6;"></div>
                               </div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                      })}
                    />
                  </>
                )}
                <BoundsUpdater points={points} geometries={geometries} />
                <ZoomTracker onZoomChange={setAllMapZoom} />
                <MapCenterer trigger={allMapCenterTrigger} />
              </MapContainer>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-20 px-8 py-4 bg-slate-200/95 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-slate-100 flex items-center justify-between">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {points.length} {t("Nokta")}, {geometries.length} {t("Geometri")}
               </p>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => {
                     if (confirmClear === 'MAP') {
                       localStorage.removeItem('stakeout_points_v1');
                       localStorage.removeItem('stakeout_geometries_v1');
                       setPoints([]);
                       setGeometries([]);
                       setConfirmClear('NONE');
                       window.history.back();
                     } else {
                       setConfirmClear('MAP');
                     }
                   }}
                   className={`px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-wider border transition-all active:scale-95 ${confirmClear === 'MAP' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-600 border-red-100'}`}
                 >
                   {confirmClear === 'MAP' ? t('EMİN MİSİNİZ?') : t('EKRANI TEMİZLE')}
                 </button>
               </div>
            </div>
          </div>
        )}

        {view === 'MAP' && activePoint && (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 relative z-10">
              <MapContainer 
                center={[activePoint.lat, activePoint.lng]} 
                zoom={getTileLayer(settings.mapProvider).maxNativeZoom} 
                maxZoom={22}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
                preferCanvas={true}
              >
                <TileLayer
                  url={getTileLayer(settings.mapProvider).url}
                  attribution={getTileLayer(settings.mapProvider).attribution}
                  maxZoom={22}
                  maxNativeZoom={getTileLayer(settings.mapProvider).maxNativeZoom}
                  tms={getTileLayer(settings.mapProvider).tms}
                />
                
                {processedGeometries.map(g => (
                  <React.Fragment key={g.id}>
                    {g.type === 'LineString' ? (
                      <Polyline 
                        positions={g.leafletCoords} 
                        pathOptions={{ color: g.color || '#3b82f6', weight: 2, opacity: 0.7, dashArray: '5, 10' }} 
                      />
                    ) : (
                      <Polygon 
                        positions={g.leafletCoords} 
                        pathOptions={{ color: g.color || '#3b82f6', fillColor: g.color || '#3b82f6', fillOpacity: 0.2, weight: 1, opacity: 0.6 }} 
                      />
                    )}
                  </React.Fragment>
                ))}

                <Marker 
                  position={[activePoint.lat, activePoint.lng]} 
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="width: 12px; height: 12px; background: ${activePoint.color || '#3b82f6'}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  })}
                />
                {userPos && (
                  <>
                    <Circle 
                      center={[userPos.lat, userPos.lng]} 
                      radius={userPos.accuracy} 
                      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
                    />
                    <Marker 
                      position={[userPos.lat, userPos.lng]} 
                      icon={L.divIcon({
                        className: 'user-marker',
                        html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); transform: rotate(${heading || 0}deg);">
                                <div style="position: absolute; top: -10px; left: 5px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 10px solid #3b82f6;"></div>
                               </div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                      })}
                    />
                  </>
                )}
                <MapUpdater center={[activePoint.lat, activePoint.lng]} />
              </MapContainer>

              {/* Visual Guidance Compass Overlay */}
              {guidance && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-white/30 bg-slate-900/10 backdrop-blur-[2px] relative flex items-center justify-center">
                    {/* Crosshair lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[1px] bg-white/20"></div>
                      <div className="h-full w-[1px] bg-white/20"></div>
                    </div>

                    {/* Target Indicator Dot */}
                    {(() => {
                      const maxVisualDist = guidance.totalDist < 5 ? 5 : Math.max(15, guidance.totalDist);
                      const scale = (guidance.totalDist < 5 ? 80 : 40) / maxVisualDist;
                      const topOffset = -guidance.forward * scale;
                      const leftOffset = guidance.right * scale;
                      
                      // Clamp to circle boundary
                      const distFromCenter = Math.sqrt(topOffset * topOffset + leftOffset * leftOffset);
                      const maxRadius = guidance.totalDist < 5 ? 90 : 80;
                      let finalTop = topOffset;
                      let finalLeft = leftOffset;
                      
                      if (distFromCenter > maxRadius) {
                        finalTop = (topOffset / distFromCenter) * maxRadius;
                        finalLeft = (leftOffset / distFromCenter) * maxRadius;
                      }

                      return (
                        <div 
                          className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-300 flex items-center justify-center ${guidance.totalDist < 2.0 ? 'bg-emerald-500 animate-ping' : 'bg-blue-600'}`}
                          style={{ 
                            transform: `translate(${finalLeft}px, ${finalTop}px)`,
                          }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      );
                    })()}

                    {/* Center Point (User) */}
                    <div className="w-4 h-4 bg-white rounded-full border-2 border-blue-600 shadow-md z-10"></div>
                    
                    {/* Distance Label */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-100 shadow-xl">
                       <span className="text-[11px] font-black text-slate-900 mono-font">{guidance.totalDist.toFixed(1)}m</span>
                    </div>

                    {/* Close-up Mode Indicator */}
                    {guidance.totalDist < 5 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                        <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                          {t("YAKIN ÇEKİM MODU")}
                        </div>
                        {guidance.totalDist < 2.0 && (
                          <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 animate-bounce">
                            {t("HEDEFE ULAŞILDI")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-200 p-3 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 rounded-t-[2rem] -mt-6">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-black text-slate-900 truncate leading-tight">{activePoint.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("Seçili Nokta")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${activePoint.lat},${activePoint.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-slate-200"
                  >
                    <i className="fas fa-route text-[10px]"></i>
                    <span className="text-[9px] font-black uppercase tracking-wider">{t("Navigasyon")}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className={`p-2 rounded-2xl border transition-colors duration-500 ${getAccuracyBg(userPos?.accuracy || null)}`}>
                  <div className={`text-xl font-black mono-font leading-none ${getAccuracyColor(userPos?.accuracy || null)}`}>
                    {userPos ? `±${userPos.accuracy.toFixed(1)}` : '---'}
                    <span className="text-[10px] ml-1">m</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t("Hassasiyet")}</p>
                </div>
                <div className="bg-blue-100/50 p-2 rounded-2xl border border-blue-200/50">
                  <div className="text-xl font-black text-blue-600 mono-font leading-none">
                    {guidance ? guidance.totalDist.toFixed(1) : '---'}
                    <span className="text-[10px] ml-1">m</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t("Mesafe")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
                  <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">
                    {heading !== null ? t('İLERİ / GERİ') : t('KUZEY / GÜNEY')}
                  </div>
                  <div className={`text-base font-black mono-font ${guidance && (heading !== null ? guidance.forward : guidance.north) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {guidance ? Math.abs(heading !== null ? guidance.forward : guidance.north).toFixed(1) : '0.0'}
                    <span className="text-[10px] ml-1">m</span>
                    <span className="text-[9px] ml-2 opacity-60">
                      {guidance ? ((heading !== null ? guidance.forward : guidance.north) > 0 ? (heading !== null ? t('İLERİ') : t('KUZEY')) : (heading !== null ? t('GERİ') : t('GÜNEY'))) : ''}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
                  <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">
                    {heading !== null ? t('SAĞ / SOL') : t('DOĞU / BATI')}
                  </div>
                  <div className={`text-base font-black mono-font ${guidance && (heading !== null ? guidance.right : guidance.east) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {guidance ? Math.abs(heading !== null ? guidance.right : guidance.east).toFixed(1) : '0.0'}
                    <span className="text-[10px] ml-1">m</span>
                    <span className="text-[9px] ml-2 opacity-60">
                      {guidance ? ((heading !== null ? guidance.right : guidance.east) > 0 ? (heading !== null ? t('SAĞ') : t('DOĞU')) : (heading !== null ? t('SOL') : t('BATI'))) : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              {!heading && (
                <p className="mt-1.5 text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                  {t("Pusula verisi bekleniyor... (K/G/D/B modu)")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeoutModule;
