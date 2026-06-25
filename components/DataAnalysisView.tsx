import React, { useState, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useLanguage } from '../utils/LanguageContext';
import { SavedLocation, AppSettings, CalculationMethod } from '../types';
import { geoidService } from '../services/GeoidService';
import { convertCoordinate, getSystemDisplayLabel, getWGS84Coefficients } from '../utils/CoordinateUtils';
import { calculateResult, calculateAverage, calculateMaxDistance } from '../utils/MathUtils';
import { downloadCombinedAnalysisReport } from './ExcelUtils';
import { generateTechnicalReport } from '../utils/ReportUtils';
import Header from './Header';
import GlobalFooter from './GlobalFooter';
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

const MapSetBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  React.useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 });
    }
  }, [points, map]);
  return null;
};

const BingTileLayer = () => {
  const map = useMap();
  React.useEffect(() => {
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

const METHOD_COLORS: Record<string, string> = {
  ARITHMETIC_MEAN: '#ec4899',
  WEIGHTED_LSE: '#8b5cf6',
  DBSCAN: '#d946ef',
  HUBER: '#3b82f6',
  KMEANS_4: '#06b6d4',
  HYBRID_v1: '#10b981',
  POPE_TAU: '#a855f7',
  HAMPEL: '#6366f1',
  ANDREWS_WAVE: '#f43f5e',
  TUKEYS_BIWEIGHT: '#14b8a6',
  DANISH: '#eab308',
  HODGES_LEHMANN: '#ec4899',
  TUKEYS_TRIMEAN: '#a855f7',
  OPTIMAL_S: '#0d9488'
};

const CLUSTER_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
];

const SESSION_COLORS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#65a30d', // Lime
  '#ea580c', // Orange
  '#0d9488', // Teal
  '#4f46e5', // Indigo
  '#0284c7', // Sky
];

const getClusterLetterLabel = (idx: number): string => {
  let label = '';
  let temp = idx;
  while (temp >= 0) {
    label = String.fromCharCode((temp % 26) + 65) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return label;
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

const RawPointShape = (props: any) => {
  const { cx, cy, fill, fillOpacity, r } = props;
  const radius = r !== undefined ? r : 2.5;
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={radius} 
      fill={fill} 
      fillOpacity={fillOpacity} 
    />
  );
};

const ColoredDot = (props: any) => {
  const { cx, cy, payload, index, r } = props;
  if (cx === undefined || cy === undefined) return null;
  
  let sessionIdx = 0;
  if (payload && payload.sessionIdx !== undefined) {
    sessionIdx = payload.sessionIdx;
  } else if (props.sessionIdx !== undefined) {
    sessionIdx = props.sessionIdx;
  } else {
    const idx = index !== undefined ? index : 0;
    sessionIdx = Math.floor(idx / 15);
  }
  
  const color = SESSION_COLORS[sessionIdx % SESSION_COLORS.length];
  const radius = r !== undefined ? r : 2;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={color}
      stroke="#ffffff"
      strokeWidth={0.8}
    />
  );
};

interface Props {
  locations: SavedLocation[];
  initialSelectedId?: string;
  settings: AppSettings;
  onClose: () => void;
}

const DataAnalysisView: React.FC<Props> = ({ locations, initialSelectedId, settings, onClose }) => {
  const { language, t } = useLanguage();
  const [analysisType, setAnalysisType] = useState<'precise' | 'normal'>('normal');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedPointId, setSelectedPointId] = useState<string>(initialSelectedId || '');
  const [showMap, setShowMap] = useState(false);
  const [currentMapProvider, setCurrentMapProvider] = useState(() => localStorage.getItem('default_map_provider') || 'Google Hybrid');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [reliabilityPlotMethod, setReliabilityPlotMethod] = useState<CalculationMethod>(settings.calculationMethod || 'WEIGHTED_LSE');

  const folders = useMemo(() => {
    const f = Array.from(new Set(locations.map(l => l.folderName || 'Genel')));
    return f.sort();
  }, [locations]);

  const filteredPoints = useMemo(() => {
    if (!selectedFolder) return [];
    return locations.filter(l => (l.folderName || 'Genel') === selectedFolder);
  }, [locations, selectedFolder]);

  const location = useMemo(() => {
    const orig = locations.find(l => l.id === selectedPointId);
    if (!orig) return undefined;
    return {
      ...orig,
      samples: orig.samples ? [...orig.samples] : []
    };
  }, [locations, selectedPointId]);
  const rawChartRef = React.useRef<HTMLDivElement>(null);
  const comparisonChartRef = React.useRef<HTMLDivElement>(null);
  const timeErrorChartRef = React.useRef<HTMLDivElement>(null);
  const hybridClusterChartRef = React.useRef<HTMLDivElement>(null);
  const clusterChartRef = React.useRef<HTMLDivElement>(null);
  const reliabilityChartRef = React.useRef<HTMLDivElement>(null);

  const [preciseN, setPreciseN] = useState<string>(''); // Northing (X)
  const [preciseE, setPreciseE] = useState<string>(''); // Easting (Y)
  const [preciseZ, setPreciseZ] = useState<string>('');
  const [isMemoryLoaded, setIsMemoryLoaded] = useState<boolean>(false);
  const [appliedPreciseN, setAppliedPreciseN] = useState<string>('');
  const [appliedPreciseE, setAppliedPreciseE] = useState<string>('');
  const [appliedPreciseZ, setAppliedPreciseZ] = useState<string>('');
  const [preciseWgs, setPreciseWgs] = useState<[number, number] | null>(null);
  
  const [analysisResults, setAnalysisResults] = useState<any[] | null>(null);
  const [computedClusters, setComputedClusters] = useState<number[][] | null>(null);
  const [activeClusterPointId, setActiveClusterPointId] = useState<number | null>(null);

  // Grafik özelleştirme seçenekleri
  const [customScatterRange, setCustomScatterRange] = useState<string>('auto'); // 'auto', '1.0', '2.0', '3.0', '4.0', '5.0', '10.0', '15.0'
  const [customScatterStep, setCustomScatterStep] = useState<string>('1.0'); // 'auto', '0.1', '0.2', '0.5', '1.0', '2.0'
  const [customScatterFontSize, setCustomScatterFontSize] = useState<string>('10'); // '6', '7', '7.5', '8', '9', '10', '12'
  const [customDotSize, setCustomDotSize] = useState<string>('2.0'); // '1.0', '1.5', '2.0', '2.5', '3.0', '4.0', '5.0', '6.0'
  const [xOffset, setXOffset] = useState<number>(0);
  const [yOffset, setYOffset] = useState<number>(0);
  const [customTimeSeriesRange, setCustomTimeSeriesRange] = useState<string>('auto'); // 'auto', '1.0', '2.0', '3.0', '4.0', '5.0', '10.0', '15.0', '20.0', '50.0'
  const [timeSeriesDurationLimit, setTimeSeriesDurationLimit] = useState<string>('90'); // '15', '30', '60', '90'
  const [customTimeSeriesStep, setCustomTimeSeriesStep] = useState<string>('1.0'); // 'auto', '0.1', '0.2', '0.5', '1.0', '2.0'
  const [customTimeSeriesFontSize, setCustomTimeSeriesFontSize] = useState<string>('10'); // '6', '7', '8', '9', '10', '12'
  const [customTimeSeriesDotSize, setCustomTimeSeriesDotSize] = useState<string>('2.0'); // '1.0', '1.5', '2.0', '2.5', '3.0', '4.0', '5.0', '6.0'



  const bestMethod = useMemo(() => {
    if (!analysisResults || analysisResults.length === 0) return null;
    const sorted = [...analysisResults]
      .sort((a,b) => (a.errors?.dhz || 0) - (b.errors?.dhz || 0));
    return sorted.length > 0 ? sorted[0].method : null;
  }, [analysisResults]);

  const useLocal = useMemo(() => {
    if (!location) return true;
    return location.coordinateSystem !== 'WGS84';
  }, [location]);

  React.useEffect(() => {
    if (analysisType === 'precise' && selectedPointId) {
      const saved = localStorage.getItem(`acb_labs_coords_${selectedPointId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreciseN(parsed.n || '');
          setPreciseE(parsed.e || '');
          setPreciseZ(parsed.z || '');
          setAppliedPreciseN('');
          setAppliedPreciseE('');
          setAppliedPreciseZ('');
          setIsMemoryLoaded(true);
        } catch (err) {
          setPreciseN('');
          setPreciseE('');
          setPreciseZ('');
          setIsMemoryLoaded(false);
        }
      } else {
        setPreciseN('');
        setPreciseE('');
        setPreciseZ('');
        setIsMemoryLoaded(false);
      }
      setPreciseWgs(null);
    }
  }, [selectedPointId, analysisType]);

  const methods = useMemo<CalculationMethod[]>(() => [
    'WEIGHTED_LSE',
    'DBSCAN',
    'HUBER',
    'HAMPEL',
    'HODGES_LEHMANN',
    'TUKEYS_TRIMEAN',
    'OPTIMAL_S'
  ], []);

  const getMethodLabel = (m: CalculationMethod) => {
    const labels: Record<string, string> = {
      'WEIGHTED_LSE': "WLSE",
      'DBSCAN': "DBSCAN",
      'HUBER': "HUBER-M",
      'HAMPEL': "HAMPEL-M",
      'HODGES_LEHMANN': "HODGES-R",
      'TUKEYS_TRIMEAN': "TRIMEAN-L",
      'OPTIMAL_S': "OPTIMAL-S"
    };
    return labels[m] || m;
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

    // Save coordinates to localStorage for recollection
    try {
      localStorage.setItem(`acb_labs_coords_${selectedPointId}`, JSON.stringify({
        n: preciseN,
        e: preciseE,
        z: preciseZ
      }));
      setIsMemoryLoaded(true);
    } catch (err) {
      console.error("Error saving coords to localStorage", err);
    }

    // Set applied values to trigger charts and metrics calculation
    setAppliedPreciseN(preciseN);
    setAppliedPreciseE(preciseE);
    setAppliedPreciseZ(preciseZ);

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
      setPreciseWgs([pn, pe]);
    } else {
      refX = pn; // Yukarı (X)
      refY = pe; // Sağa (Y)
      
      // Calculate WGS84 for map display
      import('../utils/CoordinateUtils').then(m => {
        const roughCenter = calculateAverage(location.samples!);
        const back = m.convertToWGS84(pe, pn, sys, Math.round(roughCenter.lng / 3) * 3);
        setPreciseWgs([back.lat, back.lng]);
      });
    }

    let clusterResults: number[][] | null = null;

    const results = methods.map(method => {
      // 1. Calculate point for this method
      const { result, clusters, usedIndices, preFilteredCount } = calculateResult(location.samples!, method, accuracyLimit);
      
      if (method === 'KMEANS_4' && clusters) {
        clusterResults = clusters;
      }
      
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
        lat: result.lat,
        lng: result.lng,
        usedCount: usedIndices ? usedIndices.length : location.samples!.length,
        preFilteredCount: preFilteredCount ?? location.samples!.length,
        calculated: {
          x: useLocal ? calcMeter.x : result.lat, 
          y: useLocal ? calcMeter.y : result.lng, 
          z: calcZ
        },
        errors: { dx, dy, dz, dhz }
      };
    });

    setAnalysisResults(results);
    setComputedClusters(clusterResults);
  };

  const multipathAnalysis = useMemo(() => {
    if (!location || !location.samples || location.samples.length < 1) return null;
    
    const maxSpread = calculateMaxDistance(location.samples);
    const avgSensorAcc = location.samples.reduce((a, b) => a + b.accuracy, 0) / location.samples.length;
    const ratio = maxSpread / (avgSensorAcc || 0.1);
    const samplesCount = location.samples.length;
    
    // Standart sapma (StdDev) hesabı
    const meanLat = location.samples.reduce((a, b) => a + b.lat, 0) / location.samples.length;
    const meanLng = location.samples.reduce((a, b) => a + b.lng, 0) / location.samples.length;
    const { latCoeff, lngCoeff } = getWGS84Coefficients(meanLat);
    const residuals = location.samples.map(s => {
      const dLat = (s.lat - meanLat) * latCoeff;
      const dLng = (s.lng - meanLng) * lngCoeff;
      return dLat * dLat + dLng * dLng;
    });
    const variance = residuals.reduce((a, b) => a + b, 0) / Math.max(1, location.samples.length - 1);
    const stdDev = Math.sqrt(variance);

    // 1. GÜVENSİZ VERİ (KIRMIZI): Donanımsal Hassasiyet > 20m VEYA Veri Saçılımı > 20m VEYA Veri Saçılımı > Donanımsal Hassasiyet * 3
    const isRed = avgSensorAcc > 20 || maxSpread > 20 || maxSpread > avgSensorAcc * 3;

    // 2. GÜVENİLİR VERİ (YEŞİL): Donanımsal Hassasiyet <= 5m VE Veri Saçılımı <= 5m VE Veri Sayısı >= 15 VE Veri Saçılımı <= Donanımsal Hassasiyet
    const isGreen = !isRed && avgSensorAcc <= 5 && maxSpread <= 5 && samplesCount >= 15 && maxSpread <= avgSensorAcc;

    // 3. ORTA GÜVENLİ VERİ / VERİ AZ (TURUNCU)
    const signalQuality: 'safe' | 'medium' | 'low' = isRed ? 'low' : isGreen ? 'safe' : 'medium';
    
    // Smooth confidenceScore for display
    const confidenceScore = isRed ? 30 : isGreen ? 90 : 60;

    // Failed criteria calculation
    const failedCriteria: { tr: string; en: string }[] = [];
    if (signalQuality !== 'safe') {
      if (avgSensorAcc > 5) {
        failedCriteria.push({
          tr: `Donanımsal hassasiyet yeterli seviyede değil (Mevcut: ±${avgSensorAcc.toFixed(2)}m, Güvenli sınır: ≤ 5.0m)`,
          en: `Hardware accuracy is insufficient (Current: ±${avgSensorAcc.toFixed(2)}m, Reliable limit: ≤ 5.0m)`
        });
      }
      if (maxSpread > 5) {
        failedCriteria.push({
          tr: `Konumsal veri saçılım genliği çok yüksek (Mevcut: ±${maxSpread.toFixed(2)}m, Güvenli sınır: ≤ 5.0m)`,
          en: `Spatial coordinate spread is too high (Current: ±${maxSpread.toFixed(2)}m, Reliable limit: ≤ 5.0m)`
        });
      }
      if (maxSpread > avgSensorAcc) {
        failedCriteria.push({
          tr: `Veri saçılım genişliği alıcı hassasiyetinden fazladır (Çoklu yansıma/Multipath sapma etkisi mevcut)`,
          en: `Coordinate spread exceeds receiver hardware accuracy (Signals affected by multipath reflection)`
        });
      }
      if (samplesCount < 15) {
        failedCriteria.push({
          tr: `Analiz için kaydedilen örnek sayısı yetersiz (Mevcut: ${samplesCount} epok, Güvenli sınır: ≥ 15)`,
          en: `Insufficient sample count for reliability (Current: ${samplesCount} epochs, Reliable limit: ≥ 15)`
        });
      }
    }
    
    return {
      maxSpread,
      avgSensorAcc,
      stdDev,
      ratio,
      confidenceScore,
      signalQuality,
      isRisk: signalQuality !== 'safe',
      isCritical: signalQuality === 'low',
      samplesCount,
      failedCriteria
    };
  }, [location]);

  const chartData = useMemo(() => {
    if (!location || !location.samples) return [];
    
    const sys = location.coordinateSystem || 'ITRF96_3';
    const limit = location.accuracyLimit || 5.0;
    
    // Determine the Ground Truth if available for time-series error calculation
    let refN = 0; // Northing (Yukarı)
    let refE = 0; // Easting (Sağa)
    let hasRef = false;

    if (analysisType === 'precise') {
      const pn = parseFloat(appliedPreciseN);
      const pe = parseFloat(appliedPreciseE);
      if (!isNaN(pn) && !isNaN(pe)) {
        if (useLocal) {
          refN = pn; 
          refE = pe; 
        } else {
          const conv = convertCoordinate(pn, pe, sys);
          refN = conv.y; 
          refE = conv.x; 
        }
        hasRef = true;
      }
    }

    // Filter by accuracy limit
    const accuracyFilteredIndices = location.samples
      .map((s, idx) => s.accuracy <= limit ? idx : -1)
      .filter(idx => idx !== -1);

    // If not precise mode, calculate the average (mean centroid) to use as reference error center
    if (!hasRef && accuracyFilteredIndices.length > 0) {
      let sumN = 0;
      let sumE = 0;
      accuracyFilteredIndices.forEach(originalIdx => {
        const s = location.samples![originalIdx];
        const conv = convertCoordinate(s.lat, s.lng, sys);
        sumN += conv.y;
        sumE += conv.x;
      });
      refN = sumN / accuracyFilteredIndices.length;
      refE = sumE / accuracyFilteredIndices.length;
      hasRef = true;
    }

    const mapped = accuracyFilteredIndices.map((originalIdx, chartIdx) => {
      const s = location.samples![originalIdx];
      const conv = convertCoordinate(s.lat, s.lng, sys);
      let errorHz = 0;
      if (hasRef) {
        const dn = refN - conv.y;
        const de = refE - conv.x;
        errorHz = Math.sqrt(dn*dn + de*de);
      }
      
      // Find which cluster this point belongs to
      let clusterId = -1;
      if (computedClusters) {
        computedClusters.forEach((cluster, cIdx) => {
          if (cluster.includes(originalIdx)) {
            clusterId = cIdx;
          }
        });
      }

      // Convert timestamp safely to numeric milliseconds since epoch
      let ts: number;
      const rawTs = s.timestamp;
      const baseTime = location.timestamp || Date.now();
      
      if (rawTs === null || rawTs === undefined) {
        ts = baseTime + chartIdx * 1000;
      } else if (rawTs instanceof Date) {
        ts = rawTs.getTime();
      } else if (typeof rawTs === 'object' && typeof (rawTs as any).getTime === 'function') {
        ts = (rawTs as any).getTime();
      } else if (typeof rawTs === 'number') {
        ts = rawTs;
      } else {
        const strTs = String(rawTs).trim();
        const num = parseFloat(strTs);
        if (!isNaN(num) && String(num) === strTs) {
          ts = num;
        } else {
          const parsed = Date.parse(strTs);
          ts = !isNaN(parsed) ? parsed : (baseTime + chartIdx * 1000);
        }
      }

      // If epoch timestamp is in seconds (< 10 Billion), scale it to milliseconds
      if (typeof ts === 'number' && !isNaN(ts) && ts < 10000000000) {
        ts = ts * 1000;
      }

      return {
        id: originalIdx + 1,
        x: conv.x, // Sağa (Y)
        y: conv.y, // Yukarı (X)
        alt: s.altitude || 0,
        acc: s.accuracy,
        time: new Date(ts).toLocaleTimeString(),
        timestamp: ts,
        errorHz: errorHz,
        clusterId,
        sessionIdx: 0
      };
    });

    // Sort chronologically to be absolutely sure we process sequential epochs
    mapped.sort((a, b) => a.timestamp - b.timestamp);

    // Dynamic grouping based on 20-second session window from the first epoch of each session
    let currentSessionIdx = 0;
    let sessionStartTime = mapped.length > 0 ? mapped[0].timestamp : 0;

    for (let i = 0; i < mapped.length; i++) {
      const origIdx = mapped[i].id - 1;
      const s = location.samples ? location.samples[origIdx] : undefined;
      if (s && s.sessionId !== undefined) {
        mapped[i].sessionIdx = s.sessionId - 1;
      } else {
        const elapsedMs = mapped[i].timestamp - sessionStartTime;
        if (elapsedMs > 20000) {
          // This epoch is outside the 20-second window of the current session.
          // It starts a new session.
          currentSessionIdx++;
          sessionStartTime = mapped[i].timestamp;
        }
        mapped[i].sessionIdx = currentSessionIdx;
      }
    }

    return mapped;
  }, [location, analysisType, appliedPreciseN, appliedPreciseE, useLocal, computedClusters]);

  // Convex hull helper for cluster boundary polygons
  const getConvexHullPoints = (pts: { dx: number; dy: number }[]) => {
    if (pts.length <= 1) return pts;
    const sorted = [...pts].sort((a, b) => a.dx !== b.dx ? a.dx - b.dx : a.dy - b.dy);
    const cross = (o: { dx: number; dy: number }, a: { dx: number; dy: number }, b: { dx: number; dy: number }) => {
      return (a.dx - o.dx) * (b.dy - o.dy) - (a.dy - o.dy) * (b.dx - o.dx);
    };
    const lower: { dx: number; dy: number }[] = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }
    const upper: { dx: number; dy: number }[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  };

  const hybridClusterChartData = useMemo(() => {
    if (!location || !location.samples || location.samples.length < 1) return null;
    const accuracyLimit = location.accuracyLimit || 5.0;
    
    // Calculate results for the selected method
    const { clusters, usedIndices } = calculateResult(
      location.samples,
      reliabilityPlotMethod,
      accuracyLimit
    );
    
    const sys = location.coordinateSystem || 'ITRF96_3';
    
    const accuracyFilteredIndices = location.samples
      .map((s, idx) => s.accuracy <= accuracyLimit ? idx : -1)
      .filter(idx => idx !== -1);

    if (accuracyFilteredIndices.length === 0) return null;

    let sumX = 0;
    let sumY = 0;
    const convertedPoints = accuracyFilteredIndices.map(idx => {
      const s = location.samples![idx];
      const conv = convertCoordinate(s.lat, s.lng, sys);
      sumX += conv.x;
      sumY += conv.y;
      return {
        idx,
        x: conv.x,
        y: conv.y,
        lat: s.lat,
        lng: s.lng,
        accuracy: s.accuracy,
        speed: s.speed,
        timestamp: s.timestamp
      };
    });

    const meanX = sumX / accuracyFilteredIndices.length;
    const meanY = sumY / accuracyFilteredIndices.length;

    // Determine the Center (Reference)
    let refCenterX = 0;
    let refCenterY = 0;
    let isPrecise = false;

    if (analysisType === 'precise') {
      const pn = parseFloat(appliedPreciseN); // Yukarı (X)
      const pe = parseFloat(appliedPreciseE); // Sağa (Y)
      
      if (!isNaN(pn) && !isNaN(pe)) {
        if (useLocal) {
          refCenterX = pe; // Easting (Sağa/Y)
          refCenterY = pn; // Northing (Yukarı/X)
        } else {
          const conv = convertCoordinate(pn, pe, sys);
          refCenterX = conv.x; // Easting (Sağa/Y)
          refCenterY = conv.y; // Northing (Yukarı/X)
        }
        isPrecise = true;
      }
    }

    if (!isPrecise) {
      refCenterX = meanX;
      refCenterY = meanY;
    }

    const relativePoints = convertedPoints.map(p => {
      const dx = p.x - refCenterX; // Easting offset in meters relative to reference
      const dy = p.y - refCenterY; // Northing offset in meters relative to reference
      
      const speedFiltered = false;
      const passedOutlierTest = usedIndices ? usedIndices.includes(p.idx) : true;
      
      let clusterId = 0;
      if (clusters) {
        clusters.forEach((cluster, cIndex) => {
          if (cluster.includes(p.idx)) {
            clusterId = cIndex;
          }
        });
      }

      return {
        id: p.idx + 1,
        name: `${t("Epok")} #${p.idx + 1}`,
        dx,
        dy,
        lat: p.lat,
        lng: p.lng,
        passedOutlierTest,
        speedFiltered,
        clusterId,
        accuracy: p.accuracy,
        speed: p.speed,
        time: new Date(p.timestamp).toLocaleTimeString()
      };
    });

    return {
      points: relativePoints,
      clusters: clusters || [],
      usedIndices: usedIndices || []
    };
  }, [location, t, analysisType, appliedPreciseN, appliedPreciseE, useLocal, reliabilityPlotMethod]);

  const clusterBounds = useMemo(() => {
    if (!hybridClusterChartData || hybridClusterChartData.points.length === 0) {
      return { minX: -1, maxX: 1, minY: -1, maxY: 1, span: 2 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    hybridClusterChartData.points.forEach(p => {
      if (p.dx < minX) minX = p.dx;
      if (p.dx > maxX) maxX = p.dx;
      if (p.dy < minY) minY = p.dy;
      if (p.dy > maxY) maxY = p.dy;
    });
    
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const maxSpan = Math.max(spanX, spanY, 0.2);
    
    const midX = minX + spanX / 2;
    const midY = minY + spanY / 2;
    const halfSpan = (maxSpan / 2) * 1.35; // 35% padding
    
    return {
      minX: midX - halfSpan,
      maxX: midX + halfSpan,
      minY: midY - halfSpan,
      maxY: midY + halfSpan,
      span: halfSpan * 2
    };
  }, [hybridClusterChartData]);

  const clusterRings = useMemo(() => {
    if (!clusterBounds) return { results: [], step: 0.5 };
    const maxMeters = clusterBounds.span / 2;
    const steps = [0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 15.0, 20.0];
    const step = steps.find(s => maxMeters / s <= 4) || 2.0;
    
    const results = [];
    for (let r = step; r < maxMeters; r += step) {
      results.push(r);
    }
    return { results, step };
  }, [clusterBounds]);

  const distributionData = useMemo(() => {
    if (chartData.length === 0) return { rawPoints: [], methodPoints: [], centerPoint: [], range: 0.5 };

    // 1. Determine the Center (Reference)
    let centerX = 0;
    let centerY = 0;
    let isPrecise = false;

    if (analysisType === 'precise') {
      const pn = parseFloat(appliedPreciseN); // Yukarı (X)
      const pe = parseFloat(appliedPreciseE); // Sağa (Y)
      
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
      
      const sIdx = d.sessionIdx !== undefined ? d.sessionIdx : 0;

      return { 
        ...d, 
        dE, 
        dN,
        sessionIdx: sIdx
      };
    });

    const methodPoints = (analysisResults || [])
      .map((res, index) => {
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
      centerLabel: isPrecise ? t('KESİN NOKTA') : t('ORTALAMA'),
      range 
    };
  }, [chartData, analysisResults, analysisType, appliedPreciseN, appliedPreciseE, useLocal, location]);

  const maxTickLimit = useMemo(() => {
    if (customScatterRange !== 'auto') {
      return parseFloat(customScatterRange);
    }
    const spread = multipathAnalysis?.maxSpread || 3.0;
    return Math.max(1.0, Math.ceil(spread / 2));
  }, [multipathAnalysis, customScatterRange]);

  const xTicks = useMemo(() => {
    let step = 0.5;
    if (customScatterStep !== 'auto') {
      step = parseFloat(customScatterStep);
    } else {
      if (maxTickLimit <= 1.0) step = 0.2;
      else if (maxTickLimit <= 2.0) step = 0.5;
      else if (maxTickLimit <= 4.0) step = 0.5;
      else if (maxTickLimit <= 10.0) step = 1.0;
      else step = 2.0;
    }
    const ticks = [];
    const minVal = -maxTickLimit + xOffset;
    const maxVal = maxTickLimit + xOffset;
    const start = Math.floor(minVal / step) * step;
    let current = start;
    let loops = 0;
    while (current <= maxVal + 0.001 && loops < 200) {
      if (current >= minVal - 0.001) {
        ticks.push(parseFloat(current.toFixed(2)));
      }
      current += step;
      loops++;
    }
    return ticks;
  }, [maxTickLimit, customScatterStep, xOffset]);

  const yTicks = useMemo(() => {
    let step = 0.5;
    if (customScatterStep !== 'auto') {
      step = parseFloat(customScatterStep);
    } else {
      if (maxTickLimit <= 1.0) step = 0.2;
      else if (maxTickLimit <= 2.0) step = 0.5;
      else if (maxTickLimit <= 4.0) step = 0.5;
      else if (maxTickLimit <= 10.0) step = 1.0;
      else step = 2.0;
    }
    const ticks = [];
    const minVal = -maxTickLimit + yOffset;
    const maxVal = maxTickLimit + yOffset;
    const start = Math.floor(minVal / step) * step;
    let current = start;
    let loops = 0;
    while (current <= maxVal + 0.001 && loops < 200) {
      if (current >= minVal - 0.001) {
        ticks.push(parseFloat(current.toFixed(2)));
      }
      current += step;
      loops++;
    }
    return ticks;
  }, [maxTickLimit, customScatterStep, yOffset]);

  const clusterTicks = useMemo(() => {
    let step = 0.5;
    if (customScatterStep !== 'auto') {
      step = parseFloat(customScatterStep);
    } else {
      if (maxTickLimit <= 1.0) step = 0.2;
      else if (maxTickLimit <= 2.0) step = 0.5;
      else if (maxTickLimit <= 4.0) step = 0.5;
      else if (maxTickLimit <= 10.0) step = 1.0;
      else step = 2.0;
    }
    const ticks = [];
    const minVal = -maxTickLimit;
    const maxVal = maxTickLimit;
    const start = Math.floor(minVal / step) * step;
    let current = start;
    let loops = 0;
    while (current <= maxVal + 0.001 && loops < 200) {
      if (current >= minVal - 0.001) {
        ticks.push(parseFloat(current.toFixed(2)));
      }
      current += step;
      loops++;
    }
    return ticks;
  }, [maxTickLimit, customScatterStep]);




  const timeSeriesChartData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // Group original points by sessionIdx and sort them
    const sessionsMap: Record<number, typeof chartData> = {};
    chartData.forEach(p => {
      const sIdx = p.sessionIdx !== undefined ? p.sessionIdx : 0;
      if (!sessionsMap[sIdx]) {
        sessionsMap[sIdx] = [];
      }
      sessionsMap[sIdx].push(p);
    });

    // Translate each session's raw epochs relative to its own starting epoch timestamp
    const mappedRawPoints: any[] = [];
    
    Object.keys(sessionsMap).forEach(key => {
      const sIdx = Number(key);
      if (sIdx >= 6) return; // Restrict strictly to 6 sessions (0 to 5)
      
      const points = [...sessionsMap[sIdx]];
      points.sort((a, b) => a.timestamp - b.timestamp);
      
      const n = points.length;
      if (n === 0) return;

      const adjustedTimestamps: number[] = [points[0].timestamp];
      
      // Calculate gaps and compress if sum of gaps > 14000ms (so total duration fits in 15s)
      const gaps: number[] = [];
      for (let i = 1; i < n; i++) {
        gaps.push(points[i].timestamp - points[i - 1].timestamp);
      }
      
      const sumGaps = gaps.reduce((sum, g) => sum + g, 0);
      if (sumGaps <= 14000) {
        // Gaps are small enough, keep as-is
        for (let i = 1; i < n; i++) {
          adjustedTimestamps.push(adjustedTimestamps[i - 1] + gaps[i - 1]);
        }
      } else {
        // Compress larger pauses proportionally so they fit within the 15-second block
        const excesses = gaps.map(g => Math.max(0, g - 1000));
        const sumExcess = excesses.reduce((sum, e) => sum + e, 0);
        const maxAllowedExcess = Math.max(0, 14000 - (n - 1) * 1000);
        
        if (sumExcess > maxAllowedExcess && sumExcess > 0) {
          const scale = maxAllowedExcess / sumExcess;
          const adjustedGaps = gaps.map((g, idx) => 1000 + excesses[idx] * scale);
          for (let i = 1; i < n; i++) {
            adjustedTimestamps.push(adjustedTimestamps[i - 1] + adjustedGaps[i - 1]);
          }
        } else {
          for (let i = 1; i < n; i++) {
            adjustedTimestamps.push(adjustedTimestamps[i - 1] + gaps[i - 1]);
          }
        }
      }

      const t_0 = adjustedTimestamps[0];
      const addedSecondsInSession = new Set<number>();
      
      points.forEach((point, idx) => {
        const dt = Math.round((adjustedTimestamps[idx] - t_0) / 1000);
        // Translate dt to 1-based index (1 to 15 seconds block)
        const dt_1_based = dt + 1;
        const dt_capped = Math.min(15, Math.max(1, dt_1_based));
        
        // Avoid duplicate seconds within the same session
        if (addedSecondsInSession.has(dt_capped)) {
          return;
        }
        addedSecondsInSession.add(dt_capped);
        
        const absoluteSec = sIdx * 15 + dt_capped;
        
        mappedRawPoints.push({
          ...point,
          second: absoluteSec,
          elapsedSecondsInsideSession: dt_capped,
          elapsedSeconds: absoluteSec,
          timeLabel: `${absoluteSec}.sec`,
          sessionIdx: sIdx
        });
      });
    });

    // Sort chronologically on the chart's timeline
    mappedRawPoints.sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);

    if (mappedRawPoints.length === 0) return [];

    const limitSec = parseInt(timeSeriesDurationLimit);
    return mappedRawPoints.filter(p => p.elapsedSeconds <= limitSec);
  }, [chartData, timeSeriesDurationLimit]);

  const segmentList = useMemo(() => {
    const list = [];
    
    // Group original points by sessionIdx
    const sessionsMap: Record<number, typeof chartData> = {};
    chartData.forEach(p => {
      const sIdx = p.sessionIdx !== undefined ? p.sessionIdx : 0;
      if (!sessionsMap[sIdx]) {
        sessionsMap[sIdx] = [];
      }
      sessionsMap[sIdx].push(p);
    });

    const maxSec = parseInt(timeSeriesDurationLimit);
    const numSegments = Math.ceil(maxSec / 15);

    for (let i = 0; i < numSegments; i++) {
      const startSec = i * 15 + 1;
      const endSec = Math.min(maxSec, (i + 1) * 15);
      
      const pts = sessionsMap[i] || [];
      const count = pts.length;

      list.push({
        segmentIdx: i,
        label: language === 'EN' 
          ? `Session ${i + 1} (${startSec}-${endSec}s)`
          : `Oturum ${i + 1} (${startSec}-${endSec}sn)`,
        color: SESSION_COLORS[i % SESSION_COLORS.length],
        count
      });
    }
    return list;
  }, [chartData, timeSeriesDurationLimit, language]);

  const sessionsList = useMemo(() => {
    if (timeSeriesChartData.length === 0) return [];
    const groups: Record<number, typeof timeSeriesChartData> = {};
    timeSeriesChartData.forEach(d => {
      const idx = d.sessionIdx !== undefined ? d.sessionIdx : 0;
      if (!groups[idx]) {
        groups[idx] = [];
      }
      groups[idx].push(d);
    });
    
    const maxIdx = Math.max(...Object.keys(groups).map(Number), 0);
    const list = [];
    for (let sIdx = 0; sIdx <= maxIdx; sIdx++) {
      const pts = groups[sIdx] || [];
      if (pts.length > 0) {
        const startId = pts[0].id;
        const endId = pts[pts.length - 1].id;
        list.push({
          sessionIdx: sIdx,
          color: SESSION_COLORS[sIdx % SESSION_COLORS.length],
          count: pts.length,
          startId,
          endId
        });
      }
    }
    return list;
  }, [timeSeriesChartData]);

  const timeSeriesMaxLimit = useMemo(() => {
    if (customTimeSeriesRange !== 'auto') {
      return parseFloat(customTimeSeriesRange);
    }
    if (timeSeriesChartData.length === 0) return 3.0;
    const maxVal = Math.max(...timeSeriesChartData.map(d => d.errorHz || 0), 0);
    return Math.floor(maxVal) + 1;
  }, [timeSeriesChartData, customTimeSeriesRange]);

  const timeSeriesYTicks = useMemo(() => {
    let step = 0.5;
    if (customTimeSeriesStep !== 'auto') {
      step = parseFloat(customTimeSeriesStep);
    } else {
      if (timeSeriesMaxLimit <= 2.0) {
        step = 0.2;
      } else if (timeSeriesMaxLimit <= 5.0) {
        step = 0.5;
      } else if (timeSeriesMaxLimit <= 15.0) {
        step = 1.0;
      } else if (timeSeriesMaxLimit <= 30.0) {
        step = 2.0;
      } else {
        step = 5.0;
      }
    }
    const ticks = [];
    let loops = 0;
    for (let val = 0; val <= timeSeriesMaxLimit + 0.01 && loops < 200; val += step) {
      ticks.push(parseFloat(val.toFixed(2)));
      loops++;
    }
    return ticks;
  }, [timeSeriesMaxLimit, customTimeSeriesStep]);

  const timeSeriesXTicks = useMemo(() => {
    const maxSec = parseInt(timeSeriesDurationLimit);
    if (maxSec === 15) {
      return [1, 5, 10, 15];
    } else if (maxSec === 30) {
      return [1, 5, 10, 15, 20, 25, 30];
    } else if (maxSec === 60) {
      return [1, 10, 20, 30, 40, 50, 60];
    } else {
      return [1, 15, 30, 45, 60, 75, 90];
    }
  }, [timeSeriesDurationLimit]);

  const exportChart = async (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { 
        backgroundColor: '#ffffff', 
        pixelRatio: 3,
        style: {
          transform: 'none',
          borderRadius: '0px'
        }
      });
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
        x: parseFloat(appliedPreciseN), 
        y: parseFloat(appliedPreciseE), 
        z: parseFloat(appliedPreciseZ), 
        isWgs84: !useLocal 
      },
      analysisResults,
      settings,
      language
    );
  };

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

  const mapInfo = getMapProviderInfo();

  const calculateNormalStats = () => {
    if (!location) return;
    const accuracyLimit = location.accuracyLimit || 5.0;
    const sys = location.coordinateSystem || 'ITRF96_3';

    let clusterResults: number[][] | null = null;

    const results = methods.map(method => {
      const { result, clusters, usedIndices, preFilteredCount } = calculateResult(location.samples!, method, accuracyLimit);
      if (method === 'KMEANS_4' && clusters) {
        clusterResults = clusters;
      }
      const conv = convertCoordinate(result.lat, result.lng, sys);
      return {
        method,
        lat: result.lat,
        lng: result.lng,
        usedCount: usedIndices ? usedIndices.length : location.samples!.length,
        preFilteredCount: preFilteredCount ?? location.samples!.length,
        calculated: {
          x: conv.x,
          y: conv.y,
          z: result.altitude
        },
        errors: null // No ground truth
      };
    });
    setAnalysisResults(results);
    setComputedClusters(clusterResults);
  };

  return (
    <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-slate-200">
      <Header title="ACB Labs" onBack={onClose} />
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-3 pb-3 w-full">
          <div className="max-w-sm mx-auto w-full space-y-3.5">

          {/* STEP 1: Method Selection */}
          <div className="bg-white rounded-2xl p-4 border border-slate-150/80 shadow-sm space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t("Analiz Yöntemini Seçin")}</label>
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => { setAnalysisType('normal'); setAnalysisResults(null); }}
                className={`w-full py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${analysisType === 'normal' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                {t("İstatistiki Yöntem Analizleri")}
              </button>
              <button 
                onClick={() => { setAnalysisType('precise'); setAnalysisResults(null); }}
                className={`w-full py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-2 ${analysisType === 'precise' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
              >
                <i className="fas fa-bullseye mr-2"></i>
                {t("Kesin Koordinatlı Analiz")}
              </button>
            </div>
            
            {/* Info Box about Specialized Models */}
            <div className="hidden">
               <div className="hidden">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-violet-600 uppercase">{t("Ağırlıklı En Küçük Kareler (Varsayılan)")}</p>
                    <p className="text-[8px] font-medium text-slate-500 leading-relaxed italic">
                      {t("Ölçüm hassasiyetine (accuracy) göre ters ağırlıklı modelleme yaparak güvensiz verilerin etkisini azaltır.")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-cyan-600 uppercase">{t("K-Means (4 Küme)")}</p>
                    <p className="text-[8px] font-medium text-slate-500 leading-relaxed italic">
                      {t("Ham konum verilerini mekansal yakınlıklarına göre 4 temel kümeye segmentler, en kararlı ve yoğun kümenin ağırlıklı merkezini alır.")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-amber-600 uppercase">{t("Hodges-Lehmann Eleme")}</p>
                    <p className="text-[8px] font-medium text-slate-500 leading-relaxed italic">
                      {t("Jeodezik Hodges-Lehmann testi ile uyuşumsuz ve kaba hatalı uç koordinat verilerini sistemden döngüsel olarak temizler.")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-blue-600 uppercase">{t("K-Means + Hodges-Lehmann + WLS")}</p>
                    <p className="text-[8px] font-medium text-slate-500 leading-relaxed italic">
                      {t("Veriyi doğrudan K-Means (k = 4) ile gruplar. Her kümede bağımsız iç Hodges-Lehmann testi yapıp en yoğun grubu seçer ve nihai konumu ağırlıklı en küçük kareler (WLS) ile dengeler.")}
                    </p>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-150/80 shadow-sm space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t("Proje ve Nokta Seçimi")}</label>
            <div className="grid grid-cols-1 gap-3">
              {/* STEP 2: Project Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t("Proje Seçin")}</label>
              <div className="relative">
                <select 
                  value={selectedFolder}
                  onChange={(e) => {
                    setSelectedFolder(e.target.value);
                    setSelectedPointId('');
                    setAnalysisResults(null);
                    setComputedClusters(null);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 rounded-xl font-bold text-slate-900 appearance-none border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">{t("Proje Seçiniz...")}</option>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <i className="fas fa-folder"></i>
                </div>
              </div>
            </div>

            {/* STEP 3: Point Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t("Nokta Seçin")}</label>
              <div className="relative text-sm">
                <select 
                  value={selectedPointId}
                  onChange={(e) => {
                    setSelectedPointId(e.target.value);
                    setAnalysisResults(null);
                    setComputedClusters(null);
                    setPreciseN('');
                    setPreciseE('');
                    setPreciseZ('');
                    setAppliedPreciseN('');
                    setAppliedPreciseE('');
                    setAppliedPreciseZ('');
                    setPreciseWgs(null);
                  }}
                  disabled={!selectedFolder}
                  className="w-full py-2.5 px-4 bg-slate-100 rounded-xl font-bold text-slate-900 appearance-none border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm disabled:opacity-50"
                >
                  <option value="">{t("Nokta Seçiniz...")}</option>
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
        </div>

          {/* STEP 4: Data Entry (Only for Precise) */}
          {analysisType === 'precise' && selectedPointId && (
            <div className="bg-white rounded-2xl p-4 border border-slate-150/80 shadow-sm space-y-3 pt-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  {t("Kesin Koordinat Girişi (")}{getSystemDisplayLabel(location?.coordinateSystem)})
                </label>
              </div>

              {isMemoryLoaded && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100/60 px-3.5 py-2 rounded-xl animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-emerald-500 text-xs shrink-0">
                      <i className="fas fa-sd-card"></i>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide truncate">
                      {t("Kayıtlı koordinat bulundu ve yüklendi!")}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem(`acb_labs_coords_${selectedPointId}`);
                      setPreciseN('');
                      setPreciseE('');
                      setPreciseZ('');
                      setIsMemoryLoaded(false);
                    }}
                    className="text-rose-500 hover:text-rose-700 active:scale-95 transition-all text-[8px] font-black uppercase shrink-0 px-2.5 py-1 bg-white border border-rose-100 rounded-lg shadow-xs"
                    title={t("Hafızayı Temizle")}
                  >
                    {t("TEMİZLE")}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-2">{useLocal ? t("Sağa (Y)") : t("Enlem (Lat)")}</label>
                  <input 
                    type="number" 
                    value={preciseE} 
                    onChange={e => {
                      setPreciseE(e.target.value);
                      setIsMemoryLoaded(false);
                    }} 
                    placeholder={useLocal ? "500000.000" : "39.9"}
                    className="w-full py-2.5 px-4 bg-slate-50 rounded-xl font-bold text-slate-900 border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-2">{useLocal ? t("Yukarı (X)") : t("Boylam (Lng)")}</label>
                  <input 
                    type="number" 
                    value={preciseN} 
                    onChange={e => {
                      setPreciseN(e.target.value);
                      setIsMemoryLoaded(false);
                    }} 
                    placeholder={useLocal ? "4400000.000" : "32.8"}
                    className="w-full py-2.5 px-4 bg-slate-50 rounded-xl font-bold text-slate-900 border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-2">{useLocal ? t("h-Elipsoid (Z)") : t("Alt (H)")}</label>
                  <input 
                    type="number" 
                    value={preciseZ} 
                    onChange={e => {
                      setPreciseZ(e.target.value);
                      setIsMemoryLoaded(false);
                    }} 
                    placeholder="100.000"
                    className="w-full py-2.5 px-4 bg-slate-50 rounded-xl font-bold text-slate-900 border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={calculateAllMethods}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <i className="fas fa-microchip"></i>
                {t("Analizi Başlat")}
              </button>
            </div>
          )}

          {/* Normal Analysis Trigger */}
          {analysisType === 'normal' && selectedPointId && !analysisResults && (
            <button 
              onClick={calculateNormalStats}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <i className="fas fa-chart-bar"></i>
              {t("Analizi Başlat")}
            </button>
          )}

          {/* STEP 5: Results and Visualization */}
          {analysisResults && analysisResults.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Analiz Sonuçları")}</label>
              </div>

              {/* Multipath / Reliability Analysis */}
              {multipathAnalysis && (
                <div className={`p-4.5 rounded-2xl border-2 animate-in slide-in-from-top-4 ${
                  multipathAnalysis.signalQuality === 'low' ? 'bg-rose-50 border-rose-100' : 
                  multipathAnalysis.signalQuality === 'medium' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                }`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                        multipathAnalysis.signalQuality === 'low' ? 'bg-rose-100 text-rose-600' : 
                        multipathAnalysis.signalQuality === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        <i className={`fas ${
                          multipathAnalysis.signalQuality === 'low' ? 'fa-signal text-rose-600 opacity-60' : 
                          multipathAnalysis.signalQuality === 'medium' ? 'fa-signal text-amber-600' : 'fa-signal text-emerald-600'
                        } text-lg`}></i>
                      </div>
                      <div>
                        <h3 className={`text-xs font-black uppercase tracking-wider ${
                          multipathAnalysis.signalQuality === 'low' ? 'text-rose-700' : 
                          multipathAnalysis.signalQuality === 'medium' ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {multipathAnalysis.signalQuality === 'safe' && t("GÜVENLİ SİNYAL")}
                          {multipathAnalysis.signalQuality === 'medium' && t("ORTA GÜVENLİ SİNYAL")}
                          {multipathAnalysis.signalQuality === 'low' && (language === 'EN' ? "UNRELIABLE SIGNAL" : "GÜVENSİZ SİNYAL")}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Veri Saçılım Analiz Özet Raporu */}
                  <div className="bg-white/80 p-3 h-auto rounded-xl border border-white/90 shadow-sm space-y-1.5">
                    <div className="text-[9.5px] space-y-1.5 leading-relaxed text-slate-600 font-medium font-sans">
                      <p className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                        <span className="text-slate-500">{t("Örnek Sayısı:")}</span>
                        <span className="font-bold text-slate-900 mono-font font-medium">{location?.samples?.length || 0}</span>
                      </p>
                      <p className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                        <span className="text-slate-500">{t("Maksimum Saçılım Genişliği:")}</span>
                        <span className="font-bold text-slate-900 mono-font font-medium">±{multipathAnalysis.maxSpread.toFixed(3)} m</span>
                      </p>
                      <p className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                        <span className="text-slate-500">{t("Konumsal Standart Sapma (1σ):")}</span>
                        <span className="font-bold text-slate-900 mono-font font-medium">±{multipathAnalysis.stdDev.toFixed(3)} m</span>
                      </p>
                      <p className="flex justify-between border-b border-dashed border-slate-100 pb-0.5">
                        <span className="text-slate-500">{t("Alıcı Sensör Hassasiyeti:")}</span>
                        <span className="font-bold text-slate-900 mono-font font-medium">±{multipathAnalysis.avgSensorAcc.toFixed(3)} m</span>
                      </p>
                      <div className="text-[10px] text-slate-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 mt-1.5 space-y-1.5">
                        <span className="font-black text-slate-900 block uppercase text-[7.5px] tracking-wider border-b border-slate-100 pb-1 mb-1 shadow-none">
                          {language === 'EN' ? "Jeodetic Signal Interpretation:" : "Jeodezik Sinyal Yorumu:"}
                        </span>
                        {multipathAnalysis.signalQuality === 'safe' && (
                          <div className="text-[10px] leading-relaxed text-slate-600 font-medium">
                            {language === 'EN' 
                              ? "The data is highly consistent. No multipath effect has been detected since there is no deviation in spatial distribution." 
                              : "Veriler yüksek tutarlılıktadır. Konumsal dağılımda sapma olmadığından multipath etkisi saptanmamıştır."}
                          </div>
                        )}
                        {multipathAnalysis.signalQuality !== 'safe' && (
                          <div className="space-y-1.5 text-slate-600">
                            <div className="space-y-1 bg-amber-50/20 p-2.5 rounded-lg border border-slate-100">
                              {multipathAnalysis.failedCriteria.map((crit, cIdx) => (
                                <p key={cIdx} className="text-[9px] leading-relaxed text-amber-700 font-semibold flex items-start gap-1">
                                  <span className="text-amber-500">•</span>
                                  <span>{language === 'EN' ? crit.en : crit.tr}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowMap(true)}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <i className="fas fa-map-marked-alt"></i>
                {t("Analiz Sonuçlarını Haritada Gör")}
              </button>

              {analysisType === 'precise' ? (
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-sm">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[8px] sm:text-[9.5px] uppercase tracking-wider">
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 rounded-tl-3xl w-[28%] whitespace-nowrap">{language === 'EN' ? "Method" : "Yöntem"}</th>
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 w-[22%] whitespace-nowrap">{language === 'EN' ? "Epochs" : "Epok"}</th>
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 w-[28%] whitespace-nowrap">{language === 'EN' ? "Δ2D Dev. (m)" : "Yatay Hata (m)"}</th>
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 rounded-tr-3xl w-[22%] whitespace-nowrap">{language === 'EN' ? "STATUS" : "DURUM"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map((res, idx) => {
                        const isBest = res.method === bestMethod;
                        const totalCount = location?.samples?.length || 0;
                        const baseCount = res.preFilteredCount ?? totalCount;
                        return (
                           <tr key={res.method} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 font-black text-[9.5px] sm:text-[11px] text-slate-800 whitespace-nowrap truncate">{getMethodLabel(res.method)}</td>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 font-mono text-[9.5px] sm:text-xs text-slate-600 font-medium whitespace-nowrap">{(res.usedCount ?? baseCount)}/{baseCount}</td>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 font-bold text-[9.5px] sm:text-xs text-blue-600 whitespace-nowrap">{res.errors.dhz.toFixed(3)}</td>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 whitespace-nowrap">
                              {isBest && (
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{language === 'EN' ? "BEST" : "EN İYİ"}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-sm">
                   <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[8px] sm:text-[9.5px] uppercase tracking-wider">
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 rounded-tl-3xl w-[28%] whitespace-nowrap">{language === 'EN' ? "Method" : "Yöntem"}</th>
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 w-[22%] whitespace-nowrap">{language === 'EN' ? "Epochs" : "Epok"}</th>
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 w-[25%] truncate">
                          {useLocal 
                            ? (language === 'EN' ? "Y / East (m)" : "Y / Sağa (m)") 
                            : (language === 'EN' ? "Latitude" : "Enlem")}
                        </th>
                        <th className="px-2 py-2 sm:px-3.5 sm:py-3.5 rounded-tr-3xl w-[25%] truncate">
                          {useLocal 
                            ? (language === 'EN' ? "X / North (m)" : "X / Yukarı (m)") 
                            : (language === 'EN' ? "Longitude" : "Boylam")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map((res, idx) => {
                        const totalCount = location?.samples?.length || 0;
                        const baseCount = res.preFilteredCount ?? totalCount;
                        return (
                           <tr key={res.method} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 font-black text-[9.5px] sm:text-[11px] text-slate-800 whitespace-nowrap truncate">{getMethodLabel(res.method)}</td>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 font-mono text-[9.5px] sm:text-xs text-slate-600 font-medium whitespace-nowrap">{(res.usedCount ?? baseCount)}/{baseCount}</td>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 font-bold text-[9.5px] sm:text-xs text-blue-600 whitespace-nowrap">{res.calculated.x.toFixed(useLocal ? 3 : 8)}</td>
                            <td className="px-2 py-2 sm:px-3.5 sm:py-3.5 font-bold text-[9.5px] sm:text-xs text-indigo-600 whitespace-nowrap">{res.calculated.y.toFixed(useLocal ? 3 : 8)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Technical Analysis Pafta */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t("Yöntem Sonuçları Grafiği")}
                  </span>
                  <button 
                    onClick={() => exportChart(rawChartRef, 'gps-plus-precision-sheet')}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fas fa-camera text-blue-400"></i> {t("DOWNLOAD")}
                  </button>
                </div>

                {/* Unified Map Settings & Axis Offset Control Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 shadow-sm space-y-3.5">
                  {/* Top Row: Title, Offset Info & Map Navigation */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                        <i className="fas fa-sliders-h text-[10px]"></i>
                      </div>
                      <span className="font-extrabold text-[9.5px] sm:text-[10px] uppercase text-slate-700 tracking-wider">
                        {t("Veri Saçılımı Grafik Ayarları")}
                      </span>
                    </div>
                    {/* Navigation Buttons integrated directly into the header right side */}
                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      <button
                        onClick={() => setXOffset(prev => prev - 1.0)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                        title={t("Sola Kaydır (X -1m)")}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <button
                          onClick={() => setYOffset(prev => prev + 1.0)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] w-8 h-3.5 rounded flex items-center justify-center transition-all active:scale-90 focus:outline-none"
                          title={t("Yukarı Kaydır (Y +1m)")}
                        >
                          <i className="fas fa-chevron-up text-[7px]"></i>
                        </button>
                        <button
                          onClick={() => setYOffset(prev => prev - 1.0)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] w-8 h-3.5 rounded flex items-center justify-center transition-all active:scale-90 focus:outline-none"
                          title={t("Aşağı Kaydır (Y -1m)")}
                        >
                          <i className="fas fa-chevron-down text-[7px]"></i>
                        </button>
                      </div>
                      <button
                        onClick={() => setXOffset(prev => prev + 1.0)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                        title={t("Sağa Kaydır (X +1m)")}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                      <button
                        onClick={() => { setXOffset(0); setYOffset(0); }}
                        className="ml-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-[9px] uppercase px-2 py-2 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-90"
                        title={t("Eksenleri Sıfırla")}
                      >
                        <i className="fas fa-redo-alt"></i> <span className="text-[7.5px] font-extrabold">{t("SIFIRLA")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Selector Option Dropdowns */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2.5 items-center justify-start text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase font-sans">{t("Eksen Limiti:")}</span>
                      <select 
                        value={customScatterRange} 
                        onChange={(e) => setCustomScatterRange(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="auto">{t("Otomatik")}</option>
                        <option value="1.0">±1m</option>
                        <option value="2.0">±2m</option>
                        <option value="3.0">±3m</option>
                        <option value="4.0">±4m</option>
                        <option value="5.0">±5m</option>
                        <option value="10.0">±10m</option>
                        <option value="15.0">±15m</option>
                        <option value="30.0">±30m</option>
                        <option value="50.0">±50m</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase font-sans">{t("Kılavuz Adımı:")}</span>
                      <select 
                        value={customScatterStep} 
                        onChange={(e) => setCustomScatterStep(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="auto">Auto</option>
                        <option value="0.1">0.1m</option>
                        <option value="0.2">0.2m</option>
                        <option value="0.5">0.5m</option>
                        <option value="1.0">1.0m</option>
                        <option value="2.0">2.0m</option>
                        <option value="5.0">5.0m</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase font-sans">{t("Yazı Boyutu:")}</span>
                      <select 
                        value={customScatterFontSize} 
                        onChange={(e) => setCustomScatterFontSize(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="6">6px</option>
                        <option value="7">7px</option>
                        <option value="7.5">7.5px</option>
                        <option value="8">8px</option>
                        <option value="9">9px</option>
                        <option value="10">10px</option>
                        <option value="12">12px</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase font-sans">{t("Nokta Boyutu:")}</span>
                      <select 
                        value={customDotSize} 
                        onChange={(e) => setCustomDotSize(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="1.0">1.0px</option>
                        <option value="1.5">1.5px</option>
                        <option value="2.0">2.0px</option>
                        <option value="2.5">2.5px</option>
                        <option value="3.0">3.0px</option>
                        <option value="3.5">3.5px</option>
                        <option value="4.0">4.0px</option>
                        <option value="5.0">5.0px</option>
                        <option value="6.0">6.0px</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1:1 Aspect Ratio Precision Sheet: Borderless & Extremely Clean layout */}
                <div 
                  ref={rawChartRef} 
                  className="bg-white rounded-[1.5rem] border-2 border-slate-200 p-3.5 pb-2.5 flex flex-col gap-1 text-slate-900 w-full max-w-[500px] h-auto mx-auto relative overflow-hidden font-sans text-left shadow-sm select-none"
                >
                  {/* Top Panel: Large/Expanded Borderless Scatter Chart */}
                  <div className="w-full aspect-square relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 8, right: 12, bottom: 12, left: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} stroke="#64748b" horizontal={true} vertical={true} />
                        <XAxis 
                          type="number" 
                          dataKey="dE" 
                          name="ΔE" 
                          domain={[-maxTickLimit + xOffset, maxTickLimit + xOffset]} 
                          ticks={xTicks}
                          interval={0}
                          angle={-90}
                          textAnchor="end"
                          height={48}
                          tickFormatter={(val) => {
                            const isInteger = Math.abs(val - Math.round(val)) < 0.01;
                            return isInteger ? `${Math.round(val).toFixed(1)}m` : '';
                          }}
                          tick={{fontSize: parseFloat(customScatterFontSize), fontWeight: 800, fill: '#000000', dy: 2.5, dx: -3}}
                          axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                          tickLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="dN" 
                          name="ΔN" 
                          domain={[-maxTickLimit + yOffset, maxTickLimit + yOffset]} 
                          ticks={yTicks}
                          interval={0}
                          width={50}
                          tickFormatter={(val) => {
                            const isInteger = Math.abs(val - Math.round(val)) < 0.01;
                            return isInteger ? `${Math.round(val).toFixed(1)}m` : '';
                          }}
                          tick={{fontSize: parseFloat(customScatterFontSize), fontWeight: 800, fill: '#000000'}} 
                          axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                          tickLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                        />
                        <ZAxis type="number" range={[15, 120]} />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const isMethod = data.method !== undefined;
                              const getMethodLabelEn = (m: CalculationMethod) => {
                                const labels: Record<string, string> = {
                                  'WEIGHTED_LSE': 'WLSE',
                                  'DBSCAN': 'DBSCAN',
                                  'HUBER': 'HUBER-M',
                                  'HAMPEL': 'HAMPEL-M',
                                  'HODGES_LEHMANN': 'HODGES-R',
                                  'TUKEYS_TRIMEAN': 'TRIMEAN-L',
                                  'OPTIMAL_S': 'OPTIMAL-S'
                                };
                                return labels[m] || m;
                              };
                              return (
                                <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg shadow-xl z-50 text-[8px] text-left">
                                  <p className="font-bold uppercase text-blue-400 mb-0.5 pb-0.5 border-b border-slate-800 leading-none">
                                    {isMethod ? `${getMethodLabelEn(data.method)}` : (language === 'EN' ? `Raw Epoch #${data.id} (Session ${(data.sessionIdx !== undefined ? data.sessionIdx : 0) + 1})` : `Ham Epok #${data.id} (Oturum ${(data.sessionIdx !== undefined ? data.sessionIdx : 0) + 1})`)}
                                  </p>
                                  <div className="space-y-0.5 font-mono">
                                    <div className="flex justify-between gap-2">
                                      <span className="opacity-60 text-[7px] uppercase">{language === 'EN' ? 'ΔE (Easting):' : 'ΔY (Sağa/Easting):'}</span>
                                      <span className="font-bold text-emerald-400">{data.dE.toFixed(4)} m</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                      <span className="opacity-60 text-[7px] uppercase">{language === 'EN' ? 'ΔN (Northing):' : 'ΔX (Yukarı/Northing):'}</span>
                                      <span className="font-bold text-sky-400">{data.dN.toFixed(4)} m</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        
                        <ReferenceLine x={0} stroke="#475569" strokeWidth={1} strokeDasharray="3 3" />
                        <ReferenceLine y={0} stroke="#475569" strokeWidth={1} strokeDasharray="3 3" />
                        
                        {/* Layer 0: Ground Truth Point */}
                        {analysisType === 'precise' && (
                          <Scatter 
                            name={language === 'EN' ? "GROUND TRUTH (REF)" : "KESİN KOORDİNAT (REF)"} 
                            data={[{ dE: 0, dN: 0 }]} 
                            fill="#10b981" 
                            shape="diamond" 
                            line={false}
                          >
                            <Cell fill="#10b981" stroke="#059669" strokeWidth={1.5} />
                          </Scatter>
                        )}

                        {/* Layer 1: Raw Points Cloud */}
                        <Scatter 
                          name={language === 'EN' ? "Raw Satellite Epochs" : "Ham Uydu Epokları"} 
                          data={distributionData.rawPoints} 
                          shape={<RawPointShape r={parseFloat(customDotSize)} />} 
                        >
                          {distributionData.rawPoints.map((entry, index) => {
                            const sessionIdx = entry.sessionIdx !== undefined ? entry.sessionIdx : 0;
                            const color = SESSION_COLORS[sessionIdx % SESSION_COLORS.length];
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={color} 
                                fillOpacity={0.7} 
                              />
                            );
                          })}
                        </Scatter>
                        
                        {/* Layer 2: Method Aggregates */}
                        {distributionData.methodPoints.map((mp) => {
                          const getMethodLabelEn = (m: CalculationMethod) => {
                            const labels: Record<string, string> = {
                              'WEIGHTED_LSE': 'WLSE',
                              'DBSCAN': 'DBSCAN',
                              'HUBER': 'HUBER-M',
                              'HAMPEL': 'HAMPEL-M',
                              'HODGES_LEHMANN': 'HODGES-R',
                              'TUKEYS_TRIMEAN': 'TRIMEAN-L',
                              'OPTIMAL_S': 'OPTIMAL-S'
                            };
                            return labels[m] || m;
                          };
                          return (
                            <Scatter 
                              key={mp.method} 
                              name={getMethodLabelEn(mp.method)} 
                              data={[mp]} 
                              fill={mp.color}
                              shape="circle"
                            />
                          );
                        })}

                        {/* Layer 3: Numeric Labels for Methods */}
                        <Scatter 
                          data={distributionData.methodPoints} 
                          shape={<CustomScatterLabel />} 
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bottom Panel: Shrunk & Very Compact Legend */}
                  <div className="shrink-0 pt-1.5 flex flex-col gap-2 w-full mt-2">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 font-sans">
                      {distributionData.methodPoints.map(m => {
                        const getMethodLabelEn = (m: CalculationMethod) => {
                          const labels: Record<string, string> = {
                            'WEIGHTED_LSE': 'WLSE',
                            'DBSCAN': 'DBSCAN',
                            'HUBER': 'HUBER-M',
                            'HAMPEL': 'HAMPEL-M',
                            'HODGES_LEHMANN': 'HODGES-R',
                            'TUKEYS_TRIMEAN': 'TRIMEAN-L',
                            'OPTIMAL_S': 'OPTIMAL-S'
                          };
                          return labels[m] || m;
                        };
                        const fs = parseFloat(customScatterFontSize);
                        const badgeSize = `${fs + 6.5}px`;
                        const badgeFontSize = `${fs - 0.5}px`;
                        const titleFontSize = `${fs - 1}px`;
                        const subFontSize = `${fs - 2}px`;
                        return (
                          <div key={m.id} className="flex items-center gap-1.5 text-left leading-none min-w-0">
                            <div className="flex items-center justify-center rounded font-black text-white shrink-0 shadow-xs" style={{ backgroundColor: m.color, width: badgeSize, height: badgeSize, fontSize: badgeFontSize }}>{m.id}</div>
                            <div className="min-w-0 font-sans">
                              <p className="font-extrabold text-slate-800 uppercase tracking-tight truncate leading-none" style={{ fontSize: titleFontSize }}>
                                {getMethodLabelEn(m.method)}
                              </p>
                              <p className="font-bold text-blue-600 font-mono tracking-tight leading-none mt-0.5" style={{ fontSize: subFontSize }}>
                                {m.errors?.dhz ? `Δ(2D) = ${m.errors.dhz.toFixed(2)}m` : (language === 'EN' ? 'BARYCENTER' : 'AĞIRLIK MERKEZİ')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {analysisType === 'precise' && (
                        <div className="flex items-center gap-1.5 text-left leading-none min-w-0 font-sans">
                          <div 
                            className="flex items-center justify-center bg-[#10b981] border border-[#059669] text-white font-black shrink-0 shadow-xs rotate-45" 
                            style={{ 
                              width: `${parseFloat(customScatterFontSize) + 2.5}px`, 
                              height: `${parseFloat(customScatterFontSize) + 2.5}px`,
                              borderRadius: '3px',
                              marginLeft: '2px',
                              marginRight: '2px'
                            }}
                          >
                            <span className="text-[6px] font-black -rotate-45 block transform">REF</span>
                          </div>
                          <div className="min-w-0 font-sans">
                            <p className="font-extrabold text-slate-800 uppercase tracking-wider truncate leading-none" style={{ fontSize: `${parseFloat(customScatterFontSize) - 0.5}px` }}>
                              PRECISE
                            </p>
                            <p className="font-bold text-emerald-600 tracking-wider leading-none mt-0.5 truncate" style={{ fontSize: `${parseFloat(customScatterFontSize) - 1.5}px` }}>
                              COORDINATE
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEPARATED SECTION: K-Means Clustering & Robust Outlier Filtering with High-Fidelity Scatter Charts */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t("Aykırı Değer Tespit Grafiği")}
                  </span>
                </div>

                <div className="flex flex-col gap-6">


                  {/* 2. Custom Method Outlier Filtering Scatter Chart */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                          {t("SÜZGEÇ YÖNTEMİ:")}
                        </label>
                        <select
                          className="bg-slate-100 border-2 border-slate-200 text-slate-800 text-[10px] font-extrabold rounded-lg px-2 py-0.5 max-w-[200px] focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                          value={reliabilityPlotMethod}
                          onChange={(e) => setReliabilityPlotMethod(e.target.value as CalculationMethod)}
                        >
                          {methods.map((m) => (
                            <option key={m} value={m}>
                              {getMethodLabel(m)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button 
                        onClick={() => exportChart(reliabilityChartRef, `gps-plus-${reliabilityPlotMethod.toLowerCase()}-reliability`)}
                        type="button"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <i className="fas fa-camera text-emerald-400"></i> {t("DOWNLOAD")}
                      </button>
                    </div>

                    <div 
                      ref={reliabilityChartRef}
                      className="bg-white rounded-[1.5rem] border-2 border-slate-200 p-3.5 pb-2.5 flex flex-col gap-1 text-slate-900 w-full max-w-[500px] h-auto mx-auto relative overflow-hidden font-sans text-left shadow-sm select-none"
                    >
                      {/* Scatter Plot */}
                      <div className="w-full aspect-square relative shrink-0">
                        {hybridClusterChartData && hybridClusterChartData.points.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 8, right: 12, bottom: 12, left: 12 }}>
                              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} stroke="#64748b" horizontal={true} vertical={true} />
                              <XAxis 
                                type="number" 
                                dataKey="dx" 
                                name="ΔE" 
                                domain={[-maxTickLimit + xOffset, maxTickLimit + xOffset]} 
                                ticks={xTicks}
                                interval={0}
                                angle={-90}
                                textAnchor="end"
                                height={48}
                                tickFormatter={(val) => {
                                  const isInteger = Math.abs(val - Math.round(val)) < 0.01;
                                  return isInteger ? `${Math.round(val).toFixed(1)}m` : '';
                                }}
                                tick={{fontSize: parseFloat(customScatterFontSize), fontWeight: 800, fill: '#000000', dy: 2.5, dx: -3}}
                                axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                                tickLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                              />
                              <YAxis 
                                type="number" 
                                dataKey="dy" 
                                name="ΔN" 
                                domain={[-maxTickLimit + yOffset, maxTickLimit + yOffset]} 
                                ticks={yTicks}
                                interval={0}
                                width={50}
                                tickFormatter={(val) => {
                                  const isInteger = Math.abs(val - Math.round(val)) < 0.01;
                                  return isInteger ? `${Math.round(val).toFixed(1)}m` : '';
                                }}
                                tick={{fontSize: parseFloat(customScatterFontSize), fontWeight: 800, fill: '#000000'}} 
                                axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                                tickLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                              />
                              <ZAxis type="number" range={[15, 15]} />
                                <Tooltip 
                                  cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg shadow-xl z-50 text-[8px] text-left">
                                          <p className="font-bold uppercase text-blue-400 mb-0.5 pb-0.5 border-b border-slate-800 leading-none">
                                            {language === 'EN' ? "Epoch" : "Epok"} #{data.id} {data.sessionIdx !== undefined ? `(${language === 'EN' ? 'Session' : 'Oturum'} ${data.sessionIdx + 1})` : ''}
                                          </p>
                                        <div className="space-y-0.5 font-mono">
                                          <div className="flex justify-between gap-2">
                                            <span className="opacity-60 text-[7px] uppercase">{language === 'EN' ? 'Spatial Cluster:' : 'Uzaysal Küme:'}</span>
                                            <span className="font-bold text-indigo-400">{language === 'EN' ? 'Cluster' : 'Küme'} {getClusterLetterLabel(data.clusterId)}</span>
                                          </div>
                                          <div className="flex justify-between gap-2">
                                            <span className="opacity-60 text-[7px] uppercase">{language === 'EN' ? 'ΔE (Easting):' : 'ΔY (Sağa/Easting):'}</span>
                                            <span className="font-bold text-emerald-400">{data.dx.toFixed(4)} m</span>
                                          </div>
                                          <div className="flex justify-between gap-2">
                                            <span className="opacity-60 text-[7px] uppercase">{language === 'EN' ? 'ΔN (Northing):' : 'ΔX (Yukarı/Northing):'}</span>
                                            <span className="font-bold text-sky-400">{data.dy.toFixed(4)} m</span>
                                          </div>
                                          {data.speed !== undefined && data.speed !== null && (
                                            <div className="flex justify-between gap-2">
                                              <span className="opacity-60 text-[7px] uppercase">{language === 'EN' ? 'Epoch Velocity:' : 'Epok Hızı:'}</span>
                                              <span className="font-bold text-amber-400">{data.speed.toFixed(3)} m/s</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between gap-2">
                                            <span className="opacity-60 text-[7px] uppercase">{language === 'EN' ? 'Filter Status:' : 'Süzgeç Durumu:'}</span>
                                            <span className={`font-bold ${data.passedOutlierTest ? 'text-emerald-500' : (data.speedFiltered ? 'text-slate-400' : 'text-rose-500')}`}>
                                              {data.passedOutlierTest 
                                                ? (language === 'EN' ? "PASSED (RELIABLE)" : "UYUMLU (GÜVENİLİR)") 
                                                : (data.speedFiltered 
                                                    ? (language === 'EN' ? "SPEED EXCEEDED (OUTLIER)" : "LİMİT DIŞI HIZ (AYKIRI)") 
                                                    : (language === 'EN' ? "GROSS ERROR (OUTLIER)" : "AYKIRI DEĞER"))}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <ReferenceLine x={0} stroke="#475569" strokeWidth={1} strokeDasharray="3 3" />
                              <ReferenceLine y={0} stroke="#475569" strokeWidth={1} strokeDasharray="3 3" />
                              
                              {/* Reference Point / Ground Truth (REF) */}
                              {analysisType === 'precise' && (
                                <Scatter 
                                  name={language === 'EN' ? "GROUND TRUTH (REF)" : "KESİN KOORDİNAT (REF)"} 
                                  data={[{ dx: 0, dy: 0 }]} 
                                  fill="#10b981" 
                                  shape="diamond" 
                                  line={false}
                                >
                                  <Cell fill="#10b981" stroke="#059669" strokeWidth={1.5} />
                                </Scatter>
                              )}

                              {/* Approved Points Series */}
                              <Scatter 
                                name={language === 'EN' ? "APPROVED" : "UYUMLU ÖLÇÜM"} 
                                data={hybridClusterChartData.points.filter(p => p.passedOutlierTest)} 
                                fill="#10b981"
                                shape={<RawPointShape r={parseFloat(customDotSize)} />}
                                onClick={(pt) => setActiveClusterPointId(pt.id)}
                                className="cursor-pointer"
                              />
                              
                              {/* Rejected/Outlier Points Series - Yöntem (Kırmızı) */}
                              <Scatter 
                                name={language === 'EN' ? "OUTLIERS" : "AYKIRI DEĞERLER"} 
                                data={hybridClusterChartData.points.filter(p => !p.passedOutlierTest)} 
                                fill="#ef4444"
                                shape={<RawPointShape r={parseFloat(customDotSize)} />}
                                onClick={(pt) => setActiveClusterPointId(pt.id)}
                                className="cursor-pointer"
                              />
                            </ScatterChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 font-bold text-xs uppercase tracking-widest">NO DATA FOUND</div>
                        )}
                      </div>

                      {/* Bottom Panel: Shrunk & Very Compact Legend */}
                      <div className="shrink-0 pt-1.5 flex flex-col gap-2 w-full mt-2">
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 font-sans">
                          {(() => {
                            const fs = parseFloat(customScatterFontSize);
                            const badgeSize = `${fs + 6.5}px`;
                            const badgeFontSize = `${fs - 0.5}px`;
                            const titleFontSize = `${fs - 1}px`;
                            const subFontSize = `${fs - 2}px`;
                            const approvedCount = hybridClusterChartData.points.filter(p => p.passedOutlierTest).length;
                            const rejectedCount = hybridClusterChartData.points.filter(p => !p.passedOutlierTest).length;
                            return (
                              <>
                                <div className="flex flex-col gap-0.5 text-left min-w-0 font-sans">
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#10b981]" />
                                    <span className="font-extrabold text-slate-700 uppercase tracking-wider truncate" style={{ fontSize: `${fs - 1.5}px` }}>
                                      {language === 'EN' ? "Approved" : "Uyumlu Ölçüm"}
                                    </span>
                                  </div>
                                  <span className="font-mono font-black text-[#10b981] pl-2.5" style={{ fontSize: `${fs + 1.5}px`, lineHeight: 1 }}>
                                    {approvedCount}
                                  </span>
                                </div>

                                <div className="flex flex-col gap-0.5 text-left min-w-0 font-sans">
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#ef4444]" />
                                    <span className="font-extrabold text-slate-700 uppercase tracking-wider truncate" style={{ fontSize: `${fs - 1.5}px` }}>
                                      {language === 'EN' ? "Outliers" : "Aykırı Değer"}
                                    </span>
                                  </div>
                                  <span className="font-mono font-black text-[#ef4444] pl-2.5" style={{ fontSize: `${fs + 1.5}px`, lineHeight: 1 }}>
                                    {rejectedCount}
                                  </span>
                                </div>

                                {analysisType === 'precise' ? (
                                  <div className="flex flex-col gap-0.5 text-left min-w-0 font-sans">
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 rotate-45 shrink-0 bg-[#10b981]" />
                                      <span className="font-extrabold text-slate-700 uppercase tracking-wider truncate" style={{ fontSize: `${fs - 1.5}px` }}>
                                        {language === 'EN' ? "Reference" : "Referans"}
                                      </span>
                                    </div>
                                    <span className="font-mono font-black text-emerald-600 pl-2.5" style={{ fontSize: `${fs + 1.5}px`, lineHeight: 1 }}>
                                      REF
                                    </span>
                                  </div>
                                ) : (
                                  <div />
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              {/* Technical Analysis Position Error Chart (With 1:1 PNG Export capability) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t("Zamana Bağlı Hata Grafiği")}
                  </span>
                  <button 
                    onClick={() => exportChart(timeErrorChartRef, 'gps-plus-time-error-chart')}
                    type="button"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fas fa-camera text-rose-400"></i> {t("DOWNLOAD")}
                  </button>
                </div>

                {/* Time Series Error Chart Config Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 text-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-start text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                      <i className="fas fa-sliders-h text-[9px]"></i>
                    </div>
                    <span className="font-extrabold text-[9px] uppercase text-slate-700 tracking-wider">{t("ZAMAN SERİSİ GRAFİK AYARLARI")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5 items-center justify-start">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase">{t("Hata Limiti:")}</span>
                      <select 
                        value={customTimeSeriesRange} 
                        onChange={(e) => setCustomTimeSeriesRange(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="auto">{language === 'EN' ? 'Auto' : 'Otomatik'}</option>
                        <option value="1.0">1m</option>
                        <option value="2.0">2m</option>
                        <option value="3.0">3m</option>
                        <option value="4.0">4m</option>
                        <option value="5.0">5m</option>
                        <option value="10.0">10m</option>
                        <option value="15.0">15m</option>
                        <option value="20.0">20m</option>
                        <option value="50.0">50m</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase">{t("Süre Limiti:")}</span>
                      <select 
                        value={timeSeriesDurationLimit} 
                        onChange={(e) => setTimeSeriesDurationLimit(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="15">15s</option>
                        <option value="30">30s</option>
                        <option value="60">60s</option>
                        <option value="90">90s</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase">{t("Kılavuz Adımı:")}</span>
                      <select 
                        value={customTimeSeriesStep} 
                        onChange={(e) => setCustomTimeSeriesStep(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="auto">Auto</option>
                        <option value="0.1">0.1m</option>
                        <option value="0.2">0.2m</option>
                        <option value="0.5">0.5m</option>
                        <option value="1.0">1.0m</option>
                        <option value="2.0">2.0m</option>
                        <option value="5.0">5.0m</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase">{t("Yazı Boyutu:")}</span>
                      <select 
                        value={customTimeSeriesFontSize} 
                        onChange={(e) => setCustomTimeSeriesFontSize(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="6">6px</option>
                        <option value="7">7px</option>
                        <option value="8">8px</option>
                        <option value="9">9px</option>
                        <option value="10">10px</option>
                        <option value="12">12px</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase">{t("Nokta Boyutu:")}</span>
                      <select 
                        value={customTimeSeriesDotSize} 
                        onChange={(e) => setCustomTimeSeriesDotSize(e.target.value)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-[9px] font-black rounded-lg px-2 py-1 outline-none text-slate-800 cursor-pointer transition-all font-mono"
                      >
                        <option value="1.0">1.0px</option>
                        <option value="1.5">1.5px</option>
                        <option value="2.0">2.0px</option>
                        <option value="2.5">2.5px</option>
                        <option value="3.0">3.0px</option>
                        <option value="3.5">3.5px</option>
                        <option value="4.0">4.0px</option>
                        <option value="5.0">5.0px</option>
                        <option value="6.0">6.0px</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Unified Aspect-Ratio Time Series Panel Wrapper (Clean, No Headers/Footers) */}
                <div 
                  ref={timeErrorChartRef}
                  className="bg-white rounded-[1.5rem] border-2 border-slate-200 p-3.5 pb-2.5 flex flex-col gap-1 text-slate-900 w-full max-w-[500px] h-auto mx-auto relative overflow-hidden font-sans text-left shadow-sm select-none"
                >
                  <div className="w-full aspect-square relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesChartData} margin={{ top: 8, right: 12, bottom: 12, left: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} strokeOpacity={0.15} stroke="#000000" />
                        <XAxis 
                          type="number"
                          dataKey="elapsedSeconds" 
                          ticks={timeSeriesXTicks}
                          domain={[1, parseInt(timeSeriesDurationLimit)]}
                          interval={0}
                          angle={-90}
                          textAnchor="end"
                          height={48}
                          tick={{ fontSize: parseFloat(customTimeSeriesFontSize), fontWeight: 800, fill: '#000000', dy: 2.5, dx: -3 }}
                          axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                          tickLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                          tickFormatter={(value) => {
                            const sec = Number(value);
                            if (isNaN(sec)) return String(value);
                            const unit = language === 'EN' ? 's' : 'sn';
                            const maxSec = parseInt(timeSeriesDurationLimit);
                            if (maxSec === 15) {
                              if (sec === 1 || sec % 5 === 0) return `${sec}${unit}`;
                            } else if (maxSec === 30) {
                              if (sec === 1 || sec % 5 === 0) return `${sec}${unit}`;
                            } else if (maxSec === 60) {
                              if (sec === 1 || sec % 10 === 0) return `${sec}${unit}`;
                            } else {
                              if (sec === 1 || sec % 15 === 0) return `${sec}${unit}`;
                            }
                            return "";
                          }}
                        />
                        <YAxis 
                          domain={[0, timeSeriesMaxLimit]} 
                          ticks={timeSeriesYTicks}
                          interval={0}
                          tick={{ fontSize: parseFloat(customTimeSeriesFontSize), fontWeight: 800, fill: '#000000' }} 
                          axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                          tickLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                          width={55} 
                          tickFormatter={(val) => {
                            const isInteger = Math.abs(val - Math.round(val)) < 0.01;
                            return isInteger ? `${Math.round(val).toFixed(1)}m` : '';
                          }}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const data = payload[0].payload;
                            const sIdx = data.sessionIdx !== undefined ? data.sessionIdx : 0;
                            const devValue = data.errorHz !== undefined ? data.errorHz : 0;
                            const elapsed = data.elapsedSeconds !== undefined ? data.elapsedSeconds : 0;
                            const segmentIdx = Math.min(5, Math.floor((elapsed - 1) / 15)) + 1;
                            return (
                              <div className="bg-white border-2 border-slate-200 text-slate-800 p-2.5 rounded-xl shadow-xl text-[10px] font-sans">
                                <p className="font-extrabold text-blue-600 mb-0.5 leading-none">
                                  {language === 'EN' ? `Time: ${elapsed} seconds` : `Zaman: ${elapsed} saniye`}
                                </p>
                                <p className="font-extrabold text-slate-900 mb-1 leading-none">
                                  {language === 'EN' ? `Interval #${segmentIdx} (Session ${sIdx + 1})` : `Aralık #${segmentIdx} (Oturum ${sIdx + 1})`}
                                </p>
                                <div className="h-px bg-slate-100 my-1" />
                                <p className="font-bold text-slate-500 font-mono leading-none">
                                  {language === 'EN' ? 'Deviation:' : 'Sapma:'} <span className="font-black text-slate-800">{devValue.toFixed(3)} m</span>
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="errorHz" 
                          name={language === 'EN' ? "Deviation" : "Yatay Hata"}
                          stroke="#cbd5e1" 
                          strokeWidth={2} 
                          dot={<ColoredDot r={parseFloat(customTimeSeriesDotSize)} />} 
                          activeDot={(props: any) => <ColoredDot {...props} r={parseFloat(customTimeSeriesDotSize) + 1.5} />}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bottom Panel: 15s Interval Legend partitioned into 6 parts (Total 90s) */}
                  <div className="shrink-0 w-full mt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1.5 font-sans">
                      {segmentList.map((segment) => {
                        const sIdx = segment.segmentIdx;
                        const color = segment.color;
                        const count = segment.count;
                        const label = segment.label;
                        
                        const fs = parseFloat(customTimeSeriesFontSize);
                        const titleFontSize = `${fs - 0.5}px`;
                        const subFontSize = `${fs - 1.5}px`;
                        return (
                          <div key={sIdx} className="flex items-center gap-1.5 text-left leading-none min-w-0">
                            <div className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                            <div className="min-w-0 font-sans">
                              <p className="font-extrabold text-slate-800 uppercase tracking-tight truncate leading-none font-sans" style={{ fontSize: titleFontSize }}>
                                {label}
                              </p>
                              <p className="font-bold text-slate-400 font-mono tracking-tight leading-none mt-0.5" style={{ fontSize: subFontSize }}>
                                {count} {language === 'EN' ? "Epoch" : "Epok"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

                <div className="mt-4">
                {analysisType === 'precise' ? (
                  <button 
                    onClick={handleDownloadExcel}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
                  >
                    <i className="fas fa-file-excel"></i>
                    {t("Ölçüm Raporu")}
                  </button>
                ) : (
                  <button 
                    onClick={() => import('./ExcelUtils').then(m => m.downloadTechnicalReport(location!, settings, language))}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
                  >
                    <i className="fas fa-file-excel"></i>
                    {t("Ölçüm Raporu")}
                  </button>
                )}
              </div>


            </div>
          )}
        </div>
      </div>
      </div>
      <GlobalFooter />

      {/* Map Modal */}
      {showMap && location && analysisResults && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in">
            <div className="absolute top-6 left-6 z-[10000] flex gap-3">
              <button 
                onClick={() => setShowMap(false)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-95 transition-all border border-slate-200"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="h-12 px-6 bg-white rounded-2xl flex items-center shadow-2xl border border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">{t("Nokta:")}</p>
                <p className="text-sm font-black text-slate-900">{location.name}</p>
              </div>
            </div>

            {/* Symmetrical Layer Selector on the top-right */}
            <div className="absolute top-6 right-6 z-[10000] flex flex-col items-end gap-2">
              <button 
                onClick={() => {
                  setShowLayerMenu(!showLayerMenu);
                }}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-95 transition-all border border-slate-200 cursor-pointer"
                title={t("Harita Kaynağı")}
              >
                <i className="fas fa-layer-group text-lg"></i>
              </button>
              {showLayerMenu && (
                <div className="bg-white border border-slate-200/80 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1 w-52 text-slate-900 select-none animate-in fade-in slide-in-from-top-2 duration-150 animate-out fade-out">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-1.5 border-b border-slate-100 mb-1 leading-none">{t("Harita Kaynağı")}</p>
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
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <i className={`fas ${currentMapProvider === opt.value ? 'fa-check-circle' : 'fa-circle-notch opacity-30'}`}></i>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <style>
              {`
                .grid-background-fine {
                  background-color: #fcfcfc !important;
                  background-image: 
                    linear-gradient(#e5e7eb 1px, transparent 1px),
                    linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
                    linear-gradient(#d1d5db 1px, transparent 1px),
                    linear-gradient(90deg, #d1d5db 1px, transparent 1px);
                  background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
                }
                .triangle-up {
                  width: 0;
                  height: 0;
                  border-left: 10px solid transparent;
                  border-right: 10px solid transparent;
                  border-bottom: 20px solid #10b981;
                  filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
                }
              `}
            </style>

            <MapContainer 
              center={[location.lat, location.lng]} 
              zoom={mapInfo.maxNativeZoom} 
              maxZoom={22}
              style={{ height: '100%', width: '100%' }}
              className="grid-background-fine"
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
              
              {/* Raw Samples Cloud (Filtered by Accuracy Limit) */}
              {location.samples?.filter(s => s.accuracy <= (location.accuracyLimit || 5.0)).map((s, idx) => {
                return (
                  <Marker 
                    key={`raw-${idx}`}
                    position={[s.lat, s.lng]} 
                    icon={L.divIcon({
                      className: 'raw-marker',
                      html: `<div style="width: 6px; height: 6px; background: #9333ea; border: 1px solid white; border-radius: 50%; box-shadow: 0 0 3px rgba(147, 51, 234, 0.61);"></div>`,
                      iconSize: [6, 6],
                      iconAnchor: [3, 3]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{t("Ham Ölçüm (Güvenilir)")} #{idx+1}</p>
                        <p className="text-xs font-bold font-mono">{t("Hass:")} ±{s.accuracy.toFixed(2)}m</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Ground Truth IF Precise */}
              {analysisType === 'precise' && preciseWgs && (
                <Marker 
                  position={preciseWgs} 
                  icon={L.divIcon({
                    className: 'precise-marker',
                    html: `<div class="triangle-up"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 15]
                  })}
                >
                  <Popup>
                    <div className="p-2 text-center">
                      <p className="text-xs font-black text-emerald-600 mb-1">{t("KESİN KOORDİNAT (REFERANS)")}</p>
                      <p className="text-[10px] font-bold text-slate-500">{t("Nirengi Noktası (Referans)")}</p>
                      <p className="text-[9px] font-mono mt-1">
                        {useLocal ? `N: ${appliedPreciseN} \nE: ${appliedPreciseE}` : `Lat: ${appliedPreciseN} \nLng: ${appliedPreciseE}`}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Algorithm Results */}
              {analysisResults.map((res, index) => {
                return (
                  <Marker 
                    key={res.method}
                    position={[res.lat, res.lng]} 
                    icon={L.divIcon({
                      className: 'method-marker',
                      html: `<div style="width: 22px; height: 22px; background: ${METHOD_COLORS[res.method]}; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-center; color: white; font-size: 11px; font-weight: 900; line-height: 1;">${index + 1}</div>`,
                      iconSize: [22, 22],
                      iconAnchor: [11, 11]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="text-[10px] font-black uppercase mb-1" style={{ color: METHOD_COLORS[res.method] }}>
                          {index + 1}. {getMethodLabel(res.method as any)}
                        </p>
                        <p className="text-xs font-bold font-mono">
                          Y: {res.calculated.x.toFixed(useLocal ? 3 : 8)}<br/>
                          X: {res.calculated.y.toFixed(useLocal ? 3 : 8)}
                        </p>
                        {res.errors && (
                           <p className="mt-1 text-[9px] font-black text-emerald-600 uppercase border-t border-slate-100 pt-1">
                             {t("Sapma")}: {res.errors.dhz.toFixed(3)}m
                           </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <MapSetBounds points={[
                ...location.samples!.filter(s => s.accuracy <= (location.accuracyLimit || 5.0)).map(s => [s.lat, s.lng] as [number, number]),
                ...analysisResults.map(r => [r.lat, r.lng] as [number, number]),
                ...(analysisType === 'precise' && preciseWgs ? [preciseWgs] : [])
              ]} />
              <MapResizer />
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute bottom-6 right-6 z-[10000] w-[120px]">
              <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-slate-100">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b pb-1">{t("Lejant")}</p>
                <div className="space-y-1.5">
                  {analysisType === 'precise' && (
                    <div className="flex items-center gap-2">
                      <div className="triangle-up" style={{ transform: 'scale(0.3)', marginBottom: '-12px', marginLeft: '-6px' }}></div>
                      <span className="text-[8px] font-black text-emerald-600 uppercase">REF.</span>
                    </div>
                  )}
                  {analysisResults.map((res, idx) => (
                    <div key={res.method} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0" style={{ backgroundColor: METHOD_COLORS[res.method] }}>
                        {idx + 1}
                      </div>
                      <span className="text-[8px] font-black text-slate-600 truncate">{getMethodLabel(res.method as any)}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1 border-t">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                    <span className="text-[7px] font-bold text-slate-400 uppercase">{t("HAM VERİ")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DataAnalysisView;
