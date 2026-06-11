import proj4 from 'proj4';

// WGS84 zaten proj4'ün varsayılanı
const WGS84 = 'EPSG:4326';

// ITRF96 ~ WGS84 kabul edilebilir pratik kullanımda (hassas dönüşüm için parametreler gerekir ama mobil GPS hassasiyeti için ihmal edilebilir)
// UTM Dilim hesaplama fonksiyonu
const getUTMZone = (lon: number) => {
  return Math.floor((lon + 180) / 6) + 1;
};

const getDom3 = (lon: number) => {
    // 3 derecelik dilim orta meridyeni
    // Türkiye için dilimler: 27, 30, 33, 36, 39, 42, 45
    // Formül: DOM = Round(lon / 3) * 3
    return Math.round(lon / 3) * 3;
};

const getDom6 = (lon: number) => {
    // 6 derecelik dilim orta meridyeni (UTM)
    // Zone = floor((lon + 180) / 6) + 1
    // DOM = Zone * 6 - 183
    const zone = Math.floor((lon + 180) / 6) + 1;
    return zone * 6 - 183;
};

export const getSystemDisplayLabel = (system: string | undefined): string => {
  if (!system || system === 'WGS84') return 'WGS84 (Enlem-Boylam)';
  switch (system) {
    case 'ITRF96_3': return 'ITRF96 - 3° - TM';
    case 'ITRF96_6': return 'ITRF96 - 6° - UTM';
    case 'ED50_3': return 'ED50 - 3° - TM';
    case 'ED50_6': return 'ED50 - 6° - UTM';
    default: return system.replace('_', ' ');
  }
};

export const convertCoordinate = (lat: number, lng: number, system: string) => {
  if (!system || system === 'WGS84') {
    return { x: lat, y: lng, labelX: 'Enlem', labelY: 'Boylam', zone: '' };
  }

  let destProj = '';
  let zoneLabel = '';

  if (system === 'ITRF96_3') {
    const dom = getDom3(lng);
    destProj = `+proj=tmerc +lat_0=0 +lon_0=${dom} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs`;
    zoneLabel = `DOM ${dom}`;
  } else if (system === 'ED50_3') {
    const dom = getDom3(lng);
    // Türkiye için ortalama ED50-WGS84 dönüşüm parametreleri (HGM/EPSG standartları)
    // +towgs84=dX,dY,dZ,Rx,Ry,Rz,dS
    destProj = `+proj=tmerc +lat_0=0 +lon_0=${dom} +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs`;
    zoneLabel = `DOM ${dom}`;
  } else if (system === 'ED50_6' || system === 'ITRF96_6') {
    const dom = getDom6(lng);
    const zone = getUTMZone(lng);
    const ellps = system.startsWith('ITRF96') ? 'GRS80' : 'intl';
    const towgs84 = system.startsWith('ED50') ? '+towgs84=-87,-98,-121,0,0,0,0 ' : '';
    destProj = `+proj=utm +zone=${zone} +ellps=${ellps} ${towgs84}+units=m +no_defs`;
    zoneLabel = `Zon ${zone}`;
  }

  if (destProj) {
    try {
      const [easting, northing] = proj4(WGS84, destProj, [lng, lat]);
      return { x: easting, y: northing, labelX: 'Sağa (Y)', labelY: 'Yukarı (X)', zone: zoneLabel };
    } catch (e) {
      console.error("Proj4 conversion error:", e);
      return { x: lat, y: lng, labelX: 'Enlem', labelY: 'Boylam', zone: 'Hata' };
    }
  }

  return { x: lat, y: lng, labelX: 'Enlem', labelY: 'Boylam', zone: '' };
};

export const convertToWGS84 = (valE: number, valN: number, system: string, zoneParam?: number) => {
  if (!system || system === 'WGS84') {
    return { lat: valE, lng: valN };
  }

  let srcProj = '';

  if (system === 'ITRF96_3' || system === 'ED50_3') {
    // zoneParam is DOM for 3-degree systems
    const dom = zoneParam || 33;
    const ellps = system.startsWith('ITRF96') ? 'GRS80' : 'intl';
    const towgs84 = system.startsWith('ED50') ? '+towgs84=-87,-98,-121,0,0,0,0 ' : '';
    srcProj = `+proj=tmerc +lat_0=0 +lon_0=${dom} +k=1 +x_0=500000 +y_0=0 +ellps=${ellps} ${towgs84}+units=m +no_defs`;
  } else if (system === 'ED50_6' || system === 'ITRF96_6') {
     // zoneParam is UTM Zone for 6-degree systems
     const zone = zoneParam || 36;
     const ellps = system.startsWith('ITRF96') ? 'GRS80' : 'intl';
     const towgs84 = system.startsWith('ED50') ? '+towgs84=-87,-98,-121,0,0,0,0 ' : '';
     srcProj = `+proj=utm +zone=${zone} +ellps=${ellps} ${towgs84}+units=m +no_defs`;
  }

  if (srcProj) {
    try {
      // proj4 takes [longitude, latitude] or [easting, northing]
      const [lngResult, latResult] = proj4(srcProj, WGS84, [valE, valN]);
      return { lat: latResult, lng: lngResult };
    } catch (e) {
      console.error("Proj4 reverse conversion error:", e);
    }
  }

  return { lat: valE, lng: valN };
};

export const getWGS84Coefficients = (latDegree: number): { latCoeff: number; lngCoeff: number } => {
  const latRad = (latDegree * Math.PI) / 180;
  
  // WGS-84 Semimajor axis (a) and flattening (f)
  const a = 6378137.0; // meters
  const f = 1 / 298.257223563;
  // Eccentricity squared (e^2)
  const e2 = 2 * f - f * f; // approximately 0.00669437999014
  
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  
  const temp = 1.0 - e2 * sinLat * sinLat;
  const sqrtTemp = Math.sqrt(temp);
  
  // Meridional radius of curvature (M) - N-S direction
  const M = (a * (1.0 - e2)) / (temp * sqrtTemp);
  
  // Prime vertical radius of curvature (N) - E-W direction
  const N = a / sqrtTemp;
  
  // 1 degree in meters:
  const latCoeff = (M * Math.PI) / 180.0;
  const lngCoeff = (N * Math.PI / 180.0) * cosLat;
  
  return { latCoeff, lngCoeff };
};

