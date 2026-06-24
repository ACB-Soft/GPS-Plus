import * as XLSX from 'xlsx';
import { SavedLocation, AppSettings, CalculationMethod, Coordinate } from '../types';
import { convertCoordinate, getSystemDisplayLabel, getWGS84Coefficients } from '../utils/CoordinateUtils';
import { calculateResult, calculateVariance, calculateMaxDistance } from '../utils/MathUtils';
import { FULL_BRAND } from '../version';
import { getCorrectedHeight, getEllipsoidalHeight } from './GeoidUtils';
import { geoidService } from '../services/GeoidService';

const getMethodName = (m: CalculationMethod) => {
  switch(m) {
    case 'WEIGHTED_LSE': return "WLSE";
    case 'DBSCAN': return "DBSCAN";
    case 'HUBER': return "HUBER-M";
    case 'HAMPEL': return "HAMPEL-M";
    case 'HODGES_LEHMANN': return "HODGES-R";
    case 'TUKEYS_TRIMEAN': return "TRIMEAN-L";
    case 'OPTIMAL_S': return "OPTIMAL-S";
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
  let projectZone = "---";
  if (uniqueFolders.length === 1) {
     projectSystem = locations[0].coordinateSystem || 'WGS84';
     const { zone } = convertCoordinate(locations[0].lat, locations[0].lng, projectSystem);
     projectZone = zone || "---";
  }

  const isWGS84 = projectSystem === 'WGS84';
  const header1 = isWGS84 ? "Enlem" : "Sağa (Y)";
  const header2 = isWGS84 ? "Boylam" : "Yukarı (X)";

  const dataRows = locations.map(loc => {
    const { x, y } = convertCoordinate(loc.lat, loc.lng, loc.coordinateSystem || 'WGS84');
    
    const val1 = x.toFixed(2);
    const val2 = y.toFixed(2);
    
    const correctedH = getCorrectedHeight(loc.lat, loc.lng, loc.altitude, loc.deviceOS);
    const orthometricH = correctedH !== null ? correctedH.toFixed(2) : '---';
    
    const ellipVal = getEllipsoidalHeight(loc.lat, loc.lng, loc.altitude, loc.deviceOS);
    const ellipsoidalH = ellipVal !== null ? ellipVal.toFixed(2) : '---';
    
    let undulationVal = '---';
    if (ellipVal !== null && correctedH !== null) {
      undulationVal = (ellipVal - correctedH).toFixed(2);
    }

    const accuracy = loc.accuracy.toFixed(2);
    const duration = (loc.measurementDuration || 0).toString();

    let reliabilityLabel = "";
    const samples = loc.samples || [];
    const avgSensorAcc = samples.length > 0 
      ? samples.reduce((a, b) => a + b.accuracy, 0) / samples.length 
      : loc.accuracy;
    const maxSpread = samples.length >= 2 ? calculateMaxDistance(samples) : 0;
    const samplesCount = samples.length;

    // 1. GÜVENSİZ VERİ (LOW / RED): Donanımsal Hassasiyet > 20m VEYA Veri Saçılımı > 20m VEYA Veri Saçılımı > Donanımsal Hassasiyet * 3
    if (avgSensorAcc > 20 || maxSpread > 20 || maxSpread > avgSensorAcc * 3) {
      reliabilityLabel = "GÜVENSİZ";
    }
    // 2. GÜVENİLİR VERİ (HIGH / GREEN): Donanımsal Hassasiyet <= 5m VE Veri Saçılımı <= 5m VE Veri Sayısı >= 15 VE Veri Saçılımı <= Donanımsal Hassasiyet
    else if (avgSensorAcc <= 5 && maxSpread <= 5 && samplesCount >= 15 && maxSpread <= avgSensorAcc) {
      reliabilityLabel = "GÜVENLİ";
    }
    // 3. ORTA GÜVENLİ VERİ / VERİ AZ (MEDIUM / ORANGE)
    else {
      reliabilityLabel = "ORTA GÜVEN";
    }

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
      reliabilityLabel,
      new Date(loc.timestamp).toLocaleString('tr-TR')
    ];
  });

  const ws_data = [
    ["Proje Adı:", projectName],
    ["Koordinat Sistemi:", getSystemDisplayLabel(projectSystem)],
    ["Dilim Numarası:", projectZone],
    [], 
    ["Nokta İsmi", header1, header2, "Yükseklik (m)", "Elipsoidal Yükseklik (m)", "Ondülasyon (m)", "Hassasiyet (m)", "Gözlem Süresi (sn)", "Güvenilirlik", "Tarih"],
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
    { wch: 18 }, // Güvenilirlik
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

export const getTechnicalReportWorksheet = (location: SavedLocation, settings?: AppSettings, language?: 'TR' | 'EN') => {
  if (!location.samples || location.samples.length === 0) {
    return null;
  }

  const txt = (tr: string, en: string) => language === 'EN' ? en : tr;

  const locPrecision = settings?.locationPrecision ?? 1;
  const heightPrecision = settings?.heightPrecision ?? 2;
  const isOrthometricSetting = settings?.heightType === 'orthometric';

  const sys = location.coordinateSystem || 'WGS84';
  const isWGS84 = sys === 'WGS84';
  const header1 = isWGS84 ? txt("Enlem", "Latitude") : txt("Sağa (Y)", "Easting (Y)");
  const header2 = isWGS84 ? txt("Boylam", "Longitude") : txt("Yukarı (X)", "Northing (X)");

  // --- İstatistiksel Ön Hazırlık ---
  const accuracyLimit = location.accuracyLimit || 5.0;
  
  const methods: CalculationMethod[] = [
    'WEIGHTED_LSE', 
    'DBSCAN',
    'HUBER',
    'HAMPEL',
    'HODGES_LEHMANN',
    'TUKEYS_TRIMEAN',
    'OPTIMAL_S'
  ];
  const methodResults = methods.map(method => {
    const { result, usedIndices } = calculateResult(location.samples!, method, accuracyLimit);
    const { x, y } = convertCoordinate(result.lat, result.lng, sys);
    
    // Calculate variance for the method
    const usedSamples = usedIndices.map(i => location.samples![i]);
    const variance = calculateVariance(usedSamples, result);
    
    const resEllip = getEllipsoidalHeight(result.lat, result.lng, result.altitude, location.deviceOS);

    return {
      method,
      x: isWGS84 ? result.lat : x,
      y: isWGS84 ? result.lng : y,
      z: isOrthometricSetting ? getCorrectedHeight(result.lat, result.lng, result.altitude, location.deviceOS) : resEllip,
      usedCount: usedIndices.length,
      accuracy: result.accuracy,
      variance: variance
    };
  });

  const rawList = location.rawSamples && location.rawSamples.length > 0 ? location.rawSamples : (location.samples || []);

  const dataRows = rawList.map((s, idx) => {
    const { x, y } = convertCoordinate(s.lat, s.lng, sys);
    const val1 = isWGS84 ? s.lat.toFixed(5) : x.toFixed(3);
    const val2 = isWGS84 ? s.lng.toFixed(5) : y.toFixed(3);

    const hValue = isOrthometricSetting 
      ? getCorrectedHeight(s.lat, s.lng, s.altitude, s.deviceOS || location.deviceOS) 
      : getEllipsoidalHeight(s.lat, s.lng, s.altitude, s.deviceOS || location.deviceOS);

    const speedVal = s.speed !== null && s.speed !== undefined ? s.speed.toFixed(2) : '---';
    const headingVal = s.heading !== null && s.heading !== undefined ? s.heading.toFixed(1) : '---';

    const accelXVal = s.accelX !== null && s.accelX !== undefined ? s.accelX.toFixed(3) : '---';
    const accelYVal = s.accelY !== null && s.accelY !== undefined ? s.accelY.toFixed(3) : '---';
    const accelZVal = s.accelZ !== null && s.accelZ !== undefined ? s.accelZ.toFixed(3) : '---';
    const gyroAVal = s.gyroAlpha !== null && s.gyroAlpha !== undefined ? s.gyroAlpha.toFixed(2) : '---';
    const gyroBVal = s.gyroBeta !== null && s.gyroBeta !== undefined ? s.gyroBeta.toFixed(2) : '---';
    const gyroGVal = s.gyroGamma !== null && s.gyroGamma !== undefined ? s.gyroGamma.toFixed(2) : '---';

    return [
      idx + 1,
      new Date(s.timestamp).toLocaleTimeString(language === 'EN' ? 'en-US' : 'tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      val1,
      val2,
      hValue !== null ? hValue.toFixed(3) : '---',
      s.accuracy.toFixed(3),
      s.altitudeAccuracy !== null ? s.altitudeAccuracy.toFixed(3) : '---',
      speedVal,
      headingVal,
      accelXVal,
      accelYVal,
      accelZVal,
      gyroAVal,
      gyroBVal,
      gyroGVal,
      s.sessionId !== undefined ? s.sessionId : 1
    ];
  });

  // --- Sinyal Güvenilirlik (Multipath) Analizi ---
  const samplesList = location.samples || [];
  const maxSpreadAll = samplesList.length >= 2 ? calculateMaxDistance(samplesList) : 0;
  const avgAccAll = samplesList.length > 0 
    ? samplesList.reduce((a, b) => a + b.accuracy, 0) / samplesList.length 
    : location.accuracy;
  const samplesCount = samplesList.length;
  const spreadRatio = maxSpreadAll / (avgAccAll || 0.1);

  // Standart sapma (StdDev) hesabı
  let stdDevAll = 0;
  if (samplesList.length >= 2) {
    const meanLat = samplesList.reduce((a, b) => a + b.lat, 0) / samplesList.length;
    const meanLng = samplesList.reduce((a, b) => a + b.lng, 0) / samplesList.length;
    const { latCoeff, lngCoeff } = getWGS84Coefficients(meanLat);
    const residuals = samplesList.map(s => {
      const dLat = (s.lat - meanLat) * latCoeff;
      const dLng = (s.lng - meanLng) * lngCoeff;
      return dLat * dLat + dLng * dLng;
    });
    const sampleVariance = residuals.reduce((a, b) => a + b, 0) / Math.max(1, samplesList.length - 1);
    stdDevAll = Math.sqrt(sampleVariance);
  }

  // 1. GÜVENSİZ VERİ (KIRMIZI): Donanımsal Hassasiyet > 20m VEYA Veri Saçılımı > 20m VEYA Veri Saçılımı > Donanımsal Hassasiyet * 3
  const isRed = avgAccAll > 20 || maxSpreadAll > 20 || maxSpreadAll > avgAccAll * 3;

  // 2. GÜVENİLİR VERİ (YEŞİL): Donanımsal Hassasiyet <= 5m VE Veri Saçılımı <= 5m VE Veri Sayısı >= 15 VE Veri Saçılımı <= Donanımsal Hassasiyet
  const isGreen = !isRed && avgAccAll <= 5 && maxSpreadAll <= 5 && samplesCount >= 15 && maxSpreadAll <= avgAccAll;

  let relLevel = "";

  if (isRed) {
    relLevel = txt("Güvensiz Veri", "Low-Integrity Data");
  } else if (isGreen) {
    relLevel = txt("Güvenli Veri", "High-Integrity Data");
  } else {
    relLevel = txt("Orta Güvenli Veri", "Medium-Integrity Data");
  }

  const heightHeader = isOrthometricSetting ? txt("Yükseklik (m)", "Height (m)") : txt("Elipsoidal Yükseklik (m)", "Ellipsoidal Height (m)");

  const ws_data = [
    [txt("Nokta Adı:", "Point Name:"), location.name],
    [txt("Proje Adı:", "Project Name:"), location.folderName],
    [txt("Koordinat Sistemi:", "Coordinate Reference System (CRS):"), getSystemDisplayLabel(sys)],
    [txt("Dilim Numarası:", "Grid Projection Zone:"), convertCoordinate(location.lat, location.lng, sys).zone || "---"],
    [txt("Ölçüm Süresi:", "Observation Duration:"), `${location.measurementDuration || 0} ${txt("sn", "sec")}`],
    [txt("Hassasiyet Eşiği:", "Pre-Filtering Accuracy Threshold:"), `${accuracyLimit.toFixed(2)} m`],
    [txt("Sinyal Güvenilirliği:", "Signal Quality & Integrity:"), relLevel],
    [txt("Standart Sapma:", "Standard Deviation:"), `${stdDevAll.toFixed(3)} m`],
    [txt("Maksimum Yayılım (Spread):", "Maximum Spatial Dispersion (Spread):"), `${maxSpreadAll.toFixed(2)} m`],
    [txt("Ortalama Sensör Hassasiyeti:", "Mean Hardware-Estimated Accuracy (1σ):"), `${avgAccAll.toFixed(2)} m`],
    [txt("Yayılım / Hassasiyet Oranı:", "Dispersion-to-Accuracy Ratio:"), spreadRatio.toFixed(2)],
    [],
    ["No", txt("Saat", "Time (Local)"), header1, header2, heightHeader, txt("Hassasiyet (m)", "Horizontal Accuracy (m)"), txt("Dikey Hass. (m)", "Vertical Accuracy (m)"), txt("Hız (m/s)", "Velocity (m/s)"), txt("Yön (Derece)", "Heading (Deg)"), txt("İvme X (m/s²)", "Linear Accel X (m/s²)"), txt("İvme Y (m/s²)", "Linear Accel Y (m/s²)"), txt("İvme Z (m/s²)", "Linear Accel Z (m/s²)"), txt("Yönelim Alpha (°)", "Orientation Alpha (°)"), txt("Eğim Beta (°)", "Roll Beta (°_office)"), txt("Eğim Gamma (°)", "Pitch Gamma (°_office)"), txt("Oturum", "Session No")],
    ...dataRows,
    [],
    [txt("ANALİZ YÖNTEMLERİ KARŞILAŞTIRMALI SONUÇLAR", "COMPARATIVE ANALYSIS OF ROBUST ESTIMATION METHODS")],
    [txt("Yöntem", "Estimation Algorithm"), header1, header2, heightHeader, txt("Kullanılan Örnek", "Epochs Utilized"), txt("Hassasiyet (m)", "Horizontal Accuracy (m)"), txt("Varyans (m²)", "Spatial Variance (m²)")],
    ...methodResults.map(res => [
      getMethodName(res.method),
      res.x.toFixed(isWGS84 ? 7 : 3),
      res.y.toFixed(isWGS84 ? 7 : 3),
      res.z !== null ? res.z.toFixed(3) : '---',
      `${res.usedCount} / ${location.samples!.length}`,
      res.accuracy.toFixed(3),
      res.variance.toFixed(4)
    ])
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
    { wch: 12 }, // Hız
    { wch: 12 }, // Yön
    { wch: 14 }, // İvme X
    { wch: 14 }, // İvme Y
    { wch: 14 }, // İvme Z
    { wch: 18 }, // Alpha
    { wch: 14 }, // Beta
    { wch: 14 }, // Gamma
    { wch: 12 }  // Oturum
  ];

  return worksheet;
};

export const downloadTechnicalReport = (location: SavedLocation, settings?: AppSettings, language?: 'TR' | 'EN') => {
  const worksheet = getTechnicalReportWorksheet(location, settings, language);
  if (!worksheet) {
    alert(language === 'EN' ? "No raw data (samples) found for this point. Survey report can only be generated for newly measured points." : "Bu noktaya ait ham veri (örneklem) bulunamadı. Teknik rapor sadece yeni ölçülen noktalar için oluşturulabilir.");
    return;
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "RAW");
  
  const prefixName = language === 'EN' ? 'Report' : 'Rapor';
  const fileName = `${prefixName}_${location.name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};



export const downloadCombinedAnalysisReport = (
  location: SavedLocation, 
  preciseCoords: { x: number, y: number, z: number, isWgs84: boolean },
  results: any[],
  settings?: AppSettings,
  language?: 'TR' | 'EN'
) => {
  const workbook = XLSX.utils.book_new();

  const txt = (tr: string, en: string) => language === 'EN' ? en : tr;

  const locPrecision = settings?.locationPrecision ?? 1;
  const heightPrecision = settings?.heightPrecision ?? 2;
  const isOrthometric = settings?.heightType === 'orthometric';
  const sys = location.coordinateSystem || 'WGS84';
  const isWgsPoint = sys === 'WGS84';

  // --- SAYFA 1: İSTATİSTİKSEL YÖNTEM ANALİZLERİ ÖLÇÜM RAPORU (HAM VERİ & İSTATİSTİKLER) ---
  const wsRaw = getTechnicalReportWorksheet(location, settings, language);
  if (wsRaw) {
    XLSX.utils.book_append_sheet(workbook, wsRaw, "RAW");
  }

  // --- SAYFA 2: İSTATİSTİKSEL ANALİZ VE AR-GE SONUÇLARI ---
  const calculationMethod = location.calculationMethod || 'WEIGHTED_LSE';
  const bestMethod = results.sort((a,b) => a.errors.dhz - b.errors.dhz)[0];
  const accuracyLimit = location.accuracyLimit || 5.0;

  // --- Veri Saçılımı ve Güvenilirlik Hesapları ---
  const samplesList = location.samples || [];
  let maxSpreadAll = 0;
  let avgAccAll = 0;
  let stdDevValue = 0;
  let signalQualityLabel = txt("BİLİNMİYOR", "UNKNOWN");
  let interpretation = txt("Yetersiz örneklem.", "Insufficient samples.");

  if (samplesList.length >= 1) {
    maxSpreadAll = samplesList.length >= 2 ? calculateMaxDistance(samplesList) : 0;
    avgAccAll = samplesList.reduce((a, b) => a + b.accuracy, 0) / samplesList.length;
    
    // Standart sapma (StdDev) hesabı
    const meanLat = samplesList.reduce((a, b) => a + b.lat, 0) / samplesList.length;
    const meanLng = samplesList.reduce((a, b) => a + b.lng, 0) / samplesList.length;
    const { latCoeff, lngCoeff } = getWGS84Coefficients(meanLat);
    const residuals = samplesList.map(s => {
      const dLat = (s.lat - meanLat) * latCoeff;
      const dLng = (s.lng - meanLng) * lngCoeff;
      return dLat * dLat + dLng * dLng;
    });
    const varianceValue = residuals.reduce((a, b) => a + b, 0) / Math.max(1, samplesList.length - 1);
    stdDevValue = Math.sqrt(varianceValue);

    const samplesCount = samplesList.length;

    // 1. GÜVENSİZ VERİ (KIRMIZI): Donanımsal Hassasiyet > 20m VEYA Veri Saçılımı > 20m VEYA Veri Saçılımı > Donanımsal Hassasiyet * 3
    const isRed = avgAccAll > 20 || maxSpreadAll > 20 || maxSpreadAll > avgAccAll * 3;

    // 2. GÜVENİLİR VERİ (YEŞİL): Donanımsal Hassasiyet <= 5m VE Veri Saçılımı <= 5m VE Veri Sayısı >= 15 VE Veri Saçılımı <= Donanımsal Hassasiyet
    const isGreen = !isRed && avgAccAll <= 5 && maxSpreadAll <= 5 && samplesCount >= 15 && maxSpreadAll <= avgAccAll;

    if (isRed) {
      signalQualityLabel = txt("Güvensiz Veri (Kırmızı Sinyal)", "Low-Integrity Data (Red Signal)");
      interpretation = txt(
        "Veriler yüksek oranda sapmalı ve güvensizdir. Kriterler: Donanımsal Hassasiyet > 20m, Veri Saçılımı > 20m veya Veri Saçılımı > Donanımsal Hassasiyet * 3",
        "GNSS observations exhibit severe spatial drift and high variance. Classification Criteria: Hardware accuracy > 20m, 2D spatial dispersion > 20m, or spatial dispersion > hardware-reported accuracy * 3."
      );
    } else if (isGreen) {
      signalQualityLabel = txt("Güvenli Veri (Yeşil Sinyal)", "High-Integrity Data (Green Signal)");
      interpretation = txt(
        "Veriler yüksek tutarlılıktadır. Çoklu yansıma (multipath) veya sapma (drift) etkisi gözlenmemiştir. Sinyal kalitesi son derece güvenli seviyededir.",
        "GNSS observations exhibit high spatial consistency and minimal noise. No multipath interference or atmospheric drift is detected. Spatial integrity exceeds standard tolerances."
      );
    } else {
      signalQualityLabel = samplesCount < 15 
        ? txt("Veri Az / Orta Güvenli Veri (Turuncu Sinyal)", "Sparse Data / Medium-Integrity Data (Orange Signal)") 
        : txt("Orta Güvenli Veri (Turuncu Sinyal)", "Medium-Integrity Data (Orange Signal)");
      interpretation = txt(
        "Veriler orta tutarlılıktadır. Kriterler: 5m < Donanımsal Hassasiyet <= 20m veya 5m < Veri Saçılımı <= 20m veya Veri Saçılımı > Donanımsal Hassasiyet veya Veri Sayısı < 15",
        "GNSS observations exhibit moderate spatial consistency. Classification Criteria: 5m < Hardware accuracy <= 20m, 5m < 2D spatial dispersion <= 20m, 2D spatial dispersion > hardware accuracy, or observed epochs < 15."
      );
    }
  }

  const analysisData: any[][] = [
    [txt("KESİN KOORDİNATLI İSTATİSTİKSEL ANALİZ RAPORU", "PRECISE COORDINATE STATISTICAL ANALYSIS REPORT")],
    [txt("Nokta Adı:", "Point Name:"), location.name],
    [txt("Proje Adı:", "Project Name:"), location.folderName || ""],
    [],
    [
      txt("Yöntem", "Method"), 
      preciseCoords.isWgs84 ? txt("Enlem (Lat)", "Latitude (Lat)") : txt("Sağa (Y)", "Easting (Y)"), 
      preciseCoords.isWgs84 ? txt("Boylam (Lng)", "Longitude (Lng)") : txt("Yukarı (X)", "Northing (X)"), 
      preciseCoords.isWgs84 ? txt("Alt (Elip.H)", "Alt (Ellip. H)") : txt("Yükseklik (Z)", "Elevation (Z)"), 
      txt("ΔX (m)", "ΔX (m)"), 
      txt("ΔY (m)", "ΔY (m)"), 
      txt("ΔZ (m)", "ΔZ (m)"),
      txt("Yatay Hata (m)", "Horizontal Error (m)"), 
      txt("DURUM", "STATUS")
    ],
    [
      txt("KESİN", "PRECISE"),
      preciseCoords.isWgs84 ? preciseCoords.x.toFixed(7) : preciseCoords.y.toFixed(3),
      preciseCoords.isWgs84 ? preciseCoords.y.toFixed(7) : preciseCoords.x.toFixed(3),
      preciseCoords.z.toFixed(3),
      (0).toFixed(3),
      (0).toFixed(3),
      (0).toFixed(3),
      (0).toFixed(3),
      txt("REFERANS", "REFERENCE")
    ],
    ...results.map(res => [
      getMethodName(res.method),
      res.calculated.x.toFixed(preciseCoords.isWgs84 ? 7 : 3),
      res.calculated.y.toFixed(preciseCoords.isWgs84 ? 7 : 3),
      (res.calculated.z ?? 0).toFixed(3),
      res.errors.dx.toFixed(3),
      res.errors.dy.toFixed(3),
      (res.errors.dz ?? 0).toFixed(3),
      res.errors.dhz.toFixed(3),
      res.method === bestMethod.method ? txt("EN BAŞARILI (YATAY)", "BEST PERFORMER (2D)") : ""
    ])
  ];

  const wsAnalysis = XLSX.utils.aoa_to_sheet(analysisData);
  XLSX.utils.book_append_sheet(workbook, wsAnalysis, txt("İstatistik ve Analiz", "Stats and Analysis"));

  // Save the combined book
  const prefixName = language === 'EN' ? 'Report' : 'Rapor';
  const fileName = `${prefixName}_${location.name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};