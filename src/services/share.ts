import type { BillItem } from "../types/bill";

interface SharePayload {
  /** [name, price, isShared] tuples — compact encoding */
  i: [string, number, boolean][];
  /** bill total */
  t: number;
  /** people count */
  p: number;
  /** total paid (0 = no tip) */
  pd: number;
}

export interface SharedBill {
  items: BillItem[];
  total: number;
  peopleCount: number;
  totalPaid: number;
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShareUrl(
  items: BillItem[],
  total: number,
  peopleCount: number,
  totalPaid: number,
): string {
  const payload: SharePayload = {
    i: items.map((it) => [it.name, it.price, it.isShared]),
    t: total,
    p: peopleCount,
    pd: totalPaid,
  };
  const encoded = toBase64(JSON.stringify(payload));
  return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
}

export function decodeShareFromUrl(): SharedBill | null {
  const hash = window.location.hash;
  if (!hash.startsWith("#share=")) return null;

  try {
    const encoded = hash.slice("#share=".length);
    const payload: SharePayload = JSON.parse(fromBase64(encoded));

    let id = 0;
    const items: BillItem[] = payload.i.map(([name, price, isShared]) => ({
      id: `item-${id++}`,
      name,
      quantity: 1,
      price,
      isShared,
    }));

    return {
      items,
      total: payload.t,
      peopleCount: payload.p,
      totalPaid: payload.pd,
    };
  } catch {
    return null;
  }
}
