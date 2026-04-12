import type { BillItem } from "../types/bill";

interface SharePayload {
  i: [string, number, number][];
  t: number;
  p: number;
  pd: number;
  bn?: string;
  ba?: string;
}

export interface SharedBill {
  items: BillItem[];
  total: number;
  peopleCount: number;
  totalPaid: number;
  bankName: string;
  bankAccount: string;
}

function buildPayload(
  items: BillItem[],
  total: number,
  peopleCount: number,
  totalPaid: number,
  bankName: string,
  bankAccount: string,
): SharePayload {
  return {
    i: items.map((it) => [it.name, it.price, it.isShared ? 1 : 0]),
    t: total,
    p: peopleCount,
    pd: totalPaid,
    bn: bankName || undefined,
    ba: bankAccount || undefined,
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
    bankName: payload.bn ?? "",
    bankAccount: payload.ba ?? "",
  };
}

export async function createShareLink(
  items: BillItem[],
  total: number,
  peopleCount: number,
  totalPaid: number,
  bankName: string,
  bankAccount: string,
): Promise<string> {
  const payload = buildPayload(items, total, peopleCount, totalPaid, bankName, bankAccount);

  const res = await fetch("/api/bills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Nem sikerült a link létrehozása.");
  }

  const { id } = (await res.json()) as { id: string };
  return `${window.location.origin}/${id}`;
}

export async function loadSharedBill(code: string): Promise<SharedBill> {
  const res = await fetch(`/api/bills/${encodeURIComponent(code)}`);

  if (!res.ok) {
    throw new Error("A megosztott számla nem található.");
  }

  const payload: SharePayload = await res.json();
  return parsePayload(payload);
}

export function getShareCodeFromPath(): string | null {
  const path = window.location.pathname.replace(/^\/+/, "");
  if (!path || path.includes("/") || path.includes(".")) return null;
  if (!/^[\w-]+$/i.test(path)) return null;
  return path;
}
