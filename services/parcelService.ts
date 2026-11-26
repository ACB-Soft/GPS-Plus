import { ParcelAdminItem, ParcelQueryResult } from '../types';

const TKGM_API_BASE = 'https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api';

const ilceClientCache = new Map<number, ParcelAdminItem[]>();
const mahalleClientCache = new Map<number, ParcelAdminItem[]>();
let illerClientCache: ParcelAdminItem[] | null = null;

// Static hosts such as GitHub Pages do not run server.ts; fall back directly to TKGM CORS-enabled API.
let preferDirectTkgm =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');

function extractAdminItems(rawJson: unknown): ParcelAdminItem[] {
  const items: ParcelAdminItem[] = [];
  const obj = rawJson as {
    features?: Array<{ properties?: { id?: unknown; text?: unknown }; id?: unknown; text?: unknown }>;
  };
  const list = Array.isArray(obj?.features) ? obj.features : Array.isArray(rawJson) ? rawJson : [];

  for (const entry of list) {
    const props = entry?.properties ?? entry;
    const rawId = props?.id;
    const rawText = props?.text;
    const idNum = typeof rawId === 'number' ? rawId : Number(rawId);
    const textStr = typeof rawText === 'string' ? rawText.trim() : '';
    if (Number.isFinite(idNum) && idNum > 0 && textStr) {
      items.push({ id: idNum, text: textStr });
    }
  }

  items.sort((a, b) => a.text.localeCompare(b.text, 'tr'));
  return items;
}

function extractPolygonRing(geometry: unknown): { lat: number; lng: number }[] {
  const geom = geometry as { type?: string; coordinates?: unknown };
  if (!geom || !geom.coordinates) return [];

  let ring: unknown[] = [];

  if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
    const rings = geom.coordinates as unknown[][];
    if (Array.isArray(rings[0])) {
      ring = rings[0];
    }
  } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
    const polygons = geom.coordinates as unknown[][][];
    let bestRing: unknown[] = [];
    for (const poly of polygons) {
      if (Array.isArray(poly) && Array.isArray(poly[0]) && poly[0].length > bestRing.length) {
        bestRing = poly[0];
      }
    }
    ring = bestRing;
  }

  const coords: { lat: number; lng: number }[] = [];
  for (const pt of ring) {
    if (Array.isArray(pt) && pt.length >= 2) {
      const lng = Number(pt[0]);
      const lat = Number(pt[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        coords.push({ lat, lng });
      }
    }
  }

  if (coords.length > 2) {
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (Math.abs(first.lat - last.lat) < 1e-9 && Math.abs(first.lng - last.lng) < 1e-9) {
      coords.pop();
    }
  }

  return coords;
}

function normalizeParcelResponse(rawJson: unknown): ParcelQueryResult | null {
  const feature = rawJson as {
    type?: string;
    geometry?: unknown;
    properties?: Record<string, unknown>;
  };

  if (!feature || !feature.geometry) {
    return null;
  }

  const coordinates = extractPolygonRing(feature.geometry);
  if (coordinates.length < 3) {
    return null;
  }

  const p = feature.properties ?? {};
  const str = (val: unknown): string =>
    typeof val === 'string' ? val.trim() : typeof val === 'number' ? String(val) : '';

  return {
    ilAd: str(p.ilAd || p.ilAdi),
    ilceAd: str(p.ilceAd || p.ilceAdi),
    mahalleAd: str(p.mahalleAd || p.mahalleAdi),
    mahalleId: Number(p.mahalleId || p.mahalleKodu || 0) || undefined,
    adaNo: str(p.adaNo || p.ada),
    parselNo: str(p.parselNo || p.parsel),
    alan: str(p.alan || p.tapuAlani || p.yuzolcumu),
    nitelik: str(p.nitelik),
    mevkii: str(p.mevkii || p.mevki),
    pafta: str(p.pafta),
    zeminKmdurum: str(p.zeminKmdurum || p.zeminTip),
    ozet: str(p.ozet),
    coordinates,
  };
}

