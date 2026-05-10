import * as XLSX from 'xlsx';
import { SavedLocation, AppSettings, CalculationMethod } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { calculateResult, calculateVariance } from '../utils/MathUtils';
import { FULL_BRAND } from '../version';
import { getCorrectedHeight, getEllipsoidalHeight } from './GeoidUtils';
import { geoidService } from '../services/GeoidService';

const getMethodName = (m: CalculationMethod) => {
  switch(m) {
    case 'ARITHMETIC_MEAN': return "Aritmetik Ortalama";
    case 'LEAST_SQUARES': return "En Küçük Kareler";
    case 'ROBUST': return "Robust Yöntem";
    case 'MAHALANOBIS': return "Mahalanobis Analizi";
    case 'DBSCAN': return "DBSCAN Kümeleme";
    case 'RANSAC': return "RANSAC (Konsensüs)";
    case 'KDE': return "KDE (Yoğunluk)";
    case 'MEDIAN_MAD': return "Median + MAD (Sağlam Sapma)";
    default: return m;
  }
};

export const downloadExcel = (locations: SavedLocation[], settings?: AppSettings) => {
  if (locations.length === 0) {
    alert("Kayıt bulunamadı.");
    return;
  }

  const locPrecision = settings?.locationPrecision ?? 1;
  const heightPrecision = settings?.heightPrecision ?? 2;
  const heightType = settings?.heightType ?? 'orthometric';

  const uniqueFolders = Array.from(new Set(locations.map(l => l.folderName)));
  const projectName = uniqueFolders.length === 1 ? uniqueFolders[0] : "Çoklu Proje Seçimi";
  
  let projectSystem = "Muhtelif";
  if (uniqueFolders.length === 1) {
     projectSystem = locations[0].coordinateSystem || 'WGS84';
  }

  const isWGS84 = projectSystem === 'WGS84';
  const header1 = isWGS84 ? "Enlem" : "Sağa (Y)";
  const header2 = isWGS84 ? "Boylam" : "Yukarı (X)";

  const dataRows = locations.map(loc => {
    const { x, y } = convertCoordinate(loc.lat, loc.lng, loc.coordinateSystem || 'WGS84');
    
    const val1 = isWGS84 ? y.toFixed(6) : x.toFixed(locPrecision);
    const val2 = isWGS84 ? x.toFixed(6) : y.toFixed(locPrecision);
    
    const correctedH = getCorrectedHeight(loc.lat, loc.lng, loc.altitude);
    const orthometricH = correctedH !== null ? correctedH.toFixed(heightPrecision) : '---';
    
    const ellipVal = getEllipsoidalHeight(loc.lat, loc.lng, loc.altitude);
    const ellipsoidalH = ellipVal !== null ? ellipVal.toFixed(heightPrecision) : '---';
    
    let undulationVal = '---';
    if (ellipVal !== null && correctedH !== null) {
      undulationVal = (ellipVal - correctedH).toFixed(heightPrecision);
    }

    const accuracy = loc.accuracy.toFixed(2);
    const duration = (loc.measurementDuration || 0).toString();

    const displayHeight = heightType === 'orthometric' ? orthometricH : ellipsoidalH;

    return [
      loc.name,
      val1, // Sağa (Y) veya Enlem
      val2, // Yukarı (X) veya Boylam
      orthometricH,
      ellipsoidalH,
      undulationVal,
      accuracy,
      duration,
      new Date(loc.timestamp).toLocaleString('tr-TR')
    ];
  });

  const ws_data = [
    ["Proje Adı:", projectName],
    ["Koordinat Sistemi:", projectSystem],
    [], 
    ["Nokta İsmi", header1, header2, "Yükseklik (m)", "Elipsoidal Yükseklik (m)", "Ondülasyon (m)", "Hassasiyet (m)", "Gözlem Süresi (sn)", "Tarih"],
    ...dataRows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  
  const wscols = [
    { wch: 15 }, // Nokta İsmi
    { wch: 18 }, // Sağa (Y) / Enlem
    { wch: 18 }, // Yukarı (X) / Boylam
    { wch: 20 }, // Ortometrik Yükseklik
    { wch: 20 }, // Elipsoidal Yükseklik
    { wch: 15 }, // Ondülasyon
    { wch: 15 }, // Hassasiyet
    { wch: 18 }, // Gözlem Süresi
    { wch: 20 }, // Tarih
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Saha Verileri");

  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');
  const fileName = `GPS_${projectName}_${dateStr}_${timeStr}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
};

export const downloadTechnicalReport = (location: SavedLocation, settings?: AppSettings) => {
  if (!location.samples || location.samples.length === 0) {
    alert("Bu noktaya ait ham veri (örneklem) bulunamadı. Teknik rapor sadece yeni ölçülen noktalar için oluşturulabilir.");
    return;
  }

  const locPrecision = settings?.locationPrecision ?? 1;
  const heightPrecision = settings?.heightPrecision ?? 2;
  const isOrthometricSetting = settings?.heightType === 'orthometric';

  const sys = location.coordinateSystem || 'WGS84';
  const isWGS84 = sys === 'WGS84';
  const header1 = isWGS84 ? "Enlem" : "Sağa (Y)";
  const header2 = isWGS84 ? "Boylam" : "Yukarı (X)";

  // --- İstatistiksel Ön Hazırlık ---
  const accuracyLimit = location.accuracyLimit || 5.0;
  
  const methods: CalculationMethod[] = ['ARITHMETIC_MEAN', 'LEAST_SQUARES', 'ROBUST', 'MAHALANOBIS', 'DBSCAN', 'RANSAC', 'KDE', 'MEDIAN_MAD'];
  const methodResults = methods.map(method => {
    const { result, usedIndices } = calculateResult(location.samples!, method, accuracyLimit);
    const { x, y } = convertCoordinate(result.lat, result.lng, sys);
    
    // Calculate variance for the method
    const usedSamples = usedIndices.map(i => location.samples![i]);
    const variance = calculateVariance(usedSamples, result);
    
    const resEllip = getEllipsoidalHeight(result.lat, result.lng, result.altitude);

    return {
      method,
      x: isWGS84 ? result.lat : x,
      y: isWGS84 ? result.lng : y,
      z: isOrthometricSetting ? getCorrectedHeight(result.lat, result.lng, result.altitude) : resEllip,
      usedCount: usedIndices.length,
      accuracy: result.accuracy,
      variance: variance
    };
  });

  // --- Gözlem Süresi Analizi (5, 10, 15, 30, 60 sn) ---
  const possibleIntervals = [5, 10, 15, 30, 60];
  const actualDuration = location.measurementDuration || 0;
  const analysisIntervals = possibleIntervals.filter(i => i < actualDuration);
  
  const intervalAnalysisRows: any[][] = [];
  
  analysisIntervals.forEach(interval => {
    const startTime = location.samples![0].timestamp;
    const sliceSamples = location.samples!.filter(s => s.timestamp <= startTime + (interval * 1000) + 500); // +500ms to be safe with timing
    
    if (sliceSamples.length < 2) return;

    const sliceResults = methods.map(method => {
      const { result, usedIndices } = calculateResult(sliceSamples, method, accuracyLimit);
      const { x, y } = convertCoordinate(result.lat, result.lng, sys);
      const usedSamples = usedIndices.map(i => sliceSamples[i]);
      const variance = calculateVariance(usedSamples, result);
      const resEllip = getEllipsoidalHeight(result.lat, result.lng, result.altitude);

      return {
        method,
        x: isWGS84 ? result.lat : x,
        y: isWGS84 ? result.lng : y,
        z: isOrthometricSetting ? getCorrectedHeight(result.lat, result.lng, result.altitude) : resEllip,
        usedCount: usedIndices.length,
        accuracy: result.accuracy,
        variance: variance
      };
    });

    intervalAnalysisRows.push([]);
    intervalAnalysisRows.push([`GÖZLEM SÜRESİ ETKİ ANALİZİ - İLK ${interval} SANİYE`]);
    intervalAnalysisRows.push(["Yöntem", header1, header2, isOrthometricSetting ? "Yükseklik (m)" : "Elipsoidal Yükseklik (m)", "Kullanılan Örnek", "Hassasiyet (m)", "Varyans (m²)"]);
    
    sliceResults.forEach(res => {
      intervalAnalysisRows.push([
        getMethodName(res.method),
        isWGS84 ? res.x.toFixed(8) : res.x.toFixed(locPrecision),
        isWGS84 ? res.y.toFixed(8) : res.y.toFixed(locPrecision),
        res.z !== null ? res.z.toFixed(heightPrecision) : '---',
        `${res.usedCount} / ${sliceSamples.length}`,
        res.accuracy.toFixed(3),
        res.variance.toFixed(6)
      ]);
    });
  });

  const dataRows = location.samples.map((s, idx) => {
    const { x, y } = convertCoordinate(s.lat, s.lng, sys);
    const val1 = isWGS84 ? s.lat.toFixed(8) : x.toFixed(locPrecision);
    const val2 = isWGS84 ? s.lng.toFixed(8) : y.toFixed(locPrecision);
    
    let status = "Kullanıldı";
    if (s.accuracy > accuracyLimit) {
      status = `Düşük Hass. (> ${accuracyLimit}m)`;
    }

    const hValue = isOrthometricSetting 
      ? getCorrectedHeight(s.lat, s.lng, s.altitude) 
      : getEllipsoidalHeight(s.lat, s.lng, s.altitude);

    return [
      idx + 1,
      new Date(s.timestamp).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      val1,
      val2,
      hValue !== null ? hValue.toFixed(heightPrecision) : '---',
      s.accuracy.toFixed(2),
      s.altitudeAccuracy !== null ? s.altitudeAccuracy.toFixed(2) : '---',
      status
    ];
  });

  const ws_data = [
    ["ÖLÇÜM RAPORU"],
    ["Nokta Adı:", location.name],
    ["Proje Adı:", location.folderName],
    ["Koordinat Sistemi:", sys],
    ["Ölçüm Süresi:", `${location.measurementDuration || 0} sn`],
    ["Hassasiyet Eşiği:", `${accuracyLimit} m`],
    ["Toplam Örnek Sayısı:", location.samples.length],
    [],
    ["No", "Saat", header1, header2, isOrthometricSetting ? "Yükseklik (m)" : "Elipsoidal Yükseklik (m)", "Hassasiyet (m)", "Dikey Hass. (m)", "Durum"],
    ...dataRows,
    [],
    ["ANLİZ YÖNTEMLERİ KARŞILAŞTIRMALI SONUÇLAR"],
    ["Yöntem", header1, header2, isOrthometricSetting ? "Yükseklik (m)" : "Elipsoidal Yükseklik (m)", "Kullanılan Örnek", "Hassasiyet (m)", "Varyans (m²)"],
    ...methodResults.map(res => [
      getMethodName(res.method),
      isWGS84 ? res.x.toFixed(8) : res.x.toFixed(locPrecision),
      isWGS84 ? res.y.toFixed(8) : res.y.toFixed(locPrecision),
      res.z !== null ? res.z.toFixed(heightPrecision) : '---',
      `${res.usedCount} / ${location.samples!.length}`,
      res.accuracy.toFixed(3),
      res.variance.toFixed(6)
    ]),
    ...intervalAnalysisRows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // Saat
    { wch: 20 }, // Val1
    { wch: 20 }, // Val2
    { wch: 15 }, // Yükseklik
    { wch: 15 }, // Hassasiyet
    { wch: 15 }, // Dikey Hass
    { wch: 20 }, // Durum
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ham Veriler");
  
  const fileName = `Olcum_Raporu_${location.name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};