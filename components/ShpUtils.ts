import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { getGeoidInfo } from './GeoidUtils';
import shpwrite from '@mapbox/shp-write';

export const downloadSHP = (locations: SavedLocation[], settings: AppSettings, language: 'TR' | 'EN' = 'TR') => {
  if (locations.length === 0) {
    alert(language === 'EN' ? "No records found." : "Kayıt bulunamadı.");
    return;
  }

  const uniqueFolders = Array.from(new Set(locations.map(l => l.folderName)));
  const projectName = uniqueFolders.length === 1 ? uniqueFolders[0] : (language === 'EN' ? "Multi_Project" : "Coklu_Proje");

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

    // GeoJSON geometries MUST be in WGS84 [Longitude, Latitude] for standard compatibility,
    // especially since we use the default WGS84 .prj file provided by shp-write.
    const outLng = loc.lng;
    const outLat = loc.lat;
    
    const properties = language === 'EN' ? {
      Point_Name: loc.name,
      Y_Easting: isWGS84 ? "0.000" : x.toFixed(3),
      X_Northing: isWGS84 ? "0.000" : y.toFixed(3),
      Latitude: loc.lat.toFixed(7),
      Longitude: loc.lng.toFixed(7),
      "H-Orthometric": orthometricH !== null ? orthometricH.toFixed(3) : "0.000",
      "h-Ellipsoid": ellipsoidalH !== null ? ellipsoidalH.toFixed(3) : "0.000",
      Coord_Sys: loc.coordinateSystem || 'WGS84'
    } : {
      Nokta_Adi: loc.name,
      Y_Saga: isWGS84 ? "0.000" : x.toFixed(3),
      X_Yukari: isWGS84 ? "0.000" : y.toFixed(3),
      Enlem: loc.lat.toFixed(7),
      Boylam: loc.lng.toFixed(7),
      "H-Ortometrik": orthometricH !== null ? orthometricH.toFixed(3) : "0.000",
      "h-Elipsoid": ellipsoidalH !== null ? ellipsoidalH.toFixed(3) : "0.000",
      Koor_Sis: loc.coordinateSystem || 'WGS84'
    };

    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [outLng, outLat] 
      },
      properties
    };
  });

  const geojson = {
    type: "FeatureCollection" as const,
    features: features
  };

  const options = {
    folder: projectName,
    types: {
      point: language === 'EN' ? 'Points' : 'Noktalar',
      polygon: language === 'EN' ? 'Polygons' : 'Alanlar',
      line: language === 'EN' ? 'Lines' : 'Cizgiler'
    },
    outputType: 'blob',
    compression: 'DEFLATE'
  };

  // shpwrite.download expects a geojson object and options
  // It automatically triggers a download of a .zip file
  try {
    shpwrite.zip(geojson as any, options as any).then((content: any) => {
      // content is typically an ArrayBuffer or Blob depending on shpwrite version, 
      // @mapbox/shp-write's zip returns a Promise that resolves to an ArrayBuffer or Blob
      // Wait, let's see what zip() returns: we can just wrap it in a Blob.
      const blob = content instanceof Blob ? content : new Blob([content], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error("Shapefile oluşturulurken hata:", error);
    alert("Shapefile oluşturulamadı. Konsolu kontrol edin.");
  }
};
