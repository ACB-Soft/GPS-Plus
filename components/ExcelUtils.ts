import * as XLSX from 'xlsx';
import { SavedLocation, AppSettings, CalculationMethod } from '../types';
import { convertCoordinate, getSystemDisplayLabel, getWGS84Coefficients } from '../utils/CoordinateUtils';
import { calculateResult, calculateVariance, calculateMaxDistance } from '../utils/MathUtils';
import { FULL_BRAND } from '../version';
import { getCorrectedHeight, getEllipsoidalHeight } from './GeoidUtils';
import { geoidService } from '../services/GeoidService';

const getMethodName = (m: CalculationMethod) => {
  switch(m) {
    case 'WEIGHTED_LSE': return "WLSE";
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

export const downloadTechnicalReport = (location: SavedLocation, settings?: AppSettings, language?: 'TR' | 'EN') => {
  if (!location.samples || location.samples.length === 0) {
    alert(language === 'EN' ? "No raw data (samples) found for this point. Survey report can only be generated for newly measured points." : "Bu noktaya ait ham veri (örneklem) bulunamadı. Teknik rapor sadece yeni ölçülen noktalar için oluşturulabilir.");
    return;
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
    
    let status = txt("Kayıtlı (Ham)", "Recorded (Raw)");
    if (s.accuracy > accuracyLimit) {
      status = language === 'EN' 
        ? `High Deviation (> ${accuracyLimit.toFixed(2)}m)` 
        : `Yüksek Sapma (> ${accuracyLimit.toFixed(2)}m)`;
    }

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
      status
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

  // 1. GÜVENSİZ VERİ (KIRMIZI): Donanımsal Hassasiyet > 20m VEYA Veri Saçılımı > 20m VEYA Veri Saçılımı > Donanımsal Hassasiyet * 3
  const isRed = avgAccAll > 20 || maxSpreadAll > 20 || maxSpreadAll > avgAccAll * 3;

  // 2. GÜVENİLİR VERİ (YEŞİL): Donanımsal Hassasiyet <= 5m VE Veri Saçılımı <= 5m VE Veri Sayısı >= 15 VE Veri Saçılımı <= Donanımsal Hassasiyet
  const isGreen = !isRed && avgAccAll <= 5 && maxSpreadAll <= 5 && samplesCount >= 15 && maxSpreadAll <= avgAccAll;

  let relLevel = "";
  let relMsg = "";

  if (isRed) {
    relLevel = txt("DÜŞÜK (KRİTİK)", "LOW (CRITICAL)");
    relMsg = txt(
      "Veriler yüksek oranda sapmalı ve güvensizdir. Kriterler: Donanımsal Hassasiyet > 20m, Veri Saçılımı > 20m veya Veri Saçılımı > Donanımsal Hassasiyet * 3",
      "Data has high drift and is unreliable. Criteria: Hardware Accuracy > 20m, Data Spread > 20m, or Data Spread > Hardware Accuracy * 3"
    );
  } else if (isGreen) {
    relLevel = txt("YÜKSEK (GÜVENLİ)", "HIGH (SAFE)");
    relMsg = txt(
      "Veriler yüksek tutarlılıktadır. Çoklu yansıma (multipath) veya sapma (drift) etkisi gözlenmemiştir. Sinyal kalitesi son derece güvenli seviyededir.",
      "Data is highly consistent. No multipath reflection or drift detected. Signal quality is at a very safe level."
    );
  } else {
    relLevel = txt("ORTA (TUTARSIZ)", "MED (INCONSISTENT)");
    relMsg = txt(
      "Veriler orta tutarlılıktadır. Kriterler: 5m < Donanımsal Hassasiyet <= 20m veya 5m < Veri Saçılımı <= 20m veya Veri Saçılımı > Donanımsal Hassasiyet veya Veri Sayısı < 15",
      "Data has moderate consistency. Criteria: 5m < Hardware Accuracy <= 20m, 5m < Data Spread <= 20m, Data Spread > Hardware Accuracy, or Samples Count < 15"
    );
  }

  const heightHeader = isOrthometricSetting ? txt("Yükseklik (m)", "Height (m)") : txt("Elipsoidal Yükseklik (m)", "Ellipsoidal Height (m)");

  const ws_data = [
    [txt("ÖLÇÜM RAPORU (TÜM HAM VERİLER - RAW)", "SURVEY REPORT (ALL RAW DATA - RAW)")],
    [txt("Nokta Adı:", "Point Name:"), location.name],
    [txt("Proje Adı:", "Project Name:"), location.folderName],
    [txt("Koordinat Sistemi:", "Coordinate System:"), getSystemDisplayLabel(sys)],
    [txt("Dilim Numarası:", "Zone Number:"), convertCoordinate(location.lat, location.lng, sys).zone || "---"],
    [txt("Ölçüm Süresi:", "Measurement Duration:"), `${location.measurementDuration || 0} ${txt("sn", "sec")}`],
    [txt("Hassasiyet Eşiği:", "Accuracy Threshold:"), `${accuracyLimit.toFixed(2)} m`],
    [txt("Sinyal Güvenilirliği:", "Signal Reliability:"), relLevel],
    [txt("Güvenilirlik Açıklaması:", "Reliability Explanation:"), relMsg],
    [txt("Maksimum Yayılım (Spread):", "Maximum Spread:"), `${maxSpreadAll.toFixed(2)} m`],
    [txt("Ortalama Sensör Hassasiyeti:", "Average Sensor Accuracy:"), `${avgAccAll.toFixed(2)} m`],
    [txt("Yayılım / Hassasiyet Oranı:", "Spread / Accuracy Ratio:"), spreadRatio.toFixed(2)],
    [],
    ["No", txt("Saat", "Time"), header1, header2, heightHeader, txt("Hassasiyet (m)", "Accuracy (m)"), txt("Dikey Hass. (m)", "Vertical Acc. (m)"), txt("Hız (m/s)", "Speed (m/s)"), txt("Yön (Derece)", "Heading (Deg)"), txt("İvme X (m/s²)", "Accel X (m/s²)"), txt("İvme Y (m/s²)", "Accel Y (m/s²)"), txt("İvme Z (m/s²)", "Accel Z (m/s²)"), txt("Yönelim Alpha (°)", "Heading Alpha (°)"), txt("Eğim Beta (°)", "Roll Beta (°)"), txt("Eğim Gamma (°)", "Pitch Gamma (°)"), txt("Durum", "Status")],
    ...dataRows,
    [],
    [txt("ANALİZ YÖNTEMLERİ KARŞILAŞTIRMALI SONUÇLAR", "COMPARATIVE ANALYSIS METHODS RESULTS")],
    [txt("Yöntem", "Method"), header1, header2, heightHeader, txt("Kullanılan Örnek", "Samples Used"), txt("Hassasiyet (m)", "Accuracy (m)"), txt("Varyans (m²)", "Variance (m²)")],
    ...methodResults.map(res => [
      getMethodName(res.method),
      res.x.toFixed(2),
      res.y.toFixed(2),
      res.z !== null ? res.z.toFixed(2) : '---',
      `${res.usedCount} / ${location.samples!.length}`,
      res.accuracy.toFixed(2),
      res.variance.toFixed(2)
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
    { wch: 18 }  // Durum
  ];

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

  // --- SAYFA 1: HAM ÖLÇÜM VERİLERİ (60 SN KAYIT) ---
  const headerX = isWgsPoint ? txt("Enlem (Lat)", "Latitude (Lat)") : txt("Sağa (Y)", "Easting (Y)");
  const headerY = isWgsPoint ? txt("Boylam (Lng)", "Longitude (Lng)") : txt("Yukarı (X)", "Northing (X)");

  const rawData: any[][] = [
    [txt("HAM ÖLÇÜM VE GÖZLEM KAYITLARI (RAW)", "RAW MEASUREMENT AND OBSERVATION RECORDS (RAW)")],
    [txt("Nokta Adı:", "Point Name:"), location.name],
    [txt("Klasör:", "Folder:"), location.folderName],
    [txt("Kayıt Tarihi:", "Record Date:"), new Date(location.timestamp).toLocaleString(language === 'EN' ? 'en-US' : 'tr-TR')],
    [txt("Koordinat Sistemi:", "Coordinate System:"), getSystemDisplayLabel(sys)],
    [txt("Dilim Numarası:", "Zone Number:"), convertCoordinate(location.lat, location.lng, sys).zone || "---"],
    [txt("Yükseklik Tipi:", "Height Type:"), isOrthometric ? txt("Ortometrik (Jeoid)", "Orthometric (Geoid)") : txt("Elipsoidal", "Ellipsoidal")],
    [],
    [txt("GÖZLEM LİSTESİ (Tüm Örnekler - Ham)", "OBSERVATION LIST (All Samples - Raw)")],
    ["No", headerX, headerY, isOrthometric ? txt("Kot (H)", "Elevation (H)") : txt("Alt (h)", "Alt (h)"), txt("Hassasiyet (m)", "Accuracy (m)"), txt("Hız (m/s)", "Speed (m/s)"), txt("Yön (Derece)", "Heading (Deg)"), txt("İvme X (m/s²)", "Accel X (m/s²)"), txt("İvme Y (m/s²)", "Accel Y (m/s²)"), txt("İvme Z (m/s²)", "Accel Z (m/s²)"), txt("Yönelim Alpha (°)", "Heading Alpha (°)"), txt("Eğim Beta (°)", "Roll Beta (°)"), txt("Eğim Gamma (°)", "Pitch Gamma (°)"), txt("Zaman", "Time")]
  ];

  const reportRawList = location.rawSamples && location.rawSamples.length > 0 ? location.rawSamples : (location.samples || []);

  if (reportRawList.length > 0) {
    reportRawList.forEach((s, idx) => {
      const conv = convertCoordinate(s.lat, s.lng, sys);
      const hVal = isOrthometric 
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

      rawData.push([
        idx + 1, 
        isWgsPoint ? s.lat.toFixed(5) : conv.x.toFixed(3), 
        isWgsPoint ? s.lng.toFixed(5) : conv.y.toFixed(3), 
        hVal !== null ? hVal.toFixed(3) : (s.altitude || 0).toFixed(3), 
        s.accuracy.toFixed(3), 
        speedVal,
        headingVal,
        accelXVal,
        accelYVal,
        accelZVal,
        gyroAVal,
        gyroBVal,
        gyroGVal,
        new Date(s.timestamp).toLocaleTimeString(language === 'EN' ? 'en-US' : 'tr-TR')
      ]);
    });
  }

  const wsRaw = XLSX.utils.aoa_to_sheet(rawData);
  XLSX.utils.book_append_sheet(workbook, wsRaw, "RAW");

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
      signalQualityLabel = txt("GÜVENSİZ VERİ (KIRMIZI SİNYAL)", "UNRELIABLE DATA (RED SIGNAL)");
      interpretation = txt(
        "Veriler yüksek oranda sapmalı ve güvensizdir. Kriterler: Donanımsal Hassasiyet > 20m, Veri Saçılımı > 20m veya Veri Saçılımı > Donanımsal Hassasiyet * 3",
        "Data has high drift and is unreliable. Criteria: Hardware Accuracy > 20m, Data Spread > 20m, or Data Spread > Hardware Accuracy * 3"
      );
    } else if (isGreen) {
      signalQualityLabel = txt("GÜVENİLİR VERİ (YEŞİL SİNYAL)", "RELIABLE DATA (GREEN SIGNAL)");
      interpretation = txt(
        "Veriler yüksek tutarlılıktadır. Çoklu yansıma (multipath) veya sapma (drift) etkisi gözlenmemiştir. Sinyal kalitesi son derece güvenli seviyededir.",
        "Data is highly consistent. No multipath reflection or drift detected. Signal quality is at a very safe level."
      );
    } else {
      signalQualityLabel = samplesCount < 15 
        ? txt("VERİ AZ / ORTA GÜVENLİ VERİ (TURUNCU SİNYAL)", "LOW SAMPLES / MODERATE SIGNAL (ORANGE SIGNAL)") 
        : txt("ORTA GÜVENLİ VERİ (TURUNCU SİNYAL)", "MODERATE SIGNAL (ORANGE SIGNAL)");
      interpretation = txt(
        "Veriler orta tutarlılıktadır. Kriterler: 5m < Donanımsal Hassasiyet <= 20m veya 5m < Veri Saçılımı <= 20m veya Veri Saçılımı > Donanımsal Hassasiyet veya Veri Sayısı < 15",
        "Data has moderate consistency. Criteria: 5m < Hardware Accuracy <= 20m, 5m < Data Spread <= 20m, Data Spread > Hardware Accuracy, or Samples Count < 15"
      );
    }
  }

  const analysisData: any[][] = [
    [txt("DETAYLI İSTATİSTİKSEL ANALİZ VE ALGORİTMA PERFORMANS RAPORU", "DETAILED STATISTICAL ANALYSIS AND ALGORITHM PERFORMANCE REPORT")],
    [txt("Nokta Adı:", "Point Name:"), location.name],
    [txt("Analiz Tarihi:", "Analysis Date:"), new Date().toLocaleString(language === 'EN' ? 'en-US' : 'tr-TR')],
    [],
    [txt("1. UYGULAMA ANA HESAPLAMA SONUÇLARI", "1. APP CORE CALCULATION RESULTS")],
    [txt("Koordinat Sistemi:", "Coordinate System:"), getSystemDisplayLabel(sys)],
    [txt("Kullanılan Ana Yöntem:", "Core Method Used:"), getMethodName(calculationMethod)],
    [txt("Hesaplanan X/Lat:", "Calculated X/Lat:"), location.lat.toFixed(6)],
    [txt("Hesaplanan Y/Lng:", "Calculated Y/Lng:"), location.lng.toFixed(6)],
    [txt("Hesaplanan Z/Alt:", "Calculated Z/Alt:"), (location.altitude || 0).toFixed(3)],
    [txt("Yatay Hassasiyet (RMS):", "Horizontal Accuracy (RMS):"), `${location.accuracy.toFixed(3)} m`],
    [txt("Ölçüm Süresi:", "Measurement Duration:"), `${location.measurementDuration || 0} ${txt("sn", "sec")}`],
    [txt("Toplam Örnek Sayısı:", "Total Samples Count:"), `${location.samples?.length || 0}`],
    [],
    [txt("2. KESİN REFERANS DEĞERLER (GROUND TRUTH)", "2. PRECISE REFERENCE VALUES (GROUND TRUTH)")],
    [preciseCoords.isWgs84 ? txt("Enlem", "Latitude") : txt("Sağa (Y)", "Easting (Y)"), preciseCoords.isWgs84 ? txt("Boylam", "Longitude") : txt("Yukarı (X)", "Northing (X)"), preciseCoords.isWgs84 ? txt("Alt (Elip.H)", "Alt (Ellip. H)") : txt("Kot (Z)", "Elevation (Z)")],
    [preciseCoords.x.toFixed(preciseCoords.isWgs84 ? 7 : 3), preciseCoords.y.toFixed(preciseCoords.isWgs84 ? 7 : 3), preciseCoords.z.toFixed(3)],
    [],
    [txt("3. ALGORİTMA BAZLI HATA ANALİZİ (KIYASLAMA)", "3. ALGORITHM-BASED ERROR ANALYSIS (BENCHMARK)")],
    [txt("Hassasiyet Hesaplama Metodu:", "Accuracy Calculation Method:"), txt("Max(İstatistiksel Hassasiyet, Maksimum Örnek Yayılımı)", "Max(Statistical Accuracy, Max Sample Spread)")],
    [txt("Veri Filtreleme:", "Data Filtering:"), language === 'EN' ? `Only samples with accuracy under ${accuracyLimit.toFixed(2)}m were analyzed.` : `Analizde sadece hassasiyeti ${accuracyLimit.toFixed(2)}m altındaki veriler kullanılmıştır.`],
    [txt("Yöntem", "Method"), preciseCoords.isWgs84 ? txt("Enlem (Lat)", "Latitude (Lat)") : txt("Sağa (Y)", "Easting (Y)"), preciseCoords.isWgs84 ? txt("Boylam (Lng)", "Longitude (Lng)") : txt("Yukarı (X)", "Northing (X)"), preciseCoords.isWgs84 ? txt("Alt (Elip.H)", "Alt (Ellip. H)") : txt("Kot (Z)", "Elevation (Z)"), txt("ΔX (m)", "ΔX (m)"), txt("ΔY (m)", "ΔY (m)"), txt("Yatay Hata (m)", "Horizontal Error (m)"), txt("DURUM", "STATUS")],
    ...results.map(res => [
      getMethodName(res.method),
      res.calculated.x.toFixed(preciseCoords.isWgs84 ? 7 : 3),
      res.calculated.y.toFixed(preciseCoords.isWgs84 ? 7 : 3),
      (res.calculated.z ?? 0).toFixed(3),
      res.errors.dx.toFixed(3),
      res.errors.dy.toFixed(3),
      res.errors.dhz.toFixed(3),
      res.method === bestMethod.method ? txt("EN BAŞARILI (YATAY)", "BEST PERFORMER (2D)") : ""
    ]),
    [],
    [txt("4. VERI SACILIMI VE SINYAL GUVENILIRLIK OZETI", "4. DATA SPREAD AND SIGNAL RELIABILITY SUMMARY")],
    [txt("Maksimum Saçılım Genişliği (Spread):", "Max Spread Width (Spread):"), `${maxSpreadAll.toFixed(3)} m`],
    [txt("Konumsal Standart Sapma (1σ):", "Spatial Standard Deviation (1σ):"), `${stdDevValue.toFixed(3)} m`],
    [txt("Ortalama Alıcı Sensör Hassasiyeti:", "Average Sensor Accuracy:"), `${avgAccAll.toFixed(3)} m`],
    [txt("Sinyal Güvenilirlik Durumu:", "Signal Reliability Status:"), signalQualityLabel],
    [txt("Geodezik Analiz Genel Yorumu:", "Geodetic Analysis Comment:"), interpretation],
    [],
    [txt("HATA TERMİNOLOJİSİ VE NOTLAR:", "ERROR TERMINOLOGY AND NOTES:")],
    [txt("- Delta (Δ): Kesin Değer - Hesaplanan Değer farkıdır.", "- Delta (Δ): Difference between True Reference and Calculated values.")],
    [txt("- Yatay Hata: Konumsal (2D) vektörel sapmadır.", "- Horizontal Error: Position (2D) vector deviation.")],
    [txt("- En Başarılı Seçimi: Yatay hatası (ΔHz) en düşük olan algoritmaya göre yapılmıştır.", "- Best Performer: Chosen based on the lowest horizontal error (ΔHz).")],
    [`- ${txt("Bu rapor", "This report is generated by")} ${FULL_BRAND} ACB - Labs ${txt("platformu üzerinden otomatik üretilmiştir.", "platform.")}`]
  ];

  const wsAnalysis = XLSX.utils.aoa_to_sheet(analysisData);
  XLSX.utils.book_append_sheet(workbook, wsAnalysis, txt("İstatistik ve Analiz", "Stats and Analysis"));

  // --- SAYFA 3: ZAMAN BAZLI PERFORMANS ANALİZİ (SÜRE ETKİSİ) ---
  const timeSteps = [5, 10, 15, 30, 60, 90].filter(t => t <= (location.measurementDuration || 0));
  const timeSeriesData: any[][] = [
    [txt("ZAMAN BAZLI KONUMLANMA PERFORMANS ANALİZİ", "TIME-BASED POSITIONING PERFORMANCE ANALYSIS")],
    [txt("(Farklı algoritmaların gözlem süresine bağlı doğrusal hata değişimi)", "(Linear error variation of different algorithms over observation duration)")],
    [],
    [txt("Gözlem Süresi", "Observation Time"), txt("Hesaplama Yöntemi", "Method"), txt("Hesaplanan X/Lat", "Calculated X/Lat"), txt("Hesaplanan Y/Lng", "Calculated Y/Lng"), txt("Hesaplanan Z/H", "Calculated Z/H"), txt("Yatay Hata (m)", "Horizontal Error (m)"), txt("Örnek Sayısı", "Samples Count")],
  ];

  // Reference values in meters for comparison
  let refNorth = 0;
  let refEast = 0;
  let refZ = preciseCoords.z;
  const testSys = preciseCoords.isWgs84 ? 'ITRF96_3' : sys;

  if (preciseCoords.isWgs84) {
    const converted = convertCoordinate(preciseCoords.x, preciseCoords.y, testSys);
    refNorth = converted.y; // Northing (Yukarı)
    refEast = converted.x;  // Easting (Sağa)
  } else {
    refNorth = preciseCoords.x; // Northing (Yukarı)
    refEast = preciseCoords.y;  // Easting (Sağa)
  }

  const allMethods: CalculationMethod[] = [
    'WEIGHTED_LSE', 
    'HUBER',
    'HAMPEL',
    'HODGES_LEHMANN',
    'TUKEYS_TRIMEAN',
    'OPTIMAL_S'
  ];

  if (location.samples && location.samples.length > 0) {
    timeSteps.forEach(t => {
      const startTime = location.samples![0].timestamp;
      const slice = location.samples!.filter(s => s.timestamp <= startTime + t * 1000 + 500);
      if (slice.length < 2) return;

      allMethods.forEach(mId => {
        const { result } = calculateResult(slice, mId, accuracyLimit);
        const convResult = convertCoordinate(result.lat, result.lng, testSys);
        
        // convResult.y is Northing, convResult.x is Easting
        const dn = refNorth - convResult.y;
        const de = refEast - convResult.x;
        const dhz = Math.sqrt(dn*dn + de*de);

        const dispConv = convertCoordinate(result.lat, result.lng, sys);

        timeSeriesData.push([
          `${t} ${txt("sn", "sec")}`,
          getMethodName(mId),
          (sys === "WGS84" ? result.lat : dispConv.x).toFixed(sys === "WGS84" ? 7 : 3),
          (sys === "WGS84" ? result.lng : dispConv.y).toFixed(sys === "WGS84" ? 7 : 3),
          (result.altitude || 0).toFixed(3),
          dhz.toFixed(3),
          slice.length
        ]);
      });
      // Add an empty row for separation between time steps
      timeSeriesData.push([]);
    });
  }

  const wsTimeSeries = XLSX.utils.aoa_to_sheet(timeSeriesData);
  XLSX.utils.book_append_sheet(workbook, wsTimeSeries, txt("Zaman Bazlı Analiz", "Time-Based Analysis"));

  // Save the combined book
  const prefixName = language === 'EN' ? 'Report' : 'Rapor';
  const fileName = `${prefixName}_${location.name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};