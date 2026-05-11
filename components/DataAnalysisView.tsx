import React, { useState, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { SavedLocation, AppSettings, CalculationMethod } from '../types';
import { geoidService } from '../services/GeoidService';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { calculateResult, calculateAverage } from '../utils/MathUtils';
import { downloadCombinedAnalysisReport } from './ExcelUtils';
import { 
  ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';

// Map rendering fix for modals
const MapResizer = () => {
  const map = useMap();
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);
  return null;
};

const METHOD_COLORS: Record<string, string> = {
  ARITHMETIC_MEAN: '#ef4444',
  LEAST_SQUARES: '#3b82f6',
  ROBUST: '#10b981',
  BAARDA: '#f59e0b',
  L1_HUBER: '#8b5cf6',
  DBSCAN: '#6366f1',
  RANSAC: '#ec4899',
  KDE: '#06b6d4'
};

const CustomScatterLabel = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || !payload.id) return null;
  
  return (
    <g transform={`translate(${cx},${cy})`}>
      <text
        x={0}
        y={4}
        textAnchor="middle"
        fill="white"
        style={{ fontSize: '10px', fontWeight: '900', pointerEvents: 'none' }}
      >
        {payload.id}
      </text>
    </g>
  );
};

interface Props {
  locations: SavedLocation[];
  initialSelectedId?: string;
  settings: AppSettings;
  onClose: () => void;
}

