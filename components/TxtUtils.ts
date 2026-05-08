import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { FULL_BRAND } from '../version';
import { getGeoidInfo } from './GeoidUtils';

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

  let content = `Proje Adi:\t${projectName}\n`;
  content += `Koordinat Sistemi:\t${projectSystem}\n\n`;
  
  content += `Nokta\t${header1}\t${header2}\t${heightLabel}\n`;
  content += "----------------------------------------------------------------\n";

  locations.forEach(loc => {
    const { x, y } = convertCoordinate(loc.lat, loc.lng, loc.coordinateSystem || 'WGS84');
    const isUTM = loc.coordinateSystem && loc.coordinateSystem !== 'WGS84';
    
    // Konum duyarlılığı ayardan alınır (WGS84 için 6-7 basamak kalabilir veya ayar uygulanabilir)
    const prec = settings.locationPrecision || 2;
    const valX = isUTM ? x.toFixed(prec) : x.toFixed(6);
    const valY = isUTM ? y.toFixed(prec) : y.toFixed(6);
    
    const hPrec = settings.heightPrecision || 2;
    const gInfo = getGeoidInfo(loc.lat, loc.lng, loc.altitude);
    const ellipsoidalH = loc.altitude;
    const orthometricH = gInfo.orthometricHeight;
    
    const displayHeight = settings.heightType === 'orthometric' ? orthometricH : ellipsoidalH;
    
    // WGS84 ise valY (Enlem) önce gelir, valX (Boylam) sonra.
    // UTM ise valX (Sağa Y) önce gelir, valY (Yukarı X) sonra.
    const firstVal = isWGS84 ? valY : valX;
    const secondVal = isWGS84 ? valX : valY;
    
    content += `${loc.name}\t${firstVal}\t${secondVal}\t${displayHeight !== null ? displayHeight.toFixed(hPrec) : '---'}\n`;
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