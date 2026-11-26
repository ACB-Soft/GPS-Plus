import { ParcelAdminItem, ParcelQueryResult } from '../types';

const ilceClientCache = new Map<number, ParcelAdminItem[]>();
const mahalleClientCache = new Map<number, ParcelAdminItem[]>();
let illerClientCache: ParcelAdminItem[] | null = null;

async function requestJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    throw new Error(body?.error || body?.Message || `İstek başarısız (${res.status})`);
  }
  return body as T;
}

export async function fetchProvinces(): Promise<ParcelAdminItem[]> {
  if (illerClientCache) return illerClientCache;
  const data = await requestJson<{ items: ParcelAdminItem[] }>('/api/parsel/iller');
  illerClientCache = data.items || [];
  return illerClientCache;
}

export async function fetchDistricts(ilId: number): Promise<ParcelAdminItem[]> {
  const cached = ilceClientCache.get(ilId);
  if (cached) return cached;
  const data = await requestJson<{ items: ParcelAdminItem[] }>(`/api/parsel/ilceler/${ilId}`);
  const items = data.items || [];
  ilceClientCache.set(ilId, items);
  return items;
}

export async function fetchNeighborhoods(ilceId: number): Promise<ParcelAdminItem[]> {
  const cached = mahalleClientCache.get(ilceId);
  if (cached) return cached;
  const data = await requestJson<{ items: ParcelAdminItem[] }>(`/api/parsel/mahalleler/${ilceId}`);
  const items = data.items || [];
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
  const data = await requestJson<{ parcel: ParcelQueryResult }>(
    `/api/parsel/sorgu/${encodeURIComponent(String(mahalleId))}/${encodeURIComponent(cleanAda)}/${encodeURIComponent(cleanParsel)}`
  );
  return data.parcel;
}
