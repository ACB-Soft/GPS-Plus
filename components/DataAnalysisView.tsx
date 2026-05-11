import React, { useState } from 'react';
import { SavedLocation, AppSettings, CalculationMethod } from '../types';
import { geoidService } from '../services/GeoidService';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { calculateResult } from '../utils/MathUtils';
import { downloadCombinedAnalysisReport } from './ExcelUtils';

interface Props {
  locations: SavedLocation[];
  initialSelectedId?: string;
  settings: AppSettings;
  onClose: () => void;
}

const DataAnalysisView: React.FC<Props> = ({ locations, initialSelectedId, settings, onClose }) => {
  const [selectedPointId, setSelectedPointId] = useState<string>(initialSelectedId || (locations.length > 0 ? locations[0].id : ''));
  const location = locations.find(l => l.id === selectedPointId);

  const [preciseX, setPreciseX] = useState<string>('');
  const [preciseY, setPreciseY] = useState<string>('');
  const [preciseZ, setPreciseZ] = useState<string>('');
  
  const [analysisResults, setAnalysisResults] = useState<any[] | null>(null);
  const [useLocal, setUseLocal] = useState(location?.coordinateSystem !== 'WGS84');

  const methods: CalculationMethod[] = [
    'ARITHMETIC_MEAN', 
    'LEAST_SQUARES', 
    'ROBUST', 
    'MAHALANOBIS', 
    'DBSCAN', 
    'RANSAC', 
    'KDE', 
    'MEDIAN_MAD'
  ];

  const getMethodLabel = (m: CalculationMethod) => {
    switch(m) {
      case 'ARITHMETIC_MEAN': return "Aritmetik";
      case 'LEAST_SQUARES': return "E.K.K.";
      case 'ROBUST': return "Robust";
      case 'MAHALANOBIS': return "Mahalanob.";
      case 'DBSCAN': return "DBSCAN";
      case 'RANSAC': return "RANSAC";
      case 'KDE': return "KDE";
      case 'MEDIAN_MAD': return "Median+MAD";
      default: return m;
    }
  };

  const calculateAllMethods = () => {
    if (!location) return;
    const px = parseFloat(preciseX);
    const py = parseFloat(preciseY);
    const pz = parseFloat(preciseZ);

    if (isNaN(px) || isNaN(py) || isNaN(pz)) {
      alert("Lütfen kesin koordinatları eksiksiz giriniz.");
      return;
    }

    const accuracyLimit = location.accuracyLimit || 5.0;
    const sys = location.coordinateSystem || 'ITRF96_3';
    const testSys = useLocal ? sys : 'ITRF96_3';

    // Ground Truth in comparison system
    let refX = px;
    let refY = py;
    let refZ = pz;

    if (!useLocal) {
      // Input is Lat/Lng/Alt -> Convert to meters for error calculation
      const converted = convertCoordinate(px, py, testSys);
      refX = converted.x;
      refY = converted.y;
    }

    const results = methods.map(method => {
      // 1. Calculate point for this method
      const { result } = calculateResult(location.samples!, method, accuracyLimit);
      
      // 2. Convert result to comparison system (meters)
      const calcMeter = convertCoordinate(result.lat, result.lng, testSys);
      const calcZ = result.altitude; // We compare ellipsoidal heights or user input

      // 3. Calculate errors
      const dx = refX - calcMeter.x;
      const dy = refY - calcMeter.y;
      const dz = refZ - calcZ;
      const dhz = Math.sqrt(dx*dx + dy*dy);
      const d3d = Math.sqrt(dx*dx + dy*dy + dz*dz);

      return {
        method,
        calculated: {
          x: useLocal ? calcMeter.x : result.lat,
          y: useLocal ? calcMeter.y : result.lng,
          z: calcZ
        },
        errors: { dx, dy, dz, dhz, d3d }
      };
    });

    setAnalysisResults(results);
  };

  const handleDownloadExcel = () => {
    if (!analysisResults || !location) return;
    
    downloadCombinedAnalysisReport(
      location,
      { 
        x: parseFloat(preciseX), 
        y: parseFloat(preciseY), 
        z: parseFloat(preciseZ), 
        isWgs84: !useLocal 
      },
      analysisResults,
      settings
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest leading-none">Hassas Analiz & AR-GE</h2>
              <p className="text-blue-400 text-[10px] font-bold mt-2 uppercase tracking-widest">Gelişmiş Raporlama Sistemi</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Detaylı Analiz İçin Nokta Seçiniz</label>
            <div className="relative">
              <select 
                value={selectedPointId}
                onChange={(e) => {
                  setSelectedPointId(e.target.value);
                  setAnalysisResults(null);
                  const loc = locations.find(l => l.id === e.target.value);
                  if (loc) setUseLocal(loc.coordinateSystem !== 'WGS84');
                }}
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 appearance-none border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="">Lütfen bir nokta seçin...</option>
                {locations.map(p => (
                  <option key={p.id} value={p.id}>[{p.folderName}] - {p.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => { setUseLocal(false); setAnalysisResults(null); }}
              className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${!useLocal ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}
            >
              WGS84 Girdi
            </button>
            <button 
              onClick={() => { setUseLocal(true); setAnalysisResults(null); }}
              className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${useLocal ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}
            >
              Lokal (X,Y,Z) Girdi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{useLocal ? 'X (E)' : 'Enlem (Lat)'}</label>
              <input 
                type="number" 
                value={preciseX} 
                onChange={e => setPreciseX(e.target.value)} 
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{useLocal ? 'Y (N)' : 'Boylam (Lng)'}</label>
              <input 
                type="number" 
                value={preciseY} 
                onChange={e => setPreciseY(e.target.value)} 
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{useLocal ? 'Z (Kot)' : 'Alt (H)'}</label>
              <input 
                type="number" 
                value={preciseZ} 
                onChange={e => setPreciseZ(e.target.value)} 
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <button 
            onClick={calculateAllMethods}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <i className="fas fa-microchip"></i>
            Hata Analizini Başlat
          </button>

          {analysisResults && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-slate-50 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-widest">
                      <th className="p-4 rounded-tl-3xl">Yöntem</th>
                      <th className="p-4">ΔYatay (m)</th>
                      <th className="p-4">ΔDüşey (m)</th>
                      <th className="p-4 rounded-tr-3xl">3D RMSE (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.map((res, idx) => (
                      <tr key={res.method} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="p-4 font-black text-[11px] text-slate-800">{getMethodLabel(res.method)}</td>
                        <td className="p-4 font-bold text-xs text-blue-600">{res.errors.dhz.toFixed(3)}</td>
                        <td className="p-4 font-bold text-xs text-amber-600">{res.errors.dz.toFixed(3)}</td>
                        <td className="p-4 font-black text-xs text-red-600">{res.errors.d3d.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-600 p-6 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-100">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">En Başarılı Algoritma</p>
                  <p className="text-xl font-black uppercase">
                    {getMethodLabel(analysisResults.sort((a,b) => a.errors.d3d - b.errors.d3d)[0].method)}
                  </p>
                </div>
                <button 
                  onClick={handleDownloadExcel}
                  className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
                >
                  <i className="fas fa-file-excel"></i>
                  Birleşik Raporu İndir
                </button>
              </div>

              <p className="text-[10px] text-slate-400 font-bold text-center italic px-4">
                * Bu testler Android/iOS sensör verileri ile kesin koordinatlar arasındaki sistematik hatayı analiz etmek içindir.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default DataAnalysisView;
