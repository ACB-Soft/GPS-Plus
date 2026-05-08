import * as XLSX from 'xlsx';
import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { FULL_BRAND } from '../version';
import { getCorrectedHeight } from './GeoidUtils';
import { geoidService } from '../services/GeoidService';

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

  // iOS Tespiti
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (typeof navigator !== 'undefined' && (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);

  const dataRows = locations.map(loc => {
    const { x, y } = convertCoordinate(loc.lat, loc.lng, loc.coordinateSystem || 'WGS84');
    
    const val1 = isWGS84 ? y.toFixed(6) : x.toFixed(locPrecision);
    const val2 = isWGS84 ? x.toFixed(6) : y.toFixed(locPrecision);
    
    const correctedH = getCorrectedHeight(loc.lat, loc.lng, loc.altitude);
    const orthometricH = correctedH !== null ? correctedH.toFixed(heightPrecision) : '---';
    
    let ellipVal = loc.altitude;
    if (isIOS && loc.altitude !== null) {
      const egm96Undulation = geoidService.getUndulation(loc.lat, loc.lng, 'EGM96');
      ellipVal = loc.altitude + egm96Undulation;
    }
    
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
  
  // Sadece hassas verileri filtrele (İstatistiklerin temeli budur)
  const allConverted = location.samples.map((s, idx) => {
    const { x, y } = convertCoordinate(s.lat, s.lng, sys);
    return { 
      idx, 
      x: isWGS84 ? s.lat : x, 
      y: isWGS84 ? s.lng : y, 
      z: s.altitude,
      raw: s
    };
  });

  // İstatistiksel işlemlere sadece hassas veriler girer
  const validSamples = allConverted.filter(s => s.raw.accuracy <= accuracyLimit);

  if (validSamples.length === 0) {
    // Hiç hassas veri yoksa istatistikleri boş dönmemek için bir uyarı gerekebilir 
    // ama pratikte en az bir tane olur.
  }

  // Aritmetik Ortalama (Sadece Hassas Veriler)
  const getMean = (samples: any[]) => {
    if (samples.length === 0) return { x: 0, y: 0, z: 0, count: 0 };
    const avgX = samples.reduce((a, b) => a + b.x, 0) / samples.length;
    const avgY = samples.reduce((a, b) => a + b.y, 0) / samples.length;
    const zArr = samples.filter(s => s.z !== null).map(s => s.z as number);
    const avgZ = zArr.length > 0 ? zArr.reduce((a, b) => a + b, 0) / zArr.length : 0;
    return { x: avgX, y: avgY, z: avgZ, count: samples.length };
  };

  const statsAll = getMean(validSamples);

  // --- Medyan Hesaplama (Sadece Hassas Veriler) ---
  const getMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const medX = getMedian(validSamples.map(s => s.x));
  const medY = getMedian(validSamples.map(s => s.y));
  const medZ = getMedian(validSamples.filter(s => s.z !== null).map(s => s.z as number));

  // --- Kümeleme (Clustering) Mantığı ---
  const getClusteredMean = (epsilonValue: number) => {
    if (validSamples.length === 0) return { x: 0, y: 0, z: 0, count: 0 };
    
    const neighbors = validSamples.map(p1 => {
      const cluster = validSamples.filter(p2 => 
        Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)) <= epsilonValue
      );
      return cluster;
    });

    let bestCluster = neighbors[0] || [];
    for (const cluster of neighbors) {
      if (cluster.length > bestCluster.length) {
        bestCluster = cluster;
      }
    }

    return getMean(bestCluster);
  };

  const dynamicEpsilon = Math.max(accuracyLimit / 2, 1.0);
  const statsClusterDynamic = getClusteredMean(dynamicEpsilon);
  const statsClusterFixed = getClusteredMean(1.0);

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
      : s.altitude;

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
    ["TEKNİK ÖLÇÜM RAPORU"],
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
    ["İSTATİSTİKSEL HESAPLAMA ÖZETİ (Sadece Hassas Veriler)"],
    ["Yöntem", header1, header2, isOrthometricSetting ? "Yükseklik (m)" : "Elipsoidal Yükseklik (m)", "Kullanılan Veri"],
    ["Aritmetik Ortalama", isWGS84 ? statsAll.x.toFixed(8) : statsAll.x.toFixed(locPrecision), isWGS84 ? statsAll.y.toFixed(8) : statsAll.y.toFixed(locPrecision), statsAll.z.toFixed(heightPrecision), `${statsAll.count} / ${location.samples.length}`],
    ["Medyan Değerler", isWGS84 ? medX.toFixed(8) : medX.toFixed(locPrecision), isWGS84 ? medY.toFixed(8) : medY.toFixed(locPrecision), medZ.toFixed(heightPrecision), `${validSamples.length} / ${location.samples.length}`],
    [`Kümeleme (Dinamik - Eps: ${dynamicEpsilon.toFixed(2)}m)`, isWGS84 ? statsClusterDynamic.x.toFixed(8) : statsClusterDynamic.x.toFixed(locPrecision), isWGS84 ? statsClusterDynamic.y.toFixed(8) : statsClusterDynamic.y.toFixed(locPrecision), statsClusterDynamic.z.toFixed(heightPrecision), `${statsClusterDynamic.count} / ${location.samples.length}`],
    ["Kümeleme (Sabit - Eps: 1.00m)", isWGS84 ? statsClusterFixed.x.toFixed(8) : statsClusterFixed.x.toFixed(locPrecision), isWGS84 ? statsClusterFixed.y.toFixed(8) : statsClusterFixed.y.toFixed(locPrecision), statsClusterFixed.z.toFixed(heightPrecision), `${statsClusterFixed.count} / ${location.samples.length}`],
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
  
  const fileName = `Teknik_Rapor_${location.name}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};