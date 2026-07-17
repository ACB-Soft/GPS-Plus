import React, { useState } from 'react';
import { SavedLocation, AppSettings } from '../types';
import { downloadKML } from './KMLUtils';
import { downloadExcel } from './ExcelUtils';
import { downloadTXT } from './TxtUtils';
import { downloadSHP } from './ShpUtils';
import { useLanguage } from '../utils/LanguageContext';

interface Props {
  locations: SavedLocation[];
  settings: AppSettings;
  onOpenACBLabs: () => void;
}

const ExportUnifiedView: React.FC<Props> = ({ locations, settings, onOpenACBLabs }) => {
  const { t, language } = useLanguage();
  const uniqueFolders: string[] = Array.from(new Set(locations.map(l => l.folderName)));
  const [selectedFolder, setSelectedFolder] = useState<string>(uniqueFolders.length > 0 ? uniqueFolders[0] : '');
  
  const filteredPoints = locations.filter(l => l.folderName === selectedFolder);
  const [selectedPointId, setSelectedPointId] = useState<string>(filteredPoints.length > 0 ? filteredPoints[0].id : '');
  
  // Reset selected point when folder changes
  React.useEffect(() => {
    const points = locations.filter(l => l.folderName === selectedFolder);
    if (points.length > 0) {
      setSelectedPointId(points[0].id);
    } else {
      setSelectedPointId('');
    }
  }, [selectedFolder, locations]);

  const getFiltered = () => filteredPoints;
  const getSelectedPoint = () => locations.find(l => l.id === selectedPointId);

  const hasSelection = !!selectedFolder;
  const hasPointSelection = !!selectedPointId;

  return (
    <div className="space-y-8 pb-10 max-w-sm mx-auto w-full">

      <div className="space-y-3">
        {uniqueFolders.length > 0 ? (
          <div className="relative">
             <select 
               value={selectedFolder}
               onChange={(e) => setSelectedFolder(e.target.value)}
               className="w-full p-4 rounded-3xl border border-slate-200 bg-slate-100 font-bold text-slate-800 appearance-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm text-sm"
             >
               {uniqueFolders.map(name => (
                 <option key={name} value={name}>{name} ({locations.filter(l => l.folderName === name).length} {t("Nokta")})</option>
               ))}
             </select>
             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <i className="fas fa-chevron-down"></i>
             </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-100 rounded-3xl border border-dashed border-slate-200">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("Kayıtlı Proje Bulunamadı")}</p>
          </div>
        )}
      </div>

      <div className="space-y-2.5 border-t border-slate-100 pt-5">
        <button 
          onClick={() => downloadKML(getFiltered())} 
          disabled={!hasSelection} 
          className={`w-full py-2.5 md:py-3.5 px-6 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base uppercase flex items-center gap-5 transition-all duration-300 shadow-xl ${
            hasSelection ? 'bg-indigo-600 shadow-indigo-200 active:scale-[0.98]' : 'bg-slate-300 opacity-40 grayscale cursor-not-allowed shadow-none'
          }`}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shrink-0">
            <i className="fas fa-earth-europe text-xl"></i>
          </div>
          <span className="tracking-tight">Google Earth (.KML)</span>
        </button>

        <button 
          onClick={() => downloadExcel(getFiltered(), settings)} 
          disabled={!hasSelection} 
          className={`w-full py-2.5 md:py-3.5 px-6 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base uppercase flex items-center gap-5 transition-all duration-300 shadow-xl ${
            hasSelection ? 'bg-emerald-600 shadow-emerald-200 active:scale-[0.98]' : 'bg-slate-300 opacity-40 grayscale cursor-not-allowed shadow-none'
          }`}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shrink-0">
            <i className="fas fa-file-excel text-xl"></i>
          </div>
          <span className="tracking-tight">{t("Excel Dökümanı (.XLSX)")}</span>
        </button>

        <button 
          onClick={() => downloadTXT(getFiltered(), settings)} 
          disabled={!hasSelection} 
          className={`w-full py-2.5 md:py-3.5 px-6 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base uppercase flex items-center gap-5 transition-all duration-300 shadow-xl ${
            hasSelection ? 'bg-sky-600 shadow-sky-200 active:scale-[0.98]' : 'bg-slate-300 opacity-40 grayscale cursor-not-allowed shadow-none'
          }`}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shrink-0">
            <i className="fas fa-file-lines text-xl"></i>
          </div>
          <span className="tracking-tight">{t("Metin Belgesi (.TXT)")}</span>
        </button>

        <button 
          onClick={() => downloadSHP(getFiltered(), settings, language)} 
          disabled={!hasSelection} 
          className={`w-full py-2.5 md:py-3.5 px-6 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base uppercase flex items-center gap-5 transition-all duration-300 shadow-xl ${
            hasSelection ? 'bg-slate-700 shadow-slate-300 active:scale-[0.98]' : 'bg-slate-300 opacity-40 grayscale cursor-not-allowed shadow-none'
          }`}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shrink-0">
            <i className="fas fa-layer-group text-xl"></i>
          </div>
          <span className="tracking-tight">SHAPE FILE (.SHP)</span>
        </button>

        <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col gap-4">
          <div className="pt-4 mt-2 flex justify-center">
            <button 
              onClick={onOpenACBLabs} 
              className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors py-2 px-4 border border-slate-100 rounded-full cursor-pointer"
            >
              <i className="fas fa-flask mr-2 opacity-50"></i>
              {t("ACB - LABS")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportUnifiedView;