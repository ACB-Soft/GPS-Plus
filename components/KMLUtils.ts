import { SavedLocation } from '../types';
import { BRAND_NAME, FULL_BRAND } from '../version';

/**
 * Generates circle coordinates in KML format (lng,lat,alt)
 * around a point (lat, lng) with radius in meters.
 */
export const createCircleKmlCoordinates = (
  lat: number,
  lng: number,
  radiusMeters: number,
  numPoints: number = 120
): string => {
  if (!radiusMeters || radiusMeters <= 0 || isNaN(radiusMeters)) {
    return '';
  }

  const R = 6378137; // Earth radius in meters (WGS84 equatorial)
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const d = radiusMeters / R;

  const coords: string[] = [];

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

    coords.push(`${lng2.toFixed(8)},${lat2.toFixed(8)},0`);
  }

  return coords.join(' ');
};

export const generateKML = (locations: SavedLocation[], projectName: string): string => {
  const dateStr = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
  const folderName = `${projectName}_${dateStr}`;

  const pointPlacemarks = locations.map(loc => {
    const safeName = escapeXml(loc.name);

    return `
    <Placemark>
      <name>${safeName}</name>
      <styleUrl>#pointStyle</styleUrl>
      <description></description>
      <Point>
        <altitudeMode>clampToGround</altitudeMode>
        <coordinates>${loc.lng},${loc.lat},0</coordinates>
      </Point>
    </Placemark>`;
  }).join('');

  const circlePlacemarks = locations.map(loc => {
    const radius = loc.accuracy || loc.accuracyLimit || 0;
    if (!radius || radius <= 0) return '';

    const circleCoords = createCircleKmlCoordinates(loc.lat, loc.lng, radius, 120);
    if (!circleCoords) return '';

    const safeName = escapeXml(loc.name);

    return `
    <Placemark>
      <name>${safeName} - Hassasiyet</name>
      <styleUrl>#accuracyCircleStyle</styleUrl>
      <description></description>
      <Polygon>
        <tessellate>1</tessellate>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${circleCoords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
  }).filter(Boolean).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(folderName)}</name>
    <description>${FULL_BRAND} tarafından oluşturuldu.</description>
    
    <Style id="pointStyle">
      <IconStyle>
        <scale>1.1</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
        </Icon>
        <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
      </IconStyle>
      <LabelStyle>
        <scale>0.9</scale>
      </LabelStyle>
    </Style>

    <Style id="accuracyCircleStyle">
      <LineStyle>
        <color>bff6823b</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>80f6823b</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>

    <Folder>
      <name>Ölçüm Noktaları</name>
      <open>1</open>
      ${pointPlacemarks}
    </Folder>

    ${circlePlacemarks ? `
    <Folder>
      <name>Hassasiyet Çemberleri</name>
      <open>1</open>
      ${circlePlacemarks}
    </Folder>` : ''}
  </Document>
</kml>`;
};

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const downloadKML = (locations: SavedLocation[]) => {
  if (locations.length === 0) {
    alert("Kayıt bulunamadı.");
    return;
  }
  
  const projectName = locations[0].folderName || "Proje";
  const kmlContent = generateKML(locations, projectName);
  const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');
  
  link.href = url;
  link.download = `GPS_${projectName}_${dateStr}_${timeStr}.kml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareKML = async (locations: SavedLocation[]) => {
  if (locations.length === 0) return;
  
  const projectName = locations[0].folderName || "Proje";
  const kmlContent = generateKML(locations, projectName);
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');
  const fileName = `GPS_${projectName}_${dateStr}_${timeStr}.kml`;
  
  const file = new File([kmlContent], fileName, { type: 'application/vnd.google-earth.kml+xml' });

  if (navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: `${BRAND_NAME} Saha Verileri`,
        text: `Google Earth için ${BRAND_NAME} tarafından hazırlanan veriler.`
      });
    } catch (err) {
      console.error("Sharing failed", err);
      downloadKML(locations); // Fallback to download
    }
  } else {
    downloadKML(locations);
  }
};