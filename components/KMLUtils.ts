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
  numPoints: number = 64
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
    const acc = loc.accuracy || loc.accuracyLimit || 0;
    const alt = loc.altitude !== null && loc.altitude !== undefined ? loc.altitude : 0;
    const safeName = escapeXml(loc.name);

    return `
    <Placemark>
      <name>${safeName}</name>
      <styleUrl>#pointStyle</styleUrl>
      <description><![CDATA[
        <div style="font-family: sans-serif; font-size: 13px; color: #1e293b; min-width: 240px;">
          <div style="background: #2563eb; color: #ffffff; padding: 8px 12px; font-weight: bold; font-size: 14px; border-radius: 6px 6px 0 0;">
            📍 ${safeName}
          </div>
          <div style="padding: 10px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 6px 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.6;">
              <tr>
                <td style="color: #64748b; font-weight: bold; width: 45%;">Enlem (Lat):</td>
                <td style="color: #0f172a; font-family: monospace;">${loc.lat.toFixed(8)}°</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: bold;">Boylam (Lng):</td>
                <td style="color: #0f172a; font-family: monospace;">${loc.lng.toFixed(8)}°</td>
              </tr>
              ${loc.altitude !== null && loc.altitude !== undefined ? `
              <tr>
                <td style="color: #64748b; font-weight: bold;">Yükseklik (H):</td>
                <td style="color: #0f172a; font-family: monospace;">${loc.altitude.toFixed(3)} m</td>
              </tr>
              ` : ''}
              <tr>
                <td style="color: #2563eb; font-weight: bold;">Hassasiyet:</td>
                <td style="color: #2563eb; font-weight: bold; font-family: monospace;">±${acc.toFixed(2)} m</td>
              </tr>
              ${loc.folderName ? `
              <tr>
                <td style="color: #64748b; font-weight: bold;">Klasör:</td>
                <td style="color: #0f172a;">${escapeXml(loc.folderName)}</td>
              </tr>
              ` : ''}
              ${loc.measurementDuration ? `
              <tr>
                <td style="color: #64748b; font-weight: bold;">Ölçüm Süresi:</td>
                <td style="color: #0f172a;">${loc.measurementDuration} sn</td>
              </tr>
              ` : ''}
              ${loc.calculationMethod ? `
              <tr>
                <td style="color: #64748b; font-weight: bold;">Yöntem:</td>
                <td style="color: #0f172a;">${escapeXml(loc.calculationMethod)}</td>
              </tr>
              ` : ''}
              ${loc.description ? `
              <tr>
                <td style="color: #64748b; font-weight: bold;">Açıklama:</td>
                <td style="color: #0f172a;">${escapeXml(loc.description)}</td>
              </tr>
              ` : ''}
            </table>
          </div>
        </div>
      ]]></description>
      <Point>
        <altitudeMode>clampToGround</altitudeMode>
        <coordinates>${loc.lng},${loc.lat},${alt}</coordinates>
      </Point>
    </Placemark>`;
  }).join('');

  const circlePlacemarks = locations.map(loc => {
    const radius = loc.accuracy || loc.accuracyLimit || 0;
    if (!radius || radius <= 0) return '';

    const circleCoords = createCircleKmlCoordinates(loc.lat, loc.lng, radius, 64);
    if (!circleCoords) return '';

    const safeName = escapeXml(loc.name);

    return `
    <Placemark>
      <name>${safeName} - Hassasiyet Çemberi (±${radius.toFixed(2)}m)</name>
      <styleUrl>#accuracyCircleStyle</styleUrl>
      <description><![CDATA[
        <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 6px;">
          <b>Ölçüm Noktası:</b> ${safeName}<br/>
          <b>Donanımsal Konumsal Hassasiyet:</b> ±${radius.toFixed(2)} m
        </div>
      ]]></description>
      <Polygon>
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
          <href>http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png</href>
        </Icon>
        <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
      </IconStyle>
      <LabelStyle>
        <scale>0.9</scale>
      </LabelStyle>
      <BalloonStyle>
        <text>$[description]</text>
      </BalloonStyle>
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