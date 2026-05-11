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

const METHOD_COLORS: Record<string, string> = {
  ARITHMETIC_MEAN: '#ef4444',
  LEAST_SQUARES: '#3b82f6',
  ROBUST: '#10b981',
  MAHALANOBIS: '#f59e0b',
  DBSCAN: '#8b5cf6',
  RANSAC: '#ec4899',
  KDE: '#06b6d4',
  MEDIAN_MAD: '#71717a'
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

  const distributionData = useMemo(() => {
    if (chartData.length === 0) return { rawPoints: [], methodPoints: [], truthPoint: [], minX: 0, minY: 0, range: 1 };

    // 1. Find Raw Data Bounds
    let minX = Math.min(...chartData.map(d => d.x));
    let maxX = Math.max(...chartData.map(d => d.x));
    let minY = Math.min(...chartData.map(d => d.y));
    let maxY = Math.max(...chartData.map(d => d.y));

    // 2. Include Ground Truth in bounds if it exists
    let hasTruth = false;
    let truthX = 0;
    let truthY = 0;

    if (analysisType === 'precise') {
      const pn = parseFloat(preciseN);
      const pe = parseFloat(preciseE);
      
      if (!isNaN(pn) && !isNaN(pe)) {
        const sys = location?.coordinateSystem || 'ITRF96_3';
        if (useLocal) {
          truthX = pn;
          truthY = pe;
        } else {
          const conv = convertCoordinate(pn, pe, sys);
          truthX = conv.x;
          truthY = conv.y;
        }
        minX = Math.min(minX, truthX);
        maxX = Math.max(maxX, truthX);
        minY = Math.min(minY, truthY);
        maxY = Math.max(maxY, truthY);
        hasTruth = true;
      }
    }

    // 3. Include Methods in bounds
    if (analysisResults) {
      analysisResults.forEach(res => {
        minX = Math.min(minX, res.calculated.x);
        maxX = Math.max(maxX, res.calculated.x);
        minY = Math.min(minY, res.calculated.y);
        maxY = Math.max(maxY, res.calculated.y);
      });
    }

    // Adjust for square grid (equal units)
    const rangeX = maxX - minX || 0.1;
    const rangeY = maxY - minY || 0.1;
    const maxRange = Math.max(rangeX, rangeY) * 1.2; // Add 20% margin
    
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    
    const finalMinX = midX - maxRange / 2;
    const finalMinY = midY - maxRange / 2;

    // Use Easting (Y) for X-Axis, Northing (X) for Y-Axis as per user's preference
    const rawPoints = chartData.map(d => ({
      ...d,
      offsetX: d.y - finalMinY, // Easting
      offsetY: d.x - finalMinX, // Northing
    }));

    const methodPoints = (analysisResults || []).map((res, index) => ({
      ...res,
      id: index + 1,
      offsetX: res.calculated.y - finalMinY,
      offsetY: res.calculated.x - finalMinX,
      color: METHOD_COLORS[res.method] || '#94a3b8'
    }));

    const truthPoint = hasTruth ? [{ 
      offsetX: truthY - finalMinY, 
      offsetY: truthX - finalMinX 
    }] : [];

    return { 
      rawPoints, 
      methodPoints, 
      truthPoint,
      range: maxRange
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
                        <th className="p-4">Hesaplanan Y (Sağa)</th>
                        <th className="p-4 rounded-tr-3xl">Hesaplanan X (Yukarı)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map((res, idx) => (
                        <tr key={res.method} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="p-4 font-black text-[11px] text-slate-800">{getMethodLabel(res.method)}</td>
                          <td className="p-4 font-bold text-xs text-blue-600">{res.calculated.y.toFixed(3)}</td>
                          <td className="p-4 font-bold text-xs text-indigo-600">{res.calculated.x.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Graphical Analysis Section */}
              <div className="space-y-6">
                {/* Chart 1: Raw Data Distribution */}
                <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center text-slate-500">
                      <i className="fas fa-satellite mr-2 text-blue-500 text-xs"></i>
                      Ham Veri Dağılımı
                    </h3>
                    <button 
                      onClick={() => exportChart(rawChartRef, 'ham-veri')}
                      className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-tighter hover:bg-blue-100 transition-all border border-blue-100/50"
                    >
                      <i className="fas fa-camera mr-1"></i> Grafiği İndir
                    </button>
                  </div>
                  <div ref={rawChartRef} className="bg-white rounded-3xl p-4 shadow-inner ring-1 ring-slate-100/50">
                    <div className="h-80 w-full flex justify-center">
                      <div style={{ width: '100%', maxWidth: '320px', aspectRatio: '1/1' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                            <XAxis 
                              type="number" 
                              dataKey="offsetX" 
                              name="ΔE" 
                              unit="m" 
                              domain={[0, distributionData.range]} 
                              tick={{fontSize: 8, fontWeight: 600}} 
                              axisLine={false}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="offsetY" 
                              name="ΔN" 
                              unit="m" 
                              domain={[0, distributionData.range]} 
                              tick={{fontSize: 8, fontWeight: 600}} 
                              axisLine={false}
                            />
                            <ZAxis type="number" range={[40, 40]} />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }} 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-2xl border border-slate-100">
                                      <p className="text-[10px] font-black text-slate-800 uppercase mb-1">Ham Veri #{data.id}</p>
                                      <div className="text-[9px] space-y-0.5">
                                        <p className="text-blue-600">E: {data.y.toFixed(4)}</p>
                                        <p className="text-indigo-600">N: {data.x.toFixed(4)}</p>
                                        <p className="text-slate-400">Acc: {data.acc?.toFixed(2)}m</p>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Scatter name="Ham Veri" data={distributionData.rawPoints} fill="#3b82f6" fillOpacity={0.4} />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Method Comparison */}
                <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center text-slate-500">
                      <i className="fas fa-layer-group mr-2 text-indigo-500 text-xs"></i>
                      Analiz Sonuçları Karşılaştırması
                    </h3>
                    <button 
                      onClick={() => exportChart(comparisonChartRef, 'analiz-karsilastirma')}
                      className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-tighter hover:bg-indigo-100 transition-all border border-indigo-100/50"
                    >
                      <i className="fas fa-camera mr-1"></i> Grafiği İndir
                    </button>
                  </div>
                  <div ref={comparisonChartRef} className="bg-white rounded-3xl p-4 shadow-inner ring-1 ring-slate-100/50">
                    <div className="h-80 w-full flex justify-center">
                      <div style={{ width: '100%', maxWidth: '320px', aspectRatio: '1/1' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                            <XAxis 
                              type="number" 
                              dataKey="offsetX" 
                              name="ΔE" 
                              unit="m" 
                              domain={[0, distributionData.range]} 
                              tick={{fontSize: 8, fontWeight: 600}} 
                              axisLine={false}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="offsetY" 
                              name="ΔN" 
                              unit="m" 
                              domain={[0, distributionData.range]} 
                              tick={{fontSize: 8, fontWeight: 600}} 
                              axisLine={false}
                            />
                            <ZAxis type="number" range={[20, 400]} />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }} 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  const isTruth = data.truth !== undefined;
                                  return (
                                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-2xl border border-slate-100">
                                      <p className="text-[10px] font-black text-slate-800 uppercase mb-1">
                                        {isTruth ? "Kesin Koordinat" : `${data.id}. ${getMethodLabel(data.method)}`}
                                      </p>
                                      <div className="text-[9px] space-y-0.5">
                                        <p className="text-blue-600">E: {data.offsetX.toFixed(4)}</p>
                                        <p className="text-indigo-600">N: {data.offsetY.toFixed(4)}</p>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            
                            {/* Raw points as background */}
                            <Scatter name="Ham Veri" data={distributionData.rawPoints} fill="#94a3b8" fillOpacity={0.1} />
                            
                            {/* Ground Truth */}
                            {distributionData.truthPoint.length > 0 && (
                              <Scatter 
                                name="Kesin Nokta" 
                                data={distributionData.truthPoint.map(p => ({ ...p, truth: true }))} 
                                fill="#ef4444"
                                shape="star"
                              />
                            )}

                            {/* Method points with Numeric Labels */}
                            <Scatter name="Yöntemler" data={distributionData.methodPoints}>
                              {distributionData.methodPoints.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Scatter>
                            {/* Second scatter just for labels to ensure they are on top */}
                            <Scatter data={distributionData.methodPoints} shape={<CustomScatterLabel />} />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend for numbers */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {distributionData.methodPoints.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black text-white" style={{ backgroundColor: m.color }}>{m.id}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase truncate">{getMethodLabel(m.method)}</span>
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
    </div>
  );
};

export default DataAnalysisView;
