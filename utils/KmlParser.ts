import { StakeoutPoint, StakeoutGeometry } from '../types';

export const parseKML = (text: string): { points: StakeoutPoint[], geometries: StakeoutGeometry[] } => {
  // Pre-process text to fix common XML namespace issues
  // Some KML files use xsi:schemaLocation without declaring the xsi namespace
  let processedText = text;
  
  // If xsi prefix is used but not defined, we can either define it or just strip the schemaLocation
  if (processedText.includes('xsi:') && !processedText.includes('xmlns:xsi')) {
    // Try to inject it into the first tag (usually <kml or <Document)
    processedText = processedText.replace(/(<[a-zA-Z0-9:]+)/, '$1 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(processedText, "text/xml");
  
  // Check for parsing errors
  const errorNode = xmlDoc.getElementsByTagName("parsererror")[0];
  if (errorNode) {
    console.error("KML Parsing Error:", errorNode.textContent);
    // Try to fix common XML issues if possible, or just return empty
  }

  // Use getElementsByTagNameNS to find Placemarks regardless of namespace prefix
  const placemarks = xmlDoc.getElementsByTagNameNS("*", "Placemark");
  const points: StakeoutPoint[] = [];
  const geometries: StakeoutGeometry[] = [];

  const kmlColorToCss = (kmlColor: string): string => {
    if (!kmlColor || kmlColor.length !== 8) return '#3b82f6'; // Default blue
    // KML: aabbggrr -> CSS: #rrggbbaa
    const aa = kmlColor.substring(0, 2);
    const bb = kmlColor.substring(2, 4);
    const gg = kmlColor.substring(4, 6);
    const rr = kmlColor.substring(6, 8);
    return `#${rr}${gg}${bb}${aa}`;
  };

  const getStyleColor = (pm: Element): string | undefined => {
    // Try to find inline color first
    const lineStyle = pm.getElementsByTagNameNS("*", "LineStyle")[0];
    const polyStyle = pm.getElementsByTagNameNS("*", "PolyStyle")[0];
    const colorTag = (lineStyle || polyStyle)?.getElementsByTagNameNS("*", "color")[0];
    if (colorTag?.textContent) {
      return kmlColorToCss(colorTag.textContent.trim());
    }
    return undefined;
  };

  const parseCoords = (coordsText: string): { lat: number, lng: number, altitude?: number }[] => {
    // KML coordinates are: lng,lat,alt (alt is optional)
    // They can be separated by spaces, tabs, or newlines
    return coordsText.trim().split(/[\s\n\r]+/).map(coordStr => {
      const parts = coordStr.split(",").map(p => p.trim());
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        const altitude = parts.length >= 3 ? parseFloat(parts[2]) : undefined;
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng, altitude };
        }
      }
      return null;
    }).filter((c): c is NonNullable<typeof c> => c !== null);
  };

  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i];
    // Find the immediate name child of the Placemark to avoid picking up names from children geometries
    let name = "";
    for (let j = 0; j < pm.childNodes.length; j++) {
      const node = pm.childNodes[j];
      if (node.nodeType === 1 && (node.nodeName === "name" || node.nodeName.endsWith(":name"))) {
        name = node.textContent || "";
        break;
      }
    }
    if (!name) name = `Nesne ${i + 1}`;
    
    const color = getStyleColor(pm);
    
    // Check for Points (could be multiple in MultiGeometry)
    const pointElements = pm.getElementsByTagNameNS("*", "Point");
    for (let j = 0; j < pointElements.length; j++) {
      const coordsText = pointElements[j].getElementsByTagNameNS("*", "coordinates")[0]?.textContent;
      if (coordsText) {
        const coords = parseCoords(coordsText);
        if (coords.length > 0) {
          points.push({
            id: `kml-pt-${Date.now()}-${i}-${j}`,
            name: pointElements.length > 1 ? `${name} (${j + 1})` : name,
            lat: coords[0].lat,
            lng: coords[0].lng,
            altitude: coords[0].altitude,
            coordinateSystem: 'WGS84',
            originalX: coords[0].lng,
            originalY: coords[0].lat,
            color
          });
        }
      }
    }

    // Check for LineStrings
    const lineElements = pm.getElementsByTagNameNS("*", "LineString");
    for (let j = 0; j < lineElements.length; j++) {
      const coordsText = lineElements[j].getElementsByTagNameNS("*", "coordinates")[0]?.textContent;
      if (coordsText) {
        const coords = parseCoords(coordsText);
        if (coords.length > 0) {
          geometries.push({
            id: `kml-line-${Date.now()}-${i}-${j}`,
            name: lineElements.length > 1 ? `${name} (Çizgi ${j + 1})` : name,
            type: 'LineString',
            coordinates: coords,
            color
          });
        }
      }
    }

    // Check for Polygons
    const polyElements = pm.getElementsByTagNameNS("*", "Polygon");
    for (let j = 0; j < polyElements.length; j++) {
      const coordsText = polyElements[j].getElementsByTagNameNS("*", "coordinates")[0]?.textContent;
      if (coordsText) {
        const coords = parseCoords(coordsText);
        if (coords.length > 0) {
          geometries.push({
            id: `kml-poly-${Date.now()}-${i}-${j}`,
            name: polyElements.length > 1 ? `${name} (Alan ${j + 1})` : name,
            type: 'Polygon',
            coordinates: coords,
            color
          });
        }
      }
    }
  }

  return { points, geometries };
};
