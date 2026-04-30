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
    
    // WGS84 ise 6 basamak, değilse (UTM vb.) 1 basamak (virgülden sonra sıfır olsa bile gösterilir)
    const val1 = isWGS84 ? y.toFixed(6) : x.toFixed(1);
    const val2 = isWGS84 ? x.toFixed(6) : y.toFixed(1);
    
    const correctedH = getCorrectedHeight(loc.lat, loc.lng, loc.altitude);
    const orthometricH = correctedH !== null ? correctedH.toFixed(1) : '---';
    
    // iOS cihazlarda ham veri (loc.altitude) ortometrik (MSL) olduğu için 
    // elipsoid yüksekliği hesaplanırken EGM96 ondülasyonu eklenmelidir.
    let ellipVal = loc.altitude;
    if (isIOS && loc.altitude !== null) {
      const egm96Undulation = geoidService.getUndulation(loc.lat, loc.lng, 'EGM96');
      ellipVal = loc.altitude + egm96Undulation;
    }
    
    const ellipsoidalH = ellipVal !== null ? ellipVal.toFixed(1) : '---';
    const accuracy = loc.accuracy.toFixed(1);
    const duration = (loc.measurementDuration || 0).toString();

    return [
      loc.name,
      val1, // Sağa (Y) veya Enlem
      val2, // Yukarı (X) veya Boylam
      orthometricH,
      ellipsoidalH,
      accuracy,
      duration,
      new Date(loc.timestamp).toLocaleString('tr-TR')
    ];
  });

  const ws_data = [
    [`"${FULL_BRAND}" tarafindan olusturuldu.`],
    [],
    ["Proje Adı:", projectName],
    ["Proje Koordinat Sistemi:", projectSystem],
    [], 
    ["Nokta İsmi", header1, header2, "Yükseklik (m)", "Elipsoidal Yükseklik (m)", "Hassasiyet (m)", "Gözlem Süresi (sn)", "Tarih"],
    ...dataRows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  
  const wscols = [
    { wch: 15 }, // Nokta İsmi
    { wch: 18 }, // Sağa (Y) / Enlem
    { wch: 18 }, // Yukarı (X) / Boylam
    { wch: 15 }, // Yükseklik
    { wch: 20 }, // Elipsoidal Yükseklik
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