import React, { useState } from 'react';
import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate, getSystemDisplayLabel } from '../utils/CoordinateUtils';
import { getAccuracyColor } from '../utils/StyleUtils';
import { useOrthometricHeight } from '../hooks/useGeoid';
import { calculateMaxDistance } from '../utils/MathUtils';
import { useLanguage } from '../utils/LanguageContext';
import safeStorage from '../utils/safeStorage';

interface Props {
  locations: SavedLocation[];
  settings: AppSettings;
  onDelete: (id: string) => void;
  onDeleteFolder: (name: string) => void;
  onRenameFolder: (oldName: string, newName: string) => void;
  onRenamePoint: (id: string, newName: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onViewOnMap: (l: SavedLocation) => void;
  onReorderFolders?: (newOrder: string[]) => void;
}

const SavedLocationItem: React.FC<{ 
  l: SavedLocation; 
  settings: AppSettings;
  expanded: boolean; 
  togglePoint: (id: string) => void; 
  deletingPoint: string | null; 
  setDeletingPoint: (id: string | null) => void; 
  onDelete: (id: string) => void; 
  onRenamePoint: (id: string, newName: string) => void;
  onViewOnMap: (l: SavedLocation) => void;
}> = ({ l, settings, expanded, togglePoint, deletingPoint, setDeletingPoint, onDelete, onRenamePoint, onViewOnMap }) => {
  const { t, language } = useLanguage();
  const geoidInfo = useOrthometricHeight(l.altitude, l.lat, l.lng, l.deviceOS);
  const isOrthometric = settings.heightType === 'orthometric';
  const displayHeight = isOrthometric ? geoidInfo.orthometricHeight : geoidInfo.ellipsoidalHeight;
  const heightPrecision = settings.heightPrecision ?? 2;

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(l.name);

  // Pre-calculate coordinate translation values for clean layout structure
  const { x, y, labelX, labelY } = convertCoordinate(l.lat, l.lng, l.coordinateSystem || 'WGS84');
  const isUTM = l.coordinateSystem && l.coordinateSystem !== 'WGS84';
  const locPrecision = settings.locationPrecision ?? 1;
  const formattedX = isUTM ? x.toFixed(locPrecision) : x.toFixed(7);
  const formattedY = isUTM ? y.toFixed(locPrecision) : y.toFixed(7);

  const maxSpread = React.useMemo(() => {
    return l.samples && l.samples.length >= 2 ? calculateMaxDistance(l.samples) : 0;
  }, [l.samples]);

  // Average Hardware reported sensor accuracy
  const avgHardwareAccuracy = React.useMemo(() => {
    if (!l.samples || l.samples.length === 0) return l.accuracy;
    return l.samples.reduce((sum, s) => sum + s.accuracy, 0) / l.samples.length;
  }, [l.samples, l.accuracy]);

  // Re-calculate accuracy based on spread if samples are present
  const dynamicAccuracy = React.useMemo(() => {
    if (!l.samples || l.samples.length <= 1) return l.accuracy;
    return Math.max(maxSpread, avgHardwareAccuracy);
  }, [l.samples, maxSpread, avgHardwareAccuracy, l.accuracy]);

  // Reliability calculation logic
  const reliability = React.useMemo(() => {
    const samples = l.samples || [];
    const avgSensorAcc = samples.length > 0 
      ? samples.reduce((a, b) => a + b.accuracy, 0) / samples.length 
      : l.accuracy;

    const samplesCount = samples.length;

    // 1. GÜVENSİZ VERİ (KIRMIZI): Donanımsal Hassasiyet > 20m VEYA Veri Saçılımı > 20m VEYA Veri Saçılımı > Donanımsal Hassasiyet * 3
    if (avgSensorAcc > 20 || maxSpread > 20 || maxSpread > avgSensorAcc * 3) {
      return 'LOW';
    }

    // 2. GÜVENİLİR VERİ (YEŞİL): Donanımsal Hassasiyet <= 10m VE Veri Saçılımı <= 5m VE Veri Sayısı >= 15 VE Veri Saçılımı <= Donanımsal Hassasiyet
    if (avgSensorAcc <= 10 && maxSpread <= 5 && samplesCount >= 15 && maxSpread <= avgSensorAcc) {
      return 'HIGH';
    }
    
    // 3. ORTA GÜVENLİ VERİ / VERİ AZ (TURUNCU)
    return 'MEDIUM';
  }, [l.samples, l.accuracy, maxSpread]);

  const handleSave = () => {
    if (newName.trim() && newName !== l.name) {
      onRenamePoint(l.id, newName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewName(l.name);
    setIsEditing(false);
  };

  const renderCoordinates = (l: SavedLocation) => {
    const { x, y, labelX, labelY } = convertCoordinate(l.lat, l.lng, l.coordinateSystem || 'WGS84');
    const isUTM = l.coordinateSystem && l.coordinateSystem !== 'WGS84';
    const locPrecision = settings.locationPrecision ?? 1;
    const formattedX = isUTM ? x.toFixed(locPrecision) : x.toFixed(7);
    const formattedY = isUTM ? y.toFixed(locPrecision) : y.toFixed(7);

    return (
      <>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t(labelX)}</span>
          <p className="text-[13px] mono-font text-slate-800 font-bold leading-tight">{formattedX}</p>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t(labelY)}</span>
          <p className="text-[13px] mono-font text-slate-800 font-bold leading-tight">{formattedY}</p>
        </div>
      </>
    );
  };

  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-100 rounded-[1.8rem] border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-4 flex items-center justify-between transition-colors">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2 animate-in">
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <button 
              onClick={handleSave}
              className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-90 transition-all shrink-0"
            >
              <i className="fas fa-check text-xs"></i>
            </button>
            <button 
              onClick={handleCancel}
              className="w-8 h-8 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center active:scale-90 transition-all shrink-0"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        ) : (
          <div onClick={() => togglePoint(l.id)} className="min-w-0 flex-1 cursor-pointer select-none">
            <h5 className="text-[15px] font-black text-slate-900 truncate">{l.name}</h5>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
              {expanded ? t('Detayları Gizle') : t('Koordinatları Gör')}
            </p>
          </div>
        )}
        <div className="pl-4 border-l border-slate-100 ml-4 flex items-center gap-1">
          {!isEditing && deletingPoint !== l.id && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-100 rounded-xl transition-colors active:scale-90"
              title={t("Noktayı Düzenle")}
              type="button"
            >
              <i className="fas fa-pen text-xs"></i>
            </button>
          )}
          {deletingPoint === l.id ? (
            <div className="flex items-center gap-2 animate-in">
              <button 
                onClick={() => { onDelete(l.id); setDeletingPoint(null); }}
                className="px-3 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-red-600/20"
              >
                {t("SİL")}
              </button>
              <button 
                onClick={() => setDeletingPoint(null)}
                className="px-3 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl uppercase tracking-widest"
              >
                {t("İPTAL")}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setDeletingPoint(l.id)} 
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-xl transition-colors active:scale-90"
              title={t("Noktayı Sil")}
              type="button"
            >
              <i className="fas fa-trash-can text-sm"></i>
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-2.5 animate-in fade-in duration-300">
          {/* Top Row: Sağa, Yukarı, Yükseklik */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 mb-1.5">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t(labelX)}</span>
              <p className="text-[13px] mono-font text-slate-800 font-bold leading-tight">{formattedX}</p>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t(labelY)}</span>
              <p className="text-[13px] mono-font text-slate-800 font-bold leading-tight">{formattedY}</p>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 tracking-widest leading-none mb-0.5">{isOrthometric ? t('YÜKSEKLİK') : t('h-ELİPSOİD (Z)')}</span>
              <p className="text-[13px] mono-font text-slate-800 font-black leading-tight">{displayHeight !== null ? `${displayHeight.toFixed(heightPrecision)}m` : '---'}</p>
            </div>
          </div>
          {/* Bottom Row: Hassasiyet, Saçılım, GPS Sinyali */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t("Hassasiyet")}</span>
              <p className={`text-[13px] mono-font font-black leading-tight ${getAccuracyColor(avgHardwareAccuracy)}`}>±{avgHardwareAccuracy.toFixed(1)}m</p>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t("Saçılım")}</span>
              <p className={`text-[13px] mono-font font-black leading-tight ${
                reliability === 'HIGH' ? 'text-emerald-600' :
                reliability === 'MEDIUM' ? 'text-amber-600' : 
                'text-rose-600'
              }`}>±{maxSpread.toFixed(2)}m</p>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{t("GPS Sinyali")}</span>
              <p className={`text-[11px] font-black uppercase tracking-widest leading-tight mt-0.5 ${
                reliability === 'HIGH' ? 'text-emerald-600' :
                reliability === 'MEDIUM' ? 'text-amber-600' : 
                'text-rose-600'
              }`}>
                {reliability === 'HIGH' ? t('GÜVENLİ') : 
                 reliability === 'MEDIUM' ? t('Orta') : t('GÜVENSİZ')}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-50 flex flex-col gap-1">
            <button 
              onClick={() => onViewOnMap(l)}
              className="w-full py-2 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
            >
              <i className="fas fa-map-location-dot"></i>
              {t("Harita Üzerinde Gör")}
            </button>
            <button 
              onClick={() => handleNavigate(l.lat, l.lng)}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
            >
              <i className="fas fa-route"></i>
              {t("Navigasyona Gönder")}
            </button>
            <button 
              onClick={() => import('./ExcelUtils').then(m => m.downloadTechnicalReport(l, settings, language))}
              className="w-full py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-slate-600/20 cursor-pointer"
            >
              <i className="fas fa-file-excel"></i>
              {t("Ölçüm Raporu")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SavedLocationsList: React.FC<Props> = ({ 
  locations, 
  settings, 
  onDelete, 
  onDeleteFolder, 
  onRenameFolder, 
  onRenamePoint, 
  onBulkDelete, 
  onViewOnMap,
  onReorderFolders 
}) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [expandedPoints, setExpandedPoints] = useState<string[]>([]);
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
  const [deletingPoint, setDeletingPoint] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  
  const folders: Record<string, SavedLocation[]> = {};
  locations.forEach(l => { 
    const fName = l.folderName || '';
    if (!folders[fName]) folders[fName] = []; 
    folders[fName].push(l); 
  });

  // Extract unique folders preserving current order in locations
  const allFoldersInLocations = React.useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    locations.forEach(l => {
      const fName = l.folderName || '';
      if (!seen.has(fName)) {
        seen.add(fName);
        list.push(fName);
      }
    });
    return list;
  }, [locations]);

  // Read saved custom folder order
  const [folderOrder, setFolderOrder] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem('gps_folder_order_v1.0');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Reconcile saved order with current existing folders
  const orderedFolderNames = React.useMemo(() => {
    const currentSet = new Set(allFoldersInLocations);
    const validSaved = folderOrder.filter(f => currentSet.has(f));
    const missing = allFoldersInLocations.filter(f => !validSaved.includes(f));
    return [...validSaved, ...missing];
  }, [allFoldersInLocations, folderOrder]);

  const handleDragStart = (e: React.DragEvent, name: string) => {
    e.dataTransfer.setData('text/plain', name);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedFolder(name);
  };

  const handleDragOver = (e: React.DragEvent, targetName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolder !== targetName) {
      setDragOverFolder(targetName);
    }
  };

  const handleDragLeave = (name: string) => {
    if (dragOverFolder === name) {
      setDragOverFolder(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetName: string) => {
    e.preventDefault();
    const sourceName = draggedFolder || e.dataTransfer.getData('text/plain');
    if (!sourceName || sourceName === targetName) {
      setDraggedFolder(null);
      setDragOverFolder(null);
      return;
    }

    const fromIdx = orderedFolderNames.indexOf(sourceName);
    const toIdx = orderedFolderNames.indexOf(targetName);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedFolder(null);
      setDragOverFolder(null);
      return;
    }

    const newOrder = [...orderedFolderNames];
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);

    setFolderOrder(newOrder);
    try {
      safeStorage.setItem('gps_folder_order_v1.0', JSON.stringify(newOrder));
    } catch {}
    if (onReorderFolders) {
      onReorderFolders(newOrder);
    }
    setDraggedFolder(null);
    setDragOverFolder(null);
  };

  const handleDragEnd = () => {
    setDraggedFolder(null);
    setDragOverFolder(null);
  };

  const toggleFolder = (name: string) => {
    setExpanded(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  };

  const togglePoint = (id: string) => {
    setExpandedPoints(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleStartEdit = (name: string) => {
    setEditingFolder(name);
    setNewFolderName(name);
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmed = newFolderName.trim();
    if (trimmed && trimmed !== oldName) {
      onRenameFolder(oldName, trimmed);
      const newOrder = orderedFolderNames.map(f => f === oldName ? trimmed : f);
      setFolderOrder(newOrder);
      try {
        safeStorage.setItem('gps_folder_order_v1.0', JSON.stringify(newOrder));
      } catch {}
    }
    setEditingFolder(null);
  };

  const handleDeleteFolderConfirm = (name: string) => {
    onDeleteFolder(name);
    setDeletingFolder(null);
    const newOrder = orderedFolderNames.filter(f => f !== name);
    setFolderOrder(newOrder);
    try {
      safeStorage.setItem('gps_folder_order_v1.0', JSON.stringify(newOrder));
    } catch {}
  };

  const getFolderCoordinateSystem = (locs: SavedLocation[]) => {
    if (locs.length === 0) return '';
    const sys = locs[0].coordinateSystem;
    const allSame = locs.every(l => l.coordinateSystem === sys);
    return allSame ? t(getSystemDisplayLabel(sys)) : t('Karışık');
  };

  const getFolderZone = (locs: SavedLocation[]) => {
    if (locs.length === 0) return '';
    const { zone } = convertCoordinate(locs[0].lat, locs[0].lng, locs[0].coordinateSystem || 'WGS84');
    return zone ? `(${zone})` : '';
  };

  return (
    <div className="space-y-3 pb-10">
      {orderedFolderNames.length > 0 ? (
        orderedFolderNames.map((name, index) => {
          const locs = folders[name] || [];
          const isDragging = draggedFolder === name;
          const isOver = dragOverFolder === name && !isDragging;

          return (
            <div 
              key={name} 
              draggable={editingFolder !== name && deletingFolder !== name}
              onDragStart={(e) => handleDragStart(e, name)}
              onDragOver={(e) => handleDragOver(e, name)}
              onDragLeave={() => handleDragLeave(name)}
              onDrop={(e) => handleDrop(e, name)}
              onDragEnd={handleDragEnd}
              className={`bg-slate-100 rounded-3xl shadow-sm border transition-all overflow-hidden ${
                isDragging 
                  ? 'opacity-40 scale-[0.98] border-dashed border-blue-400' 
                  : isOver 
                    ? 'ring-2 ring-blue-500 bg-blue-50/70 border-blue-400 shadow-md' 
                    : 'border-slate-100'
              }`}
            >
              <div className="py-2 md:py-3 px-4 flex items-center justify-between transition-colors">
                {editingFolder === name ? (
                  <div className="flex items-center gap-2 flex-1 animate-in w-full">
                    <input 
                      type="text" 
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-full min-w-0 p-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:border-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(name);
                        if (e.key === 'Escape') setEditingFolder(null);
                      }}
                    />
                    <button 
                      onClick={() => handleSaveEdit(name)}
                      className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-90 transition-all shrink-0 cursor-pointer"
                    >
                      <i className="fas fa-check text-xs"></i>
                    </button>
                    <button 
                      onClick={() => setEditingFolder(null)}
                      className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center active:scale-90 transition-all shrink-0 cursor-pointer"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <div onClick={() => toggleFolder(name)} className="flex items-center gap-2 flex-1 cursor-pointer select-none min-w-0 py-0.5">
                      {orderedFolderNames.length > 1 && (
                        <div 
                          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 flex items-center pr-1" 
                          title={t("Sürükleyip Bırakın")}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-grip-vertical text-xs"></i>
                        </div>
                      )}
                      <div className="min-w-0 flex flex-col flex-1">
                        <h4 className="font-black text-sm text-slate-800 tracking-tight truncate mb-0.5">{name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">
                          {getFolderCoordinateSystem(locs)} {getFolderZone(locs)}
                        </p>
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{locs.length} {t("Nokta")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 ml-2 shrink-0">
                      {deletingFolder === name ? (
                        <div className="flex items-center gap-2 animate-in">
                          <button 
                            onClick={() => handleDeleteFolderConfirm(name)}
                            className="px-3 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-red-600/20 cursor-pointer"
                          >
                            {t("SİL")}
                          </button>
                          <button 
                            onClick={() => setDeletingFolder(null)}
                            className="px-3 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl uppercase tracking-widest cursor-pointer"
                          >
                            {t("İPTAL")}
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Düzenle Butonu */}
                          <button 
                            onClick={() => handleStartEdit(name)}
                            className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl transition-all active:scale-90 shadow-sm hover:bg-blue-200 cursor-pointer"
                            title={t("Projeyi Düzenle")}
                            type="button"
                          >
                            <i className="fas fa-pen text-sm"></i>
                          </button>

                          {/* Sil Butonu */}
                          <button 
                            onClick={() => setDeletingFolder(name)}
                            className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-2xl transition-all active:scale-90 shadow-sm hover:bg-red-200 cursor-pointer"
                            title={t("Projeyi Sil")}
                            type="button"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              {expanded.includes(name) && (
                <div className="p-3 bg-slate-200/50 space-y-2 border-t border-slate-50">
                  {locs.map(l => (
                    <SavedLocationItem 
                      key={l.id} 
                      l={l} 
                      settings={settings}
                      expanded={expandedPoints.includes(l.id)} 
                      togglePoint={togglePoint} 
                      deletingPoint={deletingPoint} 
                      setDeletingPoint={setDeletingPoint} 
                      onDelete={onDelete} 
                      onRenamePoint={onRenamePoint}
                      onViewOnMap={onViewOnMap}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="p-12 text-center bg-slate-200/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 rounded-3xl flex items-center justify-center text-slate-300 shadow-sm">
            <i className="fas fa-folder-open text-2xl"></i>
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs">{t("Henüz Proje Yok")}</h4>
            <p className="text-[11px] text-slate-400 font-bold">{t("Yeni bir ölçüm yaparak başlayabilirsiniz.")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedLocationsList;