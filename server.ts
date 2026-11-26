import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const TKGM_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://parselsorgu.tkgm.gov.tr/',
  'Origin': 'https://parselsorgu.tkgm.gov.tr',
  'Accept': 'application/json, text/plain, */*',
};

interface AdminItem {
  id: number;
  text: string;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const adminCache = new Map<string, CacheEntry<AdminItem[]>>();
const CACHE_TTL_ILLER = 12 * 60 * 60 * 1000;
const CACHE_TTL_SUB = 6 * 60 * 60 * 1000;

function getCached(key: string): AdminItem[] | null {
  const entry = adminCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    adminCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: AdminItem[], ttlMs: number): void {
  adminCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function extractAdminItems(rawJson: unknown): AdminItem[] {
  const items: AdminItem[] = [];
  const obj = rawJson as { features?: Array<{ properties?: { id?: unknown; text?: unknown }; id?: unknown; text?: unknown }> };
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

  // Remove closing point if identical to the first point
  if (coords.length > 2) {
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (Math.abs(first.lat - last.lat) < 1e-9 && Math.abs(first.lng - last.lng) < 1e-9) {
      coords.pop();
    }
  }

  return coords;
}

function normalizeParcelResponse(rawJson: unknown) {
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
  const str = (val: unknown): string => (typeof val === 'string' ? val.trim() : typeof val === 'number' ? String(val) : '');

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

async function fetchTkgmJson(url: string): Promise<{ status: number; data: unknown }> {
  const response = await fetch(url, {
    headers: TKGM_HEADERS,
    signal: AbortSignal.timeout(12000),
  });

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { Message: text };
  }
  return { status: response.status, data: parsed };
}

async function startServer() {
  const app = express();

  app.get('/api/parsel/iller', async (_req: Request, res: Response) => {
    try {
      const cached = getCached('iller');
      if (cached) {
        res.json({ items: cached });
        return;
      }

      const { status, data } = await fetchTkgmJson(
        'https://parselsorgu.tkgm.gov.tr/app/modules/administrativeQuery/data/ilListe.json'
      );

      if (status < 200 || status >= 300) {
        res.status(502).json({ error: 'TKGM il listesi servisine erişilemedi.' });
        return;
      }

      const items = extractAdminItems(data);
      setCached('iller', items, CACHE_TTL_ILLER);
      res.json({ items });
    } catch (err) {
      console.error('TKGM ilListe error:', err);
      res.status(502).json({ error: 'İl listesi yüklenirken bağlantı hatası oluştu.' });
    }
  });

  app.get('/api/parsel/ilceler/:ilId', async (req: Request, res: Response) => {
    const ilId = String(req.params.ilId || '').trim();
    if (!/^\d{1,6}$/.test(ilId)) {
      res.status(400).json({ error: 'Geçersiz il kimliği.' });
      return;
    }

    try {
      const cacheKey = `ilceler:${ilId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.json({ items: cached });
        return;
      }

      const { status, data } = await fetchTkgmJson(
        `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/idariYapi/ilceListe/${encodeURIComponent(ilId)}`
      );

      if (status === 404) {
        res.status(404).json({ error: 'Seçilen il için ilçe bulunamadı.' });
        return;
      }
      if (status < 200 || status >= 300) {
        res.status(502).json({ error: 'TKGM ilçe listesi servisine erişilemedi.' });
        return;
      }

      const items = extractAdminItems(data);
      setCached(cacheKey, items, CACHE_TTL_SUB);
      res.json({ items });
    } catch (err) {
      console.error('TKGM ilceListe error:', err);
      res.status(502).json({ error: 'İlçe listesi yüklenirken bağlantı hatası oluştu.' });
    }
  });

  app.get('/api/parsel/mahalleler/:ilceId', async (req: Request, res: Response) => {
    const ilceId = String(req.params.ilceId || '').trim();
    if (!/^\d{1,8}$/.test(ilceId)) {
      res.status(400).json({ error: 'Geçersiz ilçe kimliği.' });
      return;
    }

    try {
      const cacheKey = `mahalleler:${ilceId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.json({ items: cached });
        return;
      }

      const { status, data } = await fetchTkgmJson(
        `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/idariYapi/mahalleListe/${encodeURIComponent(ilceId)}`
      );

      if (status === 404) {
        res.status(404).json({ error: 'Seçilen ilçe için mahalle/köy bulunamadı.' });
        return;
      }
      if (status < 200 || status >= 300) {
        res.status(502).json({ error: 'TKGM mahalle listesi servisine erişilemedi.' });
        return;
      }

      const items = extractAdminItems(data);
      setCached(cacheKey, items, CACHE_TTL_SUB);
      res.json({ items });
    } catch (err) {
      console.error('TKGM mahalleListe error:', err);
      res.status(502).json({ error: 'Mahalle listesi yüklenirken bağlantı hatası oluştu.' });
    }
  });

  app.get('/api/parsel/sorgu/:mahalleId/:ada/:parsel', async (req: Request, res: Response) => {
    const mahalleId = String(req.params.mahalleId || '').trim();
    const ada = String(req.params.ada || '').trim();
    const parsel = String(req.params.parsel || '').trim();

    if (!/^\d{1,10}$/.test(mahalleId) || !/^\d{1,10}$/.test(ada) || !/^\d{1,10}$/.test(parsel)) {
      res.status(400).json({ error: 'Mahalle, ada ve parsel numaraları yalnızca rakamlardan oluşmalıdır.' });
      return;
    }

    try {
      const { status, data } = await fetchTkgmJson(
        `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/parsel/${encodeURIComponent(mahalleId)}/${encodeURIComponent(ada)}/${encodeURIComponent(parsel)}`
      );

      if (status === 404) {
        res.status(404).json({ error: 'Girilen ada ve parsel numarasıyla eşleşen bir kayıt bulunamadı.' });
        return;
      }
      if (status < 200 || status >= 300) {
        const msg = (data as { Message?: string })?.Message || 'TKGM parsel sorgusu başarısız oldu.';
        res.status(502).json({ error: msg });
        return;
      }

      const parcel = normalizeParcelResponse(data);
      if (!parcel) {
        res.status(404).json({ error: 'Parsel geometrisi alınamadı.' });
        return;
      }

      res.json({ parcel });
    } catch (err) {
      console.error('TKGM parsel query error:', err);
      res.status(502).json({ error: 'TKGM servisine bağlanılamadı. Lütfen tekrar deneyin.' });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
