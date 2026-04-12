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

async function compress(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const input = encoder.encode(data);
  const stream = new Blob([input as BlobPart]).stream().pipeThrough(
    new CompressionStream("deflate-raw"),
  );
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompress(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(
    new DecompressionStream("deflate-raw"),
  );
  return new Response(stream).text();
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

export async function encodeShareUrl(
  items: BillItem[],
  total: number,
  peopleCount: number,
  totalPaid: number,
): Promise<string> {
  const payload = buildPayload(items, total, peopleCount, totalPaid);
  const json = JSON.stringify(payload);
  const compressed = await compress(json);
  const encoded = toUrlSafeBase64(compressed);
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
}

export async function decodeShareFromHash(): Promise<SharedBill | null> {
  const hash = window.location.hash.slice(1);
  if (!hash || hash.length < 4) return null;

  try {
    const compressed = fromUrlSafeBase64(hash);
    const json = await decompress(compressed);
    const payload: SharePayload = JSON.parse(json);
    if (!Array.isArray(payload.i) || typeof payload.t !== "number") return null;
    return parsePayload(payload);
  } catch {
    return null;
  }
}
