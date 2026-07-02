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
  let projectZone = "---";
  if (uniqueFolders.length === 1) {
     projectSystem = locations[0].coordinateSystem || 'WGS84';
     const { zone } = convertCoordinate(locations[0].lat, locations[0].lng, projectSystem);
     projectZone = zone || "---";
  }

  const isWGS84 = projectSystem === 'WGS84';
  const header1 = isWGS84 ? "Enlem" : "Sağa (Y)";
  const header2 = isWGS84 ? "Boylam" : "Yukarı (X)";

  let content = `Proje Adi:\t${projectName}\n`;
  content += `Koordinat Sistemi:\t${projectSystem}\n`;
  content += `Dilim Numarasi:\t${projectZone}\n\n`;
  
  content += `Nokta\t${header1}\t${header2}\tYükseklik (m)\th-Elipsoid (m)\tOndülasyon (N)\n`;
  content += "------------------------------------------------------------------------------------------------\n";

  locations.forEach(loc => {
    const { x, y } = convertCoordinate(loc.lat, loc.lng, loc.coordinateSystem || 'WGS84');
    const isUTM = loc.coordinateSystem && loc.coordinateSystem !== 'WGS84';
    
    const prec = settings.locationPrecision || 2;
    const valX = isUTM ? x.toFixed(prec) : x.toFixed(6);
    const valY = isUTM ? y.toFixed(prec) : y.toFixed(6);
    
    const hPrec = settings.heightPrecision || 2;
    const gInfo = getGeoidInfo(loc.lat, loc.lng, loc.altitude, loc.deviceOS);
    
    // For iOS deviceOS logic:
    const isIOSDevice = /iPad|iPhone|iPod/.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') || (typeof navigator !== 'undefined' && (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
    const isIOS = loc.deviceOS ? (loc.deviceOS === 'iOS') : isIOSDevice;
    
    let ellipsoidalH = loc.altitude;
    if (isIOS && loc.altitude !== null) {
      ellipsoidalH = loc.altitude + gInfo.undulation;
    }
    
    const orthometricH = gInfo.orthometricHeight;
    let undulationVal = '---';
    if (ellipsoidalH !== null && orthometricH !== null) {
      undulationVal = (ellipsoidalH - orthometricH).toFixed(hPrec);
    }
    
    const orthStr = orthometricH !== null ? orthometricH.toFixed(hPrec) : '---';
    const ellipStr = ellipsoidalH !== null ? ellipsoidalH.toFixed(hPrec) : '---';

    const firstVal = valX;
    const secondVal = valY;
    
    content += `${loc.name}\t${firstVal}\t${secondVal}\t${orthStr}\t${ellipStr}\t${undulationVal}\n`;
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