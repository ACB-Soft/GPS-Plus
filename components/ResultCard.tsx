import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate, getSystemDisplayLabel } from '../utils/CoordinateUtils';
import { useOrthometricHeight } from '../hooks/useGeoid';
import { calculateMaxDistance } from '../utils/MathUtils';


// Map rendering fix for modals
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
};

interface Props {
  location: SavedLocation;
  settings: AppSettings;
  initialShowMap?: boolean;
  onCloseMap?: () => void;
}

const ResultCard: React.FC<Props> = ({ location, settings, initialShowMap = false, onCloseMap }) => {
  const [showMap, setShowMap] = useState(initialShowMap);
  const [showWarning, setShowWarning] = useState(false);
  const { x, y, labelX, labelY, zone } = convertCoordinate(location.lat, location.lng, location.coordinateSystem || 'WGS84');
  const isUTM = location.coordinateSystem && location.coordinateSystem !== 'WGS84';
  
  const locPrecision = settings.locationPrecision ?? 1;
  const heightPrecision = settings.heightPrecision ?? 2;
  const isOrthometric = settings.heightType === 'orthometric';

  const formattedX = isUTM ? x.toFixed(locPrecision) : x.toFixed(6);
  const formattedY = isUTM ? y.toFixed(locPrecision) : y.toFixed(6);
  
  const geoidInfo = useOrthometricHeight(location.altitude, location.lat, location.lng);
  const displayHeight = isOrthometric ? geoidInfo.orthometricHeight : geoidInfo.ellipsoidalHeight;
  
  // Re-calculate accuracy based on spread if samples are present
  // This ensures old data also reflects the "Max(Statistical, MaxDistance)" logic
  const dynamicAccuracy = React.useMemo(() => {
    if (!location.samples || location.samples.length <= 1) return location.accuracy;
    
    // Filter samples by accuracy limit as per user's latest logic
    const limit = location.accuracyLimit || 5.0;
    const reliableSamples = location.samples.filter(s => s.accuracy <= limit);
    
    if (reliableSamples.length <= 1) return location.accuracy;
    
    const maxSpread = calculateMaxDistance(reliableSamples);
    const avgSensorAcc = reliableSamples.reduce((a, b) => a + b.accuracy, 0) / reliableSamples.length;
    // Return the maximum of physical spread and sensor baseline as per user request
    return Math.max(maxSpread, avgSensorAcc);
  }, [location.samples, location.accuracyLimit]);

  const getMapProviderInfo = () => {
    const provider = localStorage.getItem('default_map_provider') || 'Google Hybrid';
    switch (provider) {
      case 'Google Hybrid': return { url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", maxNativeZoom: 20 };
      case 'Google Satellite': return { url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", maxNativeZoom: 20 };
      case 'OpenTopoMap': return { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", maxNativeZoom: 17 };
      case 'Google Roadmap':
      default: return { url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", maxNativeZoom: 20 };
    }
  };

  const reliability = React.useMemo(() => {
    const samples = location.samples || [];
    const avgSensorAcc = samples.length > 0 
      ? samples.reduce((a, b) => a + b.accuracy, 0) / samples.length 
      : location.accuracy;

    const maxSpread = samples.length >= 3 ? calculateMaxDistance(samples) : 0;

    // RULE 1: UNSAFE (GÜVENSİZ)
    if (avgSensorAcc > 20 || maxSpread > 30 || (samples.length >= 3 && maxSpread > avgSensorAcc * 3)) {
      return 'LOW';
    }

    // RULE 2: ORTA GÜVEN / VERİ AZ
    if (avgSensorAcc > 10 || maxSpread > 15 || samples.length < 5) {
      return 'MEDIUM';
    }
    
    // RULE 3: GÜVENLİ
    return 'HIGH';
  }, [location.samples, location.accuracy]);

  useEffect(() => {
    if (reliability === 'LOW' || reliability === 'MEDIUM') {
      setShowWarning(true);
    }
  }, [reliability]);

  const mapInfo = getMapProviderInfo();

  return (
    <>
      <div className="soft-card p-5 md:p-6 border-slate-200/60 space-y-5 md:space-y-6 text-center animate-in relative overflow-hidden bg-white max-w-sm mx-auto shadow-2xl shadow-slate-300/50">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] leading-none">Kayıt Edildi</span>
            </div>
            <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full border shadow-sm min-w-[100px] ${
                reliability === 'HIGH' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                reliability === 'MEDIUM' || reliability === 'UNKNOWN' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                'bg-rose-50 border-rose-100 text-rose-600'
              }`}>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] leading-none">
                  {reliability === 'HIGH' ? 'GÜVENLİ' : 
                   reliability === 'MEDIUM' ? 'ORTA GÜVEN' : 
                   reliability === 'LOW' ? 'GÜVENSİZ' : 'VERİ AZ'}
                </span>
              </div>
          </div>
          <div className="space-y-1">
            <p className="text-[14px] md:text-[16px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">{location.folderName}</p>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tight truncate px-4">{location.name}</h3>
          </div>
        </div>

        <div className="space-y-4">
          {location.coordinateSystem && (
            <div className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">
              {getSystemDisplayLabel(location.coordinateSystem)} {zone && `(${zone})`}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-slate-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 text-left shadow-sm">
              <div className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase mb-1 leading-none">{labelX}</div>
              <div className="text-[14px] md:text-[16px] font-bold text-slate-900 mono-font leading-none">{formattedX}</div>
            </div>
            <div className="bg-slate-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 text-left shadow-sm">
              <div className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase mb-1 leading-none">{labelY}</div>
              <div className="text-[14px] md:text-[16px] font-bold text-slate-900 mono-font leading-none">{formattedY}</div>
            </div>
            <div className="bg-blue-50/50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-blue-100 text-left shadow-sm">
              <div className="text-[9px] md:text-[10px] text-blue-500 font-black mb-1 leading-none tracking-widest">{isOrthometric ? 'YÜKSEKLİK' : 'h-ELİPSOİD'}</div>
              <div className="text-xl md:text-2xl font-black text-blue-600 mono-font leading-none">{displayHeight !== null ? displayHeight.toFixed(heightPrecision) : '---'}<span className="text-[10px] ml-1">m</span></div>
            </div>
            <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border text-left transition-colors shadow-sm ${
              dynamicAccuracy <= 10 ? 'bg-emerald-50/50 border-emerald-100' : 
              dynamicAccuracy <= 20 ? 'bg-amber-50/50 border-amber-100' : 'bg-rose-50/50 border-rose-100'
            }`}>
              <div className={`text-[9px] md:text-[10px] font-black uppercase mb-1 leading-none ${
                dynamicAccuracy <= 10 ? 'text-emerald-500' : 
                dynamicAccuracy <= 20 ? 'text-amber-500' : 'text-rose-500'
              }`}>Hassasiyet</div>
              <div className={`text-xl md:text-2xl font-black mono-font leading-none ${
                dynamicAccuracy <= 10 ? 'text-emerald-600' : 
                dynamicAccuracy <= 20 ? 'text-amber-600' : 'text-rose-600'
              }`}>±{dynamicAccuracy.toFixed(1)}<span className="text-[10px] ml-1">m</span></div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowMap(true)}
          className="w-full pt-4 md:pt-5 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] active:scale-95 transition-all hover:text-blue-700"
        >
          <i className="fas fa-map-marked-alt text-sm"></i>
          HARİTADA GÖR
        </button>

        <button 
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
            window.open(url, '_blank');
          }}
          className="w-full pt-4 md:pt-5 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] active:scale-95 transition-all hover:text-emerald-700"
        >
          <i className="fas fa-route text-sm"></i>
          NAVİGASYONA GÖNDER
        </button>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in">
          <div className="absolute top-6 left-6 z-[10000]">
            <button 
              onClick={() => {
                setShowMap(false);
                if (onCloseMap) onCloseMap();
              }}
              className="w-12 h-12 bg-slate-200/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-90 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={mapInfo.maxNativeZoom} 
            maxZoom={22}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url={mapInfo.url}
              attribution={localStorage.getItem('default_map_provider') === 'OpenTopoMap' ? '&copy; OpenTopoMap' : '&copy; Google'}
              maxZoom={22}
              maxNativeZoom={mapInfo.maxNativeZoom}
            />
            <Marker 
              position={[location.lat, location.lng]} 
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
            />
            <Circle 
              center={[location.lat, location.lng]} 
              radius={dynamicAccuracy} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
            />
            <MapResizer />
          </MapContainer>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-xs px-6">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Hassasiyet</p>
                <p className={`text-base font-black mono-font leading-none ${
                  dynamicAccuracy <= 10 ? 'text-emerald-600' : 
                  dynamicAccuracy <= 20 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  ±{dynamicAccuracy.toFixed(1)}m
                </p>
              </div>
              <div className="text-right flex-1 min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nokta Adı</p>
                <p className="text-sm font-black text-slate-900 truncate leading-none">{location.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWarning && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
          
          {reliability === 'LOW' ? (
            <div className="relative bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-rose-100 animate-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 mb-2">
                  <i className="fas fa-satellite-dish text-rose-500 text-2xl animate-pulse"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Düşük Sinyal Kalitesi!</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    Ölçüm sırasında çevresel ve donanımsal faktörler nedeniyle hatalar tespit edildi.
                  </p>
                  <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 mt-2">
                    <p className="text-[11px] font-bold text-rose-700 leading-tight">
                      Gerçek konumunuz gösterilenden farklı olabilir. Ölçümü gökyüzü açık bir alanda tekrarlamanız önerilir.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                  ANLADIM
                </button>
              </div>
            </div>
          ) : (
            <div className="relative bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-amber-100 animate-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 mb-2">
                  <i className="fas fa-satellite-dish text-amber-500 text-2xl animate-pulse"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Orta Sinyal Kalitesi!</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    Ölçüm sırasında çevresel ve donanımsal faktörler nedeniyle hatalar tespit edildi.
                  </p>
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 mt-2">
                    <p className="text-[11px] font-bold text-amber-700 leading-tight">
                      Gerçek konumunuz gösterilenden farklı olabilir. Ölçümü gökyüzü açık bir alanda tekrarlamanız önerilir.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                  ANLADIM
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ResultCard;