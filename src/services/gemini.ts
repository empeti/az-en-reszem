import type { BillData, BillItem } from "../types/bill";

function roundPrice(n: number): number {
  return Math.round(n * 100) / 100;
}

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT = `You are an expert receipt/bill parser. Analyze this restaurant bill image and extract every line item.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "currency": "HUF",
  "items": [
    { "name": "item name", "quantity": 1, "price": 12.50, "shared": false }
  ],
  "total": 12.50
}

Rules:
- "currency" is the ISO 4217 currency code detected from the bill (e.g. "HUF", "EUR", "USD", "GBP", "CHF", "CZK", "PLN", "RON", "RSD"). Look for currency symbols (Ft, €, $, £, CHF, Kč, zł, lei, din) or explicit currency labels on the bill. If uncertain, use "HUF".
- "price" is the TOTAL price for that line (quantity * unit price). Preserve decimals exactly as shown on the bill (e.g. 12.50, 3.99, 1250). Do NOT round to integers.
- "quantity" is the count for that line item.
- "name" should be the item name exactly as printed on the bill.
- "shared" must be true for any item that is a communal fee charged to the whole table — regardless of language. Examples by language:
  • English: service charge, gratuity, cover charge, table fee, bread, bread basket, VAT surcharge, mandatory tip
  • Hungarian: szervízdíj, felszolgálási díj, kiszolgálási díj, terítékdíj, kötelező borravaló, kosárdíj
  • German: Servicegebühr, Bedienungsgeld, Gedeck, Korbgebühr, Mehrwertsteuer-Zuschlag
  • French: service compris, frais de service, couvert, corbeille de pain
  • Italian: coperto, servizio, pane e coperto
  • Spanish: servicio, cubierto, pan y cubierto
  • Romanian: serviciu, tacâm, coș de pâine
  • Czech/Slovak: servis, obsluha, koš
  • Polish: obsługa, serwis, koszyk z pieczywem
  For regular food and drink orders, always set false.
- If a service charge / gratuity / cover charge is present on the bill, always include it as a separate item with shared=true.
- "total" is the grand total from the bill. Preserve decimals.
- If you cannot read a value, use your best guess.
- Return valid JSON only, nothing else.`;

export async function parseBillImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<BillData> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API hiba (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text: string =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Nem sikerült JSON-t kinyerni a válaszból.");
  }

  const VALID_CURRENCIES = ["HUF","EUR","USD","GBP","CHF","CZK","PLN","RON","RSD"];

  const parsed = JSON.parse(jsonMatch[0]) as {
    currency?: string;
    items: { name: string; quantity: number; price: number; shared?: boolean }[];
    total: number;
  };

  const detectedCurrency =
    parsed.currency && VALID_CURRENCIES.includes(parsed.currency.toUpperCase())
      ? parsed.currency.toUpperCase()
      : "HUF";

  const items: BillItem[] = [];
  let idCounter = 0;
  for (const item of parsed.items) {
    const isShared = item.shared === true;
    const qty = Math.max(1, item.quantity);
    const unitPrice = roundPrice(item.price / qty);
    for (let i = 0; i < qty; i++) {
      items.push({
        id: `item-${idCounter++}`,
        name: item.name,
        quantity: 1,
        price: unitPrice,
        isShared,
      });
    }
  }

  return {
    items,
    total: parsed.total,
    currency: detectedCurrency,
  };
}
