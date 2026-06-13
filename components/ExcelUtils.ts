import * as XLSX from 'xlsx';
import { SavedLocation, AppSettings, CalculationMethod } from '../types';
import { convertCoordinate, getSystemDisplayLabel, getWGS84Coefficients } from '../utils/CoordinateUtils';
import { calculateResult, calculateVariance, calculateMaxDistance } from '../utils/MathUtils';
import { FULL_BRAND } from '../version';
import { getCorrectedHeight, getEllipsoidalHeight } from './GeoidUtils';
import { geoidService } from '../services/GeoidService';

const getMethodName = (m: CalculationMethod) => {
  switch(m) {
    case 'WEIGHTED_LSE': return "Ağırlıklı En Küçük Kareler";
    case 'HUBER': return "Huber M-Tahmini";
    case 'KMEANS_BAARDA_HUBER': return "KMeans + Baarda + Huber";
    case 'KMEANS_4': return "K-Means (4 Küme)";
    case 'BAARDA': return "Baarda Eleme";
    case 'IQR_WLS': return "IQR Aykırı Değer Eleme (WLS)";
    case 'RANSAC': return "RANSAC Gözlem Ayıklama (WLS)";
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
    
    const correctedH = getCorrectedHeight(loc.lat, loc.lng, loc.altitude);
    const orthometricH = correctedH !== null ? correctedH.toFixed(2) : '---';
    
    const ellipVal = getEllipsoidalHeight(loc.lat, loc.lng, loc.altitude);
    const ellipsoidalH = ellipVal !== null ? ellipVal.toFixed(2) : '---';
    
    let undulationVal = '---';
    if (ellipVal !== null && correctedH !== null) {
      undulationVal = (ellipVal - correctedH).toFixed(2);
    }

    const accuracy = loc.accuracy.toFixed(2);
    const duration = (loc.measurementDuration || 0).toString();

    let reliabilityLabel = "";
    if (loc.samples && loc.samples.length >= 5) {
      const maxSpread = calculateMaxDistance(loc.samples);
      const avgAcc = loc.samples.reduce((a, b) => a + b.accuracy, 0) / loc.samples.length;
      const ratio = maxSpread / (avgAcc || 0.1);
      if (ratio > 3) reliabilityLabel = "GÜVENSİZ";
      else if (ratio > 1.0) reliabilityLabel = "ORTA GÜVEN";
      else reliabilityLabel = "GÜVENLİ";
    } else {
      // Fallback to single point accuracy if no samples or too few
      if (loc.accuracy <= 3.0) reliabilityLabel = "GÜVENLİ";
      else if (loc.accuracy <= 8.0) reliabilityLabel = "ORTA GÜVEN";
      else reliabilityLabel = "GÜVENSİZ";
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
  
  const methods: CalculationMethod[] = [
    'WEIGHTED_LSE', 
    'HUBER',
    'KMEANS_4',
    'BAARDA',
    'KMEANS_BAARDA_HUBER',
    'IQR_WLS',
    'RANSAC'
  ];
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
        res.x.toFixed(2),
        res.y.toFixed(2),
        res.z !== null ? res.z.toFixed(2) : '---',
        `${res.usedCount} / ${sliceSamples.length}`,
        res.accuracy.toFixed(2),
        res.variance.toFixed(2)
      ]);
    });
  });

  const dataRows = location.samples.map((s, idx) => {
    const { x, y } = convertCoordinate(s.lat, s.lng, sys);
    const val1 = isWGS84 ? s.lat.toFixed(2) : x.toFixed(2);
    const val2 = isWGS84 ? s.lng.toFixed(2) : y.toFixed(2);
    
    let status = "Kullanıldı";
    if (s.accuracy > accuracyLimit) {
      status = `Düşük Hass. (> ${accuracyLimit.toFixed(2)}m)`;
    }

    const hValue = isOrthometricSetting 
      ? getCorrectedHeight(s.lat, s.lng, s.altitude) 
      : getEllipsoidalHeight(s.lat, s.lng, s.altitude);

    return [
      idx + 1,
      new Date(s.timestamp).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      val1,
      val2,
      hValue !== null ? hValue.toFixed(2) : '---',
      s.accuracy.toFixed(2),
      s.altitudeAccuracy !== null ? s.altitudeAccuracy.toFixed(2) : '---',
      status
    ];
  });

  // --- Sinyal Güvenilirlik (Multipath) Analizi ---
  const maxSpreadAll = calculateMaxDistance(location.samples);
  const avgAccAll = location.samples.reduce((a, b) => a + b.accuracy, 0) / location.samples.length;
  const spreadRatio = maxSpreadAll / (avgAccAll || 0.1);
  let relLevel = "YÜKSEK (GÜVENLİ)";
  let relMsg = "Veri saçılımı hassasiyet limitleri dahilinde. Sinyal yansıması (Multipath) riski düşük.";
  if (spreadRatio > 3) {
    relLevel = "DÜŞÜK (KRİTİK)";
    relMsg = "Kritik sinyal sapması! Saçılım, raporlanan hassasiyetin 3 katından fazla. Veriler güvenilir değil.";
  } else if (spreadRatio > 1.5) {
    relLevel = "ORTA (TUTARSIZ)";
    relMsg = "Şüpheli veri yayılımı. Sensör hassasiyetine oranla yüksek saçılım tespit edildi. Multipath etkisi olabilir.";
  }

  const ws_data = [
    ["ÖLÇÜM RAPORU"],
    ["Nokta Adı:", location.name],
    ["Proje Adı:", location.folderName],
    ["Koordinat Sistemi:", getSystemDisplayLabel(sys)],
    ["Dilim Numarası:", convertCoordinate(location.lat, location.lng, sys).zone || "---"],
    ["Ölçüm Süresi:", `${location.measurementDuration || 0} sn`],
    ["Hassasiyet Eşiği:", `${accuracyLimit.toFixed(2)} m`],
    ["Sinyal Güvenilirliği:", relLevel],
    ["Güvenilirlik Açıklaması:", relMsg],
    ["Maksimum Yayılım (Spread):", `${maxSpreadAll.toFixed(2)} m`],
    ["Ortalama Sensör Hassasiyeti:", `${avgAccAll.toFixed(2)} m`],
    ["Yayılım / Hassasiyet Oranı:", spreadRatio.toFixed(2)],
    [],
    ["No", "Saat", header1, header2, isOrthometricSetting ? "Yükseklik (m)" : "Elipsoidal Yükseklik (m)", "Hassasiyet (m)", "Dikey Hass. (m)", "Durum"],
    ...dataRows,
    [],
    ["ANLİZ YÖNTEMLERİ KARŞILAŞTIRMALI SONUÇLAR"],
    ["Yöntem", header1, header2, isOrthometricSetting ? "Yükseklik (m)" : "Elipsoidal Yükseklik (m)", "Kullanılan Örnek", "Hassasiyet (m)", "Varyans (m²)"],
    ...methodResults.map(res => [
      getMethodName(res.method),
      res.x.toFixed(2),
      res.y.toFixed(2),
      res.z !== null ? res.z.toFixed(2) : '---',
      `${res.usedCount} / ${location.samples!.length}`,
      res.accuracy.toFixed(2),
      res.variance.toFixed(2)
    ]),
    ...intervalAnalysisRows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 12 }, // Saat
    { wch: 20 }, // Val1
    { wch: 20 }, // Val2
    { wch: 15 } // Yükseklik
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ham Veriler");
  
  const fileName = `Teknik_Rapor_${location.name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const downloadCombinedAnalysisReport = (
  location: SavedLocation, 
  preciseCoords: { x: number, y: number, z: number, isWgs84: boolean },
  results: any[],
  settings?: AppSettings
) => {
  const workbook = XLSX.utils.book_new();

  const locPrecision = settings?.locationPrecision ?? 1;
  const heightPrecision = settings?.heightPrecision ?? 2;
  const isOrthometric = settings?.heightType === 'orthometric';
  const sys = location.coordinateSystem || 'WGS84';
  const isWgsPoint = sys === 'WGS84';

  // --- SAYFA 1: HAM ÖLÇÜM VERİLERİ (60 SN KAYIT) ---
  const headerX = isWgsPoint ? "Enlem (Lat)" : "Sağa (Y)";
  const headerY = isWgsPoint ? "Boylam (Lng)" : "Yukarı (X)";

  const rawData: any[][] = [
    ["HAM ÖLÇÜM VE GÖZLEM KAYITLARI"],
    ["Nokta Adı:", location.name],
    ["Klasör:", location.folderName],
    ["Kayıt Tarihi:", new Date(location.timestamp).toLocaleString('tr-TR')],
    ["Koordinat Sistemi:", getSystemDisplayLabel(sys)],
    ["Dilim Numarası:", convertCoordinate(location.lat, location.lng, sys).zone || "---"],
    ["Yükseklik Tipi:", isOrthometric ? "Ortometrik (Jeoid)" : "Elipsoidal"],
    [],
    ["GÖZLEM LİSTESİ (Tüm Örnekler)"],
    ["No", headerX, headerY, isOrthometric ? "Kot (H)" : "Alt (h)", "Hassasiyet (m)", "Zaman"]
  ];

  if (location.samples && location.samples.length > 0) {
    location.samples.forEach((s, idx) => {
      const conv = convertCoordinate(s.lat, s.lng, sys);
      const hVal = isOrthometric 
        ? getCorrectedHeight(s.lat, s.lng, s.altitude) 
        : getEllipsoidalHeight(s.lat, s.lng, s.altitude);

      rawData.push([
        idx + 1, 
        isWgsPoint ? s.lat.toFixed(2) : conv.x.toFixed(2), 
        isWgsPoint ? s.lng.toFixed(2) : conv.y.toFixed(2), 
        hVal !== null ? hVal.toFixed(2) : (s.altitude || 0).toFixed(2), 
        s.accuracy.toFixed(2), 
        new Date(s.timestamp).toLocaleTimeString('tr-TR')
      ]);
    });
  }

  const wsRaw = XLSX.utils.aoa_to_sheet(rawData);
  XLSX.utils.book_append_sheet(workbook, wsRaw, "Ölçüm Kayıtları");

  // --- SAYFA 2: İSTATİSTİKSEL ANALİZ VE AR-GE SONUÇLARI ---
  const calculationMethod = location.calculationMethod || 'WEIGHTED_LSE';
  const bestMethod = results.sort((a,b) => a.errors.dhz - b.errors.dhz)[0];
  const accuracyLimit = location.accuracyLimit || 5.0;

  // --- Veri Saçılımı ve Güvenilirlik Hesapları ---
  const samplesList = location.samples || [];
  let maxSpreadAll = 0;
  let avgAccAll = 0;
  let stdDevValue = 0;
  let signalQualityLabel = "BİLİNMİYOR";
  let interpretation = "Yetersiz örneklem.";

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
      signalQualityLabel = "GÜVENSİZ VERİ (KIRMIZI SİNYAL)";
      interpretation = "Veriler yüksek oranda sapmalı ve güvensizdir. Kriterler: Donanımsal Hassasiyet > 20m, Veri Saçılımı > 20m veya Veri Saçılımı > Donanımsal Hassasiyet * 3";
    } else if (isGreen) {
      signalQualityLabel = "GÜVENİLİR VERİ (YEŞİL SİNYAL)";
      interpretation = "Veriler yüksek tutarlılıktadır. Çoklu yansıma (multipath) veya sapma (drift) etkisi gözlenmemiştir. Sinyal kalitesi son derece güvenli seviyededir.";
    } else {
      signalQualityLabel = samplesCount < 15 ? "VERİ AZ / ORTA GÜVENLİ VERİ (TURUNCU SİNYAL)" : "ORTA GÜVENLİ VERİ (TURUNCU SİNYAL)";
      interpretation = "Veriler orta tutarlılıktadır. Kriterler: 5m < Donanımsal Hassasiyet <= 20m veya 5m < Veri Saçılımı <= 20m veya Veri Saçılımı > Donanımsal Hassasiyet veya Veri Sayısı < 15";
    }
  }

  const analysisData: any[][] = [
    ["DETAYLI İSTATİSTİKSEL ANALİZ VE ALGORİTMA PERFORMANS RAPORU"],
    ["Nokta Adı:", location.name],
    ["Analiz Tarihi:", new Date().toLocaleString('tr-TR')],
    [],
    ["1. UYGULAMA ANA HESAPLAMA SONUÇLARI"],
    ["Koordinat Sistemi:", getSystemDisplayLabel(sys)],
    ["Kullanılan Ana Yöntem:", getMethodName(calculationMethod)],
    ["Hesaplanan X/Lat:", location.lat.toFixed(2)],
    ["Hesaplanan Y/Lng:", location.lng.toFixed(2)],
    ["Hesaplanan Z/Alt:", (location.altitude || 0).toFixed(2)],
    ["Yatay Hassasiyet (RMS):", `${location.accuracy.toFixed(2)} m`],
    ["Ölçüm Süresi:", `${location.measurementDuration || 0} sn`],
    ["Toplam Örnek Sayısı:", `${location.samples?.length || 0}`],
    [],
    ["2. KESİN REFERANS DEĞERLER (GROUND TRUTH)"],
    [preciseCoords.isWgs84 ? "Enlem" : "Sağa (Y)", preciseCoords.isWgs84 ? "Boylam" : "Yukarı (X)", preciseCoords.isWgs84 ? "Alt (Elip.H)" : "Kot (Z)"],
    [preciseCoords.x.toFixed(2), preciseCoords.y.toFixed(2), preciseCoords.z.toFixed(2)],
    [],
    ["3. ALGORİTMA BAZLI HATA ANALİZİ (KIYASLAMA)"],
    ["Hassasiyet Hesaplama Metodu:", "Max(İstatistiksel Hassasiyet, Maksimum Örnek Yayılımı)"],
    ["Veri Filtreleme:", `Analizde sadece hassasiyeti ${accuracyLimit.toFixed(2)}m altındaki veriler kullanılmıştır.`],
    ["Yöntem", preciseCoords.isWgs84 ? "Enlem (Lat)" : "Sağa (Y)", preciseCoords.isWgs84 ? "Boylam (Lng)" : "Yukarı (X)", preciseCoords.isWgs84 ? "Alt (Elip.H)" : "Kot (Z)", "ΔX (m)", "ΔY (m)", "Yatay Hata (m)", "DURUM"],
    ...results.map(res => [
      getMethodName(res.method),
      res.calculated.x.toFixed(2),
      res.calculated.y.toFixed(2),
      (res.calculated.z ?? 0).toFixed(2),
      res.errors.dx.toFixed(2),
      res.errors.dy.toFixed(2),
      res.errors.dhz.toFixed(2),
      res.method === bestMethod.method ? "EN BAŞARILI (YATAY)" : ""
    ]),
    [],
    ["4. VERI SACILIMI VE SINYAL GUVENILIRLIK OZETI"],
    ["Maksimum Saçılım Genişliği (Spread):", `${maxSpreadAll.toFixed(2)} m`],
    ["Konumsal Standart Sapma (1σ):", `${stdDevValue.toFixed(2)} m`],
    ["Ortalama Alıcı Sensör Hassasiyeti:", `${avgAccAll.toFixed(2)} m`],
    ["Sinyal Güvenilirlik Durumu:", signalQualityLabel],
    ["Geodezik Analiz Genel Yorumu:", interpretation],
    [],
    ["HATA TERMİNOLOJİSİ VE NOTLAR:"],
    ["- Delta (Δ): Kesin Değer - Hesaplanan Değer farkıdır."],
    ["- Yatay Hata: Konumsal (2D) vektörel sapmadır."],
    ["- En Başarılı Seçimi: Yatay hatası (ΔHz) en düşük olan algoritmaya göre yapılmıştır."],
    [`- Bu rapor ${FULL_BRAND} ACB - Labs platformu üzerinden otomatik üretilmiştir.`]
  ];

  const wsAnalysis = XLSX.utils.aoa_to_sheet(analysisData);
  XLSX.utils.book_append_sheet(workbook, wsAnalysis, "İstatistik ve Analiz");

  // --- SAYFA 3: ZAMAN BAZLI PERFORMANS ANALİZİ (SÜRE ETKİSİ) ---
  const timeSteps = [5, 10, 15, 30, 60, 120].filter(t => t <= (location.measurementDuration || 0));
  const timeSeriesData: any[][] = [
    ["ZAMAN BAZLI KONUMLANMA PERFORMANS ANALİZİ"],
    ["(Farklı algoritmaların gözlem süresine bağlı doğrusal hata değişimi)"],
    [],
    ["Gözlem Süresi", "Hesaplama Yöntemi", "Hesaplanan X/Lat", "Hesaplanan Y/Lng", "Hesaplanan Z/H", "Yatay Hata (m)", "Örnek Sayısı"],
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
    'KMEANS_4',
    'BAARDA',
    'KMEANS_BAARDA_HUBER',
    'IQR_WLS',
    'RANSAC'
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
          `${t} sn`,
          getMethodName(mId),
          (sys === "WGS84" ? result.lat : dispConv.x).toFixed(2),
          (sys === "WGS84" ? result.lng : dispConv.y).toFixed(2),
          (result.altitude || 0).toFixed(2),
          dhz.toFixed(2),
          slice.length
        ]);
      });
      // Add an empty row for separation between time steps
      timeSeriesData.push([]);
    });
  }

  const wsTimeSeries = XLSX.utils.aoa_to_sheet(timeSeriesData);
  XLSX.utils.book_append_sheet(workbook, wsTimeSeries, "Zaman Bazlı Analiz");

  // Save the combined book
  const fileName = `ArGe_Analiz_Raporu_${location.name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};