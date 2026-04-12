import { deflate, inflate } from "pako";
import type { BillItem } from "../types/bill";

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

function toUrlSafeBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafeBase64(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function encodeShareUrl(
  items: BillItem[],
  total: number,
  peopleCount: number,
  totalPaid: number,
): string {
  const payload: SharePayload = {
    i: items.map((it) => [it.name, it.price, it.isShared ? 1 : 0]),
    t: total,
    p: peopleCount,
    pd: totalPaid,
  };
  const json = JSON.stringify(payload);
  const compressed = deflate(json, { level: 9 });
  const encoded = toUrlSafeBase64(compressed);
  return `${window.location.origin}${window.location.pathname}#s=${encoded}`;
}

export function decodeShareFromUrl(): SharedBill | null {
  const hash = window.location.hash;

  let encoded: string;
  if (hash.startsWith("#s=")) {
    encoded = hash.slice(3);
  } else if (hash.startsWith("#share=")) {
    encoded = hash.slice(7);
    return decodeLegacy(encoded);
  } else {
    return null;
  }

  try {
    const compressed = fromUrlSafeBase64(encoded);
    const json = inflate(compressed, { to: "string" });
    const payload: SharePayload = JSON.parse(json);
    return payloadToSharedBill(payload);
  } catch {
    return null;
  }
}

function decodeLegacy(encoded: string): SharedBill | null {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json);
    const mapped: SharePayload = {
      i: payload.i.map((x: [string, number, boolean | number]) => [
        x[0],
        x[1],
        x[2] ? 1 : 0,
      ]),
      t: payload.t,
      p: payload.p,
      pd: payload.pd,
    };
    return payloadToSharedBill(mapped);
  } catch {
    return null;
  }
}

function payloadToSharedBill(payload: SharePayload): SharedBill {
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
