import { SavedLocation, AppSettings } from '../types';
import { convertCoordinate } from '../utils/CoordinateUtils';
import { getGeoidInfo } from './GeoidUtils';
import shpwrite from '@mapbox/shp-write';

/**
 * Generates circle polygon coordinates as [lng, lat] array in WGS84
 * around a center point (lat, lng) with radius in meters.
 */
export const createCirclePolygonCoordinates = (
  lat: number,
  lng: number,
  radiusMeters: number,
  numPoints: number = 64
): [number, number][] => {
  if (!radiusMeters || radiusMeters <= 0 || isNaN(radiusMeters)) {
    return [];
  }

  const R = 6378137; // Earth radius in meters (WGS84 equatorial)
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const d = radiusMeters / R;

  const coords: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const bearing = (i * (360 / numPoints) * Math.PI) / 180;

    const lat2Rad = Math.asin(
      Math.sin(latRad) * Math.cos(d) +
      Math.cos(latRad) * Math.sin(d) * Math.cos(bearing)
    );

    const lng2Rad = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
      Math.cos(d) - Math.sin(latRad) * Math.sin(lat2Rad)
    );

    const lat2 = (lat2Rad * 180) / Math.PI;
    const lng2 = (lng2Rad * 180) / Math.PI;

    coords.push([parseFloat(lng2.toFixed(8)), parseFloat(lat2.toFixed(8))]);
  }

  return coords;
};

export const downloadSHP = (locations: SavedLocation[], settings: AppSettings, language: 'TR' | 'EN' = 'TR') => {
  if (locations.length === 0) {
    alert(language === 'EN' ? "No records found." : "Kayıt bulunamadı.");
    return;
  }

  const uniqueFolders = Array.from(new Set(locations.map(l => l.folderName)));
  const projectName = uniqueFolders.length === 1 ? uniqueFolders[0] : (language === 'EN' ? "Multi_Project" : "Coklu_Proje");

  const isWGS84 = locations[0].coordinateSystem === 'WGS84' || !locations[0].coordinateSystem;

  const pointFeatures: any[] = [];
  const polygonFeatures: any[] = [];

  locations.forEach((loc) => {
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
    const radius = loc.accuracy || loc.accuracyLimit || 0;
    
    const pointProperties = language === 'EN' ? {
      Point_Name: loc.name,
      Y_Easting: isWGS84 ? "0.000" : x.toFixed(3),
      X_Northing: isWGS84 ? "0.000" : y.toFixed(3),
      Latitude: loc.lat.toFixed(7),
      Longitude: loc.lng.toFixed(7),
      "H-Orthometric": orthometricH !== null ? orthometricH.toFixed(3) : "0.000",
      "h-Ellipsoid": ellipsoidalH !== null ? ellipsoidalH.toFixed(3) : "0.000",
      Accuracy_m: radius.toFixed(2),
      Coord_Sys: loc.coordinateSystem || 'WGS84'
    } : {
      Nokta_Adi: loc.name,
      Y_Saga: isWGS84 ? "0.000" : x.toFixed(3),
      X_Yukari: isWGS84 ? "0.000" : y.toFixed(3),
      Enlem: loc.lat.toFixed(7),
      Boylam: loc.lng.toFixed(7),
      "H-Ortometrik": orthometricH !== null ? orthometricH.toFixed(3) : "0.000",
      "h-Elipsoid": ellipsoidalH !== null ? ellipsoidalH.toFixed(3) : "0.000",
      Hassas_m: radius.toFixed(2),
      Koor_Sis: loc.coordinateSystem || 'WGS84'
    };

    pointFeatures.push({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [outLng, outLat] 
      },
      properties: pointProperties
    });

    // Create Accuracy Circle polygon feature if accuracy/radius > 0
    if (radius > 0) {
      const ring = createCirclePolygonCoordinates(loc.lat, loc.lng, radius, 64);
      if (ring.length > 0) {
        const polyProperties = language === 'EN' ? {
          Point_Name: loc.name,
          Accuracy_m: radius.toFixed(2),
          Radius_m: radius.toFixed(2)
        } : {
          Nokta_Adi: loc.name,
          Hassas_m: radius.toFixed(2),
          Yaricap_m: radius.toFixed(2)
        };

        polygonFeatures.push({
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [ring]
          },
          properties: polyProperties
        });
      }
    }
  });

  const geojson = {
    type: "FeatureCollection" as const,
    features: [...pointFeatures, ...polygonFeatures]
  };

  const options = {
    folder: projectName,
    types: {
      point: language === 'EN' ? 'Points' : 'Noktalar',
      polygon: language === 'EN' ? 'Hassasiyet_Cemberleri' : 'Hassasiyet_Cemberleri',
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
