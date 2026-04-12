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

function hexToBase36(hex: string): string {
  return BigInt("0x" + hex).toString(36);
}

function base36ToHex(b36: string): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let n = 0n;
  for (const c of b36.toLowerCase()) {
    n = n * 36n + BigInt(chars.indexOf(c));
  }
  return n.toString(16).padStart(32, "0");
}

function hexToUuid(hex: string): string {
  const h = hex.padStart(32, "0");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
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

  const blobId =
    res.headers.get("X-jsonblob-id") ??
    res.headers.get("Location")?.split("/").pop();

  if (!blobId) {
    throw new Error("Nem sikerült a link létrehozása.");
  }

  const hex = blobId.replace(/-/g, "");
  const shortCode = hexToBase36(hex);
  return `${window.location.origin}/${shortCode}`;
}

export async function loadShare(shortCode: string): Promise<SharedBill> {
  const hex = base36ToHex(shortCode);
  const uuid = hexToUuid(hex);

  const res = await fetch(`${JSONBLOB_API}/${uuid}`, {
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