const DataAnalysisView: React.FC<Props> = ({ locations, initialSelectedId, settings, onClose }) => {
  const [analysisType, setAnalysisType] = useState<'precise' | 'normal'>('precise');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedPointId, setSelectedPointId] = useState<string>(initialSelectedId || '');
  const [showMap, setShowMap] = useState(false);

  const folders = useMemo(() => {
    const f = Array.from(new Set(locations.map(l => l.folderName || 'Genel')));
    return f.sort();
  }, [locations]);

  const filteredPoints = useMemo(() => {
    if (!selectedFolder) return [];
    return locations.filter(l => (l.folderName || 'Genel') === selectedFolder);
  }, [locations, selectedFolder]);

  const location = locations.find(l => l.id === selectedPointId);
  const rawChartRef = React.useRef<HTMLDivElement>(null);
  const comparisonChartRef = React.useRef<HTMLDivElement>(null);

  const [preciseN, setPreciseN] = useState<string>(''); // Northing (X)
  const [preciseE, setPreciseE] = useState<string>(''); // Easting (Y)
  const [preciseZ, setPreciseZ] = useState<string>('');
  
  const [analysisResults, setAnalysisResults] = useState<any[] | null>(null);
  const useLocal = useMemo(() => {
    if (!location) return true;
    return location.coordinateSystem !== 'WGS84';
  }, [location]);

  const methods: CalculationMethod[] = [
    'ARITHMETIC_MEAN', 
    'LEAST_SQUARES', 
    'ROBUST', 
    'BAARDA', 
    'L1_HUBER',
    'DBSCAN', 
    'RANSAC', 
    'KDE'
  ];

  const getMethodLabel = (m: CalculationMethod) => {
    switch(m) {
      case 'ARITHMETIC_MEAN': return "Aritmetik";
      case 'LEAST_SQUARES': return "E.K.K.";
      case 'ROBUST': return "Robust";
      case 'BAARDA': return "Baarda";
      case 'L1_HUBER': return "L1-Norm";
      case 'DBSCAN': return "DBSCAN";
      case 'RANSAC': return "RANSAC";
      case 'KDE': return "KDE";
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
      // pn = Yukarı (X) = Lat, pe = Sağa (Y) = Lng
      const converted = convertCoordinate(pn, pe, testSys);
      refX = converted.y; // Northing (Yukarı/X)
      refY = converted.x; // Easting (Sağa/Y)
    } else {
      refX = pn; // Yukarı (X)
      refY = pe; // Sağa (Y)
    }

    const results = methods.map(method => {
      // 1. Calculate point for this method
      const { result } = calculateResult(location.samples!, method, accuracyLimit);
      
      // 2. Convert result to comparison system (meters)
      const calcMeter = convertCoordinate(result.lat, result.lng, testSys);
      const calcZ = result.altitude; 

      // 3. Calculate errors
      // calcMeter.y is Northing (Yukarı/X), calcMeter.x is Easting (Sağa/Y)
      const dx = refX - calcMeter.y; // Yukarı (X) error
      const dy = refY - calcMeter.x; // Sağa (Y) error
      const dz = refZ - (calcZ || 0);
      const dhz = Math.sqrt(dx*dx + dy*dy);

      return {
        method,
        calculated: {
          x: useLocal ? calcMeter.x : result.lat, // x is Sağa (Y) / Lat? Wait. 
          y: useLocal ? calcMeter.y : result.lng, // y is Yukarı (X) / Lng?
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

  const distributionData = useMemo(() => {
    if (chartData.length === 0) return { rawPoints: [], methodPoints: [], centerPoint: [], range: 0.5 };

    // 1. Determine the Center (Reference)
    let centerX = 0;
    let centerY = 0;
    let isPrecise = false;

    if (analysisType === 'precise') {
      const pn = parseFloat(preciseN); // Yukarı (X)
      const pe = parseFloat(preciseE); // Sağa (Y)
      
      if (!isNaN(pn) && !isNaN(pe)) {
        const sys = location?.coordinateSystem || 'ITRF96_3';
        if (useLocal) {
          centerX = pe; // Easting (Sağa/Y)
          centerY = pn; // Northing (Yukarı/X)
        } else {
          const conv = convertCoordinate(pn, pe, sys);
          centerX = conv.x; // Easting (Sağa/Y)
          centerY = conv.y; // Northing (Yukarı/X)
        }
        isPrecise = true;
      }
    }

    if (!isPrecise) {
      centerX = chartData.reduce((a, b) => a + b.x, 0) / chartData.length;
      centerY = chartData.reduce((a, b) => a + b.y, 0) / chartData.length;
    }

    // 2. Calculate Deltas (Relative to Center)
    let maxDelta = 0.1;

    const rawPoints = chartData.map(d => {
      const dE = d.x - centerX; // Easting Delta
      const dN = d.y - centerY; // Northing Delta
      maxDelta = Math.max(maxDelta, Math.abs(dE), Math.abs(dN));
      return { ...d, dE, dN };
    });

    const methodPoints = (analysisResults || []).map((res, index) => {
      const dE = res.calculated.x - centerX;
      const dN = res.calculated.y - centerY;
      maxDelta = Math.max(maxDelta, Math.abs(dE), Math.abs(dN));
      return {
        ...res,
        id: index + 1,
        dE,
        dN,
        color: METHOD_COLORS[res.method] || '#94a3b8'
      };
    });

    // Square range with symmetric bounds
    const range = Math.ceil(maxDelta * 10) / 10 + 0.05;

    return { 
      rawPoints, 
      methodPoints, 
      centerLabel: isPrecise ? 'KESİN NOKTA' : 'ORTALAMA',
      range 
    };
  }, [chartData, analysisResults, analysisType, preciseN, preciseE, useLocal, location]);

  const exportChart = async (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { backgroundColor: '#ffffff', quality: 1 });
      saveAs(dataUrl, `${name}-${location?.name || 'export'}.png`);
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

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

  const mapInfo = getMapProviderInfo();

  const calculateNormalStats = () => {
    if (!location) return;
    const accuracyLimit = location.accuracyLimit || 5.0;
    const sys = location.coordinateSystem || 'ITRF96_3';

    const results = methods.map(method => {
      const { result } = calculateResult(location.samples!, method, accuracyLimit);
      const conv = convertCoordinate(result.lat, result.lng, sys);
      return {
        method,
        calculated: {
          x: conv.x,
          y: conv.y,
          z: result.altitude
        },
        errors: null // No ground truth
      };
    });
    setAnalysisResults(results);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-5 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] leading-none">Hassas Analiz & AR-GE</h2>
              <p className="text-blue-400 text-[8px] font-bold mt-1 uppercase tracking-widest opacity-80">Gelişmiş Raporlama Sistemi</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all text-xs">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
          
          {/* STEP 1: Method Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">1. Analiz Yöntemini Seçin</label>
            <div className="flex gap-2">
              <button 
                onClick={() => { setAnalysisType('precise'); setAnalysisResults(null); }}
                className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${analysisType === 'precise' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
              >
                <i className="fas fa-bullseye mr-2"></i>
                Kesin Koordinatlı
              </button>
              <button 
                onClick={() => { setAnalysisType('normal'); setAnalysisResults(null); }}
                className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${analysisType === 'normal' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Normal Analiz
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STEP 2: Project Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">2. Proje Seçin</label>
              <div className="relative">
                <select 
                  value={selectedFolder}
                  onChange={(e) => {
                    setSelectedFolder(e.target.value);
                    setSelectedPointId('');
                    setAnalysisResults(null);
                  }}
                  className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 appearance-none border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">Proje Seçiniz...</option>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <i className="fas fa-folder"></i>
                </div>
              </div>
            </div>

            {/* STEP 3: Point Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">3. Nokta Seçin</label>
              <div className="relative text-sm">
                <select 
                  value={selectedPointId}
                  onChange={(e) => {
                    setSelectedPointId(e.target.value);
                    setAnalysisResults(null);
                  }}
                  disabled={!selectedFolder}
                  className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 appearance-none border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm disabled:opacity-50"
                >
                  <option value="">Nokta Seçiniz...</option>
                  {filteredPoints.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <i className="fas fa-map-pin"></i>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Data Entry (Only for Precise) */}
          {analysisType === 'precise' && selectedPointId && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  4. Kesin Koordinat Girişi ({location?.coordinateSystem})
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-2">{useLocal ? 'Sağa (Y)' : 'Enlem (Lat)'}</label>
                  <input 
                    type="number" 
                    value={preciseE} 
                    onChange={e => setPreciseE(e.target.value)} 
                    placeholder={useLocal ? "500000.000" : "39.9"}
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-2">{useLocal ? 'Yukarı (X)' : 'Boylam (Lng)'}</label>
                  <input 
                    type="number" 
                    value={preciseN} 
                    onChange={e => setPreciseN(e.target.value)} 
                    placeholder={useLocal ? "4400000.000" : "32.8"}
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-2">{useLocal ? 'Z (Kot)' : 'Alt (H)'}</label>
                  <input 
                    type="number" 
                    value={preciseZ} 
                    onChange={e => setPreciseZ(e.target.value)} 
                    placeholder="100.000"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={calculateAllMethods}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <i className="fas fa-microchip"></i>
                Analizi Gerçekleştir
              </button>
            </div>
          )}

          {/* Normal Analysis Trigger */}
          {analysisType === 'normal' && selectedPointId && !analysisResults && (
            <button 
              onClick={calculateNormalStats}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <i className="fas fa-chart-bar"></i>
              İstatistikleri Göster
            </button>
          )}

          {/* STEP 5: Results and Visualization */}
          {analysisResults && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">5. Analiz Sonuçları</label>
              </div>

              <button 
                onClick={() => setShowMap(true)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <i className="fas fa-map-marked-alt"></i>
                Analiz Sonuçlarını Haritada Gör
              </button>

              {analysisType === 'precise' ? (
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
                        const isBest = res.method === analysisResults.sort((a,b) => (a.errors?.dhz || 0) - (b.errors?.dhz || 0))[0].method;
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
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-slate-50 shadow-sm">
                   <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-widest">
                        <th className="p-4 rounded-tl-3xl">Yöntem</th>
                        <th className="p-4">{useLocal ? 'Hesaplanan Y (Sağa)' : 'Hesaplanan Enlem (Lat)'}</th>
                        <th className="p-4 rounded-tr-3xl">{useLocal ? 'Hesaplanan X (Yukarı)' : 'Hesaplanan Boylam (Lng)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map((res, idx) => (
                        <tr key={res.method} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="p-4 font-black text-[11px] text-slate-800">{getMethodLabel(res.method)}</td>
                          <td className="p-4 font-bold text-xs text-blue-600">{res.calculated.x.toFixed(useLocal ? 3 : 8)}</td>
                          <td className="p-4 font-bold text-xs text-indigo-600">{res.calculated.y.toFixed(useLocal ? 3 : 8)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Technical Analysis Pafta */}
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all pointer-events-none">
                    <i className="fas fa-bullseye text-6xl text-blue-400"></i>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-[2px] bg-blue-500 rounded-full"></div>
                      <div className="space-y-0.5">
                        <h3 className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Hassasiyet Analiz Paftası</h3>
                        <p className="text-blue-400 text-[7px] font-bold uppercase tracking-widest opacity-80">Ref: {distributionData.centerLabel}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => exportChart(rawChartRef, 'teknik-analiz-paftasi')}
                      className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/10"
                    >
                      <i className="fas fa-camera mr-1"></i> PNG
                    </button>
                  </div>

                  <div ref={rawChartRef} className="bg-white rounded-2xl p-4 shadow-2xl aspect-square w-full max-w-sm mx-auto relative overflow-hidden">
                    {/* Technical Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-black/10 m-4"></div>
                      <div className="w-[20%] h-[20%] border border-black rounded-full"></div>
                      <div className="absolute w-[40%] h-[40%] border border-black rounded-full"></div>
                      <div className="absolute w-[80%] h-[80%] border border-black rounded-full"></div>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 30 }}>
                        <CartesianGrid strokeDasharray="1 1" strokeOpacity={0.1} stroke="#000" />
                        <XAxis 
                          type="number" 
                          dataKey="dE" 
                          name="ΔE" 
                          unit="m" 
                          domain={[-distributionData.range, distributionData.range]} 
                          tick={{fontSize: 7, fontWeight: 900}} 
                          axisLine={{ stroke: '#cbd5e1' }}
                          label={{ value: 'ΔE (Sağa) [m]', position: 'bottom', offset: 15, fontSize: 8, fontWeight: 900, fill: '#64748b' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="dN" 
                          name="ΔN" 
                          unit="m" 
                          domain={[-distributionData.range, distributionData.range]} 
                          tick={{fontSize: 7, fontWeight: 900}} 
                          axisLine={{ stroke: '#cbd5e1' }}
                          label={{ value: 'ΔN (Yukarı) [m]', angle: -90, position: 'left', offset: 10, fontSize: 8, fontWeight: 900, fill: '#64748b' }}
                        />
                        <ZAxis type="number" range={[20, 300]} />
                        <Tooltip 
                          cursor={{ strokeDasharray: '2 2', stroke: '#94a3b8' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const isMethod = data.method !== undefined;
                              return (
                                <div className="bg-slate-900 border border-white/10 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-md z-50">
                                  <p className="text-[9px] font-black uppercase text-blue-400 mb-2 pb-1 border-b border-white/5">
                                    {isMethod ? `Yöntem: ${getMethodLabel(data.method)}` : `Ham Ölçüm #${data.id}`}
                                  </p>
                                  <div className="space-y-1 font-mono text-[9px]">
                                    <div className="flex justify-between gap-4">
                                      <span className="opacity-60 text-[8px] uppercase">Δ Sağa (E):</span>
                                      <span className="font-black text-blue-400">{data.dE.toFixed(4)} m</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="opacity-60 text-[8px] uppercase">Δ Yukarı (N):</span>
                                      <span className="font-black text-indigo-400">{data.dN.toFixed(4)} m</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        
                        <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
                        <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                        
                        {/* Layer 1: Raw Points Cloud */}
                        <Scatter 
                          name="Ham Ölçümler" 
                          data={distributionData.rawPoints} 
                          fill="#64748b" 
                          fillOpacity={0.15} 
                          shape="circle" 
                        />
                        
                        {/* Layer 2: Method Aggregates */}
                        {distributionData.methodPoints.map((mp) => (
                          <Scatter 
                            key={mp.method} 
                            name={getMethodLabel(mp.method)} 
                            data={[mp]} 
                            fill={mp.color}
                            shape="circle"
                          />
                        ))}

                        {/* Layer 3: Numeric Labels for Methods */}
                        <Scatter 
                          data={distributionData.methodPoints} 
                          shape={<CustomScatterLabel />} 
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend / Method Reference */}
                  <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/5 p-4 rounded-xl border border-white/5">
                    {distributionData.methodPoints.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center rounded-md text-[8px] font-black text-white shadow-lg shrink-0" style={{ backgroundColor: m.color }}>{m.id}</div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[7px] font-black text-white uppercase tracking-tighter truncate leading-tight">{getMethodLabel(m.method)}</span>
                          <span className="text-[6px] font-bold text-blue-400 uppercase tracking-widest leading-tight">{m.errors?.dhz.toFixed(3)}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                      <i className="fas fa-history mr-2 text-indigo-500"></i>
                      Zamana Bağlı Yukarı (X)
                    </h3>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={['auto', 'auto']} tick={{fontSize: 8}} axisLine={false} width={45} />
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontWeight: 'bold' }} />
                          <Line type="monotone" dataKey="x" stroke="#6366f1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                      <i className="fas fa-history mr-2 text-amber-500"></i>
                      Zamana Bağlı Sağa (Y)
                    </h3>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={['auto', 'auto']} tick={{fontSize: 8}} axisLine={false} width={45} />
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontWeight: 'bold' }} />
                          <Line type="monotone" dataKey="y" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

                <div className="bg-blue-600 p-6 rounded-[2rem] text-white flex flex-col items-center gap-6 shadow-xl shadow-blue-100">
                {analysisType === 'precise' ? (
                  <>
                    <div className="text-center w-full">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Yatayda En Başarılı Algoritma</p>
                      <p className="text-xl font-black uppercase">
                        {getMethodLabel(analysisResults.sort((a,b) => (a.errors?.dhz || 0) - (b.errors?.dhz || 0))[0].method)}
                      </p>
                    </div>
                    <button 
                      onClick={handleDownloadExcel}
                      className="w-full bg-white text-blue-600 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-flask"></i>
                      Kesin Koordinatlı Analiz Raporu
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => import('./ExcelUtils').then(m => m.downloadTechnicalReport(location!, settings))}
                    className="w-full bg-white text-blue-600 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-file-excel"></i>
                    Normal Ölçüm Raporu Al
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400 font-bold text-center italic px-4">
                * Bu testler Android/iOS sensör verileri ile kesin koordinatlar arasındaki sistematik hatayı analiz etmek içindir.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Map Modal */}
        {showMap && location && analysisResults && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in">
            <div className="absolute top-6 left-6 z-[10000] flex gap-3">
              <button 
                onClick={() => setShowMap(false)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-90 transition-all border border-slate-200"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="h-12 px-6 bg-white rounded-2xl flex items-center shadow-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Nokta:</p>
                <p className="text-sm font-black text-slate-900">{location.name}</p>
              </div>
            </div>

            <MapContainer 
              center={[location.lat, location.lng]} 
              zoom={20} 
              maxZoom={22}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url={mapInfo.url}
                attribution="&copy; Google Maps"
                maxZoom={22}
                maxNativeZoom={mapInfo.maxNativeZoom}
              />
              
              {/* Raw Samples Cloud */}
              {location.samples?.map((s, idx) => (
                <Marker 
                  key={`raw-${idx}`}
                  position={[s.lat, s.lng]} 
                  icon={L.divIcon({
                    className: 'raw-marker',
                    html: `<div style="width: 8px; height: 8px; background: rgba(255,255,255,0.4); border: 1px solid rgba(0,0,0,0.5); border-radius: 50%;"></div>`,
                    iconSize: [8, 8],
                    iconAnchor: [4, 4]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Ham Ölçüm #{idx+1}</p>
                      <p className="text-xs font-bold font-mono">Hass: ±{s.accuracy.toFixed(2)}m</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Ground Truth IF Precise */}
              {analysisType === 'precise' && (
                <Marker 
                  position={[parseFloat(preciseN), parseFloat(preciseE)]} 
                  icon={L.divIcon({
                    className: 'precise-marker',
                    html: `<div style="width: 20px; height: 20px; display: flex; align-items: center; justify-center; background: #ef4444; color: white; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);"><i class="fas fa-crosshairs" style="font-size: 10px; margin: auto;"></i></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })}
                >
                  <Popup>
                    <div className="p-2 text-center">
                      <p className="text-xs font-black text-rose-600 mb-1">KESİN KOORDİNAT</p>
                      <p className="text-[10px] font-bold text-slate-500">Bu nokta referans alınmıştır.</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Algorithm Results */}
              {analysisResults.map((res) => {
                const { result } = calculateResult(location.samples!, res.method as any, location.accuracyLimit || 5.0);
                
                return (
                  <Marker 
                    key={res.method}
                    position={[result.lat, result.lng]} 
                    icon={L.divIcon({
                      className: 'method-marker',
                      html: `<div style="width: 14px; height: 14px; background: ${METHOD_COLORS[res.method]}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-center; color: white; font-size: 6px; font-weight: 900;"></div>`,
                      iconSize: [14, 14],
                      iconAnchor: [7, 7]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="text-[10px] font-black uppercase mb-1" style={{ color: METHOD_COLORS[res.method] }}>
                          {getMethodLabel(res.method as any)}
                        </p>
                        <p className="text-xs font-bold font-mono">
                          Y: {res.calculated.x.toFixed(useLocal ? 3 : 8)}<br/>
                          X: {res.calculated.y.toFixed(useLocal ? 3 : 8)}
                        </p>
                        {res.errors && (
                           <p className="mt-1 text-[9px] font-black text-emerald-600 uppercase border-t border-slate-100 pt-1">
                             Hata: {res.errors.dhz.toFixed(3)}m
                           </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <MapResizer />
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute bottom-6 right-6 z-[10000] max-w-[180px]">
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-slate-200">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">Renk Skalası</p>
                <div className="space-y-1.5">
                  {analysisResults.map(res => (
                    <div key={res.method} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: METHOD_COLORS[res.method] }}></div>
                      <span className="text-[9px] font-black text-slate-700 truncate">{getMethodLabel(res.method as any)}</span>
                    </div>
                  ))}
                  {analysisType === 'precise' && (
                    <div className="flex items-center gap-2 pt-1 border-t mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                      <span className="text-[9px] font-black text-rose-600">Referans</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DataAnalysisView;
