import L from 'leaflet';

/**
 * Calculates total polyline geodesic length in meters.
 */
export const calculatePolylineLength = (coords: { lat: number; lng: number }[]): number => {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += L.latLng(coords[i].lat, coords[i].lng).distanceTo(L.latLng(coords[i + 1].lat, coords[i + 1].lng));
  }
  return total;
};

/**
 * Calculates perimeter of a closed polygon in meters.
 */
export const calculatePolygonPerimeter = (coords: { lat: number; lng: number }[]): number => {
  if (!coords || coords.length < 2) return 0;
  
  // Clean duplicate closing point if present
  const sanitized = sanitizeCoordinates(coords);
  if (sanitized.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < sanitized.length; i++) {
    const next = sanitized[(i + 1) % sanitized.length];
    total += L.latLng(sanitized[i].lat, sanitized[i].lng).distanceTo(L.latLng(next.lat, next.lng));
  }
  return total;
};

/**
 * Calculates surface area of a polygon in square meters using flat tangent plane projection and Shoelace algorithm.
 */
export const calculatePolygonArea = (coords: { lat: number; lng: number }[]): number => {
  if (!coords || coords.length < 3) return 0;
  
  const sanitized = sanitizeCoordinates(coords);
  if (sanitized.length < 3) return 0;

  let sumLat = 0;
  for (let i = 0; i < sanitized.length; i++) {
    sumLat += sanitized[i].lat;
  }
  const meanLat = sumLat / sanitized.length;
  const meanLatRad = (meanLat * Math.PI) / 180;

  const R = 6378137; // Earth's equatorial radius in meters
  const mPerLat = (Math.PI / 180) * R;
  const mPerLng = (Math.PI / 180) * R * Math.cos(meanLatRad);

  const originLat = sanitized[0].lat;
  const originLng = sanitized[0].lng;

  const projected = sanitized.map(c => ({
    x: (c.lng - originLng) * mPerLng,
    y: (c.lat - originLat) * mPerLat
  }));

  let area = 0;
  for (let i = 0; i < projected.length; i++) {
    const j = (i + 1) % projected.length;
    area += projected[i].x * projected[j].y;
    area -= projected[j].x * projected[i].y;
  }

  return Math.abs(area) / 2.0;
};

/**
 * Removes duplicate closing point if identical to the first coordinate.
 */
export const sanitizeCoordinates = (coords: { lat: number; lng: number }[]): { lat: number; lng: number }[] => {
  if (!coords || coords.length < 2) return coords || [];
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (Math.abs(first.lat - last.lat) < 1e-9 && Math.abs(first.lng - last.lng) < 1e-9) {
    return coords.slice(0, -1);
  }
  return coords;
};
