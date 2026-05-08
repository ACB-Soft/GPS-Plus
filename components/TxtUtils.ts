import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { FULL_BRAND } from '../version';
import { getGeoidInfo } from './GeoidUtils';
import { calculateResult, calculateRMSE } from '../utils/MathUtils';
import { geoidService } from '../services/GeoidService';

export const downloadTXT = (locations: SavedLocation[], settings: AppSettings) => {
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
  const heightLabel = settings.heightType === 'orthometric' ? "Yükseklik (m)" : "Elipsoidal Yükseklik (m)";

  // iOS Tespiti
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (typeof navigator !== 'undefined' && (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);

  let content = `${FULL_BRAND} SİSTEM MÜHENDİSLİĞİ\n`;
  content += `RESMİ ÖLÇÜM RAPORU (TEXT)\n`;
  content += `----------------------------------------------------------------\n`;
  content += `Proje Adı:\t${projectName}\n`;
  content += `Koordinat Sistemi:\t${projectSystem}\n`;
  content += `Hesaplama Yöntemi:\t${settings.calculationMethod}\n`;
  content += `Basım Tarihi:\t${new Date().toLocaleString('tr-TR')}\n`;
  content += `----------------------------------------------------------------\n\n`;
  
  content += `Nokta\t${header1}\t${header2}\t${heightLabel}\tHass.(m)\tRMSE(m)\n`;
  content += "----------------------------------------------------------------\n";

  locations.forEach(loc => {
    // Redo calculation to ensure consistency with current settings
    let resultCoord = { lat: loc.lat, lng: loc.lng, altitude: loc.altitude, accuracy: loc.accuracy };
    let rmse = 0;

    if (loc.samples && loc.samples.length > 0) {
       const accLimit = loc.accuracyLimit || settings.defaultAccuracyLimit || 5.0;
       const { result, usedIndices } = calculateResult(loc.samples, settings.calculationMethod, accLimit);
       resultCoord = result;
       
       const usedSamples = usedIndices.map(i => loc.samples![i]);
       rmse = calculateRMSE(usedSamples, result);
    }

    const { x, y } = convertCoordinate(resultCoord.lat, resultCoord.lng, loc.coordinateSystem || 'WGS84');
    const isUTM = loc.coordinateSystem && loc.coordinateSystem !== 'WGS84';
    
    const prec = settings.locationPrecision || 2;
    const valX = isUTM ? x.toFixed(prec) : x.toFixed(7);
    const valY = isUTM ? y.toFixed(prec) : y.toFixed(7);
    
    const hPrec = settings.heightPrecision || 2;
    const gInfo = getGeoidInfo(resultCoord.lat, resultCoord.lng, resultCoord.altitude);
    
    let ellipVal = resultCoord.altitude;
    if (isIOS && resultCoord.altitude !== null) {
      const egm96Undulation = geoidService.getUndulation(resultCoord.lat, resultCoord.lng, 'EGM96');
      ellipVal = resultCoord.altitude + egm96Undulation;
    }

    const orthometricH = gInfo.orthometricHeight;
    const displayHeight = settings.heightType === 'orthometric' ? orthometricH : ellipVal;
    
    // WGS84: Enlem (Lat/Y), Boylam (Lng/X)
    // UTM: Sağa (Y/X), Yukarı (X/Y)
    // According to CoordinateUtils: x is Lng/Easting, y is Lat/Northing
    const firstVal = isWGS84 ? valY : valX; // Enlem(lat) vs Sağa(x)
    const secondVal = isWGS84 ? valX : valY; // Boylam(lng) vs Yukarı(y)
    
    content += `${loc.name}\t${firstVal}\t${secondVal}\t${displayHeight !== null ? displayHeight.toFixed(hPrec) : '---'}\t${resultCoord.accuracy.toFixed(3)}\t${rmse.toFixed(4)}\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');
  
  link.href = url;
  link.download = `GPS_${projectName}_${dateStr}_${timeStr}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};