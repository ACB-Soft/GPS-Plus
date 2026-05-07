import * as XLSX from 'xlsx';
import { SavedLocation } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { FULL_BRAND } from '../version';
import { getCorrectedHeight } from './GeoidUtils';
import { geoidService } from '../services/GeoidService';

export const downloadExcel = (locations: SavedLocation[]) => {
  if (locations.length === 0) {
    alert("Kayıt bulunamadı.");
    return;
  }

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
    
    // WGS84 ise 6 basamak, değilse (UTM vb.) 2 basamak (virgülden sonra sıfır olsa bile gösterilir)
    const val1 = isWGS84 ? y.toFixed(6) : x.toFixed(2);
    const val2 = isWGS84 ? x.toFixed(6) : y.toFixed(2);
    
    const correctedH = getCorrectedHeight(loc.lat, loc.lng, loc.altitude);
    const orthometricH = correctedH !== null ? correctedH.toFixed(2) : '---';
    
    // iOS cihazlarda ham veri (loc.altitude) ortometrik (MSL) olduğu için 
    // elipsoid yüksekliği hesaplanırken EGM96 ondülasyonu eklenmelidir.
    let ellipVal = loc.altitude;
    if (isIOS && loc.altitude !== null) {
      const egm96Undulation = geoidService.getUndulation(loc.lat, loc.lng, 'EGM96');
      ellipVal = loc.altitude + egm96Undulation;
    }
    
    const ellipsoidalH = ellipVal !== null ? ellipVal.toFixed(2) : '---';
    
    // Ondülasyon hesapla: Elipsoid - Orto
    let undulationVal = '---';
    if (ellipVal !== null && correctedH !== null) {
      undulationVal = (ellipVal - correctedH).toFixed(2);
    }

    const accuracy = loc.accuracy.toFixed(2);
    const duration = (loc.measurementDuration || 0).toString();

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
    { wch: 15 }, // Yükseklik
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

export const downloadTechnicalReport = (location: SavedLocation) => {
  if (!location.samples || location.samples.length === 0) {
    alert("Bu noktaya ait ham veri (örneklem) bulunamadı. Teknik rapor sadece yeni ölçülen noktalar için oluşturulabilir.");
    return;
  }

  const sys = location.coordinateSystem || 'WGS84';
  const isWGS84 = sys === 'WGS84';
  const header1 = isWGS84 ? "Enlem" : "Sağa (Y)";
  const header2 = isWGS84 ? "Boylam" : "Yukarı (X)";

  // --- İstatistiksel Ön Hazırlık ---
  const accuracyLimit = location.accuracyLimit || 5.0;
  
  // Önce hassas verileri filtrele (Daha sonra sigma hesaplaması için temel)
  const validSamples = location.samples.map((s, idx) => {
    const { x, y } = convertCoordinate(s.lat, s.lng, sys);
    return { 
      idx, 
      x: isWGS84 ? s.lat : x, 
      y: isWGS84 ? s.lng : y, 
      z: s.altitude,
      raw: s
    };
  });

  // Aritmetik Ortalama (Hassasiyete bakılmaksızın tümü)
  const allX = validSamples.map(s => s.x);
  const allY = validSamples.map(s => s.y);
  const allZ = validSamples.filter(s => s.z !== null).map(s => s.z as number);
  
  const avgX = allX.reduce((a, b) => a + b, 0) / allX.length;
  const avgY = allY.reduce((a, b) => a + b, 0) / allY.length;
  const avgZ = allZ.length > 0 ? allZ.reduce((a, b) => a + b, 0) / allZ.length : 0;

  // Sigma Hesaplama (Mesafe bazlı)
  const distances = validSamples.map(s => Math.sqrt(Math.pow(s.x - avgX, 2) + Math.pow(s.y - avgY, 2)));
  const sumSqDist = distances.reduce((a, b) => a + Math.pow(b, 2), 0);
  const sigma = Math.sqrt(sumSqDist / validSamples.length) || 0.00000001; // Bölme hatası olmasın

  // Filtreleme Fonksiyonu
  const getFilteredMean = (sigmaMultiplier: number | null) => {
    let filtered = validSamples;
    
    // Önce hassasiyet sınırı (Eğer sigmaMultiplier varsa accuracy de elenir)
    if (sigmaMultiplier !== null) {
      filtered = filtered.filter(s => s.raw.accuracy <= accuracyLimit);
    }

    if (sigmaMultiplier !== null) {
      filtered = filtered.filter((s, idx) => distances[s.idx] <= sigmaMultiplier * sigma);
    }

    if (filtered.length === 0) return { x: 0, y: 0, z: 0, count: 0 };
    
    const fX = filtered.reduce((a, b) => a + b.x, 0) / filtered.length;
    const fY = filtered.reduce((a, b) => a + b.y, 0) / filtered.length;
    const fZArr = filtered.filter(s => s.z !== null).map(s => s.z as number);
    const fZ = fZArr.length > 0 ? fZArr.reduce((a, b) => a + b, 0) / fZArr.length : 0;
    
    return { x: fX, y: fY, z: fZ, count: filtered.length };
  };

  const statsAll = { x: avgX, y: avgY, z: avgZ, count: validSamples.length };
  const statsS1 = getFilteredMean(1);
  const statsS2 = getFilteredMean(2);
  const statsS3 = getFilteredMean(3);

  // --- Medyan Hesaplama ---
  const getMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const medX = getMedian(allX);
  const medY = getMedian(allY);
  const medZ = getMedian(allZ);

  const dataRows = location.samples.map((s, idx) => {
    const { x, y } = convertCoordinate(s.lat, s.lng, sys);
    const val1 = isWGS84 ? s.lat.toFixed(8) : x.toFixed(3);
    const val2 = isWGS84 ? s.lng.toFixed(8) : y.toFixed(3);
    
    const dist = distances[idx];
    let status = "Kullanıldı";

    if (s.accuracy > accuracyLimit) {
      status = `Düşük Hass. (> ${accuracyLimit}m)`;
    } else if (dist > 3 * sigma) {
      status = "Elendi (Sigma 3+)";
    } else if (dist > 2 * sigma) {
      status = "Elendi (Sigma 2)";
    } else if (dist > 1 * sigma) {
      status = "Elendi (Sigma 1)";
    }

    return [
      idx + 1,
      new Date(s.timestamp).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      val1,
      val2,
      s.altitude !== null ? s.altitude.toFixed(3) : '---',
      s.accuracy.toFixed(3),
      s.altitudeAccuracy !== null ? s.altitudeAccuracy.toFixed(3) : '---',
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
    ["No", "Saat", header1, header2, "Yükseklik (m)", "Hassasiyet (m)", "Dikey Hass. (m)", "Durum"],
    ...dataRows,
    [],
    ["İSTATİSTİKSEL HESAPLAMA ÖZETİ"],
    ["Yöntem", header1, header2, "Yükseklik (m)", "Kullanılan Veri"],
    ["Aritmetik Ortalama", isWGS84 ? statsAll.x.toFixed(8) : statsAll.x.toFixed(3), isWGS84 ? statsAll.y.toFixed(8) : statsAll.y.toFixed(3), statsAll.z.toFixed(3), `${statsAll.count} / ${location.samples.length}`],
    ["Medyan Değerler", isWGS84 ? medX.toFixed(8) : medX.toFixed(3), isWGS84 ? medY.toFixed(8) : medY.toFixed(3), medZ.toFixed(3), `${location.samples.length} / ${location.samples.length}`],
    ["1-Sigma Filtreli (68%)", isWGS84 ? statsS1.x.toFixed(8) : statsS1.x.toFixed(3), isWGS84 ? statsS1.y.toFixed(8) : statsS1.y.toFixed(3), statsS1.z.toFixed(3), `${statsS1.count} / ${location.samples.length}`],
    ["2-Sigma Filtreli (95%)", isWGS84 ? statsS2.x.toFixed(8) : statsS2.x.toFixed(3), isWGS84 ? statsS2.y.toFixed(8) : statsS2.y.toFixed(3), statsS2.z.toFixed(3), `${statsS2.count} / ${location.samples.length}`],
    ["3-Sigma Filtreli (99%)", isWGS84 ? statsS3.x.toFixed(8) : statsS3.x.toFixed(3), isWGS84 ? statsS3.y.toFixed(8) : statsS3.y.toFixed(3), statsS3.z.toFixed(3), `${statsS3.count} / ${location.samples.length}`],
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