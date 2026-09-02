import React from 'react';
import { StakeoutPoint, StakeoutGeometry, AppSettings } from '../types';
import { useLanguage } from '../utils/LanguageContext';

export type SelectedMapFeature = 
  | {
      type: 'POINT';
      point: StakeoutPoint;
      isVertex?: boolean;
      vertexIndex?: number;
      parentGeometryName?: string;
    }
  | {
      type: 'LINE';
      geometry: StakeoutGeometry;
      length: number;
    }
  | {
      type: 'POLYGON';
      geometry: StakeoutGeometry;
      area: number;
      perimeter?: number;
    };

interface Props {
  feature: SelectedMapFeature;
  settings?: AppSettings;
  onClose: () => void;
  onStakeout?: (point: StakeoutPoint) => void;
}

export const formatDistance = (meters: number): string => {
  const formattedMeters = meters.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' m';
  if (meters >= 1000) {
    const km = (meters / 1000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' km';
    return `${km} (${formattedMeters})`;
  }
  return formattedMeters;
};

export const formatArea = (sqMeters: number): string => {
  const formattedM2 = sqMeters.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²';
  if (sqMeters >= 10000) {
    const ha = (sqMeters / 10000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ha';
    return `${ha} (${formattedM2})`;
  }
  return formattedM2;
};

export const CompactBottomInfoCard: React.FC<Props> = ({
  feature,
  onClose,
  onStakeout
}) => {
  const { t } = useLanguage();

  if (feature.type === 'POINT') {
    const { point, isVertex, vertexIndex } = feature;
    const layerName = point.projectName || t("Manuel Noktalar");

    return (
      <div 
        id="compact-info-card-point"
        className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-xl px-3.5 py-2.5 flex flex-col gap-1.5 text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
      >
        {/* 1. Satır: Proje Bilgisi & Obje Tipi & Kapat Butonu */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100/80 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80 truncate max-w-[180px] flex items-center gap-1">
              <i className="fas fa-layer-group text-[8.5px]"></i>
              <span className="truncate">{layerName}</span>
            </span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              {isVertex ? t("Köşe Noktası") : t("Nokta")}
            </span>
          </div>

          <button
            id="btn-close-info-card"
            onClick={onClose}
            className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title={t("Kapat")}
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>

        {/* 2. Satır: Objenin Adı */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-white" 
              style={{ backgroundColor: point.color || '#3b82f6' }}
            />
            <span className="text-xs font-black text-slate-900 truncate">
              {point.name}
            </span>
          </div>
          {isVertex && vertexIndex !== undefined && (
            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
              #{vertexIndex + 1}
            </span>
          )}
        </div>

        {/* 3. Satır: Enlem / Boylam Bilgisi ve Git Butonu */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
          <div className="font-mono text-[11px] font-medium text-slate-700 flex items-center gap-2.5 truncate">
            <span>{t("Enlem")}: <strong className="text-slate-950 font-black">{point.lat.toFixed(6)}</strong></span>
            <span>{t("Boylam")}: <strong className="text-slate-950 font-black">{point.lng.toFixed(6)}</strong></span>
          </div>

          {onStakeout && (
            <button
              id="btn-stakeout-from-card"
              onClick={() => onStakeout(point)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <i className="fas fa-location-arrow text-[8.5px]"></i>
              <span>{t("Git")}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (feature.type === 'LINE') {
    const { geometry, length } = feature;
    const layerName = geometry.projectName || t("Manuel Noktalar");

    return (
      <div 
        id="compact-info-card-line"
        className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-xl px-3.5 py-2.5 flex flex-col gap-1.5 text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
      >
        {/* 1. Satır: Proje Bilgisi & Obje Tipi & Kapat Butonu */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100/80 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80 truncate max-w-[180px] flex items-center gap-1">
              <i className="fas fa-layer-group text-[8.5px]"></i>
              <span className="truncate">{layerName}</span>
            </span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              {t("Çizgi")}
            </span>
          </div>

          <button
            id="btn-close-info-card"
            onClick={onClose}
            className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title={t("Kapat")}
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>

        {/* 2. Satır: Objenin Adı */}
        <div className="flex items-center gap-2 min-w-0">
          <span 
            className="w-3.5 h-1.5 rounded-full shrink-0 shadow-xs" 
            style={{ backgroundColor: geometry.color || '#f59e0b' }}
          />
          <span className="text-xs font-black text-slate-900 truncate">
            {geometry.name || t("Çizgi Objesi")}
          </span>
        </div>

        {/* 3. Satır: Uzunluk ve Kırık Nokta Bilgisi */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <span className="font-bold text-slate-500">{t("Uzunluk")}:</span>
            <span className="font-mono text-xs font-black text-slate-950 truncate">{formatDistance(length)}</span>
          </div>

          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            {geometry.coordinates.length} {t("Nokta")}
          </span>
        </div>
      </div>
    );
  }

  if (feature.type === 'POLYGON') {
    const { geometry, area } = feature;
    const layerName = geometry.projectName || t("Manuel Noktalar");

    return (
      <div 
        id="compact-info-card-polygon"
        className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-xl px-3.5 py-2.5 flex flex-col gap-1.5 text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
      >
        {/* 1. Satır: Proje Bilgisi & Obje Tipi & Kapat Butonu */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100/80 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80 truncate max-w-[180px] flex items-center gap-1">
              <i className="fas fa-layer-group text-[8.5px]"></i>
              <span className="truncate">{layerName}</span>
            </span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              {t("Poligon")}
            </span>
          </div>

          <button
            id="btn-close-info-card"
            onClick={onClose}
            className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title={t("Kapat")}
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>

        {/* 2. Satır: Objenin Adı */}
        <div className="flex items-center gap-2 min-w-0">
          <span 
            className="w-2.5 h-2.5 rounded-xs shrink-0 shadow-xs" 
            style={{ backgroundColor: geometry.color || '#10b981' }}
          />
          <span className="text-xs font-black text-slate-900 truncate">
            {geometry.name || t("Poligon Objesi")}
          </span>
        </div>

        {/* 3. Satır: Yüzölçümü ve Köşe Sayısı Bilgisi */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <span className="font-bold text-slate-500">{t("Yüzölçümü")}:</span>
            <span className="font-mono text-xs font-black text-emerald-800 truncate">{formatArea(area)}</span>
          </div>

          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            {geometry.coordinates.length} {t("Köşe")}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default CompactBottomInfoCard;
