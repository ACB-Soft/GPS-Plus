import { SavedLocation } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { FULL_BRAND } from '../version';
import { getCorrectedHeight } from './GeoidUtils';

export const downloadTXT = (locations: SavedLocation[]) => {
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

  let content = `Proje Adi:\t${projectName}\n`;
  content += `Koordinat Sistemi:\t${projectSystem}\n\n`;
  
  content += `Nokta\t${header1}\t${header2}\tYukseklik(m)\n`;
  content += "----------------------------------------------------------------\n";

  locations.forEach(loc => {
    const { x, y } = convertCoordinate(loc.lat, loc.lng, loc.coordinateSystem || 'WGS84');
    const isUTM = loc.coordinateSystem && loc.coordinateSystem !== 'WGS84';
    
    // UTM ise 2 basamak, WGS84 ise 6 basamak
    const valX = isUTM ? x.toFixed(2) : x.toFixed(6);
    const valY = isUTM ? y.toFixed(2) : y.toFixed(6);
    
    const correctedH = getCorrectedHeight(loc.lat, loc.lng, loc.altitude);
    
    // WGS84 ise valY (Enlem) önce gelir, valX (Boylam) sonra.
    // UTM ise valX (Sağa Y) önce gelir, valY (Yukarı X) sonra.
    const firstVal = isWGS84 ? valY : valX;
    const secondVal = isWGS84 ? valX : valY;
    
    content += `${loc.name}\t${firstVal}\t${secondVal}\t${correctedH !== null ? correctedH.toFixed(2) : '---'}\n`;
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