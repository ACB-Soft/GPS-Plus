import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate, getSystemDisplayLabel } from '../utils/CoordinateUtils';
import { useOrthometricHeight } from '../hooks/useGeoid';
import { calculateMaxDistance } from '../utils/MathUtils';
import { useLanguage } from '../utils/LanguageContext';
import { getAccuracyColor } from '../utils/StyleUtils';


// Map rendering fix for modals and dynamic recentering
const MapResizer = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng]);
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }
  }, [map, lat, lng]);
  return null;
};

const BingTileLayer = () => {
  const map = useMap();
  useEffect(() => {
    const BingLayerClass = L.TileLayer.extend({
      getTileUrl: function (coords: any) {
        let quadkey = '';
        const z = coords.z;
        const x = coords.x;
        const y = coords.y;
        for (let i = z; i > 0; i--) {
          let digit = 0;
          const mask = 1 << (i - 1);
          if ((x & mask) !== 0) {
            digit += 1;
          }
          if ((y & mask) !== 0) {
            digit += 2;
          }
          quadkey += digit;
        }
        return L.Util.template(this._url, {
          quadkey: quadkey,
          s: this._getSubdomain(coords)
        });
      }
    });

    const layer = new (BingLayerClass as any)(
      "https://ecn.t{s}.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587",
      {
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        attribution: 'Tiles &copy; Microsoft (Bing Maps)',
        maxNativeZoom: 19,
        maxZoom: 22
      }
    );

    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
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
  const { t, language } = useLanguage();
  const [showMap, setShowMap] = useState(initialShowMap);
  const [showWarning, setShowWarning] = useState(false);
  const [currentMapProvider, setCurrentMapProvider] = useState(() => localStorage.getItem('default_map_provider') || 'Google Hybrid');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const { x, y, labelX, labelY, zone } = convertCoordinate(location.lat, location.lng, location.coordinateSystem || 'WGS84');
  const isUTM = location.coordinateSystem && location.coordinateSystem !== 'WGS84';
  
  const locPrecision = settings.locationPrecision ?? 1;
  const heightPrecision = settings.heightPrecision ?? 2;
  const isOrthometric = settings.heightType === 'orthometric';

  const formattedX = isUTM ? x.toFixed(locPrecision) : x.toFixed(6);
  const formattedY = isUTM ? y.toFixed(locPrecision) : y.toFixed(6);
  
  const geoidInfo = useOrthometricHeight(location.altitude, location.lat, location.lng, location.deviceOS);
  const displayHeight = isOrthometric ? geoidInfo.orthometricHeight : geoidInfo.ellipsoidalHeight;
  
  const maxSpread = React.useMemo(() => {
    return location.samples && location.samples.length >= 2 ? calculateMaxDistance(location.samples) : 0;
  }, [location.samples]);

  const avgHardwareAccuracy = React.useMemo(() => {
    if (!location.samples || location.samples.length === 0) return location.accuracy;
    return location.samples.reduce((sum, s) => sum + s.accuracy, 0) / location.samples.length;
  }, [location.samples, location.accuracy]);

  // Re-calculate accuracy based on spread if samples are present
  // This ensures old data also reflects the "Max(Statistical, MaxDistance)" logic
  const dynamicAccuracy = React.useMemo(() => {
    if (!location.samples || location.samples.length <= 1) return location.accuracy;
    return Math.max(maxSpread, avgHardwareAccuracy);
  }, [location.samples, maxSpread, avgHardwareAccuracy, location.accuracy]);

  const getMapProviderInfo = () => {
    const provider = currentMapProvider;
    switch (provider) {
      case 'Google Hybrid': return { url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", maxNativeZoom: 20, tms: false, attribution: '&copy; Google' };
      case 'Google Satellite': return { url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", maxNativeZoom: 20, tms: false, attribution: '&copy; Google' };
      case 'OpenTopoMap': return { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", maxNativeZoom: 17, tms: false, attribution: '&copy; OpenTopoMap contributors' };
      case 'Esri World Imagery': return { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", maxNativeZoom: 19, tms: false, attribution: 'Tiles &copy; Esri' };
      case 'Bing Satellite': return { url: "", maxNativeZoom: 19, tms: false, attribution: 'Tiles &copy; Microsoft (Bing Maps)' };
      case 'Google Roadmap':
      default: return { url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", maxNativeZoom: 20, tms: false, attribution: '&copy; Google' };
    }
  };

  const reliability = React.useMemo(() => {
    const samples = location.samples || [];
    const avgSensorAcc = samples.length > 0 
      ? samples.reduce((a, b) => a + b.accuracy, 0) / samples.length 
      : location.accuracy;

    const maxSpread = samples.length >= 2 ? calculateMaxDistance(samples) : 0;
    const samplesCount = samples.length;

    // 1. GÜVENSİZ VERİ (KIRMIZI): Donanımsal Hassasiyet > 20m VEYA Veri Saçılımı > 20m VEYA Veri Saçılımı > Donanımsal Hassasiyet * 3
    if (avgSensorAcc > 20 || maxSpread > 20 || maxSpread > avgSensorAcc * 3) {
      return 'LOW';
    }

    // 2. GÜVENİLİR VERİ (YEŞİL): Donanımsal Hassasiyet <= 5m VE Veri Saçılımı <= 5m VE Veri Sayısı >= 15 VE Veri Saçılımı <= Donanımsal Hassasiyet
    if (avgSensorAcc <= 5 && maxSpread <= 5 && samplesCount >= 15 && maxSpread <= avgSensorAcc) {
      return 'HIGH';
    }
    
    // 3. ORTA GÜVENLİ VERİ / VERİ AZ (TURUNCU)
    return 'MEDIUM';
  }, [location.samples, location.accuracy]);

  useEffect(() => {
    if (reliability === 'LOW' || reliability === 'MEDIUM') {
      setShowWarning(true);
    }
  }, [reliability]);

  const mapInfo = getMapProviderInfo();

  return (
    <>
      <div className="soft-card p-3.5 md:p-4 border-slate-200/60 space-y-3 md:space-y-3.5 text-center animate-in relative overflow-hidden bg-white w-full max-w-sm mx-auto shadow-2xl shadow-slate-300/50">
        <div className="space-y-1.5 md:space-y-2">
          <div className="space-y-0.5">
            <p className="text-[14px] md:text-[16px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">{location.folderName}</p>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tight truncate px-4">{location.name}</h3>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          {location.coordinateSystem && (
            <div className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">
              {t(getSystemDisplayLabel(location.coordinateSystem))} {zone && `(${zone})`}
            </div>
          )}
          {/* Restructured 3 Rows & 2 Columns Layout */}
          {(() => {
            const boxBgClass = "bg-gradient-to-br from-slate-50 to-slate-100/80 border-slate-200/80 p-2 py-1.5 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm";

            return (
              <div className="grid grid-cols-2 gap-2">
                {/* Row 1: Sağa, Yukarı */}
                <div className={boxBgClass}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t(labelX)}</span>
                  <p className="text-[15px] md:text-[16px] mono-font text-slate-800 font-black leading-tight">{formattedX}</p>
                </div>
                <div className={boxBgClass}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t(labelY)}</span>
                  <p className="text-[15px] md:text-[16px] mono-font text-slate-800 font-black leading-tight">{formattedY}</p>
                </div>

                {/* Row 2: Yükseklik, GPS Sinyali */}
                <div className={boxBgClass}>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest leading-none mb-0.5">{isOrthometric ? t('YÜKSEKLİK') : t('h-ELİPSOİD')}</span>
                  <p className="text-[15px] md:text-[16px] mono-font text-slate-800 font-black leading-tight">{displayHeight !== null ? `${displayHeight.toFixed(heightPrecision)}m` : '---'}</p>
                </div>
                <div className={boxBgClass}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t("GPS Sinyali")}</span>
                  <p className={`text-[11px] md:text-[12px] font-black uppercase tracking-widest leading-tight ${
                    reliability === 'HIGH' ? 'text-emerald-500' :
                    reliability === 'MEDIUM' || reliability === 'UNKNOWN' ? 'text-amber-500' : 
                    'text-rose-500'
                  }`}>
                    {reliability === 'HIGH' ? t('GÜVENLİ') : 
                     reliability === 'MEDIUM' ? t('Orta') : 
                     reliability === 'LOW' ? t('GÜVENSİZ') : t('VERİ AZ')}
                  </p>
                </div>

                {/* Row 3: Hassasiyet, Saçılım */}
                <div className={boxBgClass}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t("Hassasiyet")}</span>
                  <p className={`text-[15px] md:text-[16px] mono-font font-black leading-tight ${getAccuracyColor(avgHardwareAccuracy)}`}>±{avgHardwareAccuracy.toFixed(1)}m</p>
                </div>
                <div className={boxBgClass}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t("Saçılım")}</span>
                  <p className={`text-[15px] md:text-[16px] mono-font font-black leading-tight ${
                    reliability === 'HIGH' ? 'text-emerald-500' :
                    reliability === 'MEDIUM' || reliability === 'UNKNOWN' ? 'text-amber-500' : 
                    'text-rose-500'
                  }`}>±{maxSpread.toFixed(1)}m</p>
                </div>
              </div>
            );
          })()}
        </div>
        
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <button 
            onClick={() => setShowMap(true)}
            className="w-full py-2 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <i className="fas fa-map-location-dot"></i>
            {t("Harita Üzerinde Gör")}
          </button>
          <button 
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
              window.open(url, '_blank');
            }}
            className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <i className="fas fa-route"></i>
            {t("Navigasyona Gönder")}
          </button>
          <button 
            onClick={() => import('./ExcelUtils').then(m => m.downloadTechnicalReport(location, settings, language))}
            className="w-full py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-slate-600/20 cursor-pointer"
          >
            <i className="fas fa-file-excel"></i>
            {t("Ölçüm Raporu")}
          </button>
        </div>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in">
          <div className="absolute top-6 left-6 z-[10000]">
            <button 
              onClick={() => {
                setShowMap(false);
                if (onCloseMap) onCloseMap();
              }}
              className="w-12 h-12 bg-slate-200/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-90 transition-all cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Symmetrical Layer Selector on the top-right */}
          <div className="absolute top-6 right-6 z-[10000] flex flex-col items-end gap-2">
            <button 
              onClick={() => {
                setShowLayerMenu(!showLayerMenu);
              }}
              className="w-12 h-12 bg-slate-200/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-95 transition-all cursor-pointer"
              title={t("Harita Kaynağı")}
            >
              <i className="fas fa-layer-group text-lg"></i>
            </button>
            {showLayerMenu && (
              <div className="bg-slate-200/95 backdrop-blur-md border border-slate-300/30 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1 w-52 text-slate-900 select-none animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5 border-b border-slate-300/40 mb-1 leading-none">{t("Harita Kaynağı")}</p>
                {[
                  { value: 'Google Hybrid', label: t("1-Google Hibrit") },
                  { value: 'Google Satellite', label: t("2-Google Satellite") },
                  { value: 'OpenTopoMap', label: t("3-Open Topo Map") },
                  { value: 'Esri World Imagery', label: t("4-Esri World Imagery") },
                  { value: 'Bing Satellite', label: t("5-Bing Satellite") },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setCurrentMapProvider(opt.value);
                      localStorage.setItem('default_map_provider', opt.value);
                      setShowLayerMenu(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all active:scale-95 cursor-pointer ${
                      currentMapProvider === opt.value
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                        : 'hover:bg-slate-300/60 text-slate-800'
                    }`}
                  >
                    <i className={`fas ${currentMapProvider === opt.value ? 'fa-check-circle' : 'fa-circle-notch opacity-30'}`}></i>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={mapInfo.maxNativeZoom} 
            maxZoom={22}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            {currentMapProvider === 'Bing Satellite' ? (
              <BingTileLayer />
            ) : (
              <TileLayer
                key={currentMapProvider}
                url={mapInfo.url}
                attribution={mapInfo.attribution}
                maxZoom={22}
                maxNativeZoom={mapInfo.maxNativeZoom}
                tms={mapInfo.tms}
              />
            )}
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
            <MapResizer lat={location.lat} lng={location.lng} />
          </MapContainer>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-xs px-6">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("Hassasiyet")}</p>
                <p className={`text-base font-black mono-font leading-none ${
                  reliability === 'HIGH' ? 'text-emerald-600' : 
                  reliability === 'MEDIUM' || reliability === 'UNKNOWN' ? 'text-amber-600' : 
                  'text-rose-600'
                }`}>
                  ±{dynamicAccuracy.toFixed(1)}m
                </p>
              </div>
              <div className="text-right flex-1 min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t("Nokta Adı")}</p>
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
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t("Düşük Sinyal Kalitesi!")}</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed font-sans">
                    {t("Ölçüm sırasında çevresel ve donanımsal faktörler nedeniyle hatalar tespit edildi.")}
                  </p>
                  <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 mt-2">
                    <p className="text-[11px] font-bold text-rose-700 leading-tight">
                      {t("Gerçek konumunuz gösterilenden farklı olabilir. Ölçümü gökyüzü açık bir alanda tekrarlamanız önerilir.")}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200 cursor-pointer text-xs"
                >
                  {t("ANLADIM")}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-amber-100 animate-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center space-y-4 font-sans">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 mb-2">
                  <i className="fas fa-satellite-dish text-amber-500 text-2xl animate-pulse"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t("Orta Sinyal Kalitesi!")}</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {t("Ölçüm sırasında çevresel ve donanımsal faktörler nedeniyle hatalar tespit edildi.")}
                  </p>
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 mt-2">
                    <p className="text-[11px] font-bold text-amber-700 leading-tight">
                      {t("Gerçek konumunuz gösterilenden farklı olabilir. Ölçümü gökyüzü açık bir alanda tekrarlamanız önerilir.")}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWarning(false)}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200 cursor-pointer text-xs"
                >
                  {t("ANLADIM")}
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