async function tryLocalApi<T>(url: string): Promise<{ available: boolean; data?: T }> {
  if (preferDirectTkgm) return { available: false };

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Static hosting (GitHub Pages / Vite static preview) returned HTML 404 or SPA fallback
      preferDirectTkgm = true;
      return { available: false };
    }

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error || body?.Message || `İstek başarısız (${res.status})`);
    }
    return { available: true, data: body as T };
  } catch (err: any) {
    // Only rethrow intentional API validation/not-found errors from our backend
    if (err instanceof Error && err.message && !err.message.includes('Failed to fetch') && !err.message.includes('JSON')) {
      throw err;
    }
    preferDirectTkgm = true;
    return { available: false };
  }
}

async function fetchDirectTkgmJson(path: string, notFoundMessage: string): Promise<unknown> {
  const res = await fetch(`${TKGM_API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 404) {
    throw new Error(notFoundMessage);
  }
  if (!res.ok) {
    throw new Error(body?.Message || body?.error || `TKGM servisine erişilemedi (${res.status}).`);
  }
  return body;
}

export async function fetchProvinces(): Promise<ParcelAdminItem[]> {
  if (illerClientCache) return illerClientCache;

  const local = await tryLocalApi<{ items: ParcelAdminItem[] }>('/api/parsel/iller');
  if (local.available && local.data) {
    illerClientCache = local.data.items || [];
    return illerClientCache;
  }

  const raw = await fetchDirectTkgmJson('/idariYapi/ilListe', 'İl listesi bulunamadı.');
  illerClientCache = extractAdminItems(raw);
  return illerClientCache;
}

export async function fetchDistricts(ilId: number): Promise<ParcelAdminItem[]> {
  const cached = ilceClientCache.get(ilId);
  if (cached) return cached;

  const local = await tryLocalApi<{ items: ParcelAdminItem[] }>(`/api/parsel/ilceler/${ilId}`);
  if (local.available && local.data) {
    const items = local.data.items || [];
    ilceClientCache.set(ilId, items);
    return items;
  }

  const raw = await fetchDirectTkgmJson(
    `/idariYapi/ilceListe/${encodeURIComponent(String(ilId))}`,
    'Seçilen il için ilçe bulunamadı.'
  );
  const items = extractAdminItems(raw);
  ilceClientCache.set(ilId, items);
  return items;
}

export async function fetchNeighborhoods(ilceId: number): Promise<ParcelAdminItem[]> {
  const cached = mahalleClientCache.get(ilceId);
  if (cached) return cached;

  const local = await tryLocalApi<{ items: ParcelAdminItem[] }>(`/api/parsel/mahalleler/${ilceId}`);
  if (local.available && local.data) {
    const items = local.data.items || [];
    mahalleClientCache.set(ilceId, items);
    return items;
  }

  const raw = await fetchDirectTkgmJson(
    `/idariYapi/mahalleListe/${encodeURIComponent(String(ilceId))}`,
    'Seçilen ilçe için mahalle/köy bulunamadı.'
  );
  const items = extractAdminItems(raw);
  mahalleClientCache.set(ilceId, items);
  return items;
}

export async function queryParcelByAdmin(
  mahalleId: number,
  ada: string,
  parsel: string
): Promise<ParcelQueryResult> {
  const cleanAda = ada.trim() === '' ? '0' : ada.trim();
  const cleanParsel = parsel.trim();

  if (!/^\d{1,10}$/.test(cleanAda) || !/^\d{1,10}$/.test(cleanParsel)) {
    throw new Error('Ada ve parsel numaraları yalnızca rakamlardan oluşmalıdır.');
  }

  const local = await tryLocalApi<{ parcel: ParcelQueryResult }>(
    `/api/parsel/sorgu/${encodeURIComponent(String(mahalleId))}/${encodeURIComponent(cleanAda)}/${encodeURIComponent(cleanParsel)}`
  );
  if (local.available && local.data) {
    return local.data.parcel;
  }

  const raw = await fetchDirectTkgmJson(
    `/parsel/${encodeURIComponent(String(mahalleId))}/${encodeURIComponent(cleanAda)}/${encodeURIComponent(cleanParsel)}`,
    'Girilen ada ve parsel numarasıyla eşleşen bir kayıt bulunamadı.'
  );

  const parcel = normalizeParcelResponse(raw);
  if (!parcel) {
    throw new Error('Parsel geometrisi alınamadı.');
  }
  return parcel;
}
