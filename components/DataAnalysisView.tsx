import React, { useState, useMemo } from 'react';
import { SavedLocation, AppSettings, CalculationMethod } from '../types';
import { geoidService } from '../services/GeoidService';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { calculateResult, calculateAverage } from '../utils/MathUtils';
import { downloadCombinedAnalysisReport } from './ExcelUtils';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

interface Props {
  locations: SavedLocation[];
  initialSelectedId?: string;
  settings: AppSettings;
  onClose: () => void;
}

const DataAnalysisView: React.FC<Props> = ({ locations, initialSelectedId, settings, onClose }) => {
  const [selectedPointId, setSelectedPointId] = useState<string>(initialSelectedId || (locations.length > 0 ? locations[0].id : ''));
  const location = locations.find(l => l.id === selectedPointId);

  const [preciseN, setPreciseN] = useState<string>(''); // Northing (X)
  const [preciseE, setPreciseE] = useState<string>(''); // Easting (Y)
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
    const pn = parseFloat(preciseN);
    const pe = parseFloat(preciseE);
    const pz = parseFloat(preciseZ);

    if (isNaN(pn) || isNaN(pe) || isNaN(pz)) {
      alert("Lütfen kesin koordinatları eksiksiz giriniz.");
      return;
    }

    const accuracyLimit = location.accuracyLimit || 5.0;
    const sys = location.coordinateSystem || 'ITRF96_3';
    const testSys = useLocal ? sys : 'ITRF96_3';

    // Ground Truth in comparison system
    let refX = pn; // North
    let refY = pe; // East
    let refZ = pz;

    if (!useLocal) {
      // Input is Lat(pn)/Lng(pe)/Alt -> Convert to meters for error calculation
      const converted = convertCoordinate(pn, pe, testSys);
      refX = converted.x;
      refY = converted.y;
    }

    const results = methods.map(method => {
      // 1. Calculate point for this method
      const { result } = calculateResult(location.samples!, method, accuracyLimit);
      
      // 2. Convert result to comparison system (meters)
      const calcMeter = convertCoordinate(result.lat, result.lng, testSys);
      const calcZ = result.altitude; 

      // 3. Calculate errors
      const dx = refX - calcMeter.x;
      const dy = refY - calcMeter.y;
      const dz = refZ - (calcZ || 0);
      const dhz = Math.sqrt(dx*dx + dy*dy);

      return {
        method,
        calculated: {
          x: useLocal ? calcMeter.x : result.lat,
          y: useLocal ? calcMeter.y : result.lng,
          z: calcZ
        },
        errors: { dx, dy, dz, dhz }
      };
    });

    setAnalysisResults(results);
  };

  const chartData = useMemo(() => {
    if (!location || !location.samples) return [];
    
    const sys = location.coordinateSystem || 'ITRF96_3';
    
    return location.samples.map((s, idx) => {
      const conv = convertCoordinate(s.lat, s.lng, sys);
      return {
        id: idx + 1,
        x: conv.x,
        y: conv.y,
        alt: s.altitude || 0,
        acc: s.accuracy,
        time: new Date(s.timestamp).toLocaleTimeString()
      };
    });
  }, [location]);

  // Data for the distribution plot (Local offsets from mean)
  const distributionData = useMemo(() => {
    if (chartData.length === 0) return { data: [], maxOffset: 0.1 };
    const meanX = chartData.reduce((a, b) => a + b.x, 0) / chartData.length;
    const meanY = chartData.reduce((a, b) => a + b.y, 0) / chartData.length;
    
    let maxAbs = 0.05; // En az 5cm ölçek
    const data = chartData.map(d => {
      const offsetX = d.y - meanY; // West-East (Easting)
      const offsetY = d.x - meanX; // South-North (Northing)
      maxAbs = Math.max(maxAbs, Math.abs(offsetX), Math.abs(offsetY));
      return { ...d, offsetX, offsetY };
    });

    // Ölçeği biraz daha genişlet (marjin bırak)
    const maxOffset = Math.ceil(maxAbs * 10) / 10 + 0.1;

    return { data, maxOffset };
  }, [chartData]);

  const handleDownloadExcel = () => {
    if (!analysisResults || !location) return;
    
    downloadCombinedAnalysisReport(
      location,
      { 
        x: parseFloat(preciseN), 
        y: parseFloat(preciseE), 
        z: parseFloat(preciseZ), 
        isWgs84: !useLocal 
      },
      analysisResults,
      settings
    );
  };

  const handleDownloadNormal = () => {
    if (!location) return;
    import('./ExcelUtils').then(m => m.downloadTechnicalReport(location, settings));
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{useLocal ? 'Sağa (Y)' : 'Enlem (Lat)'}</label>
              <input 
                type="number" 
                value={preciseE} 
                onChange={e => setPreciseE(e.target.value)} 
                placeholder={useLocal ? "500000.000" : "39.9"}
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{useLocal ? 'Yukarı (X)' : 'Boylam (Lng)'}</label>
              <input 
                type="number" 
                value={preciseN} 
                onChange={e => setPreciseN(e.target.value)} 
                placeholder={useLocal ? "4400000.000" : "32.8"}
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{useLocal ? 'Z (Kot)' : 'Alt (H)'}</label>
              <input 
                type="number" 
                value={preciseZ} 
                onChange={e => setPreciseZ(e.target.value)} 
                placeholder="100.000"
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
                      <th className="p-4 rounded-tr-3xl">DURUM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.map((res, idx) => {
                      const isBest = res.method === analysisResults.sort((a,b) => a.errors.dhz - b.errors.dhz)[0].method;
                      return (
                        <tr key={res.method} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="p-4 font-black text-[11px] text-slate-800">{getMethodLabel(res.method)}</td>
                          <td className="p-4 font-bold text-xs text-blue-600">{res.errors.dhz.toFixed(3)}</td>
                          <td className="p-4 font-bold text-xs text-amber-600">{Math.abs(res.errors.dz).toFixed(3)}</td>
                          <td className="p-4">
                            {isBest && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter">EN İYİ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Graphical Analysis Section */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                    <i className="fas fa-bullseye mr-2 text-blue-500"></i>
                    Yatay Konum Hassasiyet Dağılımı (X-Y Saçılımı)
                  </h3>
                  <div className="h-80 w-full flex justify-center">
                    <div style={{ width: '100%', maxWidth: '320px', aspectRatio: '1/1' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                          <XAxis 
                            type="number" 
                            dataKey="offsetX" 
                            name="ΔE (Sağa)" 
                            unit="m" 
                            domain={[-distributionData.maxOffset, distributionData.maxOffset]} 
                            tick={{fontSize: 9}} 
                            axisLine={false}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="offsetY" 
                            name="ΔN (Yukarı)" 
                            unit="m" 
                            domain={[-distributionData.maxOffset, distributionData.maxOffset]} 
                            tick={{fontSize: 9}} 
                            axisLine={false}
                          />
                          <ZAxis type="number" range={[100, 100]} />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }} 
                            contentStyle={{ borderRadius: '1rem', border: 'none', fontWeight: 'bold' }}
                          />
                          <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={2} />
                          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
                          <Scatter name="Measurement" data={distributionData.data} fill="#3b82f6">
                            {distributionData.data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index > distributionData.data.length - 20 ? '#ef4444' : '#3b82f6'} fillOpacity={0.5} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">İlk Ölçümler</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-red-500"></span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Son Ölçümler</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                    <i className="fas fa-arrows-up-down mr-2 text-indigo-500"></i>
                    Düşey (Kot) Değişim Analizi
                  </h3>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ left: -20 }}>
                        <XAxis type="number" dataKey="id" hide />
                        <YAxis type="number" dataKey="alt" domain={['auto', 'auto']} tick={{fontSize: 8}} axisLine={false} />
                        <Tooltip />
                        <Scatter data={chartData} fill="#6366f1" shape="circle" fillOpacity={0.6} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 p-6 rounded-[2rem] text-white flex flex-col items-center gap-6 shadow-xl shadow-blue-100">
                <div className="text-center w-full">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Yatayda En Başarılı Algoritma</p>
                  <p className="text-xl font-black uppercase">
                    {getMethodLabel(analysisResults.sort((a,b) => a.errors.dhz - b.errors.dhz)[0].method)}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={handleDownloadExcel}
                    className="bg-white text-blue-600 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-flask"></i>
                    Kesin Koordinatlı Analiz Raporu
                  </button>
                  <button 
                    onClick={handleDownloadNormal}
                    className="bg-blue-500 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 border border-blue-400/30"
                  >
                    <i className="fas fa-file-excel"></i>
                    Normal Ölçüm Raporu
                  </button>
                </div>
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
