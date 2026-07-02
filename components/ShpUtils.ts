import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { getGeoidInfo } from './GeoidUtils';
import shpwrite from 'shp-write';

export const downloadSHP = (locations: SavedLocation[], settings: AppSettings) => {
  if (locations.length === 0) {
    alert("Kayıt bulunamadı.");
    return;
  }

  const uniqueFolders = Array.from(new Set(locations.map(l => l.folderName)));
  const projectName = uniqueFolders.length === 1 ? uniqueFolders[0] : "Coklu_Proje";

  const isWGS84 = locations[0].coordinateSystem === 'WGS84' || !locations[0].coordinateSystem;

  const features = locations.map((loc, index) => {
    // x is Easting/Lat, y is Northing/Lng
    const { x, y } = convertCoordinate(loc.lat, loc.lng, loc.coordinateSystem || 'WGS84');

    const gInfo = getGeoidInfo(loc.lat, loc.lng, loc.altitude, loc.deviceOS);
    const isIOSDevice = /iPad|iPhone|iPod/.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') || (typeof navigator !== 'undefined' && (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
    const isIOS = loc.deviceOS ? (loc.deviceOS === 'iOS') : isIOSDevice;
    
    let ellipsoidalH = loc.altitude;
    if (isIOS && loc.altitude !== null) {
      ellipsoidalH = loc.altitude + gInfo.undulation;
    }
    const orthometricH = gInfo.orthometricHeight;

    // Output coordinates in the requested coordinate system
    // For WGS84: GeoJSON requires [Longitude, Latitude]
    // For local grid: [Easting (Y), Northing (X)]
    // x is Easting for Grid and Latitude for WGS84
    // y is Northing for Grid and Longitude for WGS84
    const outX = isWGS84 ? y : x; // Lng or Easting (Y)
    const outY = isWGS84 ? x : y; // Lat or Northing (X)
    
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [outX, outY] 
      },
      properties: {
        Nokta_Adi: loc.name,
        Y_Saga: isWGS84 ? 0 : parseFloat(x.toFixed(3)),
        X_Yukari: isWGS84 ? 0 : parseFloat(y.toFixed(3)),
        Enlem: isWGS84 ? parseFloat(x.toFixed(7)) : 0,
        Boylam: isWGS84 ? parseFloat(y.toFixed(7)) : 0,
        Ortometrik: orthometricH !== null ? parseFloat(orthometricH.toFixed(3)) : 0,
        Elipsoid_H: ellipsoidalH !== null ? parseFloat(ellipsoidalH.toFixed(3)) : 0,
        Koor_Sis: loc.coordinateSystem || 'WGS84'
      }
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features: features
  };

  const options = {
    folder: projectName,
    types: {
      point: 'Noktalar',
      polygon: 'Alanlar',
      line: 'Cizgiler'
    }
  };

  // shpwrite.download expects a geojson object and options
  // It automatically triggers a download of a .zip file
  try {
    shpwrite.download(geojson, options);
  } catch (error) {
    console.error("Shapefile oluşturulurken hata:", error);
    alert("Shapefile oluşturulamadı. Konsolu kontrol edin.");
  }
};
