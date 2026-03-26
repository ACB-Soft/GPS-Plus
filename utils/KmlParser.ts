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
  const styles = xmlDoc.getElementsByTagNameNS("*", "Style");
  const styleMaps = xmlDoc.getElementsByTagNameNS("*", "StyleMap");
  
  const styleColorMap: { [id: string]: string } = {};
  const styleIconMap: { [id: string]: string } = {};

  const kmlColorToCss = (kmlColor: string): string => {
    if (!kmlColor || kmlColor.length !== 8) return '#3b82f6'; // Default blue
    // KML: aabbggrr -> CSS: #rrggbbaa
    const aa = kmlColor.substring(0, 2);
    const bb = kmlColor.substring(2, 4);
    const gg = kmlColor.substring(4, 6);
    const rr = kmlColor.substring(6, 8);
    return `#${rr}${gg}${bb}${aa}`;
  };

  // Parse shared styles
  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    const id = style.getAttribute("id");
    if (id) {
      // Color
      const lineStyle = style.getElementsByTagNameNS("*", "LineStyle")[0];
      const polyStyle = style.getElementsByTagNameNS("*", "PolyStyle")[0];
      const colorTag = (lineStyle || polyStyle)?.getElementsByTagNameNS("*", "color")[0];
      if (colorTag?.textContent) {
        styleColorMap[id] = kmlColorToCss(colorTag.textContent.trim());
      }
      
      // Icon
      const iconStyle = style.getElementsByTagNameNS("*", "IconStyle")[0];
      const iconHref = iconStyle?.getElementsByTagNameNS("*", "Icon")[0]?.getElementsByTagNameNS("*", "href")[0]?.textContent;
      if (iconHref) {
        styleIconMap[id] = iconHref.trim();
      }
    }
  }

  // Parse style maps (simple implementation: pick the first pair's style)
  for (let i = 0; i < styleMaps.length; i++) {
    const sm = styleMaps[i];
    const id = sm.getAttribute("id");
    if (id) {
      const pairs = sm.getElementsByTagNameNS("*", "Pair");
      for (let j = 0; j < pairs.length; j++) {
        const key = pairs[j].getElementsByTagNameNS("*", "key")[0]?.textContent;
        if (key === "normal") {
          const styleUrl = pairs[j].getElementsByTagNameNS("*", "styleUrl")[0]?.textContent;
          if (styleUrl) {
            const styleId = styleUrl.replace(/^#/, "");
            if (styleColorMap[styleId]) {
              styleColorMap[id] = styleColorMap[styleId];
            }
            if (styleIconMap[styleId]) {
              styleIconMap[id] = styleIconMap[styleId];
            }
          }
          break;
        }
      }
    }
  }

  const points: StakeoutPoint[] = [];
  const geometries: StakeoutGeometry[] = [];

  const getStyleColor = (pm: Element): string | undefined => {
    // 1. Try to find inline style first
    const inlineStyle = pm.getElementsByTagNameNS("*", "Style")[0];
    if (inlineStyle) {
      const lineStyle = inlineStyle.getElementsByTagNameNS("*", "LineStyle")[0];
      const polyStyle = inlineStyle.getElementsByTagNameNS("*", "PolyStyle")[0];
      const colorTag = (lineStyle || polyStyle)?.getElementsByTagNameNS("*", "color")[0];
      if (colorTag?.textContent) {
        return kmlColorToCss(colorTag.textContent.trim());
      }
    }

    // 2. Try to find referenced styleUrl
    const styleUrl = pm.getElementsByTagNameNS("*", "styleUrl")[0]?.textContent;
    if (styleUrl) {
      const styleId = styleUrl.replace(/^#/, "");
      if (styleColorMap[styleId]) {
        return styleColorMap[styleId];
      }
    }

    // 3. Fallback to nested styles directly in Placemark (legacy/simple KML)
    const lineStyle = pm.getElementsByTagNameNS("*", "LineStyle")[0];
    const polyStyle = pm.getElementsByTagNameNS("*", "PolyStyle")[0];
    const colorTag = (lineStyle || polyStyle)?.getElementsByTagNameNS("*", "color")[0];
    if (colorTag?.textContent) {
      return kmlColorToCss(colorTag.textContent.trim());
    }

    return undefined;
  };

  const getStyleIcon = (pm: Element): string | undefined => {
    // 1. Try to find inline style first
    const inlineStyle = pm.getElementsByTagNameNS("*", "Style")[0];
    if (inlineStyle) {
      const iconStyle = inlineStyle.getElementsByTagNameNS("*", "IconStyle")[0];
      const iconHref = iconStyle?.getElementsByTagNameNS("*", "Icon")[0]?.getElementsByTagNameNS("*", "href")[0]?.textContent;
      if (iconHref) return iconHref.trim();
    }

    // 2. Try to find referenced styleUrl
    const styleUrl = pm.getElementsByTagNameNS("*", "styleUrl")[0]?.textContent;
    if (styleUrl) {
      const styleId = styleUrl.replace(/^#/, "");
      if (styleIconMap[styleId]) {
        return styleIconMap[styleId];
      }
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
    const iconUrl = getStyleIcon(pm);
    
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
            color,
            iconUrl
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
