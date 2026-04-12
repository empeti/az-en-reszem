import type { BillItem } from "../types/bill";

const JSONBLOB_API = "https://jsonblob.com/api/jsonBlob";

interface SharePayload {
  i: [string, number, number][];
  t: number;
  p: number;
  pd: number;
}

export interface SharedBill {
  items: BillItem[];
  total: number;
  peopleCount: number;
  totalPaid: number;
}

function bigintToBase36(n: bigint): string {
  return n.toString(36);
}

function base36ToBigint(s: string): bigint {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = 0n;
  for (const c of s.toLowerCase()) {
    result = result * 36n + BigInt(chars.indexOf(c));
  }
  return result;
}

function buildPayload(
  items: BillItem[],
  total: number,
  peopleCount: number,
  totalPaid: number,
): SharePayload {
  return {
    i: items.map((it) => [it.name, it.price, it.isShared ? 1 : 0]),
    t: total,
    p: peopleCount,
    pd: totalPaid,
  };
}

function parsePayload(payload: SharePayload): SharedBill {
  let id = 0;
  const items: BillItem[] = payload.i.map(([name, price, shared]) => ({
    id: `item-${id++}`,
    name,
    quantity: 1,
    price,
    isShared: shared === 1,
  }));
  return {
    items,
    total: payload.t,
    peopleCount: payload.p,
    totalPaid: payload.pd,
  };
}

export async function storeShare(
  items: BillItem[],
  total: number,
  peopleCount: number,
  totalPaid: number,
): Promise<string> {
  const payload = buildPayload(items, total, peopleCount, totalPaid);

  const res = await fetch(JSONBLOB_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Nem sikerült a link létrehozása.");
  }

  const location = res.headers.get("Location");
  if (!location) {
    throw new Error("Nem sikerült a link létrehozása.");
  }

  const blobId = location.split("/").pop()!;
  const shortCode = bigintToBase36(BigInt(blobId));
  const base = window.location.origin;
  return `${base}/${shortCode}`;
}

export async function loadShare(shortCode: string): Promise<SharedBill> {
  const blobId = base36ToBigint(shortCode).toString();

  const res = await fetch(`${JSONBLOB_API}/${blobId}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("A megosztott számla nem található.");
  }

  const payload: SharePayload = await res.json();
  return parsePayload(payload);
}

export function getShareCodeFromPath(): string | null {
  const path = window.location.pathname.replace(/^\/+/, "");
  if (!path || path.includes("/") || path.includes(".")) return null;
  if (!/^[a-z0-9]+$/i.test(path)) return null;
  return path;
}
